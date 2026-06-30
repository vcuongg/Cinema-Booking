const bcrypt = require("bcrypt");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const OTP = require("../models/OTP");
const sendEmail = require("../utils/sendEmail");
const generateOTP = require("../utils/generateOTP");

//register
exports.register = async (req, res) => {
    try {

        const {
            name,
            username,
            email,
            password,
            resetPassword,
        } = req.body;

        if (!name || !username || !email || !password) {
            return res.status(400).json({
                success: false,
                message: "Please fill all fields",
            });
        }

        const emailExists = await User.findOne({ email });

        if (emailExists) {
            return res.status(400).json({
                success: false,
                message: "Email already exists",
            });
        }

        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            return res.status(400).json({
                success: false,
                message: "Username already exists",
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
        });

        const token = generateToken(user._id, user.role);

        res.status(201).json({
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

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

//login
exports.login = async (req, res) => {
    try {

        const { account, password } = req.body;

        if (!account || !password) {
            return res.status(400).json({
                success: false,
                message: "Please enter account and password",
            });
        }

        const user = await User.findOne({
            $or: [
                { email: account },
                { username: account },
            ],
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: "Account does not exist",
            });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: "Wrong password",
            });
        }

        const token = generateToken(user._id, user.role);

        res.status(200).json({
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

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

//ForgotPassword
exports.forgotPassword = async (req, res) => {
    try {

        const { email } = req.body;

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Email does not exist",
            });
        }

        const otp = generateOTP();

        await OTP.deleteMany({ email });

        await OTP.create({
            email,
            otp,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
        });

        await sendEmail(
            email,
            "Cinema Booking - Reset Password",
            `
                <h2>Cinema Booking</h2>

                <p>Your OTP code is:</p>

                <h1 style="color:red;">${otp}</h1>

                <p>This OTP will expire in 5 minutes.</p>
            `
        );

        res.json({
            success: true,
            message: "OTP has been sent to your email.",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

// Verify OTP
exports.verifyOTP = async (req, res) => {
    try {

        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({
                success: false,
                message: "Email and OTP are required",
            });
        }

        const otpData = await OTP.findOne({ email, otp });

        if (!otpData) {
            return res.status(400).json({
                success: false,
                message: "Invalid OTP",
            });
        }

        if (otpData.expiresAt < new Date()) {

            await OTP.deleteOne({ _id: otpData._id });

            return res.status(400).json({
                success: false,
                message: "OTP has expired",
            });
        }

        res.status(200).json({
            success: true,
            message: "OTP verified successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};

//resetPassword
exports.resetPassword = async (req, res) => {
    try {

        const { email, newPassword } = req.body;

        if (!email || !newPassword) {
            return res.status(400).json({
                success: false,
                message: "Email and new password are required",
            });
        }

        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        // Xóa OTP sau khi đổi mật khẩu
        await OTP.deleteMany({ email });

        res.json({
            success: true,
            message: "Password has been reset successfully",
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message,
        });

    }
};
