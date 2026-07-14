import axios from "axios";
import { Platform } from "react-native";
import type { ShowtimeSummary, SelectedSeat } from "@/shared/types/booking";


const BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5001/api"
    : "http://localhost:5001/api";

const SHOWTIME_API = `${BASE_URL}/showtimes`;

export const showtimeService = {
  getShowtimesByMovie: async (movieId: string): Promise<ShowtimeSummary[]> => {

    const response = await fetch(`${SHOWTIME_API}?movieId=${movieId}`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch showtimes");
    }
    

    return response.json();
  },

  getSeatsByShowtime: async (
    showtimeId: string
  ): Promise<{ showtime: ShowtimeSummary; seats: SelectedSeat[] }> => {
    const response = await fetch(`${SHOWTIME_API}/${showtimeId}/seats`);
    
    if (!response.ok) {
      throw new Error("Failed to fetch seats");
    }
    
    return response.json();
  },
};