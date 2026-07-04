const mongoose = require("mongoose");

const cinemaSchema = new mongoose.Schema(
  {
    cinemaName: {
      type: String,
      required: true,
    },

    address: {
      type: String,
      required: true,
    },

    city: {
      type: String,
      required: true,
    },

    coverPhoto: {
      type: String,
      default: "",
    },

    totalHalls: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    totalCapacity: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

module.exports = mongoose.model("Cinema", cinemaSchema, "cinemas");