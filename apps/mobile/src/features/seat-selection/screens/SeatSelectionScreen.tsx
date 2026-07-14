import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getSeatsByShowtime, SeatStatus } from '@/shared/services/ShowtimeService';
import { ShowtimeSummary } from '@/shared/types/booking';

function getParamValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] || '' : value || '';
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

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')} VND`;
}

export default function SeatSelectionScreen() {
  const params = useLocalSearchParams<{ showtimeId?: string | string[] }>();
  const showtimeId = getParamValue(params.showtimeId);
  const [showtime, setShowtime] = useState<ShowtimeSummary | null>(null);
  const [seats, setSeats] = useState<SeatStatus[]>([]);
  const [selectedSeatIds, setSelectedSeatIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadSeats = useCallback(async () => {
    if (!showtimeId) {
      setError('Showtime ID is missing');
      setLoading(false);
      return;
    }

    try {
      setError('');
      const data = await getSeatsByShowtime(showtimeId);
      setShowtime(data.showtime);
      setSeats(data.seats);
      setSelectedSeatIds((current) =>
        current.filter((seatId) => data.seats.some((seat) => seat._id === seatId && !seat.isBooked)),
      );
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load seats');
    } finally {
      setLoading(false);
    }
  }, [showtimeId]);

  useEffect(() => {
    loadSeats();
  }, [loadSeats]);

  const selectedSeats = useMemo(
    () => seats.filter((seat) => selectedSeatIds.includes(seat._id)),
    [seats, selectedSeatIds],
  );
  const totalPrice = (showtime?.price || 0) * selectedSeats.length;

  const toggleSeat = (seat: SeatStatus) => {
    if (seat.isBooked) {
      return;
    }

    setSelectedSeatIds((current) =>
      current.includes(seat._id)
        ? current.filter((seatId) => seatId !== seat._id)
        : [...current, seat._id],
    );
  };

  const continueToPayment = async () => {
    if (!showtimeId || selectedSeatIds.length === 0) {
      return;
    }

    const token = await AsyncStorage.getItem('token');

    if (!token) {
      router.replace('/login');
      return;
    }

    router.push({
      pathname: '/payment',
      params: {
        showtimeId,
        seatIds: selectedSeatIds.join(','),
      },
    } as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Select Seats</Text>
          <Text style={styles.title}>
            {showtime ? `${formatDate(showtime.showDate)} - ${showtime.startTime}` : 'Choose your seats'}
          </Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.helperText}>Loading seats...</Text>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
            {!!error && <Text style={styles.errorText}>{error}</Text>}

            {!error && (
              <>
                <View style={styles.screenBox}>
                  <Text style={styles.screenText}>SCREEN</Text>
                </View>

                <View style={styles.legendRow}>
                  <LegendDot color="#151D27" label="Available" />
                  <LegendDot color="#E50914" label="Selected" />
                  <LegendDot color="#3E4654" label="Booked" />
                </View>

                <View style={styles.seatGrid}>
                  {seats.map((seat) => {
                    const selected = selectedSeatIds.includes(seat._id);

                    return (
                      <Pressable
                        key={seat._id}
                        disabled={seat.isBooked}
                        onPress={() => toggleSeat(seat)}
                        style={[
                          styles.seatButton,
                          seat.seatType === 'vip' && styles.vipSeat,
                          selected && styles.selectedSeat,
                          seat.isBooked && styles.bookedSeat,
                        ]}>
                        <Text
                          style={[
                            styles.seatText,
                            selected && styles.selectedSeatText,
                            seat.isBooked && styles.bookedSeatText,
                          ]}>
                          {seat.seatName}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </>
            )}
          </ScrollView>

          <View style={styles.footer}>
            <View>
              <Text style={styles.footerLabel}>{selectedSeats.length} seats selected</Text>
              <Text style={styles.footerValue}>{formatCurrency(totalPrice)}</Text>
            </View>

            <Pressable
              disabled={selectedSeatIds.length === 0}
              onPress={continueToPayment}
              style={[styles.continueButton, selectedSeatIds.length === 0 && styles.disabledButton]}>
              <Text style={styles.continueText}>Continue</Text>
              <Ionicons name="arrow-forward" size={18} color="#fff" />
            </Pressable>
          </View>
        </>
      )}
    </SafeAreaView>
  );
}

function LegendDot({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={styles.legendText}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#090D12',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: 12,
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151D27',
    borderWidth: 1,
    borderColor: '#29313D',
  },
  headerText: {
    flex: 1,
  },
  eyebrow: {
    color: '#E50914',
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '900',
    marginTop: 3,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  content: {
    padding: 18,
    paddingBottom: 110,
  },
  helperText: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  errorText: {
    color: '#FF9E98',
    fontSize: 14,
    lineHeight: 21,
  },
  screenBox: {
    height: 42,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1F2937',
    borderWidth: 1,
    borderColor: '#374151',
    marginBottom: 18,
  },
  screenText: {
    color: '#9CA3AF',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },
  legendDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#4B5563',
  },
  legendText: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  seatGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 9,
    justifyContent: 'center',
  },
  seatButton: {
    width: 54,
    height: 44,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151D27',
    borderWidth: 1,
    borderColor: '#29313D',
  },
  vipSeat: {
    borderColor: '#A16207',
    backgroundColor: '#241A0A',
  },
  selectedSeat: {
    backgroundColor: '#E50914',
    borderColor: '#FF9E98',
  },
  bookedSeat: {
    backgroundColor: '#3E4654',
    borderColor: '#4B5563',
  },
  seatText: {
    color: '#D1D5DB',
    fontSize: 12,
    fontWeight: '800',
  },
  selectedSeatText: {
    color: '#fff',
  },
  bookedSeatText: {
    color: '#9CA3AF',
  },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 92,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    backgroundColor: '#101720',
    borderTopWidth: 1,
    borderTopColor: '#29313D',
  },
  footerLabel: {
    color: '#9CA3AF',
    fontSize: 12,
  },
  footerValue: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 4,
  },
  continueButton: {
    minHeight: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderRadius: 12,
    paddingHorizontal: 18,
    backgroundColor: '#E50914',
  },
  disabledButton: {
    opacity: 0.45,
  },
  continueText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '900',
  },
});
