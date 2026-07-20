const mongoose = require("mongoose");

const Booking = require("../models/Booking");
const Seat = require("../models/Seat");
const Showtime = require("../models/Showtime");
const Movie = require("../models/Movie");
const User = require("../models/User");
const {
  createPaymentLink,
  getPaymentRequest,
} = require("../services/payosService");
const generateTicketCode = require("../utils/ticketCode");
const { isDbConnected } = require("../config/db");

const PAYMENT_METHODS = ["simulated", "payos"];
const SERVICE_FEE = 2500;
const PAYMENT_TIMEOUT_MINUTES = 15;

const roundMoney = (value) => Math.round(value);

const getUserId = (req) => req.user && req.user.id;

const getDocumentId = (value) => {
  if (!value) {
    return value;
  }

  return value._id || value;
};

const formatSeatName = (seat) => `${seat.seatRow}${seat.seatNumber}`;

const populateBooking = (query) =>
  query
    .populate({
      path: "showtimeId",
      populate: [
        { path: "movieId" },
        {
          path: "roomId",
          populate: {
            path: "cinemaId",
          },
        },
      ],
    })
    .populate("seats.seatId");

const getPromoDiscount = (orderAmount, promoCode) => {
  const code = String(promoCode || "")
    .trim()
    .toUpperCase();

  if (!code) {
    return {
      promoCode: "",
      discountAmount: 0,
      promoMessage: "",
    };
  }

  if (code === "CINEMA10") {
    return {
      promoCode: code,
      discountAmount: roundMoney(orderAmount * 0.1),
      promoMessage: "Promo CINEMA10 applied",
    };
  }

  if (code === "NEWUSER") {
    return {
      promoCode: code,
      discountAmount: Math.min(5000, orderAmount),
      promoMessage: "Promo NEWUSER applied",
    };
  }

  return {
    promoCode: code,
    discountAmount: 0,
    promoMessage: "Promo code is not valid",
  };
};

const buildPriceSummary = ({ seatCount, seatPrice, promoCode }) => {
  const orderAmount = roundMoney(seatCount * seatPrice);
  const serviceFee = seatCount > 0 ? SERVICE_FEE : 0;
  const promo = getPromoDiscount(orderAmount, promoCode);
  const totalPrice = roundMoney(
    Math.max(0, orderAmount + serviceFee - promo.discountAmount),
  );

  return {
    orderAmount,
    serviceFee,
    discountAmount: promo.discountAmount,
    totalPrice,
    promoCode: promo.promoCode,
    promoMessage: promo.promoMessage,
  };
};

const generatePayosOrderCode = () =>
  Number(
    `${Date.now()}${Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0")}`,
  );

const buildDefaultUrl = (req, path) => {
  const publicApiUrl = process.env.API_PUBLIC_URL;

  if (publicApiUrl) {
    return `${publicApiUrl.replace(/\/$/, "")}${path}`;
  }

  return `${req.protocol}://${req.get("host")}${path}`;
};

const getPayosUrls = (req) => ({
  returnUrl:
    process.env.PAYOS_RETURN_URL ||
    buildDefaultUrl(req, "/api/payments/payos/return"),
  cancelUrl:
    process.env.PAYOS_CANCEL_URL ||
    buildDefaultUrl(req, "/api/payments/payos/cancel"),
});

const expirePendingBookings = async (filter = {}) =>
  Booking.updateMany(
    {
      ...filter,
      bookingStatus: "pending",
      paymentStatus: "pending",
      paymentExpiresAt: { $ne: null, $lte: new Date() },
    },
    {
      $set: {
        bookingStatus: "cancelled",
        paymentStatus: "failed",
        payosStatus: "EXPIRED",
      },
    },
  );

const syncPayosBookingStatus = async (booking) => {
  if (
    !booking ||
    booking.paymentProvider !== "payos" ||
    booking.paymentStatus !== "pending" ||
    !booking.payosOrderCode
  ) {
    return booking;
  }

  try {
    const paymentData = await getPaymentRequest(booking.payosOrderCode);
    const payosStatus = String(paymentData.status || "").toUpperCase();
    const latestTransaction = Array.isArray(paymentData.transactions)
      ? paymentData.transactions[0]
      : null;

    booking.payosStatus = paymentData.status || booking.payosStatus;
    booking.payosPaymentLinkId =
      paymentData.paymentLinkId || booking.payosPaymentLinkId;

    if (latestTransaction && latestTransaction.reference) {
      booking.paymentReference = latestTransaction.reference;
    }

    if (payosStatus === "PAID") {
      booking.paymentStatus = "paid";
      booking.bookingStatus = "confirmed";
      booking.ticketCode = booking.ticketCode || generateTicketCode();
      booking.paidAt =
        booking.paidAt ||
        (latestTransaction && latestTransaction.transactionDateTime
          ? new Date(latestTransaction.transactionDateTime)
          : new Date());
    } else if (
      booking.paymentStatus === "pending" &&
      ["CANCELLED", "EXPIRED"].includes(payosStatus)
    ) {
      booking.paymentStatus = "failed";
      booking.bookingStatus = "cancelled";
    }

    await booking.save();
  } catch (error) {
    console.warn("Could not sync PayOS booking status:", error.message);
  }

  return booking;
};

