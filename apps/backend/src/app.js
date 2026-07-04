const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const favouriteRoutes = require("./routes/favourite");

const sendEmail = require("./utils/sendEmail");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/favourites", favouriteRoutes);

// Home
app.get("/", (req, res) => {
    res.send("Cinema Booking API");
});

// Test Email (Chỉ dùng khi phát triển)
app.get("/test-email", async (req, res) => {
    try {
        await sendEmail(
            "cinemabooking@gmail.com",
            "Cinema Booking Test",
            `
            <h2>🎬 Cinema Booking</h2>
            <p>Chúc mừng!</p>
            <p>Hệ thống gửi email thành công.</p>
            `
        );

        res.json({
            success: true,
            message: "Email sent successfully",
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

module.exports = app;