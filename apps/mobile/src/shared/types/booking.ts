export type PaymentMethod = 'simulated' | 'payos' | 'momo' | 'vnpay' | 'card';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'cancelled' | 'refunded';
export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface MovieSummary {
  _id: string;
  title: string;
  description?: string;
  genre?: string | string[];
  duration?: number;
  language?: string;
  poster?: string;
  posterUrl?: string;
  rating?: number;
}

export interface CinemaSummary {
  _id: string;
  cinemaName: string;
  address?: string;
  city?: string;
}

export interface RoomSummary {
  _id: string;
  roomName: string;
  cinemaId?: CinemaSummary | string;
}

export interface ShowtimeSummary {
  _id: string;
  movieId?: MovieSummary | string;
  roomId?: RoomSummary | string;
  showDate: string;
  startTime: string;
  endTime?: string;
  price: number;
}

export interface SelectedSeat {
  _id: string;
  seatRow: string;
  seatNumber: number;
  seatType?: 'standard' | 'vip';
  seatName: string;
  price: number;
}

export interface PriceSummary {
  orderAmount: number;
  serviceFee: number;
  discountAmount: number;
  totalPrice: number;
  promoCode: string;
  promoMessage?: string;
}

export interface BookingCheckout {
  movie?: MovieSummary | null;
  showtime: ShowtimeSummary;
  cinema?: CinemaSummary | null;
  room?: RoomSummary | null;
  selectedSeats: SelectedSeat[];
  priceSummary: PriceSummary;
}

export interface BookingSeat {
  seatId: SelectedSeat | string;
  price: number;
}

export interface Booking {
  _id: string;
  userId: string;
  showtimeId: ShowtimeSummary | string;
  seats: BookingSeat[];
  totalPrice: number;
  orderAmount?: number;
  serviceFee?: number;
  discountAmount?: number;
  promoCode?: string;
  paymentMethod: PaymentMethod;
  paymentProvider?: 'simulated' | 'payos';
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
  ticketCode: string;
  paidAt?: string | null;
  paymentExpiresAt?: string | null;
  payosOrderCode?: number | null;
  payosPaymentLinkId?: string;
  payosCheckoutUrl?: string;
  payosQrCode?: string;
  payosStatus?: string;
  paymentReference?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface BookingPreviewRequest {
  showtimeId: string;
  seatIds: string[];
  promoCode?: string;
}

export interface CreateBookingRequest extends BookingPreviewRequest {
  paymentMethod: PaymentMethod;
}

export interface BookingPaymentInfo {
  provider: 'simulated' | 'payos';
  status: PaymentStatus;
  orderCode?: number;
  paymentLinkId?: string;
  checkoutUrl?: string;
  qrCode?: string;
  expiresAt?: string;
}

export interface CreateBookingResponse {
  booking: Booking;
  checkout: BookingCheckout;
  payment?: BookingPaymentInfo;
}
