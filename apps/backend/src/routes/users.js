const express = require("express");
const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const { getUsers } = require("../controllers/userController");

const router = express.Router();
router.get("/", protect, authorizeRoles("admin"), getUsers);
module.exports = router;
