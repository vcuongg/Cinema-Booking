const express = require("express");

const router = express.Router();

const {
  getAllCinemas,
  getActiveCinemas,
  searchCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema,
} = require("../controllers/cinemaController");

// GET /api/cinemas
router.get("/", getAllCinemas);

// GET /api/cinemas/active
router.get("/active", getActiveCinemas);

// GET /api/cinemas/search?keyword=...
router.get("/search", searchCinemas);

// GET /api/cinemas/:id
router.get("/:id", getCinemaById);

// POST /api/cinemas
router.post("/", createCinema);

// PATCH /api/cinemas/:id
router.patch("/:id", updateCinema);

// DELETE /api/cinemas/:id
router.delete("/:id", deleteCinema);

module.exports = router;