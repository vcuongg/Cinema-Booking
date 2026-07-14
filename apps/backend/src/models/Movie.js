const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
<<<<<<< Updated upstream
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
=======
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        genre: [{
            type: String,
            required: true,
        }],

        duration: {
            type: Number,
            required: true,
        },

        language: {
            type: String,
            default: "English",
        },

        releaseDate: {
            type: Date,
            required: true,
        },

        poster: {
            type: String,
            default: "",
        },

        trailer: {
            type: String,
            default: "",
        },

        status: {
            type: String,
            enum: ["now_showing", "coming_soon"],
            default: "coming_soon",
        },

        rating: {
            type: Number,
            default: 0,
        },
>>>>>>> Stashed changes
    },

    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },

    genre: {
      type: [String],
      required: [true, "Genre is required"],
      trim: true,
    },

    duration: {
      type: Number,
      required: [true, "Duration is required"],
      min: [1, "Duration must be greater than 0"],
    },

    director: {
      type: String,
      default: "",
      trim: true,
    },

    actors: {
      type: [String],
      default: [],
    },

    posterUrl: {
      type: String,
      default: "",
      trim: true,
    },

    trailerUrl: {
      type: String,
      default: "",
      trim: true,
    },

    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },

    status: {
      type: String,
      enum: ["now_showing", "coming_soon"],
      default: "coming_soon",
    },

    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },

    priceFrom: {
      type: Number,
      default: 0,
      min: 0,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("Movie", movieSchema);
