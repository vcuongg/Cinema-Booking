import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PosterPicker() {
  return (
    <TouchableOpacity style={styles.container} activeOpacity={0.7}>
      <View style={styles.iconWrap}>
        <Ionicons name="camera" size={36} color="#E50914" />
      </View>
      <Text style={styles.title}>Upload Poster</Text>
      <Text style={styles.subtitle}>Recommended: 500 × 750 px</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#1A2333",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#222A36",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    marginBottom: 20,
  },
  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: "#2A303B",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  title: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  subtitle: {
    color: "#8F98A8",
    fontSize: 13,
  },
});
