import { MaterialIcons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { createBooking, previewBooking } from '@/shared/services/BookingService';
import {
  BookingCheckout,
  MovieSummary,
  PaymentMethod,
  PriceSummary,
} from '@/shared/types/booking';

const TEST_TOKEN = '';
const TEST_SHOWTIME_ID = '';
const TEST_SEAT_IDS: string[] = [];

const demoCheckout: BookingCheckout = {
  movie: {
    _id: 'demo-movie',
    title: 'Interstellar Odyssey',
    genre: 'Sci-Fi',
    duration: 148,
    rating: 4.9,
    poster:
      'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg',
  },
  showtime: {
    _id: 'demo-showtime',
    showDate: '2024-10-24T00:00:00.000Z',
    startTime: '20:45',
    endTime: '23:13',
    price: 90000,
  },
  cinema: {
    _id: 'demo-cinema',
    cinemaName: 'Grand Cinema',
    address: '7th Ave, New York',
    city: 'New York',
  },
  room: {
    _id: 'demo-room',
    roomName: 'Hall 04',
  },
  selectedSeats: [
    {
      _id: 'demo-seat-1',
      seatRow: 'G',
      seatNumber: 12,
      seatType: 'vip',
      seatName: 'G12',
      price: 90000,
    },
    {
      _id: 'demo-seat-2',
      seatRow: 'G',
      seatNumber: 14,
      seatType: 'vip',
      seatName: 'G14',
      price: 90000,
    },
  ],
  priceSummary: {
    orderAmount: 180000,
    serviceFee: 2500,
    discountAmount: 0,
    totalPrice: 182500,
    promoCode: '',
  },
};

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value || '';
}

function parseSeatIds(value?: string | string[]) {
  const rawValue = getParamValue(value);

  if (!rawValue) {
    return TEST_SEAT_IDS;
  }

  return rawValue
    .split(',')
    .map((seatId) => seatId.trim())
    .filter(Boolean);
}

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')} VND`;
}

