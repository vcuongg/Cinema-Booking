import React from "react";
import { StyleSheet, Text, View } from "react-native";

import StatusCard from "../components/StatusCard";

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <StatusCard
        title="Mobile ready"
        description="Kết nối API backend, navigation và state management sẽ được thêm dần theo feature."
      />
      <Text style={styles.sectionTitle}>Folder gợi ý</Text>
      <Text style={styles.sectionText}>- components: UI tái sử dụng</Text>
      <Text style={styles.sectionText}>- screens: từng màn hình</Text>
      <Text style={styles.sectionText}>- services: gọi API</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 8,
  },
  sectionTitle: {
    marginTop: 24,
    marginBottom: 8,
    fontSize: 18,
    fontWeight: "700",
    color: "#101828",
  },
  sectionText: {
    fontSize: 14,
    lineHeight: 22,
    color: "#475467",
  },
});
