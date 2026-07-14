import { apiRequest } from './api';

import { ShowtimeSummary } from '@/shared/types/booking';

export interface SeatStatus {
  _id: string;
  seatRow: string;
  seatNumber: number;
  seatType?: 'standard' | 'vip';
  seatName: string;
  isBooked: boolean;
}

interface SeatsResponse {
  showtime: ShowtimeSummary;
  seats: Array<Omit<SeatStatus, 'seatName'>>;
}

function getDocumentId(value?: string | { _id?: string } | null) {
  if (!value) {
    return '';
  }

  return typeof value === 'string' ? value : value._id || '';
}

function normalizeSeat(seat: Omit<SeatStatus, 'seatName'>): SeatStatus {
  return {
    ...seat,
    seatName: `${seat.seatRow}${seat.seatNumber}`,
  };
}

export async function getShowtimesByMovie(movieId: string): Promise<ShowtimeSummary[]> {
  const showtimes = await apiRequest<ShowtimeSummary[]>('/showtimes');

  return showtimes.filter((showtime) => getDocumentId(showtime.movieId) === movieId);
}

export async function getSeatsByShowtime(showtimeId: string): Promise<{
  showtime: ShowtimeSummary;
  seats: SeatStatus[];
}> {
  const data = await apiRequest<SeatsResponse>(`/showtimes/${showtimeId}/seats`);

  return {
    showtime: data.showtime,
    seats: data.seats.map(normalizeSeat),
  };
}
