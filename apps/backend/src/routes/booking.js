const express = require("express");

const {
  createBooking,
  getBookingById,
  getMyBookings,
  getAdminBookingSummary,
  previewBooking,
} = require("../controllers/bookingController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.post("/preview", protect, previewBooking);
router.post("/", protect, createBooking);
router.get(
  "/admin/summary",
  protect,
  authorizeRoles("admin"),
  getAdminBookingSummary,
);
router.get("/my", protect, getMyBookings);
router.get("/:id", protect, getBookingById);

module.exports = router;
