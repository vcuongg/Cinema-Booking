import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  createRoom,
  deleteRoom,
  getRoomFormData,
  getRooms,
  updateRoom,
} from "@/shared/services/RoomService";
import type { Cinema } from "@/shared/types/cinema";
import type { Room } from "@/shared/types/room";

const COLORS = {
  black: "#0D141D",
  card: "#171E29",
  border: "#222A36",
  text: "#FFFFFF",
  muted: "#9AA3B2",
  red: "#E50914",
};

function getCinemaId(room: Room): string {
  return typeof room.cinemaId === "string" ? room.cinemaId : room.cinemaId._id;
}

function getCinemaName(room: Room): string {
  return typeof room.cinemaId === "string" ? "Unknown cinema" : room.cinemaId.cinemaName;
}

export default function RoomManagementScreen() {
  const { height: screenHeight } = useWindowDimensions();
  const router = useRouter();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editorVisible, setEditorVisible] = useState(false);
  const [cinemaPickerVisible, setCinemaPickerVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);

  const [cinemaId, setCinemaId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [rows, setRows] = useState("");
  const [seatsPerRow, setSeatsPerRow] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const editorScrollRef = useRef<ScrollView>(null);

  const scrollEditorTo = (y?: number) => {
    // Wait until the keyboard has updated the modal's layout before scrolling.
    requestAnimationFrame(() => {
      setTimeout(() => {
        if (typeof y === "number") {
          editorScrollRef.current?.scrollTo({ y, animated: true });
        } else {
          editorScrollRef.current?.scrollToEnd({ animated: true });
        }
      }, 150);
    });
  };

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSubscription = Keyboard.addListener("keyboardDidShow", (event) => {
      setKeyboardHeight(event.endCoordinates.height);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => setKeyboardHeight(0));

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const totalSeats = useMemo(() => {
    const parsedRows = Number(rows);
    const parsedSeats = Number(seatsPerRow);

    if (!Number.isInteger(parsedRows) || !Number.isInteger(parsedSeats)) {
      return 0;
    }

    if (parsedRows <= 0 || parsedSeats <= 0) {
      return 0;
    }

    return parsedRows * parsedSeats;
  }, [rows, seatsPerRow]);

  const selectedCinema = cinemas.find((item) => item._id === cinemaId) || null;

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    try {
      const [roomData, formData] = await Promise.all([getRooms(), getRoomFormData()]);
      setRooms(roomData);
      setCinemas(formData.cinemas || []);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cannot load rooms";
      Alert.alert("Error", message);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const resetEditor = () => {
    setEditingRoom(null);
    setCinemaId("");
    setRoomName("");
    setRows("");
    setSeatsPerRow("");
  };

  const openCreateEditor = () => {
    router.push("/admin/CreateRoom");
  };

  const openUpdateEditor = (room: Room) => {
    router.push({ pathname: "/admin/UpdateRoom", params: { id: room._id } });
  };

  const onCloseEditor = () => {
    setEditorVisible(false);
    setCinemaPickerVisible(false);
    resetEditor();
  };

  const onSaveRoom = async () => {
    const parsedRows = Number(rows);
    const parsedSeatsPerRow = Number(seatsPerRow);

    if (!cinemaId) {
      Alert.alert("Validation", "Please select cinema.");
      return;
    }

    if (!roomName.trim()) {
      Alert.alert("Validation", "Please enter room name.");
      return;
    }

    if (!Number.isInteger(parsedRows) || parsedRows <= 0) {
      Alert.alert("Validation", "Rows must be a positive integer.");
      return;
    }

    if (!Number.isInteger(parsedSeatsPerRow) || parsedSeatsPerRow <= 0) {
      Alert.alert("Validation", "Seats per row must be a positive integer.");
      return;
    }

    setSaving(true);

    try {
      const payload = {
        cinemaId,
        roomName: roomName.trim(),
        rows: parsedRows,
        seatsPerRow: parsedSeatsPerRow,
      };

      if (editingRoom) {
        await updateRoom(editingRoom._id, payload);
      } else {
        await createRoom(payload);
      }

      onCloseEditor();
      await loadData();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Cannot save room";
      Alert.alert("Error", message);
    } finally {
      setSaving(false);
    }
  };

  const onDeleteRoom = async (room: Room) => {
    const action = async () => {
      try {
        await deleteRoom(room._id);
        await loadData();
      } catch (error) {
        const message = error instanceof Error ? error.message : "Cannot delete room";
        Alert.alert("Error", message);
      }
    };

    if (Platform.OS === "web") {
      const ok = window.confirm(`Delete ${room.roomName}?`);
      if (!ok) return;
      await action();
      return;
    }

    Alert.alert("Delete room", `Delete ${room.roomName}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: action },
    ]);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.replace("/admin/DashBoardAdmin")}>
            <Ionicons name="arrow-back" size={22} color={COLORS.text} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Manage Rooms</Text>

          <TouchableOpacity style={styles.iconButton} onPress={openCreateEditor}>
            <Ionicons name="add" size={24} color={COLORS.red} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={styles.loadingText}>Loading rooms...</Text>
        ) : (
          <FlatList
            data={rooms}
            keyExtractor={(item) => item._id}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => loadData(true)}
                tintColor={COLORS.red}
              />
            }
            ListEmptyComponent={<Text style={styles.emptyText}>No rooms found.</Text>}
            renderItem={({ item }) => (
              <View style={styles.roomCard}>
                <View style={styles.roomHeadRow}>
                  <Text style={styles.roomTitle}>{item.roomName}</Text>
                  <Text style={styles.cinemaBadge}>{getCinemaName(item)}</Text>
                </View>

                <View style={styles.metricRow}>
                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="view-grid" size={16} color={COLORS.red} />
                    <Text style={styles.metricText}>{item.rows} rows</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <MaterialCommunityIcons name="seat" size={16} color={COLORS.red} />
                    <Text style={styles.metricText}>{item.seatsPerRow} seats/row</Text>
                  </View>

                  <View style={styles.metricItem}>
                    <Ionicons name="people" size={16} color={COLORS.red} />
                    <Text style={styles.metricText}>{item.totalSeats} seats</Text>
                  </View>
                </View>

                <View style={styles.actionRow}>
                  <TouchableOpacity style={styles.editButton} onPress={() => openUpdateEditor(item)}>
                    <Ionicons name="create-outline" size={16} color={COLORS.text} />
                    <Text style={styles.editText}>Edit</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.deleteButton} onPress={() => onDeleteRoom(item)}>
                    <Ionicons name="trash-outline" size={16} color={COLORS.text} />
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
        )}

        <Modal visible={editorVisible} animationType="slide" transparent onRequestClose={onCloseEditor}>
          <KeyboardAvoidingView style={[styles.modalBackdrop, Platform.OS === "android" && { paddingBottom: keyboardHeight }]} behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <Pressable style={styles.backdropTapArea} onPress={onCloseEditor} />
            <View style={[styles.modalSheet, keyboardHeight > 0 && { maxHeight: screenHeight - keyboardHeight - 16 }]}>
              <Text style={styles.modalTitle}>{editingRoom ? "Update Room" : "Create Room"}</Text>
              <ScrollView
                ref={editorScrollRef}
                style={styles.formScroll}
                contentContainerStyle={[
                  styles.formScrollContent,
                  Platform.OS === "android" && { paddingBottom: keyboardHeight + 16 },
                ]}
                keyboardShouldPersistTaps="handled"
                keyboardDismissMode="on-drag"
                showsVerticalScrollIndicator={false}
              >
              <Text style={styles.label}>Cinema</Text>
              <TouchableOpacity style={styles.pickerButton} onPress={() => setCinemaPickerVisible(true)}>
                <Text style={styles.pickerText}>{selectedCinema ? selectedCinema.cinemaName : "Select cinema"}</Text>
                <Ionicons name="chevron-down" size={18} color={COLORS.red} />
              </TouchableOpacity>

              <Text style={styles.label}>Room Name</Text>
              <TextInput
                value={roomName}
                onChangeText={setRoomName}
                placeholder="e.g. Hall 1"
                placeholderTextColor={COLORS.muted}
                style={styles.input}
                onFocus={() => scrollEditorTo(70)}
              />

              <View style={styles.twoColRow}>
                <View style={styles.col}>
                  <Text style={styles.label}>Rows</Text>
                  <TextInput
                    value={rows}
                    onChangeText={setRows}
                    keyboardType="number-pad"
                    placeholder="10"
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    onFocus={() => scrollEditorTo()}
                  />
                </View>

                <View style={styles.col}>
                  <Text style={styles.label}>Seats / Row</Text>
                  <TextInput
                    value={seatsPerRow}
                    onChangeText={setSeatsPerRow}
                    keyboardType="number-pad"
                    placeholder="12"
                    placeholderTextColor={COLORS.muted}
                    style={styles.input}
                    onFocus={() => scrollEditorTo()}
                  />
                </View>
              </View>

              <Text style={styles.totalText}>Total seats: {totalSeats}</Text>

              <View style={styles.modalActionRow}>
                <TouchableOpacity style={styles.cancelButton} onPress={onCloseEditor} disabled={saving}>
                  <Text style={styles.cancelText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.saveButton} onPress={onSaveRoom} disabled={saving}>
                  <Text style={styles.saveText}>{saving ? "Saving..." : "Save"}</Text>
                </TouchableOpacity>
              </View>
              </ScrollView>
            </View>
          </KeyboardAvoidingView>
        </Modal>

        <Modal
          visible={cinemaPickerVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setCinemaPickerVisible(false)}
        >
          <Pressable style={styles.modalBackdrop} onPress={() => setCinemaPickerVisible(false)}>
            <Pressable style={styles.dropdownSheet} onPress={(event) => event.stopPropagation()}>
              <Text style={styles.dropdownTitle}>Select Cinema</Text>

              <ScrollView>
                {cinemas.map((item) => (
                  <TouchableOpacity
                    key={item._id}
                    style={styles.dropdownItem}
                    onPress={() => {
                      setCinemaId(item._id);
                      setCinemaPickerVisible(false);
                    }}
                  >
                    <Text style={styles.dropdownItemText}>{item.cinemaName}</Text>
                    {cinemaId === item._id ? (
                      <Ionicons name="checkmark-circle" size={20} color={COLORS.red} />
                    ) : null}
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
      </View>
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
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: COLORS.card,
  },
  headerTitle: {
    color: COLORS.text,
    fontSize: 18,
    fontWeight: "700",
  },
  loadingText: {
    color: COLORS.text,
    textAlign: "center",
    marginTop: 30,
  },
  listContent: {
    paddingBottom: 20,
  },
  emptyText: {
    color: COLORS.muted,
    textAlign: "center",
    marginTop: 30,
  },
  roomCard: {
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
  },
  roomHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 8,
  },
  roomTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: "700",
    flex: 1,
  },
  cinemaBadge: {
    color: COLORS.red,
    fontSize: 12,
    fontWeight: "700",
  },
  metricRow: {
    marginTop: 10,
    gap: 8,
  },
  metricItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metricText: {
    color: COLORS.muted,
    fontSize: 13,
  },
  actionRow: {
    marginTop: 12,
    flexDirection: "row",
    gap: 10,
  },
  editButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#243246",
  },
  editText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  deleteButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    height: 40,
    borderRadius: 10,
    backgroundColor: "#3B1F25",
  },
  deleteText: {
    color: COLORS.text,
    fontWeight: "600",
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    justifyContent: "flex-end",
  },
  backdropTapArea: {
    ...StyleSheet.absoluteFill,
  },
  modalSheet: {
    backgroundColor: COLORS.card,
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    padding: 16,
    borderColor: COLORS.border,
    borderWidth: 1,
    maxHeight: "82%",
    flexShrink: 1,
  },
  modalTitle: {
    color: COLORS.text,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 12,
  },
  formScroll: {
    flexShrink: 1,
  },
  formScrollContent: {
    flexGrow: 1,
  },
  label: {
    color: COLORS.muted,
    fontSize: 12,
    marginBottom: 6,
    fontWeight: "600",
  },
  input: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.black,
    color: COLORS.text,
    paddingHorizontal: 12,
    marginBottom: 10,
  },
  pickerButton: {
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.black,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  pickerText: {
    color: COLORS.text,
    fontSize: 14,
    flexShrink: 1,
  },
  twoColRow: {
    flexDirection: "row",
    gap: 10,
  },
  col: {
    flex: 1,
  },
  totalText: {
    color: COLORS.red,
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 12,
  },
  modalActionRow: {
    flexDirection: "row",
    gap: 10,
  },
  cancelButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.border,
    backgroundColor: COLORS.black,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1,
    height: 44,
    borderRadius: 10,
    backgroundColor: COLORS.red,
    alignItems: "center",
    justifyContent: "center",
  },
  saveText: {
    color: COLORS.text,
    fontWeight: "700",
  },
  dropdownSheet: {
    backgroundColor: COLORS.card,
    borderRadius: 14,
    margin: 20,
    maxHeight: "70%",
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 12,
  },
  dropdownTitle: {
    color: COLORS.text,
    fontWeight: "700",
    fontSize: 15,
    marginBottom: 8,
  },
  dropdownItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  dropdownItemText: {
    color: COLORS.text,
    fontSize: 14,
  },
});
