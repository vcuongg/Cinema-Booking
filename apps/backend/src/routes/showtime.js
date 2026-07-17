const express = require("express");

const {
  getShowtimes,
  getManageShowtimes,
  getShowtimeFormData,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimesByMovie,
  getSeatsByShowtime,
  searchShowtimes,
} = require("../controllers/showtimeController");

const router = express.Router();

// ================= GET =================

// GET /api/showtimes
router.get("/", getShowtimes);

// GET /api/showtimes/manage
router.get("/manage", getManageShowtimes);

// GET /api/showtimes/form-data
router.get("/form-data", getShowtimeFormData);

// GET /api/showtimes/movie?movieId=...
router.get("/movie", getShowtimesByMovie);

// GET /search
router.get("/search", searchShowtimes);

// GET /api/showtimes/:showtimeId/seats
router.get("/:showtimeId/seats", getSeatsByShowtime);

// GET /api/showtimes/:id
router.get("/:id", getShowtime);

// ================= POST =================

router.post("/", createShowtime);

// ================= PATCH =================

router.patch("/:id", updateShowtime);

// ================= DELETE =================

router.delete("/:id", deleteShowtime);

module.exports = router;
