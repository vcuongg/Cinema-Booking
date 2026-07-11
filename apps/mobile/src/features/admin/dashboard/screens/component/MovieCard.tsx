import { View, Text, StyleSheet, Image } from "react-native";

type Props = {
  title: string;
  sold: number;
  image: string;
};

export default function MovieCard({
  title,
  sold,
  image,
}: Props) {
  return (
    <View style={styles.card}>
      <Image
        source={{ uri: image }}
        style={styles.poster}
      />

      <View style={styles.info}>
        <Text style={styles.title}>{title}</Text>

        <Text style={styles.sold}>
          🎟 {sold} tickets sold
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",

    backgroundColor: "#171E29",

    borderRadius: 18,

    padding: 12,

    marginBottom: 14,

    borderWidth: 1,
    borderColor: "#222A36",
  },

  poster: {
    width: 60,
    height: 85,

    borderRadius: 10,
  },

  info: {
    marginLeft: 15,
    flex: 1,
  },

  title: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },

  sold: {
    color: "#A5ADBA",
    fontSize: 14,
  },
});