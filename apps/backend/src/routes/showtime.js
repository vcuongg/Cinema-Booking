const express = require("express");

const router = express.Router();

const {
  getShowtimes,
  getManageShowtimes,
  getShowtimeFormData,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
} = require("../controllers/showtimeController");

router.get("/", getShowtimes);
router.get("/manage", getManageShowtimes);
router.get("/form-data", getShowtimeFormData);
router.get("/:id", getShowtime);
router.post("/", createShowtime);
router.patch("/:id", updateShowtime);
router.delete("/:id", deleteShowtime);

module.exports = router;