const validateBookingInput = ({ showtimeId, seatIds, paymentMethod }) => {
  if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
    return {
      status: 400,
      message: "Invalid showtimeId",
    };
  }

  if (!Array.isArray(seatIds) || seatIds.length === 0) {
    return {
      status: 400,
      message: "seatIds must be a non-empty array",
    };
  }

  const uniqueSeatIds = [...new Set(seatIds.map(String))];

  if (
    uniqueSeatIds.some((seatId) => !mongoose.Types.ObjectId.isValid(seatId))
  ) {
    return {
      status: 400,
      message: "Invalid seatIds",
    };
  }

  if (paymentMethod && !PAYMENT_METHODS.includes(paymentMethod)) {
    return {
      status: 400,
      message: "Invalid paymentMethod",
    };
  }

  return {
    uniqueSeatIds,
  };
};

const getCheckoutData = async ({ showtimeId, seatIds }) => {
  const showtime = await Showtime.findById(showtimeId)
    .populate("movieId")
    .populate({
      path: "roomId",
      populate: {
        path: "cinemaId",
      },
    });

  if (!showtime) {
    return {
      status: 404,
      message: "Showtime not found",
    };
  }

  const roomId = getDocumentId(showtime.roomId);

  const seats = await Seat.find({
    _id: { $in: seatIds },
    roomId,
  }).sort({ seatRow: 1, seatNumber: 1 });

  if (seats.length !== seatIds.length) {
    return {
      status: 400,
      message: "Some seats are invalid or do not belong to this showtime room",
    };
  }

  await expirePendingBookings({ showtimeId });

  const existingBookings = await Booking.find({
    showtimeId,
    "seats.seatId": { $in: seatIds },
    $or: [
      { bookingStatus: "confirmed" },
      {
        bookingStatus: "pending",
        paymentStatus: "pending",
        $or: [
          { paymentExpiresAt: null },
          { paymentExpiresAt: { $gt: new Date() } },
        ],
      },
    ],
  }).populate("seats.seatId");

  if (existingBookings.length > 0) {
    const bookedSeatIds = new Set(
      existingBookings.flatMap((booking) =>
        booking.seats.map((seat) => getDocumentId(seat.seatId).toString()),
      ),
    );

    const bookedSeats = seats
      .filter((seat) => bookedSeatIds.has(seat._id.toString()))
      .map(formatSeatName);

    return {
      status: 409,
      message: "Some seats are already booked",
      bookedSeats,
    };
  }

  const selectedSeats = seats.map((seat) => ({
    _id: seat._id,
    seatRow: seat.seatRow,
    seatNumber: seat.seatNumber,
    seatType: seat.seatType,
    seatName: formatSeatName(seat),
    price: showtime.price,
  }));

  return {
    showtime,
    seats,
    selectedSeats,
  };
};

const buildCheckoutResponse = ({ showtime, selectedSeats, priceSummary }) => {
  const room = showtime.roomId;
  const cinema = room && room.cinemaId;

  return {
    movie: showtime.movieId,
    showtime: {
      _id: showtime._id,
      showDate: showtime.showDate,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      price: showtime.price,
    },
    cinema,
    room,
    selectedSeats,
    priceSummary,
  };
};

