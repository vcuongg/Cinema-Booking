import { Cinema } from "./cinema";

export interface Room {
    _id: string;

    cinemaId: string | Cinema;

    roomName: string;

    totalSeats: number;

    rows: number;

    seatsPerRow: number;

    createdAt: string;

    updatedAt: string;
}

export interface CreateRoomRequest {
  cinemaId: string;

  roomName: string;

  totalSeats?: number;

  rows: number;

  seatsPerRow: number;
}

export interface UpdateRoomRequest {
  roomName?: string;

  totalSeats?: number;

  rows?: number;

  seatsPerRow?: number;
}