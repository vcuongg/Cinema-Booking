import AsyncStorage from '@react-native-async-storage/async-storage';
import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getMyBookings } from '@/shared/services/BookingService';
import {
  Booking,
  CinemaSummary,
  MovieSummary,
  RoomSummary,
  SelectedSeat,
  ShowtimeSummary,
} from '@/shared/types/booking';

type TicketTab = 'upcoming' | 'past';

interface TicketView {
  id: string;
  movieTitle: string;
  posterUrl: string;
  formatLabel: string;
  cinemaName: string;
  dateLabel: string;
  timeLabel: string;
  rowLabel: string;
  seatLabel: string;
  hallLabel: string;
  ticketCode: string;
  isPast: boolean;
}

const TEST_TOKEN = '';
const fallbackPosterUrl =
  'https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg';

const demoTickets: TicketView[] = [
  {
    id: 'demo-ticket-1',
    movieTitle: "Oppenheimer: The Director's Cut",
    posterUrl: fallbackPosterUrl,
    formatLabel: 'IMAX 3D',
    cinemaName: 'AMC Empire 25, Times Square',
    dateLabel: 'Oct 24, 2024',
    timeLabel: '19:30',
    rowLabel: 'H',
    seatLabel: '14, 15',
    hallLabel: '04',
    ticketCode: 'CB-DEMO-0001',
    isPast: false,
  },
  {
    id: 'demo-ticket-2',
    movieTitle: 'Dune: Part Two',
    posterUrl: fallbackPosterUrl,
    formatLabel: '2D',
    cinemaName: 'Grand Cinema',
    dateLabel: 'Nov 12, 2023',
    timeLabel: '21:00',
    rowLabel: 'G',
    seatLabel: '08',
    hallLabel: '02',
    ticketCode: 'CB-DEMO-0002',
    isPast: true,
  },
];

function getParamValue(value?: string | string[]) {
  if (Array.isArray(value)) {
    return value[0] || '';
  }

  return value || '';
}

function isMovieSummary(value: ShowtimeSummary['movieId']): value is MovieSummary {
  return Boolean(value && typeof value !== 'string');
}

function isRoomSummary(value: ShowtimeSummary['roomId']): value is RoomSummary {
  return Boolean(value && typeof value !== 'string');
}

function isCinemaSummary(value: RoomSummary['cinemaId']): value is CinemaSummary {
  return Boolean(value && typeof value !== 'string');
}

