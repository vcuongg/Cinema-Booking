const mongoose = require("mongoose");
const Cinema = require("./Cinema");


const roomSchema = new mongoose.Schema(
  {
    cinemaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Cinema",
      required: true,
    },
    roomName: {
      type: String,
      required: true,
    },
    totalSeats: {
      type: Number,
      required: true,
    },
    rows: {
      type: Number,
      required: true,
    },
    seatsPerRow: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Room", roomSchema);