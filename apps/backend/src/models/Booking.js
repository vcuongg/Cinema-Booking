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
    paymentMethod: {
      type: String,
      enum: ["simulated", "momo", "vnpay", "card"],
      default: "simulated",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
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
  },
  { timestamps: true },
);

module.exports = mongoose.model("Booking", bookingSchema);
