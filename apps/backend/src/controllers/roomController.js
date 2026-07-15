const mongoose = require("mongoose");

const Cinema = require("../models/Cinema");
const Room = require("../models/Room");
const Seat = require("../models/Seat");
const Showtime = require("../models/Showtime");

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

// GET /api/rooms
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

// GET /api/rooms/form-data
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

// GET /api/rooms/:id
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

// POST /api/rooms
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
        $regex: `^${normalizedRoomName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
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

// PATCH /api/rooms/:id
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

    const nextCinemaId = req.body.cinemaId || room.cinemaId.toString();
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

    const cinema = await ensureCinemaExists(nextCinemaId);

    if (!cinema) {
      return res.status(404).json({
        error: "Cinema not found",
      });
    }

    const duplicateRoom = await Room.findOne({
      _id: { $ne: id },
      cinemaId: nextCinemaId,
      roomName: {
        $regex: `^${nextRoomName.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
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

    if (layoutChanged) {
      const hasShowtime = await Showtime.exists({ roomId: id });

      if (hasShowtime) {
        return res.status(409).json({
          error:
            "Cannot change room layout because this room already has showtimes",
        });
      }
    }

    room.cinemaId = nextCinemaId;
    room.roomName = nextRoomName;
    room.rows = nextRows;
    room.seatsPerRow = nextSeatsPerRow;
    room.totalSeats = nextRows * nextSeatsPerRow;

    await room.save();

    if (layoutChanged) {
      await Seat.deleteMany({ roomId: room._id });

      const seats = buildSeatLayout(room._id, room.rows, room.seatsPerRow);

      if (seats.length > 0) {
        await Seat.insertMany(seats);
      }
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

// DELETE /api/rooms/:id
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

    return res.status(200).json({
      message: "Room deleted",
    });
  } catch (error) {
    return res.status(400).json({
      error: error.message,
    });
  }
};

module.exports = {
  getRooms,
  getRoomFormData,
  getRoomById,
  createRoom,
  updateRoom,
  deleteRoom,
};
