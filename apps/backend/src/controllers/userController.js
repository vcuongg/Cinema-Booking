const User = require("../models/User");
const bcrypt = require("bcryptjs");
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

exports.updateUser = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    const { name, username, email, role, password } = req.body;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    if (name !== undefined) user.name = String(name).trim();
    if (username !== undefined) user.username = String(username).trim().toLowerCase();
    if (email !== undefined) user.email = String(email).trim().toLowerCase();
    if (role !== undefined) user.role = role;
    if (password !== undefined && password !== "") {
      if (String(password).length < 6) return res.status(400).json({ success: false, message: "Password must be at least 6 characters" });
      user.password = await bcrypt.hash(String(password), 10);
    }
    await user.save();
    const safeUser = user.toObject();
    delete safeUser.password;
    return res.json({ success: true, user: safeUser });
  } catch (error) {
    if (error.code === 11000) return res.status(409).json({ success: false, message: "Username or email already exists" });
    if (error.name === "ValidationError") return res.status(400).json({ success: false, message: Object.values(error.errors)[0].message });
    console.error("Update user error:", error);
    return res.status(500).json({ success: false, message: "Cannot update user" });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    if (!isDbConnected()) return res.status(503).json({ success: false, message: "Database unavailable." });
    if (String(req.user.id || req.user._id) === req.params.id) return res.status(400).json({ success: false, message: "You cannot delete your own account" });
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    return res.json({ success: true, message: "User deleted" });
  } catch (error) { console.error("Delete user error:", error); return res.status(500).json({ success: false, message: "Cannot delete user" }); }
};