function isSelectedSeat(value: Booking['seats'][number]['seatId']): value is SelectedSeat {
  return Boolean(value && typeof value !== 'string');
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

function isPastShowtime(showDate?: string, startTime?: string) {
  if (!showDate) {
    return false;
  }

  const dateOnly = showDate.slice(0, 10);
  const date = new Date(`${dateOnly}T${startTime || '23:59'}:00`);

  if (Number.isNaN(date.getTime())) {
    return false;
  }

  return date.getTime() < Date.now();
}

function mapBookingToTicket(booking: Booking): TicketView {
  const showtime = typeof booking.showtimeId === 'string' ? undefined : booking.showtimeId;
  const movie = showtime && isMovieSummary(showtime.movieId) ? showtime.movieId : undefined;
  const room = showtime && isRoomSummary(showtime.roomId) ? showtime.roomId : undefined;
  const cinema = room && isCinemaSummary(room.cinemaId) ? room.cinemaId : undefined;
  const seats = booking.seats
    .map((seat) => seat.seatId)
    .filter(isSelectedSeat);
  const firstSeat = seats[0];

  return {
    id: booking._id,
    movieTitle: movie?.title || 'Movie',
    posterUrl: movie?.poster || movie?.posterUrl || fallbackPosterUrl,
    formatLabel: seats.some((seat) => seat.seatType === 'vip') ? 'VIP' : '2D',
    cinemaName: cinema?.cinemaName || 'Cinema',
    dateLabel: formatDate(showtime?.showDate),
    timeLabel: showtime?.startTime || 'N/A',
    rowLabel: firstSeat?.seatRow || 'N/A',
    seatLabel:
      seats.map((seat) => seat.seatName || `${seat.seatRow}${seat.seatNumber}`).join(', ') ||
      'N/A',
    hallLabel: room?.roomName || 'N/A',
    ticketCode: booking.ticketCode,
    isPast: isPastShowtime(showtime?.showDate, showtime?.startTime),
  };
}

export default function TicketScreen() {
  const params = useLocalSearchParams<{ token?: string }>();
  const [activeTab, setActiveTab] = useState<TicketTab>('upcoming');
  const [tickets, setTickets] = useState<TicketView[]>(demoTickets);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [storedToken, setStoredToken] = useState('');

  const token = getParamValue(params.token) || storedToken || TEST_TOKEN;

  useEffect(() => {
    AsyncStorage.getItem('token')
      .then((nextToken) => setStoredToken(nextToken || ''))
      .catch(() => setStoredToken(''));
  }, []);

  useEffect(() => {
    if (!token) {
      setTickets(demoTickets);
      return;
    }

    let isMounted = true;

    const loadTickets = async () => {
      setLoading(true);
      setError('');

      try {
        const bookings = await getMyBookings(token);
        const paidBookings = bookings.filter(
          (booking) =>
            booking.paymentStatus === 'paid' && booking.bookingStatus === 'confirmed',
        );

        if (isMounted) {
          setTickets(paidBookings.map(mapBookingToTicket));
        }
      } catch (ticketError) {
        const nextError =
          ticketError instanceof Error ? ticketError.message : 'Failed to load tickets';

        if (isMounted) {
          setError(nextError);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadTickets();

    return () => {
      isMounted = false;
    };
  }, [token]);

  const visibleTickets = useMemo(
    () =>
      tickets.filter((ticket) =>
        activeTab === 'past' ? ticket.isPast : !ticket.isPast,
      ),
    [activeTab, tickets],
  );
  const featuredTicket = visibleTickets[0];
  const peekTicket = visibleTickets[1];

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <View style={styles.locationRow}>
          <View style={styles.avatar}>
            <MaterialIcons name="person" size={20} color="#c8c6c5" />
          </View>
          <Text style={styles.locationText}>New York, USA</Text>
        </View>

        <TouchableOpacity style={styles.headerButton} activeOpacity={0.75}>
          <MaterialIcons name="search" size={24} color="#e50914" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}>
        <View style={styles.titleBlock}>
          <Text style={styles.title}>My Tickets</Text>

          <View style={styles.tabs}>
            <TabButton
              label="Upcoming"
              active={activeTab === 'upcoming'}
              onPress={() => setActiveTab('upcoming')}
            />
            <TabButton
              label="Past"
              active={activeTab === 'past'}
              onPress={() => setActiveTab('past')}
            />
          </View>
        </View>

        {loading && <Text style={styles.helperText}>Loading tickets...</Text>}
        {!!error && <Text style={styles.errorText}>{error}</Text>}

        {!featuredTicket && !loading ? (
          <View style={styles.emptyCard}>
            <MaterialIcons name="local-activity" size={32} color="#e50914" />
            <Text style={styles.emptyTitle}>No tickets found</Text>
            <Text style={styles.emptyText}>
              Your confirmed bookings will appear here after payment.
            </Text>
          </View>
        ) : null}

        {featuredTicket ? (
          <View style={[styles.ticketStack, activeTab === 'past' && styles.pastStack]}>
            <TicketCard ticket={featuredTicket} />

            {peekTicket ? (
              <View style={styles.peekTicket}>
                <View style={styles.peekTextWrap}>
                  <Text style={styles.peekTitle}>{peekTicket.movieTitle}</Text>
                  <Text style={styles.peekMeta}>
                    {peekTicket.dateLabel} - {peekTicket.timeLabel}
                  </Text>
                </View>

                <MaterialIcons name="local-activity" size={24} color="#e50914" />
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.bottomNav}>
        <BottomNavItem icon="home" label="Home" />
        <BottomNavItem icon="local-activity" label="Tickets" active />
        <BottomNavItem icon="favorite" label="Favorites" />
        <BottomNavItem icon="person" label="Profile" />
      </View>
    </SafeAreaView>
  );
}

function TicketCard({ ticket }: { ticket: TicketView }) {
  return (
    <Pressable
      style={({ pressed }) => [
        styles.ticketPressable,
        pressed && styles.ticketPressed,
      ]}>
      <View style={styles.ticketCard}>
        <View style={styles.ticketMain}>
          <Image source={{ uri: ticket.posterUrl }} style={styles.poster} resizeMode="cover" />

          <View style={styles.ticketInfo}>
            <View>
              <View style={styles.formatBadge}>
                <Text style={styles.formatText}>{ticket.formatLabel}</Text>
              </View>

              <Text style={styles.movieTitle}>{ticket.movieTitle}</Text>

              <View style={styles.cinemaRow}>
                <MaterialIcons name="location-on" size={14} color="#c8c6c5" />
                <Text style={styles.cinemaText}>{ticket.cinemaName}</Text>
              </View>
            </View>

            <View style={styles.scheduleRow}>
              <View style={styles.scheduleItem}>
                <Text style={styles.ticketLabel}>Date</Text>
                <Text style={styles.ticketValue}>{ticket.dateLabel}</Text>
              </View>

              <View style={styles.scheduleItem}>
                <Text style={styles.ticketLabel}>Time</Text>
                <Text style={styles.ticketValue}>{ticket.timeLabel}</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.separator} />

        <View style={styles.ticketFooter}>
          <View style={styles.codeBox}>
            <MaterialIcons name="qr-code-2" size={82} color="#111827" />
            <Text style={styles.codeText}>{ticket.ticketCode}</Text>
          </View>

          <View style={styles.seatDetails}>
            <TicketMeta label="Row" value={ticket.rowLabel} />
            <TicketMeta label="Seats" value={ticket.seatLabel} withBorder />
            <TicketMeta label="Hall" value={ticket.hallLabel} />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

function TabButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.tabButton, active && styles.tabButtonActive]}>
      <Text style={[styles.tabText, active ? styles.tabTextActive : styles.tabTextMuted]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

function TicketMeta({
  label,
  value,
  withBorder,
}: {
  label: string;
  value: string;
  withBorder?: boolean;
}) {
  return (
    <View style={[styles.metaItem, withBorder && styles.metaItemBorder]}>
      <Text style={styles.metaLabel}>{label}</Text>
      <Text style={styles.metaValue}>{value}</Text>
    </View>
  );
}

function BottomNavItem({
  icon,
  label,
  active,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  active?: boolean;
}) {
  const color = active ? '#e50914' : '#c8c6c5';

  return (
    <TouchableOpacity style={[styles.navItem, !active && styles.navItemMuted]} activeOpacity={0.75}>
      <MaterialIcons name={icon} size={24} color={color} />
      <Text style={[styles.navLabel, active && styles.navLabelActive]}>{label}</Text>
      {active && <View style={styles.navDot} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
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
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#2e353f',
    borderWidth: 1,
    borderColor: '#5e3f3b',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationText: {
    color: '#e50914',
    fontSize: 20,
    fontWeight: '600',
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 132,
  },
  titleBlock: {
    marginBottom: 24,
  },
  title: {
    color: '#dce3f0',
    fontSize: 34,
    fontWeight: '800',
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    backgroundColor: '#151c25',
    borderRadius: 12,
    padding: 4,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#e50914',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
  },
  tabTextActive: {
    color: '#fff7f6',
  },
  tabTextMuted: {
    color: '#c8c6c5',
    opacity: 0.6,
  },
  helperText: {
    color: '#c8c6c5',
    fontSize: 14,
    marginBottom: 14,
  },
  errorText: {
    color: '#ffb4ab',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 14,
  },
  emptyCard: {
    backgroundColor: '#192029',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  emptyTitle: {
    color: '#dce3f0',
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
  },
  emptyText: {
    color: '#c8c6c5',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 6,
  },
  ticketStack: {
    opacity: 1,
  },
  pastStack: {
    opacity: 0.5,
  },
  ticketPressable: {
    marginBottom: 24,
  },
  ticketPressed: {
    transform: [{ scale: 0.98 }],
  },
  ticketCard: {
    backgroundColor: '#232a34',
    borderRadius: 16,
    overflow: 'hidden',
  },
  ticketMain: {
    flexDirection: 'row',
  },
  poster: {
    width: '34%',
    aspectRatio: 2 / 3,
    backgroundColor: '#151c25',
  },
  ticketInfo: {
    flex: 1,
    padding: 16,
    justifyContent: 'space-between',
  },
  formatBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(229, 9, 20, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(229, 9, 20, 0.2)',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
  },
  formatText: {
    color: '#e50914',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  movieTitle: {
    color: '#dce3f0',
    fontSize: 20,
    lineHeight: 24,
    fontWeight: '700',
  },
  cinemaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 8,
  },
  cinemaText: {
    flex: 1,
    color: '#c8c6c5',
    fontSize: 11,
    fontWeight: '500',
  },
  scheduleRow: {
    flexDirection: 'row',
    marginTop: 16,
  },
  scheduleItem: {
    flex: 1,
  },
  ticketLabel: {
    color: '#c8c6c5',
    fontSize: 11,
    fontWeight: '500',
    textTransform: 'uppercase',
    opacity: 0.6,
  },
  ticketValue: {
    color: '#dce3f0',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3,
  },
  separator: {
    borderTopWidth: 1,
    borderStyle: 'dashed',
    borderTopColor: 'rgba(94, 63, 59, 0.3)',
  },
  ticketFooter: {
    backgroundColor: 'rgba(46, 53, 63, 0.5)',
    padding: 24,
    alignItems: 'center',
  },
  codeBox: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
    alignItems: 'center',
    minWidth: 148,
  },
  codeText: {
    color: '#111827',
    fontSize: 12,
    fontWeight: '800',
    marginTop: 4,
  },
  seatDetails: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
  },
  metaItem: {
    flex: 1,
    alignItems: 'center',
  },
  metaItemBorder: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: 'rgba(94, 63, 59, 0.2)',
  },
  metaLabel: {
    color: '#c8c6c5',
    fontSize: 11,
    opacity: 0.6,
    marginBottom: 4,
  },
  metaValue: {
    color: '#dce3f0',
    fontSize: 18,
    fontWeight: '600',
  },
  peekTicket: {
    marginTop: -48,
    marginHorizontal: 10,
    padding: 24,
    borderRadius: 16,
    backgroundColor: '#232a34',
    borderWidth: 1,
    borderColor: 'rgba(94, 63, 59, 0.2)',
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  peekTextWrap: {
    flex: 1,
    paddingRight: 12,
  },
  peekTitle: {
    color: '#dce3f0',
    fontSize: 20,
    fontWeight: '600',
  },
  peekMeta: {
    color: '#c8c6c5',
    fontSize: 13,
    fontWeight: '600',
    marginTop: 4,
  },
  bottomNav: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 28,
    backgroundColor: 'rgba(13, 20, 29, 0.96)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  navItem: {
    minWidth: 62,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navItemMuted: {
    opacity: 0.6,
  },
  navLabel: {
    color: '#c8c6c5',
    fontSize: 11,
    marginTop: 4,
  },
  navLabelActive: {
    color: '#e50914',
    fontWeight: '500',
  },
  navDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#e50914',
    marginTop: 4,
  },
});