function formatDate(value?: string) {
  if (!value) {
    return 'N/A';
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatGenre(movie?: MovieSummary | null) {
  if (!movie || !movie.genre) {
    return 'Cinema';
  }

  return Array.isArray(movie.genre) ? movie.genre.join(', ') : movie.genre;
}

function getPosterUrl(movie?: MovieSummary | null) {
  return movie?.poster || movie?.posterUrl || demoCheckout.movie?.poster || '';
}

function applyDemoPromo(priceSummary: PriceSummary, promoCode: string): PriceSummary {
  const normalizedCode = promoCode.trim().toUpperCase();
  let discountAmount = 0;
  let promoMessage = '';

  if (normalizedCode === 'CINEMA10') {
    discountAmount = Math.round(priceSummary.orderAmount * 0.1);
    promoMessage = 'Promo CINEMA10 applied';
  } else if (normalizedCode === 'NEWUSER') {
    discountAmount = Math.min(5000, priceSummary.orderAmount);
    promoMessage = 'Promo NEWUSER applied';
  } else if (normalizedCode) {
    promoMessage = 'Promo code is not valid';
  }

  return {
    ...priceSummary,
    promoCode: normalizedCode,
    discountAmount,
    promoMessage,
    totalPrice: Math.max(
      0,
      Math.round((priceSummary.orderAmount + priceSummary.serviceFee - discountAmount) * 100) /
        100,
    ),
  };
}

export default function PaymentScreen() {
  const params = useLocalSearchParams<{
    token?: string;
    showtimeId?: string;
    seatIds?: string;
  }>();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('payos');
  const [promoCode, setPromoCode] = useState('');
  const [checkout, setCheckout] = useState<BookingCheckout>(demoCheckout);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [isLoadingPreview, setIsLoadingPreview] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const token = getParamValue(params.token) || TEST_TOKEN;
  const showtimeId = getParamValue(params.showtimeId) || TEST_SHOWTIME_ID;
  const seatIds = useMemo(() => parseSeatIds(params.seatIds), [params.seatIds]);
  const canUseApi = Boolean(token && showtimeId && seatIds.length > 0);
  const movie = checkout.movie;
  const selectedSeatNames = checkout.selectedSeats.map((seat) => seat.seatName).join(', ');

  const loadPreview = async (nextPromoCode = promoCode) => {
    setError('');
    setMessage('');
    setPaymentUrl('');

    if (!canUseApi) {
      setCheckout((currentCheckout) => ({
        ...currentCheckout,
        priceSummary: applyDemoPromo(currentCheckout.priceSummary, nextPromoCode),
      }));
      return;
    }

    setIsLoadingPreview(true);

    try {
      const preview = await previewBooking(
        {
          showtimeId,
          seatIds,
          promoCode: nextPromoCode,
        },
        token,
      );

      setCheckout(preview);
      setMessage(preview.priceSummary.promoMessage || '');
    } catch (previewError) {
      const nextError =
        previewError instanceof Error ? previewError.message : 'Failed to load payment preview';
      setError(nextError);
    } finally {
      setIsLoadingPreview(false);
    }
  };

  useEffect(() => {
    loadPreview('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, showtimeId, seatIds.join(',')]);

  const handleApplyPromo = () => {
    loadPreview(promoCode);
  };

  const openPaymentUrl = async (url: string) => {
    if (!url) {
      return;
    }

    await WebBrowser.openBrowserAsync(url);
  };

  const handleConfirm = async () => {
    setError('');
    setMessage('');

    if (paymentUrl) {
      await openPaymentUrl(paymentUrl);
      return;
    }

    if (!canUseApi) {
      setError('Missing token, showtimeId, or seatIds. Payment is showing demo data.');
      return;
    }

    setIsProcessing(true);

    try {
      const result = await createBooking(
        {
          showtimeId,
          seatIds,
          paymentMethod,
          promoCode,
        },
        token,
      );

      setCheckout(result.checkout);

      if (result.payment?.provider === 'payos' && result.payment.checkoutUrl) {
        setPaymentUrl(result.payment.checkoutUrl);
        setMessage('PayOS payment link created. Complete payment to receive your ticket.');
        await openPaymentUrl(result.payment.checkoutUrl);
        return;
      }

      if (result.booking.paymentStatus === 'paid') {
        setMessage(`Payment success. Ticket code: ${result.booking.ticketCode}`);
      } else {
        setMessage('Booking created. Waiting for payment confirmation.');
      }
    } catch (bookingError) {
      const nextError =
        bookingError instanceof Error ? bookingError.message : 'Failed to confirm booking';
      setError(nextError);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={24} color="#dce3f0" />
        </Pressable>

        <Text style={styles.headerTitle}>Confirm Booking</Text>

        <View style={styles.iconButton} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.movieRow}>
          <View style={styles.posterWrap}>
            <Image source={{ uri: getPosterUrl(movie) }} style={styles.poster} />
            <Text style={styles.posterBadge}>IMAX</Text>
          </View>

          <View style={styles.movieInfo}>
            <Text style={styles.movieTitle}>{movie?.title || 'Movie title'}</Text>
            <Text style={styles.metaText}>
              {formatGenre(movie)} - {movie?.duration || 0} min - {movie?.rating || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <View style={styles.cardHeaderText}>
              <Text style={styles.label}>Cinema & Location</Text>
              <Text style={styles.value}>
                {checkout.cinema?.cinemaName || 'Cinema'} - {checkout.room?.roomName || 'Room'}
              </Text>
              <Text style={styles.metaText}>{checkout.cinema?.address || 'Address'}</Text>
            </View>
            <MaterialIcons name="map" size={24} color="#e50914" />
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailColumn}>
              <Text style={styles.label}>Showtime</Text>
              <Text style={styles.value}>{formatDate(checkout.showtime.showDate)}</Text>
              <Text style={styles.highlightValue}>{checkout.showtime.startTime}</Text>
            </View>

            <View style={[styles.detailColumn, styles.leftBorder]}>
              <Text style={styles.label}>Seats</Text>
              <Text style={styles.value}>
                {checkout.selectedSeats[0]?.seatType === 'vip' ? 'VIP Section' : 'Standard'}
              </Text>
              <Text style={styles.highlightValue}>{selectedSeatNames || 'N/A'}</Text>
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Promo Code</Text>
          <View style={styles.promoRow}>
            <TextInput
              placeholder="Enter code"
              placeholderTextColor="#777"
              value={promoCode}
              onChangeText={setPromoCode}
              autoCapitalize="characters"
              editable={!paymentUrl}
              style={styles.input}
            />
            <Pressable
              style={[
                styles.applyButton,
                (isLoadingPreview || Boolean(paymentUrl)) && styles.disabledButton,
              ]}
              onPress={handleApplyPromo}
              disabled={isLoadingPreview || Boolean(paymentUrl)}>
              <Text style={styles.applyText}>{isLoadingPreview ? '...' : 'Apply'}</Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Payment Method</Text>

          <PaymentOption
            label="VietQR / PayOS"
            badge="QR"
            selected={paymentMethod === 'payos'}
            onPress={() => setPaymentMethod('payos')}
          />
        </View>

        <View style={styles.card}>
          <PriceRow
            label={`Order Amount (${checkout.selectedSeats.length} seats)`}
            value={formatCurrency(checkout.priceSummary.orderAmount)}
          />
          <PriceRow label="Service Fee" value={formatCurrency(checkout.priceSummary.serviceFee)} />
          <PriceRow
            label="Promo Discount"
            value={`-${formatCurrency(checkout.priceSummary.discountAmount)}`}
            accent
          />
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Pay</Text>
            <Text style={styles.total}>{formatCurrency(checkout.priceSummary.totalPrice)}</Text>
          </View>
        </View>

        {!!message && <Text style={styles.successText}>{message}</Text>}
        {!!paymentUrl && (
          <Pressable style={styles.openPaymentButton} onPress={() => openPaymentUrl(paymentUrl)}>
            <MaterialIcons name="open-in-new" size={20} color="#fff7f6" />
            <Text style={styles.openPaymentText}>Open PayOS Checkout</Text>
          </Pressable>
        )}
        {!!error && <Text style={styles.errorText}>{error}</Text>}
      </ScrollView>

      <View style={styles.bottomBar}>
        <Pressable
          style={[styles.confirmButton, isProcessing && styles.disabledButton]}
          onPress={handleConfirm}
          disabled={isProcessing}>
          <Text style={styles.confirmText}>
            {paymentUrl ? 'Open PayOS Checkout' : isProcessing ? 'Creating...' : 'Create VietQR Payment'}
          </Text>
          {!isProcessing && <MaterialIcons name="chevron-right" size={24} color="#fff7f6" />}
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

function PaymentOption({
  label,
  badge,
  icon,
  selected,
  onPress,
}: {
  label: string;
  badge?: string;
  icon?: keyof typeof MaterialIcons.glyphMap;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      style={[styles.paymentOption, selected && styles.paymentSelected]}
      onPress={onPress}>
      <View style={styles.paymentLeft}>
        <View style={[styles.paymentIcon, badge && styles.momoIcon]}>
          {badge ? (
            <Text style={styles.paymentBadge}>{badge}</Text>
          ) : (
            <MaterialIcons name={icon || 'payments'} size={22} color="#dce3f0" />
          )}
        </View>
        <Text style={styles.value}>{label}</Text>
      </View>

      <MaterialIcons
        name={selected ? 'radio-button-checked' : 'radio-button-unchecked'}
        size={22}
        color={selected ? '#e50914' : '#c8c6c5'}
      />
    </Pressable>
  );
}

function PriceRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <View style={styles.priceRow}>
      <Text style={[styles.priceLabel, accent && styles.accentText]}>{label}</Text>
      <Text style={[styles.priceValue, accent && styles.accentText]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0d141d',
  },
  header: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  iconButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    color: '#fff7f6',
    fontSize: 20,
    fontWeight: '700',
  },
  content: {
    padding: 20,
    paddingBottom: 120,
  },
  movieRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  posterWrap: {
    width: 96,
    height: 144,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#151c25',
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  posterBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    backgroundColor: '#e50914',
    color: '#fff7f6',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  movieInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  movieTitle: {
    color: '#dce3f0',
    fontSize: 24,
    fontWeight: '700',
  },
  metaText: {
    color: '#af8782',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#192029',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  cardHeaderText: {
    flex: 1,
  },
  detailsGrid: {
    flexDirection: 'row',
    gap: 16,
    paddingTop: 16,
  },
  detailColumn: {
    flex: 1,
  },
  leftBorder: {
    borderLeftWidth: 1,
    borderLeftColor: 'rgba(255, 255, 255, 0.05)',
    paddingLeft: 16,
  },
  label: {
    color: '#af8782',
    fontSize: 12,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  value: {
    color: '#dce3f0',
    fontSize: 16,
    fontWeight: '600',
  },
  highlightValue: {
    color: '#fff7f6',
    fontSize: 18,
    fontWeight: '800',
    marginTop: 4,
  },
  promoRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    backgroundColor: '#151c25',
    borderRadius: 12,
    color: '#dce3f0',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  applyButton: {
    backgroundColor: '#2e353f',
    borderRadius: 12,
    paddingHorizontal: 18,
    justifyContent: 'center',
  },
  applyText: {
    color: '#dce3f0',
    fontWeight: '600',
  },
  paymentOption: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: '#232a34',
    marginTop: 10,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentSelected: {
    borderColor: '#e50914',
    backgroundColor: '#2e353f',
  },
  paymentLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  momoIcon: {
    backgroundColor: '#a50064',
  },
  paymentBadge: {
    color: '#ffffff',
    fontSize: 11,
    fontWeight: '800',
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  priceLabel: {
    color: '#af8782',
    fontSize: 15,
  },
  priceValue: {
    color: '#dce3f0',
    fontSize: 15,
    fontWeight: '600',
  },
  accentText: {
    color: '#e50914',
  },
  totalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    paddingTop: 14,
    marginTop: 2,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    color: '#fff7f6',
    fontSize: 20,
    fontWeight: '800',
  },
  total: {
    color: '#fff7f6',
    fontSize: 28,
    fontWeight: '800',
  },
  successText: {
    color: '#67d391',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  openPaymentButton: {
    height: 48,
    borderRadius: 12,
    backgroundColor: '#2e353f',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  openPaymentText: {
    color: '#fff7f6',
    fontSize: 15,
    fontWeight: '700',
  },
  errorText: {
    color: '#ffb4ab',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 16,
  },
  bottomBar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 20,
    backgroundColor: 'rgba(13, 20, 29, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  confirmButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#e50914',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  confirmText: {
    color: '#fff7f6',
    fontSize: 18,
    fontWeight: '700',
  },
  disabledButton: {
    opacity: 0.65,
  },
});
