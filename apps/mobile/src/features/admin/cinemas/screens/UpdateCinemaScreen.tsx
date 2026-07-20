import React, { useEffect, useState } from "react";
import { useLocalSearchParams } from "expo-router";

import { getCinemaById, updateCinema } from "@/shared/services/CinemaService";

import { getRoomsByCinema } from "@/shared/services/RoomService";

import { Room } from "@/shared/types/room";

import { UpdateCinemaRequest } from "@/shared/types/cinema";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  Switch,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";

const RED = "#E74C3C";

export default function CreateCinemaScreen() {
  const router = useRouter();

  const { id } = useLocalSearchParams<{
    id: string;
  }>();
  const [loading, setLoading] = useState(true);
  const [coverPhoto, setCoverPhoto] = useState<string | null>(null);
  const [cinemaName, setCinemaName] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [saving, setSaving] = useState(false);
  const [isActive, setIsActive] = useState(true);

  const [halls, setHalls] = useState<Room[]>([]);
  const [nextHallName, setNextHallName] = useState("");

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n\n${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  const handlePickCover = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (!permission.granted) {
      Alert.alert("Permission needed", "Please allow photo library access.");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
      base64: true,
    });

    if (result.canceled) return;

    const asset = result.assets[0];

    // Mobile
    if (asset.base64) {
      setCoverPhoto(`data:image/jpeg;base64,${asset.base64}`);
      return;
    }

    // Web fallback
    const response = await fetch(asset.uri);

    const blob = await response.blob();

    const reader = new FileReader();

    reader.onloadend = () => {
      setCoverPhoto(reader.result as string);
    };

    reader.readAsDataURL(blob);
  };
  const loadRooms = async () => {
    try {
      const rooms = await getRoomsByCinema(id);

      setHalls(rooms);
    } catch (error) {
      console.error(error);

      setHalls([]);
    }
  };
  const loadCinema = async () => {
    try {
      setLoading(true);

      const cinema = await getCinemaById(id);

      setCinemaName(cinema.cinemaName);

      setAddress(cinema.address);

      setCity(cinema.city);

      setCoverPhoto(cinema.coverPhoto || null);

      setIsActive(cinema.isActive);

      const rooms = await getRoomsByCinema(id);
      console.log("Cinema ID:", id);
      console.log("Rooms:", rooms);
      setHalls(rooms);
    } catch (error) {
      console.error(error);

      showAlert("Error", "Cannot load cinema.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      loadCinema();
    }
  }, [id]);

  // const handleEditHall = (hall) => {
  //   console.log("Edit hall", hall.id);
  // };

  // const handleDeleteHall = (hall) => {
  //   setHalls((prev) => prev.filter((h) => h.id !== hall.id));
  // };

  const handleCancel = () => {
    router.back();
  };

  const validateForm = () => {
    if (!cinemaName.trim()) {
      showAlert("Validation", "Cinema name is required.");
      return false;
    }

    if (!address.trim()) {
      showAlert("Validation", "Address is required.");
      return false;
    }

    if (!city.trim()) {
      showAlert("Validation", "City is required.");
      return false;
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      setSaving(true);

      const payload: UpdateCinemaRequest = {
        cinemaName: cinemaName.trim(),

        address: address.trim(),

        city: city.trim(),

        coverPhoto: coverPhoto ?? "",

        isActive,
      };

      await updateCinema(id, payload);

      if (Platform.OS === "web") {
        showAlert("Success", "Cinema updated successfully.");

        router.replace("/admin/CinemaManagement");
      } else {
        Alert.alert("Success", "Cinema updated successfully.", [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]);
      }
    } catch (error) {
      console.error(error);
      showAlert(
        "Error",
        error instanceof Error ? error.message : "An error occurred.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#0A0A0C",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
          }}
        >
          Loading Cinema...
        </Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          style={styles.headerIconBtn}
        >
          <Ionicons name="chevron-back" size={22} color={RED} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Update Cinema</Text>
        <TouchableOpacity style={styles.headerIconBtn}>
          <Ionicons name="search" size={20} color="#E5E5E7" />
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 140 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Cover photo */}
        <TouchableOpacity
          style={styles.coverWrap}
          activeOpacity={0.85}
          onPress={handlePickCover}
        >
          {coverPhoto ? (
            <Image source={{ uri: coverPhoto }} style={styles.coverImage} />
          ) : (
            <View style={styles.coverPlaceholder} />
          )}
          <View style={styles.coverOverlay} />
          <View style={styles.coverContent}>
            <View style={styles.coverIconCircle}>
              <Ionicons name="camera" size={20} color={RED} />
            </View>
            <Text style={styles.coverText}>CHANGE COVER PHOTO</Text>
          </View>
        </TouchableOpacity>

        {/* Cinema Name */}
        <Text style={styles.label}>Cinema Name</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Grand Imperial IMAX"
          placeholderTextColor="#5C5C60"
          value={cinemaName}
          onChangeText={setCinemaName}
        />

        {/* Address */}
        <Text style={styles.label}>Address</Text>

        <View style={styles.inputWithIcon}>
          <Ionicons
            name="location-outline"
            size={16}
            color={RED}
            style={{ marginRight: 8 }}
          />

          <TextInput
            style={styles.inputInline}
            placeholder="Lincoln Square"
            placeholderTextColor="#5C5C60"
            value={address}
            onChangeText={setAddress}
          />
        </View>

        {/* City */}
        <Text style={styles.label}>City</Text>

        <View style={styles.inputWithIcon}>
          <Ionicons
            name="business-outline"
            size={16}
            color={RED}
            style={{ marginRight: 8 }}
          />

          <TextInput
            style={styles.inputInline}
            placeholder="New York"
            placeholderTextColor="#5C5C60"
            value={city}
            onChangeText={setCity}
          />
        </View>

        {/* Hall Configuration */}
        <View style={styles.sectionHeaderRow}>
          <Text style={styles.sectionTitle}>Hall</Text>
        </View>

        {halls.length === 0 ? (
          <Text
            style={{
              color: "#777",
              marginTop: 12,
              marginBottom: 15,
              textAlign: "center",
            }}
          >
            No halls have been created for this cinema.
          </Text>
        ) : (
          halls.map((hall) => (
            <View key={hall._id} style={styles.hallCard}>
              <View style={styles.hallIconBox}>
                <MaterialCommunityIcons
                  name="theater"
                  size={18}
                  color="#E5E5E7"
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={styles.hallName}>{hall.roomName}</Text>

                <Text style={styles.hallMeta}>
                  {hall.totalSeats} Seats · {hall.rows} × {hall.seatsPerRow}
                </Text>
              </View>
            </View>
          ))
        )}


        {/* Cinema Status */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconBar} />
          <View style={styles.statusIconCircle}>
            <Ionicons name="wifi" size={16} color={RED} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.statusTitle}>Cinema Status</Text>
            <Text style={styles.statusSubtitle}>
              {isActive ? "Active & Accepting Bookings" : "Inactive"}
            </Text>
          </View>
          <Switch
            value={isActive}
            onValueChange={setIsActive}
            trackColor={{ false: "#3A3A3E", true: RED }}
            thumbColor="#fff"
          />
        </View>
      </ScrollView>

      {/* Footer buttons */}
      <View style={styles.footer}>
        <TouchableOpacity style={styles.cancelBtn} onPress={handleCancel}>
          <Text style={styles.cancelBtnText}>Cancel</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.saveBtn,
            saving && {
              opacity: 0.7,
            },
          ]}
          disabled={saving}
          onPress={handleSave}
        >
          <Text style={styles.saveBtnText}>
            {saving ? "Updating..." : "Update Cinema"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0C",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 24,
    paddingBottom: 14,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: RED,
    fontSize: 18,
    fontWeight: "700",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 18,
  },
  coverWrap: {
    width: "100%",
    height: 130,
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  coverPlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#1A1015",
  },
  coverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10,5,8,0.45)",
  },
  coverContent: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
  coverIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(231,76,60,0.15)",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  coverText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  label: {
    color: RED,
    fontSize: 12,
    fontWeight: "700",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#131316",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#232327",
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#E5E5E7",
    fontSize: 14,
    marginBottom: 16,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131316",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#232327",
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  inputInline: {
    flex: 1,
    paddingVertical: 13,
    color: "#E5E5E7",
    fontSize: 14,
  },
  row2: {
    flexDirection: "row",
    gap: 12,
  },
  col: {
    flex: 1,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
    marginBottom: 12,
  },
  sectionTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },
  addHallBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  addHallText: {
    color: RED,
    fontSize: 12,
    fontWeight: "700",
  },
  hallCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#131316",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#232327",
    padding: 12,
    marginBottom: 10,
    gap: 10,
  },
  hallIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#1E1E22",
    alignItems: "center",
    justifyContent: "center",
  },
  hallName: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  hallMeta: {
    color: "#8A8A8E",
    fontSize: 12,
    marginTop: 2,
  },
  hallIconBtn: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: "#1E1E22",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },
  hallIconBtnDanger: {
    backgroundColor: "rgba(231,76,60,0.12)",
  },
  nextHallInput: {
    borderWidth: 1,
    borderColor: "#3A2A2E",
    borderStyle: "dashed",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    color: "#9A9AA0",
    fontSize: 13,
    fontStyle: "italic",
    textAlign: "center",
    marginBottom: 20,
  },
  statusCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#161013",
    borderRadius: 14,
    borderWidth: 1,
    borderLeftWidth: 3,
    borderColor: "#232327",
    borderLeftColor: RED,
    padding: 14,
    gap: 12,
  },
  statusIconBar: {
    display: "none",
  },
  statusIconCircle: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "rgba(231,76,60,0.12)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusTitle: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  statusSubtitle: {
    color: "#8A8A8E",
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 18,
    paddingTop: 14,
    paddingBottom: Platform.OS === "ios" ? 34 : 18,
    backgroundColor: "#0A0A0C",
    borderTopWidth: 1,
    borderTopColor: "#1E1E22",
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#1A1A1E",
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  cancelBtnText: {
    color: "#E5E5E7",
    fontSize: 14,
    fontWeight: "700",
  },
  saveBtn: {
    flex: 2,
    backgroundColor: RED,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: RED,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
});
