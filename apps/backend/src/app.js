const express = require("express");
const cors = require("cors");

const movieRoutes = require("./routes/movies");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "ProjectMMA backend is running" });
});

app.use("/api/movies", movieRoutes);

module.exports = app;
