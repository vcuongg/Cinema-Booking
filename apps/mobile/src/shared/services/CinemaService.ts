import { apiRequest } from "./api";

import { Cinema } from "@/shared/types/cinema";

export interface CreateCinemaRequest {
  cinemaName: string;
  address: string;
  city: string;
  coverPhoto?: string;
  totalHalls: number;
  totalCapacity: number;
  isActive?: boolean;
}

export interface UpdateCinemaRequest {
  cinemaName?: string;
  address?: string;
  city?: string;
  coverPhoto?: string;
  totalHalls?: number;
  totalCapacity?: number;
  isActive?: boolean;
}

export async function getCinemas(): Promise<Cinema[]> {
  return apiRequest<Cinema[]>("/cinemas");
}

export async function getActiveCinemas(): Promise<Cinema[]> {
  return apiRequest<Cinema[]>("/cinemas/active");
}

export async function searchCinemas(keyword: string): Promise<Cinema[]> {
  return apiRequest<Cinema[]>(
    `/cinemas/search?keyword=${encodeURIComponent(keyword)}`, {
    method: "GET",
    auth: true,
  }
  );
}

export async function getCinemaById(id: string): Promise<Cinema> {
  return apiRequest<Cinema>(`/cinemas/${id}`);
}

export async function createCinema(
  payload: CreateCinemaRequest
): Promise<Cinema> {
  return apiRequest<Cinema>("/cinemas", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });
}

export async function updateCinema(
  id: string,
  payload: UpdateCinemaRequest
): Promise<Cinema> {
  const data = await apiRequest<{
    message: string;
    cinema: Cinema;
  }>(`/cinemas/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });

  return data.cinema;
}

export async function deleteCinema(id: string): Promise<void> {
  await apiRequest(`/cinemas/${id}`, {
    method: "DELETE",
  });
}