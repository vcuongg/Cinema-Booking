const mongoose = require("mongoose");
const Movies = require("./Movies");
const Room = require("./Room");


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
      required: true, // "14:00"
    },
    endTime: {
      type: String,
      required: true, // "16:30"
    },
    price: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Showtime", showtimeSchema);