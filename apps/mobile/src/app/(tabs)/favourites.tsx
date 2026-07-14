import { View, Text, StyleSheet } from "react-native";

export default function FavouritesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>My Favorites</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#111", justifyContent: "center", alignItems: "center" },
  text: { color: "#fff", fontSize: 20, fontWeight: "bold" },
});