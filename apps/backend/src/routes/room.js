const express = require("express");

const {
  getRooms,
  getRoomFormData,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
} = require("../controllers/roomController");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

router.use(protect, authorizeRoles("admin"));

router.get("/", getRooms);
router.get("/form-data", getRoomFormData);
router.get("/:id", getRoomById);
router.post("/", createRoom);
router.patch("/:id", updateRoom);
router.delete("/:id", deleteRoom);

module.exports = router;
