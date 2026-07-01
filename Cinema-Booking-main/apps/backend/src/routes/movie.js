const express = require("express");

const router = express.Router();

const {
    getAllMovies,
    getNowShowingMovies,
    getComingSoonMovies,
    searchMovies,
    getMovieById,
} = require("../controllers/movieController");

router.get("/", getAllMovies);
router.get("/now-showing", getNowShowingMovies);
router.get("/coming-soon", getComingSoonMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovieById);

module.exports = router;