const mongoose = require("mongoose");
const ShowTime = require("./Showtime");
const Seat = require("./Seat");

const bookingSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    showtimeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Showtime",
      required: true,
    },
    // Mỗi phần tử là 1 ghế đã đặt, kèm giá tại thời điểm đặt
    seats: [
      {
        seatId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Seat",
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],
    totalPrice: {
      type: Number,
      required: true,
    },
    orderAmount: {
      type: Number,
      default: 0,
    },
    serviceFee: {
      type: Number,
      default: 0,
    },
    discountAmount: {
      type: Number,
      default: 0,
    },
    promoCode: {
      type: String,
      default: "",
      trim: true,
    },
    paymentMethod: {
      type: String,
      enum: ["simulated", "payos", "momo", "vnpay", "card"],
      default: "simulated",
    },
    paymentProvider: {
      type: String,
      enum: ["simulated", "payos"],
      default: "simulated",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "cancelled", "refunded"],
      default: "pending",
    },
    bookingStatus: {
      type: String,
      enum: ["pending", "confirmed", "cancelled"],
      default: "pending",
    },
    ticketCode: {
      type: String,
      default: "",
    },
    paidAt: {
      type: Date,
      default: null,
    },
    paymentExpiresAt: {
      type: Date,
      default: null,
    },
    payosOrderCode: {
      type: Number,
    },
    payosPaymentLinkId: {
      type: String,
      default: "",
    },
    payosCheckoutUrl: {
      type: String,
      default: "",
    },
    payosQrCode: {
      type: String,
      default: "",
    },
    payosStatus: {
      type: String,
      default: "",
    },
    paymentReference: {
      type: String,
      default: "",
    },
  },
  { timestamps: true },
);

bookingSchema.index({ payosOrderCode: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Booking", bookingSchema);
