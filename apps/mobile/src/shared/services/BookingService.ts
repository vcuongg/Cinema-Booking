import {
  Booking,
  BookingCheckout,
  BookingPreviewRequest,
  CreateBookingRequest,
  CreateBookingResponse,
} from '@/shared/types/booking';
import { apiRequest } from './api';

interface ApiErrorBody {
  message?: string;
  error?: string;
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;

  try {
    return await apiRequest<T>(path, {
      ...requestOptions,
      headers: {
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch (error) {
    const errorBody = error as ApiErrorBody;
    throw new Error(errorBody.message || errorBody.error || (error instanceof Error ? error.message : 'Request failed'));
  }
}

export async function previewBooking(
  payload: BookingPreviewRequest,
  token: string,
): Promise<BookingCheckout> {
  const data = await requestJson<{ checkout: BookingCheckout }>('/bookings/preview', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });

  return data.checkout;
}

export async function createBooking(
  payload: CreateBookingRequest,
  token: string,
): Promise<CreateBookingResponse> {
  const data = await requestJson<CreateBookingResponse>('/bookings', {
    method: 'POST',
    body: JSON.stringify(payload),
    token,
  });

  return data;
}

export async function getMyBookings(token: string): Promise<Booking[]> {
  const data = await requestJson<{ bookings: Booking[] }>('/bookings/my', {
    method: 'GET',
    token,
  });

  return data.bookings;
}

export async function getBookingById(id: string, token: string): Promise<Booking> {
  const data = await requestJson<{ booking: Booking }>(`/bookings/${id}`, {
    method: 'GET',
    token,
  });

  return data.booking;
}
