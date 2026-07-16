// app/seats.tsx hoặc màn hình SeatSelectionScreen tương ứng của bạn
import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { showtimeService, type SeatStatus } from "@/shared/services/ShowtimeService";
import type { ShowtimeSummary } from "@/shared/types/booking";

export default function SeatSelectionScreen() {
  const { showtimeId } = useLocalSearchParams<{ showtimeId: string }>();

  const [showtime, setShowtime] = useState<ShowtimeSummary | null>(null);
  const [seats, setSeats] = useState<SeatStatus[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<SeatStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Load ghế của suất chiếu
  const loadSeatsData = useCallback(async () => {
    if (!showtimeId) return;
    try {
      setLoading(true);
      setError("");
      const data = await showtimeService.getSeatsByShowtime(showtimeId);
      setShowtime(data.showtime);
      setSeats(data.seats);
    } catch (err) {
      setError("Không thể tải sơ đồ ghế");
    } finally {
      setLoading(false);
    }
  }, [showtimeId]);

  useEffect(() => {
    loadSeatsData();
  }, [loadSeatsData]);

  // Nhóm ghế theo từng hàng (Row) để vẽ Grid
  const groupedSeats = useMemo(() => {
    const map: { [row: string]: SeatStatus[] } = {};
    seats.forEach((seat) => {
      if (!map[seat.seatRow]) {
        map[seat.seatRow] = [];
      }
      map[seat.seatRow].push(seat);
    });

    // Sắp xếp các ghế trong hàng theo số thứ tự tăng dần
    Object.keys(map).forEach((row) => {
      map[row].sort((a, b) => a.seatNumber - b.seatNumber);
    });

    return Object.keys(map)
      .sort()
      .map((row) => ({
        row,
        data: map[row],
      }));
  }, [seats]);

  // Logic chọn / bỏ chọn ghế
  const toggleSeat = (seat: SeatStatus) => {
    // Không cho chọn ghế đã có người đặt trước
    // (Ở đây map với backend: backend trả về trường `isBooked` trong seat)
    const rawSeat = seat as any; 
    if (rawSeat.isBooked) return;

    const isAlreadySelected = selectedSeats.some((s) => s._id === seat._id);
    if (isAlreadySelected) {
      setSelectedSeats((prev) => prev.filter((s) => s._id !== seat._id));
    } else {
      setSelectedSeats((prev) => [...prev, seat]);
    }
  };

  // Tính tổng tiền dựa trên số ghế đã chọn
  const totalPrice = useMemo(() => {
    if (!showtime) return 0;
    return selectedSeats.length * showtime.price;
  }, [selectedSeats, showtime]);

  const handleContinue = () => {
    if (selectedSeats.length === 0) return;

    router.push({
      pathname: "/payment",
      params: {
        showtimeId: showtime?._id || showtimeId,
        seatIds: selectedSeats.map((s) => s._id).join(","),
      },
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Đang tải sơ đồ ghế...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={24} color="#FFFFFF" />
        </Pressable>
        <View style={{ alignItems: "center" }}>
          <Text style={styles.headerTitle}>Empire Cinema</Text>
          <Text style={styles.headerSubtitle}>
            Suất chiếu: {showtime?.startTime || "N/A"}
          </Text>
        </View>
        <Ionicons name="film-outline" size={24} color="#FFFFFF" />
      </View>

      {/* Chỉ dẫn chú thích trạng thái ghế */}
      <View style={styles.legendContainer}>
        <View style={styles.legendItem}>
          <View style={styles.legendBox} />
          <Text style={styles.legendText}>Available</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendSelected]} />
          <Text style={styles.legendText}>Selected</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendBooked]} />
          <Text style={styles.legendText}>Booked</Text>
        </View>
        <View style={styles.legendItem}>
          <View style={[styles.legendBox, styles.legendVIP]} />
          <Text style={styles.legendText}>VIP</Text>
        </View>
      </View>

      {/* Sơ đồ màn hình Screen */}
      <View style={styles.screenIndicator}>
        <View style={styles.screenLine} />
        <Text style={styles.screenText}>SCREEN</Text>
      </View>

      {/* Vẽ Grid Sơ đồ ghế */}
      <ScrollView contentContainerStyle={styles.seatScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.gridContainer}>
          {groupedSeats.map(({ row, data }) => (
            <View key={row} style={styles.rowWrapper}>
              {/* Tên hàng ghế bên trái */}
              <Text style={styles.rowLabel}>{row}</Text>

              {/* Các ghế trong hàng */}
              <View style={styles.seatRow}>
                {data.map((seat) => {
                  const rawSeat = seat as any;
                  const isBooked = rawSeat.isBooked;
                  const isSelected = selectedSeats.some((s) => s._id === seat._id);
                  const isVIP = seat.seatType === "vip";

                  return (
                    <Pressable
                      key={seat._id}
                      style={[
                        styles.seat,
                        isVIP && styles.seatVIPBorder,
                        isSelected && styles.seatSelected,
                        isBooked && styles.seatBooked,
                      ]}
                      disabled={isBooked}
                      onPress={() => toggleSeat(seat)}
                    >
                      <Text
                        style={[
                          styles.seatNumberText,
                          isSelected && styles.textWhite,
                          isBooked && styles.textBooked,
                        ]}
                      >
                        {seat.seatNumber}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {/* Tên hàng ghế bên phải */}
              <Text style={styles.rowLabel}>{row}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Thanh toán ở cuối màn hình */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.priceLabel}>TOTAL PRICE</Text>
          <Text style={styles.priceValue}>
            {totalPrice.toLocaleString("vi-VN")}đ
          </Text>
        </View>
        <Pressable
          style={[styles.continueBtn, selectedSeats.length === 0 && styles.disabledBtn]}
          disabled={selectedSeats.length === 0}
          onPress={handleContinue}
        >
          <Text style={styles.continueBtnText}>Continue →</Text>
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
  headerTitle: { color: "#FFFFFF", fontSize: 16, fontWeight: "800" },
  headerSubtitle: { color: "#9CA3AF", fontSize: 11, marginTop: 2 },
  legendContainer: { flexDirection: "row", justifyContent: "space-around", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#151D27" },
  legendItem: { flexDirection: "row", alignItems: "center", gap: 6 },
  legendBox: { width: 14, height: 14, borderRadius: 4, backgroundColor: "#151D27", borderWidth: 1, borderColor: "#29313D" },
  legendSelected: { backgroundColor: "#E50914", borderColor: "#E50914" },
  legendBooked: { backgroundColor: "#111821", borderColor: "rgba(255,255,255,0.05)", opacity: 0.3 },
  legendVIP: { borderColor: "#FFD166" },
  legendText: { color: "#9CA3AF", fontSize: 11, fontWeight: "500" },
  screenIndicator: { alignItems: "center", marginTop: 22, marginBottom: 14 },
  screenLine: { width: "70%", height: 3, backgroundColor: "#5E252B", borderRadius: 999 },
  screenText: { color: "#6B7280", fontSize: 9, fontWeight: "800", letterSpacing: 3, marginTop: 6 },
  seatScroll: { paddingBottom: 110 },
  gridContainer: { alignItems: "center", paddingHorizontal: 10, marginTop: 10 },
  rowWrapper: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 10 },
  rowLabel: { color: "#4B5563", fontSize: 12, fontWeight: "bold", width: 14, textAlign: "center" },
  seatRow: { flexDirection: "row", gap: 6 },
  seat: { width: 30, height: 30, borderRadius: 8, backgroundColor: "#151D27", borderWidth: 1, borderColor: "#29313D", justifyContent: "center", alignItems: "center" },
  seatVIPBorder: { borderColor: "#FFD166" },
  seatSelected: { backgroundColor: "#E50914", borderColor: "#E50914" },
  seatBooked: { backgroundColor: "#111821", borderColor: "rgba(255,255,255,0.02)", opacity: 0.15 },
  seatNumberText: { color: "#9CA3AF", fontSize: 10, fontWeight: "700" },
  textWhite: { color: "#FFFFFF" },
  textBooked: { color: "#374151" },
  bottomBar: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#111821", padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#29313D" },
  priceLabel: { color: "#9CA3AF", fontSize: 11, fontWeight: "600" },
  priceValue: { color: "#FFFFFF", fontSize: 22, fontWeight: "900", marginTop: 4 },
  continueBtn: { minHeight: 48, paddingHorizontal: 28, borderRadius: 12, backgroundColor: "#E50914", justifyContent: "center", alignItems: "center" },
  disabledBtn: { backgroundColor: "#151D27", opacity: 0.4 },
  continueBtnText: { color: "#FFFFFF", fontSize: 14, fontWeight: "800" },
});
