import { Platform } from "react-native";

import {
  Showtime,
  ManageShowtime,
  ShowtimeFormData,
  CreateShowtimeRequest,
  UpdateShowtimeRequest,
} from "@/shared/types/showtime";

const API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5001/api"
    : "http://localhost:5001/api";

interface ApiErrorBody {
  message?: string;
  error?: string;
}

async function requestJson<T>(
  path: string,
  options: RequestInit = {},
): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  const rawBody = await response.text();
  const data = rawBody ? JSON.parse(rawBody) : {};

  if (!response.ok) {
    const errorBody = data as ApiErrorBody;

    throw new Error(
      errorBody.message ??
        errorBody.error ??
        `Request failed: ${response.status}`,
    );
  }

  return data as T;
}

/* ===========================
   GET ALL SHOWTIMES
=========================== */

export async function getShowtimes(): Promise<Showtime[]> {
  return requestJson<Showtime[]>("/showtimes");
}

/* ===========================
   MANAGE UI
=========================== */

export async function getManageShowtimes(): Promise<ManageShowtime[]> {
  return requestJson<ManageShowtime[]>("/showtimes/manage");
}

/* ===========================
   FORM DATA
=========================== */

export async function getShowtimeFormData(): Promise<ShowtimeFormData> {
  return requestJson<ShowtimeFormData>("/showtimes/form-data");
}

/* ===========================
   GET DETAIL
=========================== */

export async function getShowtimeById(id: string): Promise<Showtime> {
  return requestJson<Showtime>(`/showtimes/${id}`);
}

/* ===========================
   CREATE
=========================== */

export async function createShowtime(
  payload: CreateShowtimeRequest,
): Promise<Showtime> {
  return requestJson<Showtime>("/showtimes", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/* ===========================
   UPDATE
=========================== */

export async function updateShowtime(
  id: string,
  payload: UpdateShowtimeRequest,
): Promise<Showtime> {
  const data = await requestJson<{
    message: string;
    showtime: Showtime;
  }>(`/showtimes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });

  return data.showtime;
}

/* ===========================
   DELETE
=========================== */

export async function deleteShowtime(id: string): Promise<void> {
  await requestJson(`/showtimes/${id}`, {
    method: "DELETE",
  });
}

/* ===========================
   GET SHOWTIMES BY MOVIE
=========================== */

export async function getShowtimesByMovie(
  movieId: string,
): Promise<Showtime[]> {
  return requestJson<Showtime[]>(
    `/showtimes/movie?movieId=${movieId}`,
  );
}

/* ===========================
   GET SEATS
=========================== */

// export async function getSeatsByShowtime(
//   showtimeId: string,
// ): Promise<Seat[]> {
//   const data = await requestJson<{
//     seats: Seat[];
//   }>(`/showtimes/${showtimeId}/seats`);

//   return data.seats;
// }