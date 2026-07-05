const express = require("express");
const { getShowtimesByMovie, getSeatsByShowtime } = require("../controllers/showtimeController");
const router = express.Router();


router.get('/', getShowtimesByMovie);

router.get('/:showtimeId/seats', getSeatsByShowtime);

module.exports = router;