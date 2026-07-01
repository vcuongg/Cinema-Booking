const mongoose = require("mongoose");

const movieSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        genre: {
            type: String,
            required: true,
        },

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
    },
    {
        timestamps: true,
    }
);

module.exports = mongoose.model("Movie", movieSchema);