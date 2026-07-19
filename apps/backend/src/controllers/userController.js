const User = require("../models/User");
const { isDbConnected } = require("../config/db");

exports.getUsers = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({ success: false, message: "Database unavailable. Cannot load users." });
    }
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    return res.json({ success: true, count: users.length, users });
  } catch (error) {
    console.error("Get users error:", error);
    return res.status(500).json({ success: false, message: "Cannot load users" });
  }
};
