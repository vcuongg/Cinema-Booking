import {
  View,
  Text,
  Image,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

import { MaterialIcons } from "@expo/vector-icons";

import { Movie } from "@/shared/types/movie";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <View style={styles.card}>

      <Image
        source={{ uri: movie.posterUrl }}
        style={styles.poster}
      />

      <View style={styles.info}>
        <Text style={styles.title}>{movie.title}</Text>

        <Text style={styles.sub}>
          {movie.duration}Minutes
        </Text>

        <View style={styles.badge}>
          <Text style={styles.badgeText}>{movie.rating}</Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.icon}>
          <MaterialIcons
            name="edit"
            size={18}
            color="white"
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.icon}>
          <MaterialIcons
            name="delete"
            size={18}
            color="white"
          />
        </TouchableOpacity>
      </View>

    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#1A2333",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    alignItems: "center",
  },

  poster: {
    width: 60,
    height: 80,
    borderRadius: 8,
  },

  info: {
    flex: 1,
    marginLeft: 12,
  },

  title: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },

  sub: {
    color: "#9AA3B2",
    marginTop: 4,
  },

  badge: {
    marginTop: 8,
    alignSelf: "flex-start",
    backgroundColor: "#3C4558",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },

  badgeText: {
    color: "#fff",
    fontSize: 11,
  },

  actions: {
    justifyContent: "space-between",
    height: 70,
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#323C4D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 6,
  },
});
