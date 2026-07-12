const express = require("express");

const {
  createBooking,
  getBookingById,
  getMyBookings,
  previewBooking,
} = require("../controllers/bookingController");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/preview", protect, previewBooking);
router.post("/", protect, createBooking);
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBookingById);

module.exports = router;
