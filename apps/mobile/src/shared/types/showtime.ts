import { Movie } from "./movie";
import { Room } from "./room";
import { Cinema } from "./cinema";
import { ShowtimeSeat } from "./seat";
export interface Showtime {

    _id: string;

    movieId: string | Movie;

    roomId: string | Room;

    showDate: string;

    startTime: string;

    endTime: string;

    price: number;

    createdAt: string;

    updatedAt: string;
}
export interface ManageShowtime {
  movie: Movie;
  showtimes: Showtime[];
}

export interface ShowtimeFormData {
  movies: Movie[];
  cinemas: Cinema[];
  rooms: Room[];
}

export interface CreateShowtimeRequest {
  movieId: string;
  roomId: string;
  showDate: string;
  startTime: string;
  price: number;
}

export interface UpdateShowtimeRequest {
  movieId?: string;
  roomId?: string;
  showDate?: string;
  startTime?: string;
  price?: number;
}

export interface ShowtimeSeatsResponse {
  showtime: Showtime;
  seats: ShowtimeSeat[];
}