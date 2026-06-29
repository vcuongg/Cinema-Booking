const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const movieSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    genre: {
      type: [String],
      default: [],
    },
    director: {
      type: String,
      default: "",
    },
    actors: {
      type: [String],
      default: [],
    },
    posterUrl: {
      type: String,
      default: "",
    },
    trailerUrl: {
      type: String,
      default: "",
    },
    releaseDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: ["now_showing", "coming_soon", "ended"],
      default: "coming_soon",
    },
    rating: {
      type: Number,
      default: 0,
    },
    priceFrom: {
      type: Number,
      required: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("Movie", movieSchema);
