const mongoose = require("mongoose");

const seatSchema = new mongoose.Schema(
  {
    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true,
    },
    seatRow: {
      type: String,
      required: true, // "A", "B", "C"...
    },
    seatNumber: {
      type: Number,
      required: true, // 1, 2, 3...
    },
    seatType: {
      type: String,
      enum: ["standard", "vip"],
      default: "standard",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Seat", seatSchema);