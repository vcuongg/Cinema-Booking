import { Platform } from 'react-native';

import {
  Booking,
  BookingCheckout,
  BookingPreviewRequest,
  CreateBookingRequest,
  CreateBookingResponse,
} from '@/shared/types/booking';

const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5001/api'
    : 'http://localhost:5001/api';

interface ApiErrorBody {
  message?: string;
  error?: string;
}

async function requestJson<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, headers, ...requestOptions } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...requestOptions,
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  const rawBody = await response.text();
  const data = rawBody ? JSON.parse(rawBody) : {};

  if (!response.ok) {
    const errorBody = data as ApiErrorBody;
    throw new Error(errorBody.message || errorBody.error || `Request failed: ${response.status}`);
  }

  return data as T;
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
