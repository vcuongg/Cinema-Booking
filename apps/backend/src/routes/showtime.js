const express = require("express");
const {
  getShowtimesByMovie,
  getSeatsByShowtime,
  getShowtimes,
  getManageShowtimes,
  getShowtimeFormData,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} = require("../controllers/showtimeController");
const router = express.Router();

// GET /api/showtimes
router.get("/", getShowtimes);

// GET /api/showtimes/manage
// Dữ liệu cho UI Manage Showtime
router.get("/manage", getManageShowtimes);

// GET /api/showtimes/form-data
// Dữ liệu cho UI Create / Update
router.get("/form-data", getShowtimeFormData);

// GET /api/showtimes/:id
router.get("/:id", getShowtime);

// POST /api/showtimes
router.post("/", createShowtime);

// PATCH /api/showtimes/:id
router.patch("/:id", updateShowtime);

// DELETE /api/showtimes/:id
router.delete("/:id", deleteShowtime);

router.get("/", getShowtimesByMovie);

router.get("/:showtimeId/seats", getSeatsByShowtime);

module.exports = router;
