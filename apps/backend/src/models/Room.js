const mongoose = require("mongoose");

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
      min: 0,
    },

    rows: {
      type: Number,
      required: true,
      min: 1,
    },

    seatsPerRow: {
      type: Number,
      required: true,
      min: 1,
    },
  },
  {
    timestamps: true, 
    versionKey: false, 
  }
);

module.exports = mongoose.model("Room", roomSchema, "rooms");
