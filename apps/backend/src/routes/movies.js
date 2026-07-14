const express = require("express");

const {
  createMovie,
  getMovies,
  getMovie,
  getNowShowingMovies,
  getComingSoonMovies,
  searchMovies,
  updateMovie,
  deleteMovie,
} = require("../controllers/movieController");

const protect = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");

const router = express.Router();

// Public routes
router.get("/", getMovies);
router.get("/now-showing", getNowShowingMovies);
router.get("/coming-soon", getComingSoonMovies);
router.get("/search", searchMovies);
router.get("/:id", getMovie);

// Admin và staff
router.post(
  "/",
  protect,
  authorizeRoles("admin", "staff"),
  createMovie,
);

router.patch(
  "/:id",
  protect,
  authorizeRoles("admin", "staff"),
  updateMovie,
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteMovie,
);

module.exports = router;