// POST /api/bookings/preview
// Validate selected seats and return payment summary for PaymentScreen.
const previewBooking = async (req, res) => {
  const userId = getUserId(req);
  const { showtimeId, seatIds, promoCode = "" } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  const validation = validateBookingInput({ showtimeId, seatIds });

  if (validation.status) {
    return res.status(validation.status).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const checkoutData = await getCheckoutData({
      showtimeId,
      seatIds: validation.uniqueSeatIds,
    });

    if (checkoutData.status) {
      return res.status(checkoutData.status).json({
        success: false,
        message: checkoutData.message,
        bookedSeats: checkoutData.bookedSeats,
      });
    }

    const priceSummary = buildPriceSummary({
      seatCount: checkoutData.selectedSeats.length,
      seatPrice: checkoutData.showtime.price,
      promoCode,
    });

    return res.status(200).json({
      success: true,
      checkout: buildCheckoutResponse({
        showtime: checkoutData.showtime,
        selectedSeats: checkoutData.selectedSeats,
        priceSummary,
      }),
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// POST /api/bookings
// Create a booking and start the selected payment flow.
const createBooking = async (req, res) => {
  const userId = getUserId(req);
  const {
    showtimeId,
    seatIds,
    paymentMethod = "payos",
    promoCode = "",
  } = req.body;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  const validation = validateBookingInput({
    showtimeId,
    seatIds,
    paymentMethod,
  });

  if (validation.status) {
    return res.status(validation.status).json({
      success: false,
      message: validation.message,
    });
  }

  try {
    const checkoutData = await getCheckoutData({
      showtimeId,
      seatIds: validation.uniqueSeatIds,
    });

    if (checkoutData.status) {
      return res.status(checkoutData.status).json({
        success: false,
        message: checkoutData.message,
        bookedSeats: checkoutData.bookedSeats,
      });
    }

    const priceSummary = buildPriceSummary({
      seatCount: checkoutData.selectedSeats.length,
      seatPrice: checkoutData.showtime.price,
      promoCode,
    });

    const bookingSeats = checkoutData.seats.map((seat) => ({
      seatId: seat._id,
      price: checkoutData.showtime.price,
    }));

    if (paymentMethod === "payos" && priceSummary.totalPrice <= 0) {
      return res.status(400).json({
        success: false,
        message: "PayOS amount must be greater than 0",
      });
    }

    if (paymentMethod === "simulated") {
      const booking = await Booking.create({
        userId,
        showtimeId,
        seats: bookingSeats,
        orderAmount: priceSummary.orderAmount,
        serviceFee: priceSummary.serviceFee,
        discountAmount: priceSummary.discountAmount,
        totalPrice: priceSummary.totalPrice,
        promoCode: priceSummary.promoCode,
        paymentMethod,
        paymentProvider: "simulated",
        paymentStatus: "paid",
        bookingStatus: "confirmed",
        ticketCode: generateTicketCode(),
        paidAt: new Date(),
      });

      const populatedBooking = await populateBooking(
        Booking.findById(booking._id),
      );

      return res.status(201).json({
        success: true,
        message: "Booking created successfully",
        booking: populatedBooking,
        checkout: buildCheckoutResponse({
          showtime: checkoutData.showtime,
          selectedSeats: checkoutData.selectedSeats,
          priceSummary,
        }),
        payment: {
          provider: "simulated",
          status: "paid",
        },
      });
    }

    const paymentExpiresAt = new Date(
      Date.now() + PAYMENT_TIMEOUT_MINUTES * 60 * 1000,
    );
    const payosOrderCode = generatePayosOrderCode();
    const paymentDescription = `CB${String(payosOrderCode).slice(-7)}`;

    const booking = await Booking.create({
      userId,
      showtimeId,
      seats: bookingSeats,
      orderAmount: priceSummary.orderAmount,
      serviceFee: priceSummary.serviceFee,
      discountAmount: priceSummary.discountAmount,
      totalPrice: priceSummary.totalPrice,
      promoCode: priceSummary.promoCode,
      paymentMethod,
      paymentProvider: "payos",
      paymentStatus: "pending",
      bookingStatus: "pending",
      ticketCode: "",
      paymentExpiresAt,
      payosOrderCode,
      payosStatus: "PENDING",
    });

    try {
      const payosUrls = getPayosUrls(req);
      const paymentData = await createPaymentLink({
        orderCode: payosOrderCode,
        amount: Math.round(priceSummary.totalPrice),
        description: paymentDescription,
        returnUrl: payosUrls.returnUrl,
        cancelUrl: payosUrls.cancelUrl,
        expiredAt: Math.floor(paymentExpiresAt.getTime() / 1000),
      });

      booking.payosPaymentLinkId = paymentData.paymentLinkId || "";
      booking.payosCheckoutUrl = paymentData.checkoutUrl || "";
      booking.payosQrCode = paymentData.qrCode || "";
      booking.payosStatus = paymentData.status || "PENDING";
      await booking.save();

      const populatedBooking = await populateBooking(
        Booking.findById(booking._id),
      );

      return res.status(201).json({
        success: true,
        message:
          "Payment link created. Complete payment to receive your ticket.",
        booking: populatedBooking,
        checkout: buildCheckoutResponse({
          showtime: checkoutData.showtime,
          selectedSeats: checkoutData.selectedSeats,
          priceSummary,
        }),
        payment: {
          provider: "payos",
          status: booking.paymentStatus,
          orderCode: payosOrderCode,
          paymentLinkId: booking.payosPaymentLinkId,
          checkoutUrl: booking.payosCheckoutUrl,
          qrCode: booking.payosQrCode,
          expiresAt: booking.paymentExpiresAt,
        },
      });
    } catch (paymentError) {
      booking.paymentStatus = "failed";
      booking.bookingStatus = "cancelled";
      booking.payosStatus = "CREATE_LINK_FAILED";
      await booking.save();

      throw paymentError;
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/bookings/my
const getMyBookings = async (req, res) => {
  const userId = getUserId(req);

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  try {
    await expirePendingBookings({ userId });

    const bookings = await populateBooking(
      Booking.find({ userId }).sort({ createdAt: -1 }),
    );

    await Promise.all(bookings.map(syncPayosBookingStatus));

    return res.status(200).json({
      success: true,
      bookings,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/bookings/:id
const getBookingById = async (req, res) => {
  const userId = getUserId(req);
  const { id } = req.params;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Not authorized",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid booking id",
    });
  }

  try {
    await expirePendingBookings(req.user.role === "admin" ? {} : { userId });

    const query = req.user.role === "admin" ? { _id: id } : { _id: id, userId };
    const booking = await populateBooking(Booking.findOne(query));

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found",
      });
    }

    await syncPayosBookingStatus(booking);

    return res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// GET /api/bookings/admin/summary
const getAdminBookingSummary = async (req, res) => {
  if (!isDbConnected()) {
    return res.status(200).json({
      success: true,
      summary: {
        totalRevenue: 0,
        ticketsSold: 0,
        totalBookings: 0,
        totalMovies: 0,
        totalShowtimes: 0,
        totalCustomers: 0,
        topMovies: [],
      },
      warning: "Database unavailable. Running in degraded mode.",
    });
  }

  try {
    const salesMatch = {
      bookingStatus: "confirmed",
      paymentStatus: "paid",
    };

    const [
      bookingTotals,
      topMovies,
      totalMovies,
      totalShowtimes,
      totalCustomers,
    ] = await Promise.all([
      Booking.aggregate([
        { $match: salesMatch },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: "$totalPrice" },
            totalBookings: { $sum: 1 },
            ticketsSold: {
              $sum: {
                $size: { $ifNull: ["$seats", []] },
              },
            },
          },
        },
      ]),
      Booking.aggregate([
        { $match: salesMatch },
        {
          $lookup: {
            from: "showtimes",
            localField: "showtimeId",
            foreignField: "_id",
            as: "showtime",
          },
        },
        { $unwind: "$showtime" },
        {
          $lookup: {
            from: "movies",
            localField: "showtime.movieId",
            foreignField: "_id",
            as: "movie",
          },
        },
        { $unwind: "$movie" },
        {
          $group: {
            _id: "$movie._id",
            title: { $first: "$movie.title" },
            poster: {
              $first: {
                $cond: [
                  { $ne: [{ $ifNull: ["$movie.poster", ""] }, ""] },
                  "$movie.poster",
                  { $ifNull: ["$movie.posterUrl", ""] },
                ],
              },
            },
            ticketsSold: {
              $sum: {
                $size: { $ifNull: ["$seats", []] },
              },
            },
            revenue: { $sum: "$totalPrice" },
          },
        },
        { $sort: { ticketsSold: -1, revenue: -1 } },
        { $limit: 5 },
      ]),
      Movie.countDocuments(),
      Showtime.countDocuments(),
      User.countDocuments({ role: "customer" }),
    ]);

    const totals = bookingTotals[0] || {
      totalRevenue: 0,
      totalBookings: 0,
      ticketsSold: 0,
    };

    return res.status(200).json({
      success: true,
      summary: {
        totalRevenue: totals.totalRevenue,
        ticketsSold: totals.ticketsSold,
        totalBookings: totals.totalBookings,
        totalMovies,
        totalShowtimes,
        totalCustomers,
        topMovies: topMovies.map((movie) => ({
          movieId: movie._id,
          title: movie.title,
          poster: movie.poster || "",
          ticketsSold: movie.ticketsSold,
          revenue: movie.revenue,
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  previewBooking,
  createBooking,
  getMyBookings,
  getBookingById,
  getAdminBookingSummary,
};
