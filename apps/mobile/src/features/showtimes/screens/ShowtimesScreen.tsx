import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5000/api"
    : "http://localhost:5000/api";

interface Room {
  _id: string;
  roomName: string;
  totalSeats: number;
}

interface Showtime {
  _id: string;
  movieId: string;
  roomId: Room;
  showDate: string;
  startTime: string;
  endTime: string;
  price: number;
}

function groupByDate(showtimes: Showtime[]): Record<string, Showtime[]> {
  return showtimes.reduce((acc: Record<string, Showtime[]>, st) => {
    const key = new Date(st.showDate).toDateString();
    if (!acc[key]) acc[key] = [];
    acc[key].push(st);
    return acc;
  }, {});
}

function formatDateLabel(dateStr: string) {
  const d = new Date(dateStr);
  return {
    day: d.toLocaleDateString("en-US", { weekday: "short" }),
    date: d.getDate(),
    month: d.toLocaleDateString("en-US", { month: "short" }),
  };
}

export default function ShowtimesScreen() {
  const router = useRouter();
  const { movieId, movieTitle } = useLocalSearchParams<{
    movieId: string;
    movieTitle: string;
  }>();

  const [showtimes, setShowtimes] = useState<Showtime[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedDate, setSelectedDate] = useState("");

  useEffect(() => {
    if (!movieId) return;
    const fetchShowtimes = async () => {
      try {
        const res = await axios.get(`${API_URL}/showtimes`, {
          params: { movieId },
        });
        setShowtimes(res.data);
        if (res.data.length > 0) {
          setSelectedDate(new Date(res.data[0].showDate).toDateString());
        }
      } catch (err: any) {
        setError(err?.response?.data?.error || "Cannot load showtimes");
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimes();
  }, [movieId]);

  const grouped = groupByDate(showtimes);
  const dates = Object.keys(grouped);
  const currentShowtimes = grouped[selectedDate] || [];

  const handleSelectTime = (showtime: Showtime) => {
    router.push({
      pathname: "/seat-selection",
      params: {
        showtimeId: showtime._id,
        movieTitle: movieTitle || "",
        startTime: showtime.startTime,
        endTime: showtime.endTime,
        price: String(showtime.price),
        roomName: showtime.roomId?.roomName || "",
        showDate: showtime.showDate,
      },
    });
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#E50000" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnFallback}>
          <Text style={styles.backBtnFallbackText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (showtimes.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No showtimes available.</Text>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtnFallback}>
          <Text style={styles.backBtnFallbackText}>← Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.backBtn}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {movieTitle}
        </Text>
      </View>

      <Text style={styles.sectionLabel}>SELECT DATE</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dateRow}
      >
        {dates.map((dateStr) => {
          const { day, date, month } = formatDateLabel(dateStr);
          const isActive = selectedDate === dateStr;
          return (
            <TouchableOpacity
              key={dateStr}
              style={[styles.dateCard, isActive && styles.dateCardActive]}
              onPress={() => setSelectedDate(dateStr)}
            >
              <Text style={[styles.dateDay, isActive && styles.dateTextActive]}>{day}</Text>
              <Text style={[styles.dateNum, isActive && styles.dateTextActive]}>{date}</Text>
              <Text style={[styles.dateMonth, isActive && styles.dateTextActive]}>{month}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.sectionLabel}>AVAILABLE SHOWTIMES</Text>
      <ScrollView contentContainerStyle={styles.listContent}>
        {currentShowtimes.map((st) => (
          <View key={st._id} style={styles.showtimeCard}>
            <View style={styles.cardHeader}>
              <Text style={styles.roomName}>{st.roomId?.roomName ?? "Unknown Room"}</Text>
              <Text style={styles.price}>${st.price.toFixed(2)}</Text>
            </View>
            <Text style={styles.timeText}>{st.startTime} → {st.endTime}</Text>
            <TouchableOpacity style={styles.selectBtn} onPress={() => handleSelectTime(st)}>
              <Text style={styles.selectBtnText}>Select Seats →</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111" },
  centered: { flex: 1, backgroundColor: "#111", justifyContent: "center", alignItems: "center", gap: 16 },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 12, gap: 12 },
  backBtn: { color: "#fff", fontSize: 22, paddingRight: 8 },
  headerTitle: { color: "#fff", fontSize: 18, fontWeight: "700", flex: 1 },
  sectionLabel: { color: "#666", fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginLeft: 16, marginBottom: 10, marginTop: 4 },
  dateRow: { paddingLeft: 16, paddingRight: 8, marginBottom: 20, gap: 10, flexDirection: "row" },
  dateCard: { width: 60, paddingVertical: 12, borderRadius: 12, backgroundColor: "#1E1E1E", alignItems: "center", gap: 2 },
  dateCardActive: { backgroundColor: "#E50000" },
  dateDay: { color: "#777", fontSize: 11, fontWeight: "600" },
  dateNum: { color: "#fff", fontSize: 22, fontWeight: "800" },
  dateMonth: { color: "#777", fontSize: 11, fontWeight: "600" },
  dateTextActive: { color: "#fff" },
  listContent: { paddingHorizontal: 16, paddingBottom: 32, gap: 12 },
  showtimeCard: { backgroundColor: "#1A1A1A", borderRadius: 14, padding: 16, gap: 10, borderWidth: 1, borderColor: "#2A2A2A" },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  roomName: { color: "#fff", fontSize: 16, fontWeight: "700" },
  price: { color: "#E50000", fontSize: 16, fontWeight: "800" },
  timeText: { color: "#888", fontSize: 13 },
  selectBtn: { backgroundColor: "#E50000", borderRadius: 10, paddingVertical: 12, alignItems: "center", marginTop: 4 },
  selectBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  errorText: { color: "#E50000", fontSize: 14, textAlign: "center", paddingHorizontal: 32 },
  emptyText: { color: "#666", fontSize: 14 },
  backBtnFallback: { marginTop: 8 },
  backBtnFallbackText: { color: "#888", fontSize: 14 },
});