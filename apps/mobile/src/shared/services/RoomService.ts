import { apiRequest } from "./api";

import type { Cinema } from "@/shared/types/cinema";
import type { Room } from "@/shared/types/room";

interface RoomFormDataResponse {
  cinemas: Cinema[];
}

interface RoomMutationResponse {
  message: string;
  room: Room;
}

export interface RoomPayload {
  cinemaId: string;
  roomName: string;
  rows: number;
  seatsPerRow: number;
}

export async function getRooms(): Promise<Room[]> {
  return apiRequest<Room[]>("/rooms", {
    method: "GET",
    auth: true,
  });
}

export async function getRoomFormData(): Promise<RoomFormDataResponse> {
  return apiRequest<RoomFormDataResponse>("/rooms/form-data", {
    method: "GET",
    auth: true,
  });
}

export async function createRoom(payload: RoomPayload): Promise<Room> {
  const data = await apiRequest<RoomMutationResponse>("/rooms", {
    method: "POST",
    auth: true,
    body: JSON.stringify(payload),
  });

  return data.room;
}

export async function updateRoom(id: string, payload: RoomPayload): Promise<Room> {
  const data = await apiRequest<RoomMutationResponse>(`/rooms/${id}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(payload),
  });

  return data.room;
}

export async function deleteRoom(id: string): Promise<void> {
  await apiRequest(`/rooms/${id}`, {
    method: "DELETE",
    auth: true,
  });
}
