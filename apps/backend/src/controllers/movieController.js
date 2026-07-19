const mongoose = require("mongoose");

const Movie = require("../models/Movie");
const { isDbConnected } = require("../config/db");

const dbUnavailableResponse = {
  success: true,
  count: 0,
  movies: [],
  warning: "Database unavailable. Running in degraded mode.",
};

// GET ALL MOVIES
const getMovies = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json(dbUnavailableResponse);
    }

    const movies = await Movie.find().sort({
      createdAt: -1,
    });

    const normalizedMovies = movies.map((movie) => {
      const data = movie.toObject();
      const poster = data.poster?.trim() || data.posterUrl?.trim() || "";
      const trailer = data.trailer?.trim() || data.trailerUrl?.trim() || "";
      return { ...data, poster, posterUrl: poster, trailer, trailerUrl: trailer };
    });

    return res.status(200).json({
      success: true,
      count: normalizedMovies.length,
      movies: normalizedMovies,
    });
  } catch (error) {
    console.error("Get movies error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot load movies",
    });
  }
};

// GET NOW SHOWING
const getNowShowingMovies = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json(dbUnavailableResponse);
    }

    const movies = await Movie.find({
      status: "now_showing",
    }).sort({
      releaseDate: -1,
    });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies: movies.map(normalizeMovie),
    });
  } catch (error) {
    console.error("Get now showing error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot load now showing movies",
    });
  }
};

// GET COMING SOON
const getComingSoonMovies = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json(dbUnavailableResponse);
    }

    const movies = await Movie.find({
      status: "coming_soon",
    }).sort({
      releaseDate: 1,
    });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies: movies.map(normalizeMovie),
    });
  } catch (error) {
    console.error("Get coming soon error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot load coming soon movies",
    });
  }
};

const escapeRegex = (value) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Normalize a field that can arrive as an array or a comma-separated string
// into a clean array of trimmed, non-empty strings.
const normalizeStringArray = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof value === "string") {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// SEARCH MOVIES
const searchMovies = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(200).json(dbUnavailableResponse);
    }

    const keyword = req.query.keyword?.trim() || "";

    if (!keyword) {
      return res.status(400).json({
        success: false,
        message: "Search keyword is required",
      });
    }

    const escapedKeyword = escapeRegex(keyword);

    const movies = await Movie.find({
      $or: [
        {
          title: {
            $regex: escapedKeyword,
            $options: "i",
          },
        },
        {
          genre: {
            $regex: escapedKeyword,
            $options: "i",
          },
        },
        {
          director: {
            $regex: escapedKeyword,
            $options: "i",
          },
        },
        {
          description: {
            $regex: escapedKeyword,
            $options: "i",
          },
        },
      ],
    }).sort({
      releaseDate: -1,
    });

    return res.status(200).json({
      success: true,
      count: movies.length,
      movies: movies.map(normalizeMovie),
    });
  } catch (error) {
    console.error("Search movies error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot search movies",
    });
  }
};

// GET MOVIE DETAIL
const getMovie = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Please try again later.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const movie = await Movie.findById(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      movie: normalizeMovie(movie),
    });
  } catch (error) {
    console.error("Get movie detail error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot load movie detail",
    });
  }
};

// CREATE MOVIE
const createMovie = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Cannot create movie now.",
      });
    }

    const {
      title,
      description,
      duration,
      genre,
      director,
      actors,
      posterUrl,
      trailerUrl,
      releaseDate,
      status,
      rating,
      priceFrom,
      isFeatured,
    } = req.body;

    const normalizedGenre = normalizeStringArray(genre);
    const normalizedActors = normalizeStringArray(actors);

    if (
      !title?.trim() ||
      !description?.trim() ||
      normalizedGenre.length === 0 ||
      !duration ||
      !releaseDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Title, description, genre, duration and release date are required",
      });
    }

    const movie = await Movie.create({
      title: title.trim(),
      description: description.trim(),
      duration,
      genre: normalizedGenre,
      director,
      actors: normalizedActors,
      posterUrl,
      trailerUrl,
      releaseDate,
      status,
      rating,
      priceFrom,
      isFeatured,
    });

    return res.status(201).json({
      success: true,
      message: "Movie created successfully",
      movie,
    });
  } catch (error) {
    console.error("Create movie error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// UPDATE MOVIE
const updateMovie = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Cannot update movie now.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const updates = { ...req.body };

    if (updates.genre !== undefined) {
      updates.genre = normalizeStringArray(updates.genre);
    }

    if (updates.actors !== undefined) {
      updates.actors = normalizeStringArray(updates.actors);
    }

    const movie = await Movie.findByIdAndUpdate(
      id,
      updates,
      {
        new: true,
        runValidators: true,
      },
    );

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie updated successfully",
      movie,
    });
  } catch (error) {
    console.error("Update movie error:", error);

    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};

// DELETE MOVIE
const deleteMovie = async (req, res) => {
  try {
    if (!isDbConnected()) {
      return res.status(503).json({
        success: false,
        message: "Database unavailable. Cannot delete movie now.",
      });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid movie ID",
      });
    }

    const movie = await Movie.findByIdAndDelete(id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: "Movie not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movie deleted successfully",
      movie,
    });
  } catch (error) {
    console.error("Delete movie error:", error);

    return res.status(500).json({
      success: false,
      message: "Cannot delete movie",
    });
  }
};

module.exports = {
  getMovies,
  getNowShowingMovies,
  getComingSoonMovies,
  searchMovies,
  getMovie,
  createMovie,
  updateMovie,
  deleteMovie,
};

const normalizeMovie = (movie) => {
  const data = movie.toObject ? movie.toObject() : movie;
  const poster = String(data.poster || data.posterUrl || "").trim();
  const trailer = String(data.trailer || data.trailerUrl || "").trim();
  return { ...data, poster, posterUrl: poster, trailer, trailerUrl: trailer };
};
