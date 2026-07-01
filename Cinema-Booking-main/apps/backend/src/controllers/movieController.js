const Movie = require("../models/Movie");
const mongoose = require("mongoose");

// GET /api/movies
exports.getAllMovies = async (req, res) => {
    try {
        const movies = await Movie.find().sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET /api/movies/now-showing
exports.getNowShowingMovies = async (req, res) => {
    try {
        const movies = await Movie.find({ status: "now_showing" }).sort({
            releaseDate: -1,
        });

        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET /api/movies/coming-soon
exports.getComingSoonMovies = async (req, res) => {
    try {
        const movies = await Movie.find({ status: "coming_soon" }).sort({
            releaseDate: 1,
        });

        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET /api/movies/search?keyword=
exports.searchMovies = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";

        const movies = await Movie.find({
            title: {
                $regex: keyword,
                $options: "i",
            },
        });

        res.status(200).json({
            success: true,
            count: movies.length,
            data: movies,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};

// GET /api/movies/:id
exports.getMovieById = async (req, res) => {
    try {
        const { id } = req.params;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({
                success: false,
                message: "Invalid movie id",
            });
        }

        const movie = await Movie.findById(id);

        if (!movie) {
            return res.status(404).json({
                success: false,
                message: "Movie not found",
            });
        }

        res.status(200).json({
            success: true,
            data: movie,
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message,
        });
    }
};