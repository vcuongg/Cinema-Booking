import React, { useEffect, useState } from "react";
console.log("Update Screen");
import {
  View,
  Text,
  Image,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Modal,
  Pressable,
  FlatList,
  Platform,
  KeyboardAvoidingView,
  Alert,
} from "react-native";

import { SafeAreaView } from "react-native-safe-area-context";

import {
  Ionicons,
  MaterialCommunityIcons,
  FontAwesome5,
} from "@expo/vector-icons";

import { LinearGradient } from "expo-linear-gradient";

import DateTimePicker from "@/shared/components/DateTimePicker";
import { useRouter, useLocalSearchParams } from "expo-router";

import {
  getShowtimeById,
  getShowtimeFormData,
  updateShowtime,
} from "@/shared/services/ShowtimeService";

import { Movie } from "@/shared/types/movie";
import { Cinema } from "@/shared/types/cinema";
import { Room } from "@/shared/types/room";

const COLORS = {
  gray: "#9CA3AF",
  black: "#000000",
  darkGray: "#1F1F1F",
  red: "#E50914",
  white: "#FFFFFF",
  border: "#2A2A2A",
};

function formatDateDisplay(date: Date) {
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const y = date.getFullYear();

  return `${m}/${d}/${y}`;
}

const showAlert = (title: string, message: string) => {
  if (Platform.OS === "web") {
    window.alert(`${title}\n\n${message}`);
  } else {
    Alert.alert(title, message);
  }
};

function formatTimeDisplay(date: Date) {
  let h = date.getHours();

  const min = String(date.getMinutes()).padStart(2, "0");

  const period = h >= 12 ? "PM" : "AM";

  h = h % 12 || 12;

  return `${String(h).padStart(2, "0")}:${min} ${period}`;
}

