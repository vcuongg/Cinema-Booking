const express = require("express");

const router = express.Router();

// Import thêm getNowShowingMovies ở đây
const {
    getAllMovies,
    getComingSoonMovies,
    searchMovies,
    getMovieById,
    getNowShowingMovies
} = require("../controllers/movieController");

// GET /api/movies
router.get("/", getAllMovies);
router.get("/now-showing", getNowShowingMovies);
router.get("/coming-soon", getComingSoonMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovieById);

module.exports = router;