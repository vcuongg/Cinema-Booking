const express = require("express");

const router = express.Router();

const favouriteController = require("../controllers/favouriteController");

const protect = require("../middleware/authMiddleware");

router.post("/", protect, favouriteController.addFavourite);

router.get("/", protect, favouriteController.getFavouriteMovies);

router.delete("/:movieId", protect, favouriteController.removeFavourite);

module.exports = router;