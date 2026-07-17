const mongoose = require("mongoose");

const Cinema = require("../models/Cinema");
const Room = require("../models/Room");
const Seat = require("../models/Seat");
const Showtime = require("../models/Showtime");

// ================= HELPERS =================

function getRowLabel(index) {
  let value = index + 1;
  let label = "";

  while (value > 0) {
    const remainder = (value - 1) % 26;
    label = String.fromCharCode(65 + remainder) + label;
    value = Math.floor((value - 1) / 26);
  }

  return label;
}

function buildSeatLayout(roomId, rows, seatsPerRow) {
  const seats = [];

  for (let row = 0; row < rows; row += 1) {
    const seatRow = getRowLabel(row);

    for (let number = 1; number <= seatsPerRow; number += 1) {
      seats.push({
        roomId,
        seatRow,
        seatNumber: number,
        seatType: "standard",
      });
    }
  }

  return seats;
}

function parsePositiveInt(value) {
  const parsed = Number(value);

  if (!Number.isInteger(parsed) || parsed <= 0) {
    return null;
  }

  return parsed;
}

async function ensureCinemaExists(cinemaId) {
  if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
    return null;
  }

  return Cinema.findById(cinemaId);
}

function escapeRegex(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// ================= GET ALL ROOMS =================


const getRooms = async (req, res) => {
  try {
    const query = {};

    if (req.query.cinemaId) {
      if (!mongoose.Types.ObjectId.isValid(req.query.cinemaId)) {
        return res.status(400).json({
          error: "Invalid cinema ID",
        });
      }

      query.cinemaId = req.query.cinemaId;
    }

    const rooms = await Room.find(query)
      .populate("cinemaId")
      .sort({ createdAt: -1 });

    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET ROOMS BY CINEMA =================

const getRoomsByCinema = async (req, res) => {
  const { cinemaId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
    return res.status(404).json({
      error: "No such cinema",
    });
  }

  try {
    const rooms = await Room.find({
      cinemaId,
    }).sort({
      roomName: 1,
    });

    return res.status(200).json(rooms);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET ROOM FORM DATA =================

const getRoomFormData = async (req, res) => {
  try {
    const cinemas = await Cinema.find({ isActive: true }).sort({
      cinemaName: 1,
    });

    return res.status(200).json({
      cinemas,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= GET ROOM BY ID =================

const getRoomById = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such room",
    });
  }

  try {
    const room = await Room.findById(id).populate("cinemaId");

    if (!room) {
      return res.status(404).json({
        error: "No such room",
      });
    }

    return res.status(200).json(room);
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= CREATE ROOM =================


const createRoom = async (req, res) => {
  const { cinemaId, roomName, rows, seatsPerRow } = req.body;

  const parsedRows = parsePositiveInt(rows);
  const parsedSeatsPerRow = parsePositiveInt(seatsPerRow);

  if (!roomName || !String(roomName).trim()) {
    return res.status(400).json({
      error: "Room name is required",
    });
  }

  if (!parsedRows || !parsedSeatsPerRow) {
    return res.status(400).json({
      error: "Rows and seatsPerRow must be positive integers",
    });
  }

  try {
    const cinema = await ensureCinemaExists(cinemaId);

    if (!cinema) {
      return res.status(404).json({
        error: "Cinema not found",
      });
    }

    const normalizedRoomName = String(roomName).trim();

    const duplicateRoom = await Room.findOne({
      cinemaId,
      roomName: {
        $regex: `^${escapeRegex(normalizedRoomName)}$`,
        $options: "i",
      },
    });

    if (duplicateRoom) {
      return res.status(409).json({
        error: "Room name already exists in this cinema",
      });
    }

    const totalSeats = parsedRows * parsedSeatsPerRow;

    const room = await Room.create({
      cinemaId,
      roomName: normalizedRoomName,
      rows: parsedRows,
      seatsPerRow: parsedSeatsPerRow,
      totalSeats,
    });

    const seats = buildSeatLayout(room._id, parsedRows, parsedSeatsPerRow);

    if (seats.length > 0) {
      await Seat.insertMany(seats);
    }

    // Keep the parent cinema's inventory numbers in sync
    cinema.totalHalls += 1;
    cinema.totalCapacity += totalSeats;
    await cinema.save();

    const populatedRoom = await Room.findById(room._id).populate("cinemaId");

    return res.status(201).json({
      message: "Room created",
      room: populatedRoom,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= UPDATE ROOM =================

const updateRoom = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such room",
    });
  }

  try {
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        error: "No such room",
      });
    }

    const previousCinemaId = room.cinemaId.toString();
    const previousTotalSeats = room.totalSeats;

    const nextCinemaId = req.body.cinemaId || previousCinemaId;
    const nextRoomName = req.body.roomName
      ? String(req.body.roomName).trim()
      : room.roomName;

    if (!nextRoomName) {
      return res.status(400).json({
        error: "Room name is required",
      });
    }

    const nextRows =
      req.body.rows !== undefined ? parsePositiveInt(req.body.rows) : room.rows;
    const nextSeatsPerRow =
      req.body.seatsPerRow !== undefined
        ? parsePositiveInt(req.body.seatsPerRow)
        : room.seatsPerRow;

    if (!nextRows || !nextSeatsPerRow) {
      return res.status(400).json({
        error: "Rows and seatsPerRow must be positive integers",
      });
    }

    const cinemaChanged = nextCinemaId !== previousCinemaId;

    const nextCinema = await ensureCinemaExists(nextCinemaId);

    if (!nextCinema) {
      return res.status(404).json({
        error: "Cinema not found",
      });
    }

    const duplicateRoom = await Room.findOne({
      _id: { $ne: id },
      cinemaId: nextCinemaId,
      roomName: {
        $regex: `^${escapeRegex(nextRoomName)}$`,
        $options: "i",
      },
    });

    if (duplicateRoom) {
      return res.status(409).json({
        error: "Room name already exists in this cinema",
      });
    }

    const layoutChanged =
      nextRows !== room.rows || nextSeatsPerRow !== room.seatsPerRow;

    if (layoutChanged || cinemaChanged) {
      const hasShowtime = await Showtime.exists({ roomId: id });

      if (hasShowtime) {
        return res.status(409).json({
          error:
            "Cannot change this room's layout or cinema because it already has showtimes",
        });
      }
    }

    const nextTotalSeats = nextRows * nextSeatsPerRow;

    room.cinemaId = nextCinemaId;
    room.roomName = nextRoomName;
    room.rows = nextRows;
    room.seatsPerRow = nextSeatsPerRow;
    room.totalSeats = nextTotalSeats;

    await room.save();

    if (layoutChanged) {
      await Seat.deleteMany({ roomId: room._id });

      const seats = buildSeatLayout(room._id, room.rows, room.seatsPerRow);

      if (seats.length > 0) {
        await Seat.insertMany(seats);
      }
    }

    // Sync cinema inventory numbers
    if (cinemaChanged) {
      await Cinema.findByIdAndUpdate(previousCinemaId, {
        $inc: { totalHalls: -1, totalCapacity: -previousTotalSeats },
      });

      await Cinema.findByIdAndUpdate(nextCinemaId, {
        $inc: { totalHalls: 1, totalCapacity: nextTotalSeats },
      });
    } else if (nextTotalSeats !== previousTotalSeats) {
      await Cinema.findByIdAndUpdate(nextCinemaId, {
        $inc: { totalCapacity: nextTotalSeats - previousTotalSeats },
      });
    }

    const populatedRoom = await Room.findById(id).populate("cinemaId");

    return res.status(200).json({
      message: "Room updated",
      room: populatedRoom,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= DELETE ROOM =================

const deleteRoom = async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({
      error: "No such room",
    });
  }

  try {
    const room = await Room.findById(id);

    if (!room) {
      return res.status(404).json({
        error: "No such room",
      });
    }

    const hasShowtime = await Showtime.exists({ roomId: id });

    if (hasShowtime) {
      return res.status(409).json({
        error: "Cannot delete room because it is linked to showtimes",
      });
    }

    await Seat.deleteMany({ roomId: id });
    await Room.findByIdAndDelete(id);

    await Cinema.findByIdAndUpdate(room.cinemaId, {
      $inc: { totalHalls: -1, totalCapacity: -room.totalSeats },
    });

    return res.status(200).json({
      message: "Room deleted",
      room,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

// ================= DELETE ROOMS BY CINEMA =================


const deleteRoomsByCinema = async (req, res) => {
  const { cinemaId } = req.params;

  if (!mongoose.Types.ObjectId.isValid(cinemaId)) {
    return res.status(404).json({
      error: "No such cinema",
    });
  }

  try {
    const rooms = await Room.find({ cinemaId }, "_id");
    const roomIds = rooms.map((room) => room._id);

    if (roomIds.length > 0) {
      await Seat.deleteMany({ roomId: { $in: roomIds } });
    }

    const result = await Room.deleteMany({ cinemaId });

    return res.status(200).json({
      message: "Rooms deleted",
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  getRooms,
  getRoomsByCinema,
  getRoomFormData,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
  deleteRoomsByCinema,
};