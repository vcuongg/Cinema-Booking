const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const movieRoutes = require("./routes/movies");
const favouriteRoutes = require("./routes/favourite");
const showtimeRoutes = require("./routes/showtime");
const { isDbConnected } = require("./config/db");

const app = express();

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
    ],
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/movies", movieRoutes);
app.use("/api/favourites", favouriteRoutes);
app.use("/api/showtimes", showtimeRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Cinema Booking API is running",
  });
});

app.get("/api/health", (req, res) => {
  return res.status(200).json({
    success: true,
    service: "backend",
    dbConnected: isDbConnected(),
  });
});

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use((error, req, res, next) => {
  console.error("Unhandled backend error:", error);

  return res.status(500).json({
    success: false,
    message: "Internal server error",
  });
});

module.exports = app;