const mongoose = require("mongoose");
const Showtime = require("../models/Showtime");
const Seat = require("../models/Seat");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Movie = require("../models/Movie");
const Cinema = require("../models/Cinema");

const calculateEndTime = (startTime, duration) => {
  const [hour, minute] = startTime.split(":").map(Number);

  const totalMinutes = hour * 60 + minute + duration;

  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;

  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(
    2,
    "0",
  )}`;
};

// ================= GET ALL =================

const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate("movieId")
      .populate({
        path: "roomId",
        populate: {
          path: "cinemaId",
        },
      })
      .sort({
        showDate: 1,
        startTime: 1,
      });

    res.status(200).json(showtimes);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET MANAGE UI =================

const getManageShowtimes = async (req, res) => {
  try {
    const movies = await Movie.find({
      status: "now_showing",
    }).sort({
      title: 1,
    });

    const result = [];

    for (const movie of movies) {
      const showtimes = await Showtime.find({
        movieId: movie._id,
      })
        .populate({
          path: "roomId",
          populate: {
            path: "cinemaId",
          },
        })
        .sort({
          showDate: 1,
          startTime: 1,
        });

      result.push({
        movie,
        showtimes,
      });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET FORM DATA =================

const getShowtimeFormData = async (req, res) => {
  try {
    const movies = await Movie.find({
      status: "now_showing",
    });

    const cinemas = await Cinema.find({
      isActive: true,
    });

    res.status(200).json({
      movies,
      cinemas,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET SINGLE =================

const getShowtime = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such showtime",
    });
  }

  try {
    const showtime = await Showtime.findById(id)
      .populate("movieId")
      .populate({
        path: "roomId",
        populate: {
          path: "cinemaId",
        },
      });

    if (!showtime) {
      return res.status(404).json({
        error: "No such showtime",
      });
    }

    res.status(200).json(showtime);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= CREATE =================

const createShowtime = async (req, res) => {
  const { movieId, cinemaId, roomId, showDate, startTime, price } = req.body;

  try {
    const movie = await Movie.findById(movieId);

    const endTime = calculateEndTime(startTime, movie.duration);

    const showtime = await Showtime.create({
      movieId,
      cinemaId,
      roomId,
      showDate,
      startTime,
      endTime,
      price,
    });

    res.status(200).json(showtime);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= UPDATE =================

const updateShowtime = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such showtime",
    });
  }

  try {
    let updateData = {
      ...req.body,
    };

    if (req.body.movieId && req.body.startTime) {
      const movie = await Movie.findById(req.body.movieId);

      updateData.endTime = calculateEndTime(req.body.startTime, movie.duration);
    }

    const showtime = await Showtime.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!showtime) {
      return res.status(404).json({
        error: "No such showtime",
      });
    }

    res.status(200).json({
      message: "Showtime updated",
      showtime,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= DELETE =================

const deleteShowtime = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such showtime",
    });
  }

  try {
    const showtime = await Showtime.findByIdAndDelete(id);

    if (!showtime) {
      return res.status(404).json({
        error: "No such showtime",
      });
    }

    res.status(200).json({
      message: "Showtime deleted",
      showtime,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// GET /api/showtimes?movieId=
const getShowtimesByMovie = async (req, res) => {
  const { movieId } = req.query;

  if (!movieId) {
    return res.status(400).json({ error: "movieId is required" });
  }

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(400).json({ error: "Invalid movieId" });
  }

  const showtimes = await Showtime.find({ movieId })
    .populate({
      path: "roomId",
      select: "roomName totalSeats",
      populate: {
        path: "cinemaId",
        select: "cinemaName address city", // Thêm các trường cần thiết
      },
    })
    .sort({ showDate: 1, startTime: 1 });

  res.status(200).json(showtimes);
};

// GET /api/showtimes/:showtimeId/seats
// Lấy sơ đồ ghế của 1 suất chiếu, kèm trạng thái isBooked
const getSeatsByShowtime = async (req, res) => {
  const { showtimeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
    return res.status(400).json({ error: "Invalid showtimeId" });
  }

  try {
    const showtime = await Showtime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({
        error: "No such showtime",
      });
    }

    const seats = await Seat.find({ roomId: showtime.roomId }).sort({
      seatRow: 1,
      seatNumber: 1,
    });

    await Booking.updateMany(
      {
        showtimeId,
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

    const bookings = await Booking.find({
      showtimeId,
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
    });

    const bookedSeatIds = new Set(
      bookings.flatMap((booking) =>
        booking.seats.map((s) => s.seatId.toString()),
      ),
    );

    const seatsWithStatus = seats.map((seat) => ({
      _id: seat._id,
      seatRow: seat.seatRow,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      isBooked: bookedSeatIds.has(seat._id.toString()),
    }));

    res.status(200).json({
      showtime,
      seats: seatsWithStatus,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  getShowtimesByMovie,
  getSeatsByShowtime,
  getShowtimes,
  getManageShowtimes,
  getShowtimeFormData,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
};
