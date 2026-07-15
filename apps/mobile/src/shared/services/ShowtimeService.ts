import { apiRequest } from './api';
import { ShowtimeSummary } from '@/shared/types/booking';
import {
  CreateShowtimeRequest,
  ManageShowtime,
  Showtime,
  ShowtimeFormData,
  UpdateShowtimeRequest,
} from '@/shared/types/showtime';

// --- TYPES & HELPERS ---
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

function normalizeSeat(seat: Omit<SeatStatus, 'seatName'>): SeatStatus {
  return {
    ...seat,
    seatName: `${seat.seatRow}${seat.seatNumber}`,
  };
}



export async function getShowtimes(): Promise<Showtime[]> {
  return apiRequest<Showtime[]>('/showtimes');
}

export async function getManageShowtimes(): Promise<ManageShowtime[]> {
  return apiRequest<ManageShowtime[]>('/showtimes/manage');
}

export async function getShowtimeFormData(): Promise<ShowtimeFormData> {
  return apiRequest<ShowtimeFormData>('/showtimes/form-data');
}

export async function getShowtimeById(id: string): Promise<Showtime> {
  return apiRequest<Showtime>(`/showtimes/${id}`);
}

export async function createShowtime(payload: CreateShowtimeRequest): Promise<Showtime> {
  return apiRequest<Showtime>('/showtimes', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateShowtime(
  id: string,
  payload: UpdateShowtimeRequest,
): Promise<Showtime> {
  const data = await apiRequest<{
    message: string;
    showtime: Showtime;
  }>(`/showtimes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });

  return data.showtime;
}

export async function deleteShowtime(id: string): Promise<void> {
  await apiRequest(`/showtimes/${id}`, {
    method: 'DELETE',
  });
}

///////////////////////////////////////////////////

export const showtimeService = {
  getShowtimesByMovie: async (movieId: string): Promise<ShowtimeSummary[]> => {
    // Sử dụng apiRequest của dự án thay vì fetch thô
    return apiRequest<ShowtimeSummary[]>(
      `/showtimes/movie?movieId=${encodeURIComponent(movieId)}`
    );
  },

  getSeatsByShowtime: async (showtimeId: string): Promise<{
    showtime: ShowtimeSummary;
    seats: SeatStatus[];
  }> => {
    // Tận dụng apiRequest và hàm normalizeSeat cực hay của team member
    const data = await apiRequest<SeatsResponse>(`/showtimes/${showtimeId}/seats`);

    return {
      showtime: data.showtime,
      seats: data.seats.map(normalizeSeat),
    };
  },
};