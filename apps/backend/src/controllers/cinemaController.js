const Cinema = require("../models/Cinema");
const mongoose = require("mongoose");

function normalizeText(text) {
  return text
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}
// ================= GET ALL CINEMAS =================

const getAllCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find().sort({
      createdAt: -1,
    });

    res.status(200).json(cinemas);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET ACTIVE CINEMAS =================

const getActiveCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find({
      isActive: true,
    }).sort({
      cinemaName: 1,
    });

    res.status(200).json(cinemas);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= SEARCH CINEMAS =================

const searchCinemas = async (req, res) => {
  try {
    const keyword = req.query.keyword || "";

    const cinemas = await Cinema.find({
      cinemaName: {
        $regex: keyword,
        $options: "i",
      },
    });

    res.status(200).json(cinemas);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET CINEMA BY ID =================

const getCinemaById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such cinema",
    });
  }

  try {
    const cinema = await Cinema.findById(id);

    if (!cinema) {
      return res.status(404).json({
        error: "No such cinema",
      });
    }

    res.status(200).json(cinema);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= CREATE CINEMA =================

const createCinema = async (req, res) => {
  const {
    cinemaName,
    address,
    city,
    coverPhoto,
    totalHalls,
    totalCapacity,
    isActive,
  } = req.body;

  try {
    const normalizedAddress = normalizeText(address);
    const normalizedCity = normalizeText(city);

    const cinemas = await Cinema.find();

    const existingCinema = cinemas.find(
      (cinema) =>
        normalizeText(cinema.address) === normalizedAddress &&
        normalizeText(cinema.city) === normalizedCity,
    );

    if (existingCinema) {
      return res.status(409).json({
        error: "A cinema already exists at this address.",
      });
    }

    const cinema = await Cinema.create({
      cinemaName: cinemaName.trim(),
      address: address.trim(),
      city: city.trim(),
      coverPhoto,
      totalHalls,
      totalCapacity,
      isActive,
    });

    return res.status(201).json(cinema);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= UPDATE CINEMA =================

const updateCinema = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such cinema",
    });
  }

  try {
    const normalizedAddress = normalizeText(req.body.address);
    const normalizedCity = normalizeText(req.body.city);

    const cinemas = await Cinema.find({
      _id: { $ne: id },
    });

    const existingCinema = cinemas.find(
      (cinema) =>
        normalizeText(cinema.address) === normalizedAddress &&
        normalizeText(cinema.city) === normalizedCity,
    );

    if (existingCinema) {
      return res.status(409).json({
        error: "A cinema already exists at this address.",
      });
    }

    const cinema = await Cinema.findByIdAndUpdate(
      id,
      {
        ...req.body,
        cinemaName: req.body.cinemaName?.trim(),
        address: req.body.address?.trim(),
        city: req.body.city?.trim(),
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!cinema) {
      return res.status(404).json({
        error: "No such cinema",
      });
    }

    return res.status(200).json({
      message: "Cinema updated successfully.",
      cinema,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};
// ================= DELETE CINEMA =================

const deleteCinema = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such cinema",
    });
  }

  try {
    const cinema = await Cinema.findByIdAndDelete(id);

    if (!cinema) {
      return res.status(404).json({
        error: "No such cinema",
      });
    }

    res.status(200).json({
      message: "Cinema deleted",
      cinema,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  getAllCinemas,
  getActiveCinemas,
  searchCinemas,
  getCinemaById,
  createCinema,
  updateCinema,
  deleteCinema,
};
