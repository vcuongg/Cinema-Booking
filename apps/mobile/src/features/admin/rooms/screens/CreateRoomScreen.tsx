import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { createRoom, getRoomFormData } from "@/shared/services/RoomService";
import type { Cinema } from "@/shared/types/cinema";

export default function CreateRoomScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);
  const [cinemas, setCinemas] = useState<Cinema[]>([]);
  const [cinemaId, setCinemaId] = useState("");
  const [roomName, setRoomName] = useState("");
  const [rows, setRows] = useState("");
  const [seatsPerRow, setSeatsPerRow] = useState("");
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void getRoomFormData()
      .then((data) => setCinemas(data.cinemas ?? []))
      .catch((error) => Alert.alert("Error", error instanceof Error ? error.message : "Cannot load cinemas"))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    const show = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      (event) => setKeyboardHeight(event.endCoordinates.height),
    );
    const hide = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setKeyboardHeight(0),
    );
    return () => { show.remove(); hide.remove(); };
  }, []);

  const totalSeats = useMemo(() => Number(rows) * Number(seatsPerRow) || 0, [rows, seatsPerRow]);
  const scrollToField = (y?: number) => setTimeout(() => {
    if (typeof y === "number") scrollRef.current?.scrollTo({ y, animated: true });
    else scrollRef.current?.scrollToEnd({ animated: true });
  }, 150);

  const onSave = async () => {
    const parsedRows = Number(rows);
    const parsedSeatsPerRow = Number(seatsPerRow);
    if (!cinemaId || !roomName.trim() || !Number.isInteger(parsedRows) || parsedRows <= 0 || !Number.isInteger(parsedSeatsPerRow) || parsedSeatsPerRow <= 0) {
      Alert.alert("Missing information", "Please select a cinema and enter valid room details.");
      return;
    }
    setSaving(true);
    try {
      await createRoom({ cinemaId, roomName: roomName.trim(), rows: parsedRows, seatsPerRow: parsedSeatsPerRow });
      router.replace("/admin/RoomsManagement");
    } catch (error) {
      Alert.alert("Error", error instanceof Error ? error.message : "Cannot create room");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <SafeAreaView style={styles.safe}><ActivityIndicator color="#E50914" /></SafeAreaView>;

  return <SafeAreaView style={styles.safe}>
    <View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color="#FFF" /></Pressable><Text style={styles.title}>Create Room</Text></View>
    <ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: keyboardHeight + 40 }]} keyboardShouldPersistTaps="handled" keyboardDismissMode="on-drag">
      <Text style={styles.label}>Cinema</Text>
      <View style={styles.cinemas}>{cinemas.map((cinema) => <Pressable key={cinema._id} onPress={() => setCinemaId(cinema._id)} style={[styles.cinema, cinemaId === cinema._id && styles.active]}><Text style={styles.cinemaText}>{cinema.cinemaName}</Text></Pressable>)}</View>
      <Text style={styles.label}>Room name</Text>
      <TextInput value={roomName} onChangeText={setRoomName} onFocus={() => scrollToField(100)} placeholder="e.g. Hall 1" placeholderTextColor="#9AA3B2" style={styles.input} />
      <View style={styles.row}>
        <View style={styles.col}><Text style={styles.label}>Rows</Text><TextInput value={rows} onChangeText={setRows} onFocus={() => scrollToField()} keyboardType="number-pad" placeholder="10" placeholderTextColor="#9AA3B2" style={styles.input} /></View>
        <View style={styles.col}><Text style={styles.label}>Seats / row</Text><TextInput value={seatsPerRow} onChangeText={setSeatsPerRow} onFocus={() => scrollToField()} keyboardType="number-pad" placeholder="12" placeholderTextColor="#9AA3B2" style={styles.input} /></View>
      </View>
      <Text style={styles.total}>Total seats: {totalSeats}</Text>
      <Pressable onPress={() => void onSave()} disabled={saving} style={[styles.save, saving && styles.saveDisabled]}><Text style={styles.saveText}>{saving ? "Saving..." : "Create room"}</Text></Pressable>
    </ScrollView>
  </SafeAreaView>;
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0D141D", paddingHorizontal: 16 }, header: { height: 60, flexDirection: "row", alignItems: "center", gap: 14 }, back: { width: 38, height: 38, borderRadius: 19, backgroundColor: "#171E29", alignItems: "center", justifyContent: "center" }, title: { color: "#FFF", fontSize: 21, fontWeight: "800" }, content: { paddingVertical: 14 }, label: { color: "#9AA3B2", fontWeight: "700", marginBottom: 8 }, cinemas: { gap: 8, marginBottom: 18 }, cinema: { padding: 13, borderRadius: 10, backgroundColor: "#171E29", borderWidth: 1, borderColor: "#222A36" }, active: { borderColor: "#E50914", backgroundColor: "#3B1F25" }, cinemaText: { color: "#FFF" }, input: { height: 48, backgroundColor: "#0D141D", borderColor: "#222A36", borderWidth: 1, borderRadius: 10, color: "#FFF", paddingHorizontal: 12, marginBottom: 16 }, row: { flexDirection: "row", gap: 10 }, col: { flex: 1 }, total: { color: "#E50914", fontWeight: "800", marginBottom: 22 }, save: { backgroundColor: "#E50914", padding: 16, alignItems: "center", borderRadius: 10 }, saveDisabled: { opacity: 0.65 }, saveText: { color: "#FFF", fontWeight: "800" },
});
