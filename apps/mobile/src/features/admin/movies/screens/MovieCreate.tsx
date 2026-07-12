import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import PosterPicker from "./component/PosterPicker";
import FormField from "./component/FormField";
import AttributePicker from "./component/AttributePicker";

export default function MovieCreateScreen() {
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");
  const [duration, setDuration] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [attributes, setAttributes] = useState<string[]>([]);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Movie</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Poster */}
        <PosterPicker />

        {/* Movie Title */}
        <FormField
          label="Movie Title"
          placeholder="Enter movie title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Genre + Duration in one row */}
        <View style={styles.row}>
          <FormField
            label="Genre"
            placeholder="e.g. Sci-Fi"
            value={genre}
            onChangeText={setGenre}
            flex={1}
          />
          <View style={styles.rowGap} />
          <FormField
            label="Duration"
            placeholder="120 min"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            flex={1}
          />
        </View>

        {/* Release Date */}
        <FormField
          label="Release Date"
          placeholder="dd/mm/yyyy"
          value={releaseDate}
          onChangeText={setReleaseDate}
        />

        {/* Description */}
        <FormField
          label="Description"
          placeholder="Enter movie description..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Attributes */}
        <AttributePicker selected={attributes} onChange={setAttributes} />

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.cancelBtn} onPress={() => router.back()}>
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.createBtn}>
            <Text style={styles.createText}>Create Movie</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d141d",
    paddingHorizontal: 18,
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A2333",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    color: "#E50914",
    fontSize: 22,
    fontWeight: "700",
  },
  placeholder: {
    width: 42,
  },
  body: {
    paddingBottom: 40,
  },
  row: {
    flexDirection: "row",
  },
  rowGap: {
    width: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: "#1A2333",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222A36",
    paddingVertical: 14,
    alignItems: "center",
  },
  cancelText: {
    color: "#8F98A8",
    fontSize: 15,
    fontWeight: "600",
  },
  createBtn: {
    flex: 2,
    backgroundColor: "#E50914",
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: "center",
  },
  createText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
