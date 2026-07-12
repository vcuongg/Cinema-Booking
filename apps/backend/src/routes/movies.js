const express = require("express");
const router = express.Router();

const {
  createMovie,
  getMovies,
  getMovie,
  deleteMovie,
  updateMovie,
} = require("../controllers/movieController");

router.get("/", getMovies);
router.get("/:id", getMovie);
router.post("/", createMovie);
router.patch("/:id", updateMovie);
router.delete("/:id", deleteMovie);

module.exports = router;