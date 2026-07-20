const express = require("express");

const {
  getRooms,
  getRoomsByCinema,
  getRoomFormData,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  deleteRoomsByCinema,
} = require("../controllers/roomController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

// ================= GET =================

// GET /api/rooms
router.get("/", getRooms);

// GET /api/rooms/form-data
router.get("/form-data", getRoomFormData);

// GET /api/rooms/cinema/:cinemaId
router.get("/cinema/:cinemaId", getRoomsByCinema);

// GET /api/rooms/:id
router.get("/:id", getRoomById);

// ================= POST =================

router.post("/", createRoom);

// ================= PATCH =================

router.patch("/:id", updateRoom);

// ================= DELETE =================

// DELETE /api/rooms/cinema/:cinemaId
router.delete("/cinema/:cinemaId", deleteRoomsByCinema);

router.delete("/:id", deleteRoom);

module.exports = router;