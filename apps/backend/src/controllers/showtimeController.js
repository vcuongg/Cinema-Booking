const mongoose = require("mongoose");
const Showtime = require("../models/Showtime");
const Seat = require("../models/Seat");
const Booking = require("../models/Booking");
const Room = require("../models/Room");
const Movie = require("../models/Movie");
const Cinema = require("../models/Cinema");

const calculateEndTime = (startTime, duration) => {
  const [hour, minute] = startTime.split(":").map(Number);

  const totalMinutes = hour * 60 + minute + duration;

  const endHour = Math.floor(totalMinutes / 60);
  const endMinute = totalMinutes % 60;

  return `${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(
    2,
    "0",
  )}`;
};

// ================= GET ALL =================

const getShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find()
      .populate("movieId")
      .populate({
        path: "roomId",
        populate: {
          path: "cinemaId",
        },
      })
      .sort({
        showDate: 1,
        startTime: 1,
      });

    res.status(200).json(showtimes);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET MANAGE UI =================

const getManageShowtimes = async (req, res) => {
  try {
    const movies = await Movie.find({
      status: "now_showing",
    }).sort({
      title: 1,
    });

    const movieIds = movies.map((movie) => movie._id);

    const showtimes = await Showtime.find({
      movieId: {
        $in: movieIds,
      },
    })
      .populate({
        path: "roomId",
        populate: {
          path: "cinemaId",
        },
      })
      .sort({
        showDate: 1,
        startTime: 1,
      });

    const result = movies.map((movie) => ({
      movie,
      showtimes: showtimes.filter(
        (showtime) => showtime.movieId.toString() === movie._id.toString(),
      ),
    }));

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET FORM DATA =================

const getShowtimeFormData = async (req, res) => {
  try {
    // Chỉ lấy phim đang chiếu
    const movies = await Movie.find({
      status: "now_showing",
    }).sort({
      title: 1,
    });

    // Chỉ lấy rạp đang hoạt động
    const cinemas = await Cinema.find({
      isActive: true,
    }).sort({
      cinemaName: 1,
    });

    // Lấy id của các rạp đang hoạt động
    const cinemaIds = cinemas.map((cinema) => cinema._id);

    // Chỉ lấy phòng thuộc các rạp đang hoạt động
    const rooms = await Room.find({
      cinemaId: {
        $in: cinemaIds,
      },
    })
      .populate("cinemaId")
      .sort({
        roomName: 1,
      });

    res.status(200).json({
      movies,
      cinemas,
      rooms,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET SINGLE =================

const getShowtime = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such showtime",
    });
  }

  try {
    const showtime = await Showtime.findById(id)
      .populate("movieId")
      .populate({
        path: "roomId",
        populate: {
          path: "cinemaId",
        },
      });

    if (!showtime) {
      return res.status(404).json({
        error: "No such showtime",
      });
    }

    res.status(200).json(showtime);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};
// ================= CREATE =================

const createShowtime = async (req, res) => {
  const { movieId, roomId, showDate, startTime, price } = req.body;

  try {
    // ===== Check movie =====

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        error: "Movie not found",
      });
    }

    // ===== Check room =====

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // ===== Check release date =====

    if (new Date(showDate) < new Date(movie.releaseDate)) {
      return res.status(400).json({
        error: "Movie has not been released yet",
      });
    }

    // ===== Calculate end time =====

    const endTime = calculateEndTime(startTime, movie.duration);

    // ===== Check duplicated showtime =====

    const existedShowtimes = await Showtime.find({
      roomId,
      showDate,
    });

    const newStart =
      Number(startTime.split(":")[0]) * 60 + Number(startTime.split(":")[1]);

    const newEnd =
      Number(endTime.split(":")[0]) * 60 + Number(endTime.split(":")[1]);

    const isConflict = existedShowtimes.some((show) => {
      const existStart =
        Number(show.startTime.split(":")[0]) * 60 +
        Number(show.startTime.split(":")[1]);

      const existEnd =
        Number(show.endTime.split(":")[0]) * 60 +
        Number(show.endTime.split(":")[1]);

      return newStart < existEnd && newEnd > existStart;
    });

    if (isConflict) {
      return res.status(400).json({
        error: "Room already has another showtime during this period",
      });
    }

    // ===== Create =====

    const showtime = await Showtime.create({
      movieId,
      roomId,
      showDate,
      startTime,
      endTime,
      price,
    });

    res.status(201).json(showtime);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= UPDATE =================

const updateShowtime = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such showtime",
    });
  }

  try {
    const currentShowtime = await Showtime.findById(id);

    if (!currentShowtime) {
      return res.status(404).json({
        error: "No such showtime",
      });
    }

    const movieId = req.body.movieId ?? currentShowtime.movieId;

    const roomId = req.body.roomId ?? currentShowtime.roomId;

    const showDate = req.body.showDate ?? currentShowtime.showDate;

    const startTime = req.body.startTime ?? currentShowtime.startTime;

    const price = req.body.price ?? currentShowtime.price;

    // ===== Check movie =====

    const movie = await Movie.findById(movieId);

    if (!movie) {
      return res.status(404).json({
        error: "Movie not found",
      });
    }

    // ===== Check room =====

    const room = await Room.findById(roomId);

    if (!room) {
      return res.status(404).json({
        error: "Room not found",
      });
    }

    // ===== Release date =====

    if (new Date(showDate) < new Date(movie.releaseDate)) {
      return res.status(400).json({
        error: "Movie has not been released yet",
      });
    }

    const endTime = calculateEndTime(startTime, movie.duration);

    // ===== Conflict =====

    const existedShowtimes = await Showtime.find({
      roomId,
      showDate,
      _id: {
        $ne: id,
      },
    });

    const newStart =
      Number(startTime.split(":")[0]) * 60 + Number(startTime.split(":")[1]);

    const newEnd =
      Number(endTime.split(":")[0]) * 60 + Number(endTime.split(":")[1]);

    const isConflict = existedShowtimes.some((show) => {
      const existStart =
        Number(show.startTime.split(":")[0]) * 60 +
        Number(show.startTime.split(":")[1]);

      const existEnd =
        Number(show.endTime.split(":")[0]) * 60 +
        Number(show.endTime.split(":")[1]);

      return newStart < existEnd && newEnd > existStart;
    });

    if (isConflict) {
      return res.status(400).json({
        error: "Room already has another showtime during this period",
      });
    }

    // ===== Update =====

    currentShowtime.movieId = movieId;
    currentShowtime.roomId = roomId;
    currentShowtime.showDate = showDate;
    currentShowtime.startTime = startTime;
    currentShowtime.endTime = endTime;
    currentShowtime.price = price;

    await currentShowtime.save();

    res.status(200).json({
      message: "Showtime updated",
      showtime: currentShowtime,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= DELETE =================

const deleteShowtime = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such showtime",
    });
  }

  try {
    const showtime = await Showtime.findByIdAndDelete(id);

    if (!showtime) {
      return res.status(404).json({
        error: "No such showtime",
      });
    }

    res.status(200).json({
      message: "Showtime deleted",
      showtime,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET BY MOVIE =================

const getShowtimesByMovie = async (req, res) => {
  const { movieId } = req.query;

  if (!movieId) {
    return res.status(400).json({
      error: "Movie ID is required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(movieId)) {
    return res.status(404).json({
      error: "Invalid movie ID",
    });
  }

  const showtimes = await Showtime.find({ movieId })
    .populate({
      path: "roomId",
      select: "roomName totalSeats",
      populate: {
        path: "cinemaId",
        select: "cinemaName address city", // Thêm các trường cần thiết
      },
    })
    .sort({ showDate: 1, startTime: 1 });

    res.status(200).json(showtimes);
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET SEATS BY SHOWTIME =================

const getSeatsByShowtime = async (req, res) => {
  const { showtimeId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
    return res.status(404).json({
      error: "No such showtime",
    });
  }

  try {
    const showtime = await Showtime.findById(showtimeId)
      .populate("movieId")
      .populate({
        path: "roomId",
        populate: {
          path: "cinemaId",
        },
      });

    if (!showtime) {
      return res.status(404).json({
        error: "No such showtime",
      });
    }

    // Get all seats in the room
    const seats = await Seat.find({
      roomId: showtime.roomId._id,
    });

    // Get all bookings for this showtime
    const bookings = await Booking.find({
      showtimeId,
    });

    const bookedSeatIds = bookings
      .map((booking) => booking.seats.map((seat) => seat.toString()))
      .flat();

    // Add booking status to each seat
    const seatsWithStatus = seats.map((seat) => ({
      ...seat.toObject(),
      isBooked: bookedSeatIds.includes(seat._id.toString()),
    }));

    res.status(200).json({
      showtime,
      seats: seatsWithStatus,
    });
  } catch (error) {
    res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  getShowtimes,
  getManageShowtimes,
  getShowtimeFormData,
  getShowtime,
  createShowtime,
  updateShowtime,
  deleteShowtime,
  getShowtimesByMovie,
  getSeatsByShowtime,
};
