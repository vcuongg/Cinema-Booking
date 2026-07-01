const Movie = require("../models/Movies");
const mongoose = require("mongoose");

// get all movies
const getMovies = async (req, res) => {
  const movies = await Movie.find().sort({ createdAt: -1 });
  res.status(200).json(movies);
};

// get now showing movies
const getNowShowingMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      status: "now_showing",
    }).sort({ releaseDate: -1 });

    res.status(200).json(movies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get coming soon movies
const getComingSoonMovies = async (req, res) => {
  try {
    const movies = await Movie.find({
      status: "coming_soon",
    }).sort({ releaseDate: 1 });

    res.status(200).json(movies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// search movies
const searchMovies = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const movies = await Movie.find({
      title: {
        $regex: keyword,
        $options: "i",
      },
    });

    res.status(200).json(movies);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// get a single movie
const getMovie = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such movie" });
  }

  const movie = await Movie.findById(id);

  if (!movie) {
    return res.status(404).json({ error: "No such movie" });
  }

  res.status(200).json(movie);
};

// create a new movie
const createMovie = async (req, res) => {
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

  try {
    const movie = await Movie.create({
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
    });

    res.status(200).json(movie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// delete a movie
const deleteMovie = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such movie" });
  }

  const movie = await Movie.findOneAndDelete({ _id: id });

  if (!movie) {
    return res.status(404).json({ error: "No such movie" });
  }

  res.status(200).json({
    message: "Movie deleted",
    movie,
  });
};

// update a movie
const updateMovie = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ error: "No such movie" });
  }

  const movie = await Movie.findOneAndUpdate(
    { _id: id },
    {
      ...req.body,
    },
    {
      new: true,
      runValidators: true,
    }
  );

  if (!movie) {
    return res.status(404).json({ error: "No such movie" });
  }

  res.status(200).json({
    message: "Movie updated",
    movie,
  });
};

module.exports = {
  getMovies,
  getNowShowingMovies,
  getComingSoonMovies,
  searchMovies,
  getMovie,
  createMovie,
  deleteMovie,
  updateMovie,
};
