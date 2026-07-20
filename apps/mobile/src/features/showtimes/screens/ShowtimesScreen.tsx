import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { showtimeService } from "@/shared/services/ShowtimeService";
import type { ShowtimeSummary, CinemaSummary, RoomSummary } from "@/shared/types/booking";

export default function ShowtimesScreen() {
  const { movieId } = useLocalSearchParams<{ movieId: string }>();

  const [showtimes, setShowtimes] = useState<ShowtimeSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedDateStr, setSelectedDateStr] = useState<string>("");
  const [selectedShowtime, setSelectedShowtime] = useState<ShowtimeSummary | null>(null);

  // 1. Fetch dữ liệu suất chiếu từ API
  const fetchShowtimes = useCallback(async () => {
    if (!movieId) return;
    try {
      setLoading(true);
      setError("");
      const data = await showtimeService.getShowtimesByMovie(movieId);
      setShowtimes(data);

      // LOGIC MỚI: Chỉ chọn ngày mặc định là ngày hợp lệ (Từ hôm nay trở đi)
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
      const currentMinutes = now.getHours() * 60 + now.getMinutes();

      const validShowtimes = data.filter((st) => {
        const d = new Date(st.showDate);
        const stDateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
        
        // Nếu là ngày quá khứ -> loại
        if (stDateStart < todayStart) return false;
        
        // Nếu là hôm nay, kiểm tra xem giờ chiếu đã qua chưa
        if (stDateStart === todayStart) {
          const [hours, minutes] = st.startTime.split(':').map(Number);
          const showtimeMinutes = hours * 60 + minutes;
          if (showtimeMinutes <= currentMinutes) return false;
        }

        return true;
      });

      if (validShowtimes.length > 0) {
        // Lấy ngày của suất chiếu hợp lệ đầu tiên làm mặc định
        const firstValidDate = new Date(validShowtimes[0].showDate).toDateString();
        setSelectedDateStr(firstValidDate);
      }
    } catch (err) {
      setError("Không thể tải lịch chiếu phim");
    } finally {
      setLoading(false);
    }
  }, [movieId]);

  useEffect(() => {
    fetchShowtimes();
  }, [fetchShowtimes]);

  // Helper format ngày hiển thị trên Card
  const formatDateCard = (dateObj: Date) => {
    const day = dateObj.getDate().toString().padStart(2, "0");
    const monthStr = dateObj.toLocaleString("en-US", { month: "short" }).toUpperCase();
    return { day, monthStr };
  };

  // 2. Lấy danh sách ngày chiếu (Loại bỏ các ngày trong quá khứ)
  const uniqueDates = useMemo(() => {
    const datesMap: { [key: string]: Date } = {};
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();

    showtimes.forEach((st) => {
      const d = new Date(st.showDate);
      const stDateStart = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

      // Chỉ hiển thị trên giao diện những ngày >= hôm nay
      if (stDateStart >= todayStart) {
        datesMap[d.toDateString()] = d;
      }
    });
    return Object.values(datesMap).sort((a, b) => a.getTime() - b.getTime());
  }, [showtimes]);

  // 3. Lọc suất chiếu của ngày đang chọn, loại bỏ suất chiếu đã qua giờ nếu là hôm nay
  const cinemasWithShowtimes = useMemo(() => {
    if (!selectedDateStr) return [];

    const now = new Date();
    const isToday = selectedDateStr === now.toDateString();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const filtered = showtimes.filter((st) => {
      const isMatchDate = new Date(st.showDate).toDateString() === selectedDateStr;
      if (!isMatchDate) return false;

      // Nếu chọn ngày hôm nay, chặn luôn các giờ chiếu đã trôi qua
      if (isToday) {
        const [hours, minutes] = st.startTime.split(':').map(Number);
        const showtimeMinutes = hours * 60 + minutes;
        if (showtimeMinutes <= currentMinutes) return false;
      }

      return true;
    });

    const groupMap: {
      [cinemaId: string]: { cinema: CinemaSummary; showtimes: ShowtimeSummary[] };
    } = {};

    filtered.forEach((st) => {
      const room = st.roomId as RoomSummary;
      if (!room || !room.cinemaId) return;

      const cinema = room.cinemaId as CinemaSummary;
      if (!groupMap[cinema._id]) {
        groupMap[cinema._id] = {
          cinema,
          showtimes: [],
        };
      }
      groupMap[cinema._id].showtimes.push(st);
    });

    // Chỉ trả về các rạp thực sự có suất chiếu hợp lệ
    return Object.values(groupMap).filter((group) => group.showtimes.length > 0);
  }, [showtimes, selectedDateStr]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Đang tải lịch chiếu...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable
          style={styles.backButton}
          onPress={() => {
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace("/home");
            }
          }}
        >
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Selection Showtime
        </Text>
        <View style={{ width: 44 }} />
      </View>

      {/* Danh sách chọn ngày */}
      <View style={{ marginVertical: 10 }}>
        <Text style={styles.sectionTitle}>SELECT DATE</Text>
        
        <View style={styles.dateListContainer}>
          {uniqueDates.length > 0 ? (
            uniqueDates.map((item) => {
              const dateStr = item.toDateString();
              const isActive = selectedDateStr === dateStr;
              const { day, monthStr } = formatDateCard(item);

              return (
                <Pressable
                  key={dateStr}
                  style={[styles.dateCard, isActive && styles.dateCardActive]}
                  onPress={() => {
                    setSelectedDateStr(dateStr);
                    setSelectedShowtime(null); 
                  }}
                >
                  <Text style={[styles.dateMonth, isActive && styles.textActive]}>
                    {monthStr}
                  </Text>
                  <Text style={[styles.dateDay, isActive && styles.textActive]}>
                    {day}
                  </Text>
                </Pressable>
              );
            })
          ) : (
            <Text style={{ color: "#6B7280", paddingHorizontal: 18 }}>
              Không có lịch chiếu khả dụng trong tương lai.
            </Text>
          )}
        </View>
      </View>

      {/* Danh sách rạp & giờ chiếu */}
      <FlatList
        data={cinemasWithShowtimes}
        keyExtractor={(item) => item.cinema._id}
        contentContainerStyle={styles.cinemaList}
        ListHeaderComponent={
          cinemasWithShowtimes.length > 0 ? (
            <Text style={styles.sectionTitle}>AVAILABLE CINEMAS</Text>
          ) : null
        }
        ListEmptyComponent={
          !loading && uniqueDates.length > 0 ? (
            <Text style={styles.emptyText}>
              Các suất chiếu trong ngày này đã kết thúc.
            </Text>
          ) : null
        }
        renderItem={({ item }) => (
          <View style={styles.cinemaCard}>
            <View style={styles.cinemaHeader}>
              <View style={{ flex: 1 }}>
                <Text style={styles.cinemaName}>{item.cinema.cinemaName}</Text>
                <Text style={styles.cinemaAddress} numberOfLines={1}>
                  📍 {item.cinema.address || "Địa chỉ đang cập nhật"}
                </Text>
              </View>
              <Ionicons name="heart-outline" size={22} color="#6B7280" />
            </View>

            <View style={styles.timeGrid}>
              {item.showtimes.map((st) => {
                const isSelected = selectedShowtime?._id === st._id;
                return (
                  <Pressable
                    key={st._id}
                    style={[styles.timeButton, isSelected && styles.timeButtonActive]}
                    onPress={() => setSelectedShowtime(st)}
                  >
                    <Text style={[styles.timeText, isSelected && styles.textActive]}>
                      {st.startTime}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      />

      {/* Footer chứa nút tiếp tục */}
      <View style={styles.footer}>
        <Pressable
          style={[styles.continueButton, !selectedShowtime && styles.disabledButton]}
          disabled={!selectedShowtime}
          onPress={() =>
            router.push({
              pathname: "/seats",
              params: { showtimeId: selectedShowtime?._id },
            })
          }
        >
          <Text style={styles.continueText}>Select Seats →</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: "#090D12" },
  loadingScreen: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#090D12" },
  loadingText: { color: "#9CA3AF", fontSize: 13, marginTop: 12 },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 18, height: 56 },
  backButton: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#151D27", justifyContent: "center", alignItems: "center", borderWidth: 1, borderColor: "#29313D" },
  headerTitle: { color: "#FFFFFF", fontSize: 18, fontWeight: "800" },
  sectionTitle: { color: "#9CA3AF", fontSize: 11, fontWeight: "700", letterSpacing: 1, paddingHorizontal: 18, marginBottom: 10, marginTop: 12 },
  dateListContainer: { flexDirection: "row", flexWrap: "wrap", paddingHorizontal: 18, gap: 10 },
  dateCard: { width: 62, height: 74, borderRadius: 14, backgroundColor: "#151D27", borderWidth: 1, borderColor: "#29313D", justifyContent: "center", alignItems: "center" },
  dateCardActive: { backgroundColor: "#E50914", borderColor: "#E50914" },
  dateMonth: { color: "#9CA3AF", fontSize: 11, fontWeight: "600" },
  dateDay: { color: "#FFFFFF", fontSize: 20, fontWeight: "800", marginTop: 4 },
  textActive: { color: "#FFFFFF" },
  cinemaList: { paddingBottom: 100 },
  cinemaCard: { backgroundColor: "#111821", marginHorizontal: 18, marginBottom: 14, padding: 16, borderRadius: 16, borderWidth: 1, borderColor: "#29313D" },
  cinemaHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 },
  cinemaName: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  cinemaAddress: { color: "#9CA3AF", fontSize: 12, marginTop: 4 },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  timeButton: { paddingVertical: 10, paddingHorizontal: 18, borderRadius: 10, backgroundColor: "#151D27", borderWidth: 1, borderColor: "#29313D" },
  timeButtonActive: { backgroundColor: "#E50914", borderColor: "#E50914" },
  timeText: { color: "#9CA3AF", fontSize: 13, fontWeight: "700" },
  footer: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#111821", padding: 18, borderTopWidth: 1, borderTopColor: "#29313D" },
  continueButton: { height: 52, borderRadius: 12, backgroundColor: "#E50914", justifyContent: "center", alignItems: "center" },
  disabledButton: { backgroundColor: "#151D27", opacity: 0.5 },
  continueText: { color: "#FFFFFF", fontSize: 15, fontWeight: "800" },
  emptyText: { color: "#6B7280", fontSize: 13, paddingHorizontal: 18, marginTop: 10 },
});