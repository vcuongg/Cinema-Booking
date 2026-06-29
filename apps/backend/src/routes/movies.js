const express = require("express");
const router = express.Router();
const {
  createMovie,
  getMovie,
  getMovies,
  deleteMovie,
  updateMovie,
} = require("../controllers/moviesController");

// GET all movies
router.get("/", getMovies);

// GET a single movie
router.get("/:id", getMovie);

// POST a new movie
router.post("/", createMovie);

// DELETE a movie
router.delete("/:id", deleteMovie);

// UPDATE a movie
router.patch("/:id", updateMovie);

module.exports = router;
