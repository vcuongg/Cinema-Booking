const mongoose = require("mongoose");

const showtimeSchema = new mongoose.Schema(
  {
    movieId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Movie",
      required: true,
    },

    roomId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Room",
      required: true, 
    },

    showDate: {
      type: Date,
      required: true,
    },

    startTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm
    },

    endTime: {
      type: String,
      required: true,
      match: /^([01]\d|2[0-3]):([0-5]\d)$/, // HH:mm
    },

    price: {
      type: Number,
      required: true,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Showtime", showtimeSchema,"showtimes");