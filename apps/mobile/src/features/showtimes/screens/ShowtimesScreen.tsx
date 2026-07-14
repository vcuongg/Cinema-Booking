import { Ionicons } from '@expo/vector-icons';
import { Href, router, useLocalSearchParams } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { getShowtimesByMovie } from '@/shared/services/ShowtimeService';
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

function getMovieTitle(showtime?: ShowtimeSummary) {
  const movie = showtime?.movieId;

  return movie && typeof movie !== 'string' ? movie.title : 'Select Showtime';
}

function getRoomName(showtime: ShowtimeSummary) {
  const room = showtime.roomId;

  return room && typeof room !== 'string' ? room.roomName : 'Screen';
}

function getCinemaName(showtime: ShowtimeSummary) {
  const room = showtime.roomId;
  const cinema = room && typeof room !== 'string' ? room.cinemaId : undefined;

  return cinema && typeof cinema !== 'string' ? cinema.cinemaName : 'Cinema';
}

function formatCurrency(value: number) {
  return `${Math.round(value).toLocaleString('vi-VN')} VND`;
}

export default function ShowtimesScreen() {
  const params = useLocalSearchParams<{ movieId?: string | string[] }>();
  const movieId = getParamValue(params.movieId);
  const [showtimes, setShowtimes] = useState<ShowtimeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadShowtimes = useCallback(async () => {
    if (!movieId) {
      setError('Movie ID is missing');
      setLoading(false);
      return;
    }

    try {
      setError('');
      const data = await getShowtimesByMovie(movieId);
      setShowtimes(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : 'Unable to load showtimes');
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    loadShowtimes();
  }, [loadShowtimes]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadShowtimes();
    setRefreshing(false);
  };

  const openSeatSelection = (showtimeId: string) => {
    router.push({
      pathname: '/seat-selection/[showtimeId]',
      params: { showtimeId },
    } as Href);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Pressable style={styles.iconButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#fff" />
        </Pressable>

        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Choose Schedule</Text>
          <Text style={styles.title}>{getMovieTitle(showtimes[0])}</Text>
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#E50914" />
          <Text style={styles.helperText}>Loading showtimes...</Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.content}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E50914"
              colors={['#E50914']}
            />
          }>
          {!!error && <Text style={styles.errorText}>{error}</Text>}

          {!error && showtimes.length === 0 && (
            <Text style={styles.helperText}>No showtimes available for this movie.</Text>
          )}

          {showtimes.map((showtime) => (
            <Pressable
              key={showtime._id}
              style={({ pressed }) => [styles.showtimeCard, pressed && styles.pressed]}
              onPress={() => openSeatSelection(showtime._id)}>
              <View style={styles.dateBox}>
                <Text style={styles.dateText}>{formatDate(showtime.showDate)}</Text>
                <Text style={styles.timeText}>{showtime.startTime}</Text>
              </View>

              <View style={styles.cardBody}>
                <Text style={styles.cinemaText}>{getCinemaName(showtime)}</Text>
                <Text style={styles.roomText}>
                  {getRoomName(showtime)} - ends {showtime.endTime || 'N/A'}
                </Text>
                <Text style={styles.priceText}>{formatCurrency(showtime.price)}</Text>
              </View>

              <Ionicons name="chevron-forward" size={22} color="#E50914" />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
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
  content: {
    padding: 18,
    paddingBottom: 34,
    gap: 14,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  helperText: {
    color: '#9CA3AF',
    fontSize: 14,
    lineHeight: 21,
  },
  errorText: {
    color: '#FF9E98',
    fontSize: 14,
    lineHeight: 21,
  },
  showtimeCard: {
    minHeight: 112,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: '#111821',
    borderWidth: 1,
    borderColor: '#29313D',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.995 }],
  },
  dateBox: {
    width: 86,
    minHeight: 82,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    backgroundColor: '#201114',
    borderWidth: 1,
    borderColor: '#5E252B',
    paddingHorizontal: 8,
  },
  dateText: {
    color: '#FFB4AE',
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'center',
  },
  timeText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '900',
    marginTop: 5,
  },
  cardBody: {
    flex: 1,
  },
  cinemaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '800',
  },
  roomText: {
    color: '#9CA3AF',
    fontSize: 13,
    marginTop: 6,
  },
  priceText: {
    color: '#E50914',
    fontSize: 14,
    fontWeight: '900',
    marginTop: 10,
  },
});
