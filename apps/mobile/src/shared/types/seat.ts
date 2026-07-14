import { Room } from "./room";
import { Showtime } from "./showtime";
export type SeatType =
    | "standard"
    | "vip";

export interface ShowtimeSeat {
  _id: string;
  seatRow: string;
  seatNumber: number;
  seatType: "standard" | "vip";
  isBooked: boolean;
}

export interface ShowtimeSeatsResponse {
  showtime: Showtime;
  seats: ShowtimeSeat[];
}