function formatTimeForAPI(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(
    date.getMinutes(),
  ).padStart(2, "0")}`;
}

export default function UpdateShowtimeScreen() {
  const router = useRouter();

  const { showtimeId } = useLocalSearchParams<{
    showtimeId: string;
  }>();

  const [loading, setLoading] = useState(true);

  const [movie, setMovie] = useState<Movie | null>(null);

  const [cinemas, setCinemas] = useState<Cinema[]>([]);

  const [rooms, setRooms] = useState<Room[]>([]);

  const [cinemaId, setCinemaId] = useState("");

  const [roomId, setRoomId] = useState("");

  const [date, setDate] = useState<Date | null>(null);

  const [startTime, setStartTime] = useState<Date | null>(null);

  const [price, setPrice] = useState("");

  const [cinemaModalVisible, setCinemaModalVisible] = useState(false);

  const [roomModalVisible, setRoomModalVisible] = useState(false);

  const [showDatePicker, setShowDatePicker] = useState(false);

  const [showTimePicker, setShowTimePicker] = useState(false);

  const selectedCinema = cinemas.find((item) => item._id === cinemaId);

  const availableRooms = rooms.filter(
    (room) => (room.cinemaId as Cinema)._id === cinemaId,
  );

  const selectedRoom = rooms.find((room) => room._id === roomId);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);

      const [formData, showtime] = await Promise.all([
        getShowtimeFormData(),
        getShowtimeById(showtimeId),
      ]);

      setCinemas(formData.cinemas);

      setRooms(formData.rooms);

      const movieData = showtime.movieId as Movie;

      setMovie(movieData);

      const room = showtime.roomId as Room;

      setCinemaId((room.cinemaId as Cinema)._id);

      setRoomId(room._id);

      setDate(new Date(showtime.showDate));

      const [hour, minute] = showtime.startTime.split(":").map(Number);

      const start = new Date();

      start.setHours(hour);

      start.setMinutes(minute);

      start.setSeconds(0);

      setStartTime(start);

      setPrice(showtime.price.toString());
    } catch (error: any) {
      showAlert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };
  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: COLORS.white }}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const handleUpdateShowtime = async () => {
    if (!roomId) {
      return showAlert("Validation", "Please select room");
    }

    if (!date) {
      return showAlert("Validation", "Please select date");
    }

    if (!startTime) {
      return showAlert("Validation", "Please select start time");
    }

    if (!price || Number(price) <= 0) {
      return showAlert("Validation", "Please enter ticket price");
    }

    try {
      await updateShowtime(showtimeId, {
        roomId,
        showDate: date.toISOString(),
        startTime: formatTimeForAPI(startTime),
        price: Number(price),
      });

      console.log("Before back");

      router.replace("/admin/DashBoardAdmin");

      console.log("After back");
    } catch (error: any) {
      console.log(error);

      showAlert("Error", error.message);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}

          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backBtn}
              onPress={() => router.replace("/admin/DashBoardAdmin")}
            >
              <Ionicons name="arrow-back" size={20} color={COLORS.red} />

              <Text style={styles.headerTitle}>Update Showtime</Text>
            </TouchableOpacity>

            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color={COLORS.gray} />
            </View>
          </View>

          {/* Banner */}

          <View style={styles.banner}>
            <Image
              source={{
                uri: movie?.posterUrl,
              }}
              style={styles.bannerImage}
            />

            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.85)"]}
              style={styles.bannerGradient}
            />

            <View style={styles.bannerContent}>
              <Text style={styles.bannerBadge}>EDIT SHOWTIME</Text>

              <Text style={styles.bannerTitle}>{movie?.title}</Text>
            </View>
          </View>

          {/* Movie */}

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Movie Title</Text>

            <View style={[styles.inputBox, styles.inputBoxDisabled]}>
              <MaterialCommunityIcons
                name="filmstrip"
                size={16}
                color={COLORS.red}
                style={styles.inputIcon}
              />

              <TextInput
                style={styles.input}
                editable={false}
                value={movie?.title}
              />
            </View>
          </View>

          {/* Cinema */}

          <View style={styles.fieldWrapper}>
            <Text style={styles.label}>Cinema Venue</Text>

            <TouchableOpacity
              style={styles.dropdownBox}
              onPress={() => setCinemaModalVisible(true)}
            >
              <Text style={styles.dropdownValue}>
                {selectedCinema ? selectedCinema.cinemaName : "Select Cinema"}
              </Text>

              <Ionicons name="chevron-down" size={16} color={COLORS.red} />
            </TouchableOpacity>
          </View>

          {/* Date + Time */}

          <View style={styles.row}>
            {/* Date */}
            <View style={[styles.fieldWrapper, styles.flex1]}>
              <Text style={styles.label}>Date</Text>

              {Platform.OS === "web" ? (
                <input
                  type="date"
                  value={date ? date.toISOString().split("T")[0] : ""}
                  onChange={(e) => {
                    if (e.target.value) {
                      setDate(new Date(e.target.value));
                    }
                  }}
                  style={{
                    width: "100%",
                    height: 46,
                    borderRadius: 10,
                    border: "none",
                    outline: "none",
                    padding: "0 12px",
                    backgroundColor: "#1F1F1F",
                    color: "#FFFFFF",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text
                    style={[styles.dateValue, !date && styles.placeholderText]}
                  >
                    {date ? formatDateDisplay(date) : "MM/DD/YYYY"}
                  </Text>

                  <Ionicons
                    name="calendar-outline"
                    size={16}
                    color={COLORS.gray}
                  />
                </TouchableOpacity>
              )}
            </View>

            {/* Time */}
            <View style={[styles.fieldWrapper, styles.flex1]}>
              <Text style={styles.label}>Start Time</Text>

              {Platform.OS === "web" ? (
                <input
                  type="time"
                  value={
                    startTime
                      ? `${String(startTime.getHours()).padStart(2, "0")}:${String(
                          startTime.getMinutes(),
                        ).padStart(2, "0")}`
                      : ""
                  }
                  onChange={(e) => {
                    const value = e.target.value;

                    if (!value) return;

                    const [hour, minute] = value.split(":").map(Number);

                    const d = new Date();

                    d.setHours(hour);
                    d.setMinutes(minute);
                    d.setSeconds(0);

                    setStartTime(d);
                  }}
                  style={{
                    width: "100%",
                    height: 46,
                    borderRadius: 10,
                    border: "none",
                    outline: "none",
                    padding: "0 12px",
                    backgroundColor: "#1F1F1F",
                    color: "#FFFFFF",
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              ) : (
                <TouchableOpacity
                  style={styles.dateBox}
                  onPress={() => setShowTimePicker(true)}
                >
                  <Text
                    style={[
                      styles.dateValue,
                      !startTime && styles.placeholderText,
                    ]}
                  >
                    {startTime ? formatTimeDisplay(startTime) : "--:-- --"}
                  </Text>

                  <Ionicons name="time-outline" size={16} color={COLORS.gray} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {/* Hall + Price */}

          <View style={styles.row}>
            <View style={[styles.fieldWrapper, styles.flex1]}>
              <Text style={styles.label}>Hall / Screen</Text>

              <TouchableOpacity
                style={styles.dropdownBox}
                onPress={() => {
                  if (cinemaId) {
                    setRoomModalVisible(true);
                  }
                }}
              >
                <View style={styles.dropdownLeft}>
                  <MaterialCommunityIcons
                    name="theater"
                    size={16}
                    color={COLORS.red}
                    style={styles.inputIcon}
                  />

                  <Text style={styles.dropdownValue} numberOfLines={1}>
                    {!cinemaId
                      ? "Select cinema first"
                      : selectedRoom
                        ? selectedRoom.roomName
                        : "Select Room"}
                  </Text>
                </View>

                <Ionicons name="chevron-down" size={16} color={COLORS.red} />
              </TouchableOpacity>
            </View>

            <View style={[styles.fieldWrapper, styles.flex1]}>
              <Text style={styles.label}>Ticket Price</Text>

              <View style={styles.inputBox}>
                <Text style={styles.currencyText}>VND</Text>

                <TextInput
                  style={styles.input}
                  keyboardType="decimal-pad"
                  value={price}
                  onChangeText={setPrice}
                  placeholder="0"
                  placeholderTextColor={COLORS.gray}
                />
              </View>
            </View>
          </View>

          {/* Capacity Preview */}

          <View style={styles.capacityCard}>
            <View style={styles.capacityHeader}>
              <Text style={styles.capacityTitle}>Capacity Preview</Text>

              <Text style={styles.capacitySubtitle}>
                {selectedRoom
                  ? `${selectedRoom.totalSeats} Seats`
                  : "Select a room"}
              </Text>
            </View>

            {selectedRoom ? (
              <>
                <View style={styles.seatGrid}>
                  {Array.from({
                    length: selectedRoom.rows,
                  }).map((_, rowIndex) => (
                    <View key={rowIndex} style={styles.seatRow}>
                      {Array.from({
                        length: selectedRoom.seatsPerRow,
                      }).map((__, seatIndex) => (
                        <View
                          key={seatIndex}
                          style={[styles.seat, styles.seatAvailable]}
                        />
                      ))}
                    </View>
                  ))}
                </View>

                <View style={styles.legendRow}>
                  <View style={styles.legendItem}>
                    <View style={[styles.legendDot, styles.seatAvailable]} />

                    <Text style={styles.legendText}>Seat</Text>
                  </View>
                </View>
              </>
            ) : (
              <Text
                style={{
                  color: COLORS.gray,
                  textAlign: "center",
                  marginVertical: 20,
                }}
              >
                Please select a room first.
              </Text>
            )}
          </View>

          {/* Action */}

          <View style={styles.actionRow}>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => router.replace("/admin/DashBoardAdmin")}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.saveBtn}
              onPress={handleUpdateShowtime}
            >
              <Text style={styles.saveText}>Update Showtime</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
      <Modal
        visible={cinemaModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setCinemaModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setCinemaModalVisible(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Cinema</Text>

              <TouchableOpacity onPress={() => setCinemaModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={cinemas}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setCinemaId(item._id);
                    setRoomId("");
                    setCinemaModalVisible(false);
                  }}
                >
                  <Text
                    style={[
                      styles.modalOptionText,
                      cinemaId === item._id && styles.modalOptionTextActive,
                    ]}
                  >
                    {item.cinemaName}
                  </Text>

                  {cinemaId === item._id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.red}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>
      <Modal
        visible={roomModalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setRoomModalVisible(false)}
      >
        <Pressable
          style={styles.modalBackdrop}
          onPress={() => setRoomModalVisible(false)}
        >
          <Pressable
            style={styles.modalSheet}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Room</Text>

              <TouchableOpacity onPress={() => setRoomModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.gray} />
              </TouchableOpacity>
            </View>

            <FlatList
              data={availableRooms}
              keyExtractor={(item) => item._id}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    setRoomId(item._id);
                    setRoomModalVisible(false);
                  }}
                >
                  <View>
                    <Text
                      style={[
                        styles.modalOptionText,
                        roomId === item._id && styles.modalOptionTextActive,
                      ]}
                    >
                      {item.roomName}
                    </Text>

                    <Text style={styles.modalOptionSubtitle}>
                      {item.totalSeats} Seats • {item.rows} x {item.seatsPerRow}
                    </Text>
                  </View>

                  {roomId === item._id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={COLORS.red}
                    />
                  )}
                </TouchableOpacity>
              )}
            />
          </Pressable>
        </Pressable>
      </Modal>

      {/* Date Picker */}

      {Platform.OS !== "web" && showDatePicker && (
        <DateTimePicker
          value={date ?? new Date()}
          mode="date"
          minimumDate={new Date()}
          display={Platform.OS === "ios" ? "inline" : "default"}
          onChange={(event: any, value?: Date) => {
            setShowDatePicker(Platform.OS === "ios");

            if (event.type !== "dismissed" && value) {
              setDate(value);
            }
          }}
        />
      )}

      {Platform.OS !== "web" && showTimePicker && (
        <DateTimePicker
          value={startTime ?? new Date()}
          mode="time"
          display={Platform.OS === "ios" ? "spinner" : "default"}
          onChange={(event: any, value?: Date) => {
            setShowTimePicker(Platform.OS === "ios");

            if (event.type !== "dismissed" && value) {
              setStartTime(value);
            }
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  backBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    color: COLORS.red,
    fontSize: 17,
    fontWeight: "700",
    marginLeft: 8,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.darkGray,
    alignItems: "center",
    justifyContent: "center",
  },

  // Banner
  banner: {
    width: "100%",
    height: 150,
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 6,
    marginBottom: 20,
    backgroundColor: COLORS.darkGray,
  },
  bannerImage: {
    width: "100%",
    height: "100%",
    position: "absolute",
  },
  bannerGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "70%",
  },
  bannerContent: {
    position: "absolute",
    left: 14,
    bottom: 12,
  },
  bannerBadge: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 20,
    fontWeight: "700",
  },

  // Fields
  fieldWrapper: {
    marginBottom: 16,
  },
  flex1: {
    flex: 1,
  },
  row: {
    flexDirection: "row",
    gap: 12,
  },
  label: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
  },
  inputBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  inputBoxDisabled: {
    opacity: 0.85,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 14,
  },
  dropdownBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  dropdownLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },
  dropdownValue: {
    color: COLORS.red,
    fontSize: 14,
    fontWeight: "600",
    flexShrink: 1,
  },
  dateBox: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: COLORS.darkGray,
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 46,
  },
  dateValue: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  placeholderText: {
    color: COLORS.gray,
  },

  // Capacity Preview
  capacityCard: {
    backgroundColor: COLORS.darkGray,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  capacityHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  capacityTitle: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "700",
  },
  capacitySubtitle: {
    color: COLORS.gray,
    fontSize: 11,
  },
  seatGrid: {
    gap: 8,
    marginBottom: 14,
  },
  seatRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  seat: {
    width: 26,
    height: 22,
    borderRadius: 4,
  },
  seatAvailable: {
    backgroundColor: "#3A3A3A",
  },
  seatUnavailable: {
    backgroundColor: "#B7935A",
  },
  legendRow: {
    flexDirection: "row",
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 3,
    marginRight: 6,
  },
  legendText: {
    color: COLORS.gray,
    fontSize: 11,
  },

  // Action Buttons
  actionRow: {
    flexDirection: "row",
    gap: 12,
  },
  cancelBtn: {
    flex: 1,
    height: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.darkGray,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 2,
    height: 50,
    borderRadius: 12,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end",
  },
  modalSheet: {
    backgroundColor: COLORS.darkGray,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    maxHeight: "60%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  modalTitle: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "700",
  },
  modalOption: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalOptionText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  modalOptionTextActive: {
    color: COLORS.red,
  },
  modalOptionSubtitle: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 2,
  },
  modalEmptyText: {
    color: COLORS.gray,
    fontSize: 13,
    textAlign: "center",
    paddingVertical: 24,
  },
  currencyText: {
    color: COLORS.red,
    fontWeight: "bold",
    fontSize: 14,
    marginHorizontal: 8,
  },
});
