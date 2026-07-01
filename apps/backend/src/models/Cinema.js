const mongoose = require('mongoose');

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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Cinema", cinemaSchema);
