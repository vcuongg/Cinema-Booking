const mongoose = require('mongoose');
const ShowTime = require('../models/ShowTime');
const Seat = require('../models/Seat');
const Booking = require('../models/Booking');
const Room = require('../models/Room');


// GET /api/showtimes?movieId=
const getShowtimesByMovie = async (req, res) => {
    const { movieId } = req.query;

    if (!movieId) {
        return res.status(400).json({ error: "movieId is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(movieId)) {
        return res.status(400).json({ error: "Invalid movieId" });
    }

    const showtimes = await ShowTime.find({ movieId })
    .populate('roomId', 'roomName totalSeats')
    .sort({ showDate: 1, startTime: 1 });

    res.status(200).json(showtimes);
};


// GET /api/showtimes/:showtimeId/seats
// Lấy sơ đồ ghế của 1 suất chiếu, kèm trạng thái isBooked
const getSeatsByShowtime = async (req, res) => {
  const { showtimeId } = req.params;
 
  if (!mongoose.Types.ObjectId.isValid(showtimeId)) {
    return res.status(400).json({ error: "Invalid showtimeId" });
  }
 
  try {
    
    const showtime = await ShowTime.findById(showtimeId);
    if (!showtime) {
      return res.status(404).json({ error: "Showtime not found" });
    }
 
    
    const seats = await Seat.find({ roomId: showtime.roomId }).sort({
      seatRow: 1,
      seatNumber: 1,
    });
 
   
    const bookings = await Booking.find({
      showtimeId,
      bookingStatus: { $in: ["pending", "confirmed"] },
    });
 
    
    const bookedSeatIds = new Set(
      bookings.flatMap((booking) =>
        booking.seats.map((s) => s.seatId.toString())
      )
    );
 
    
    const seatsWithStatus = seats.map((seat) => ({
      _id: seat._id,
      seatRow: seat.seatRow,
      seatNumber: seat.seatNumber,
      seatType: seat.seatType,
      isBooked: bookedSeatIds.has(seat._id.toString()),
    }));
 
    res.status(200).json({
      showtimeId,
      movieId: showtime.movieId,
      roomId: showtime.roomId,
      showDate: showtime.showDate,
      startTime: showtime.startTime,
      endTime: showtime.endTime,
      price: showtime.price,
      seats: seatsWithStatus,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


module.exports = { getShowtimesByMovie, getSeatsByShowtime};