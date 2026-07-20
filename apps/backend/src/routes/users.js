const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getUsers, updateUser, deleteUser } = require("../controllers/userController");

const router = express.Router();
router.get("/", protect, authorizeRoles("admin"), getUsers);
router.put("/:id", protect, authorizeRoles("admin"), updateUser);
router.delete("/:id", protect, authorizeRoles("admin"), deleteUser);
module.exports = router;
