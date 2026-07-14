const bcrypt = require("bcryptjs");

const User = require("../models/User");
const OTP = require("../models/OTP");

const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");

// REGISTER
exports.register = async (req, res) => {
  try {
    const {
      name,
      username,
      email,
      password,
      confirmPassword,
    } = req.body;

    const normalizedName = name?.trim();
    const normalizedUsername = username?.trim().toLowerCase();
    const normalizedEmail = email?.trim().toLowerCase();

    if (
      !normalizedName ||
      !normalizedUsername ||
      !normalizedEmail ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        success: false,
        message: "Please fill all fields",
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (normalizedUsername.length < 4) {
      return res.status(400).json({
        success: false,
        message: "Username must be at least 4 characters",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: "Passwords do not match",
      });
    }

    const emailExists = await User.findOne({
      email: normalizedEmail,
    });

    if (emailExists) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const usernameExists = await User.findOne({
      username: normalizedUsername,
    });

    if (usernameExists) {
      return res.status(409).json({
        success: false,
        message: "Username already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: normalizedName,
      username: normalizedUsername,
      email: normalizedEmail,
      password: hashedPassword,
    });

    const token = generateToken(user._id, user.role);

    return res.status(201).json({
      success: true,
      message: "Register successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      const duplicateField = Object.keys(error.keyValue || {})[0];

      return res.status(409).json({
        success: false,
        message: `${duplicateField || "Account"} already exists`,
      });
    }

    console.error("Register error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot register account",
    });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { account, password } = req.body;

    const normalizedAccount = account?.trim();

    if (!normalizedAccount || !password) {
      return res.status(400).json({
        success: false,
        message: "Please enter account and password",
      });
    }

    const user = await User.findOne({
      $or: [
        {
          email: normalizedAccount.toLowerCase(),
        },
        {
          username: normalizedAccount.toLowerCase(),
        },
      ],
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid account or password",
      });
    }

    const isMatch = await bcrypt.compare(
      password,
      user.password,
    );

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid account or password",
      });
    }

    const token = generateToken(user._id, user.role);

    return res.status(200).json({
      success: true,
      message: "Login successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot login",
    });
  }
};

// FORGOT PASSWORD
exports.forgotPassword = async (req, res) => {
  try {
    const normalizedEmail = req.body.email
      ?.trim()
      .toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    // Không tiết lộ email có tồn tại hay không
    if (!user) {
      return res.status(200).json({
        success: true,
        message:
          "If the email exists, an OTP has been sent",
      });
    }

    const otp = generateOTP();

    await OTP.deleteMany({
      email: normalizedEmail,
    });

    await OTP.create({
      email: normalizedEmail,
      otp,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await sendEmail(
      normalizedEmail,
      "Cinema Booking - Reset Password",
      `
        <h2>Cinema Booking</h2>
        <p>Your OTP code is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `,
    );

    return res.status(200).json({
      success: true,
      message:
        "If the email exists, an OTP has been sent",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot send OTP",
    });
  }
};

// VERIFY OTP
exports.verifyOTP = async (req, res) => {
  try {
    const normalizedEmail = req.body.email
      ?.trim()
      .toLowerCase();

    const otp = String(req.body.otp || "").trim();

    if (!normalizedEmail || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    const otpData = await OTP.findOne({
      email: normalizedEmail,
      otp,
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpData.expiresAt.getTime() < Date.now()) {
      await OTP.deleteOne({
        _id: otpData._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP verified successfully",
    });
  } catch (error) {
    console.error("Verify OTP error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot verify OTP",
    });
  }
};

// RESET PASSWORD
exports.resetPassword = async (req, res) => {
  try {
    const normalizedEmail = req.body.email
      ?.trim()
      .toLowerCase();

    const otp = String(req.body.otp || "").trim();

    const {
      newPassword,
      confirmNewPassword,
    } = req.body;

    if (
      !normalizedEmail ||
      !otp ||
      !newPassword ||
      !confirmNewPassword
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Email, OTP, new password and confirmation are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message:
          "New password must be at least 6 characters",
      });
    }

    if (newPassword !== confirmNewPassword) {
      return res.status(400).json({
        success: false,
        message: "New passwords do not match",
      });
    }

    const otpData = await OTP.findOne({
      email: normalizedEmail,
      otp,
    });

    if (!otpData) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (otpData.expiresAt.getTime() < Date.now()) {
      await OTP.deleteOne({
        _id: otpData._id,
      });

      return res.status(400).json({
        success: false,
        message: "OTP has expired",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = await bcrypt.hash(
      newPassword,
      10,
    );

    await user.save();

    await OTP.deleteMany({
      email: normalizedEmail,
    });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot reset password",
    });
  }
};