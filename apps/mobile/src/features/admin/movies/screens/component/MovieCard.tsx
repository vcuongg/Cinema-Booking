import { MaterialIcons } from "@expo/vector-icons";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import type { Movie } from "@/shared/types/movie";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  return (
    <View style={styles.card}>
      {movie.poster ? (
        <Image
          source={{
            uri: movie.poster,
          }}
          style={styles.poster}
          resizeMode="cover"
        />
      ) : (
        <View style={styles.posterPlaceholder}>
          <MaterialIcons
            name="movie"
            size={30}
            color="#9AA3B2"
          />
        </View>
      )}

      <View style={styles.info}>
        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {movie.title}
        </Text>

        <Text style={styles.sub}>
          {movie.duration} Minutes
        </Text>

        <Text style={styles.genre}>
          {movie.genre}
        </Text>

        <View style={styles.badge}>
          <MaterialIcons
            name="star"
            size={13}
            color="#FFD700"
          />

          <Text style={styles.badgeText}>
            {movie.rating ?? 0}
          </Text>
        </View>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.icon}>
          <MaterialIcons
            name="edit"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.icon,
            styles.deleteIcon,
          ]}
        >
          <MaterialIcons
            name="delete"
            size={18}
            color="#FFFFFF"
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1A2333",
    borderRadius: 14,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#29313D",
  },

  poster: {
    width: 64,
    height: 88,
    borderRadius: 9,
    backgroundColor: "#323C4D",
  },

  posterPlaceholder: {
    width: 64,
    height: 88,
    borderRadius: 9,
    backgroundColor: "#323C4D",
    justifyContent: "center",
    alignItems: "center",
  },

  info: {
    flex: 1,
    marginLeft: 12,
    marginRight: 10,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },

  sub: {
    color: "#9AA3B2",
    marginTop: 5,
    fontSize: 13,
  },

  genre: {
    color: "#9AA3B2",
    marginTop: 3,
    fontSize: 12,
  },

  badge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: 4,
    marginTop: 8,
    backgroundColor: "#3C4558",
    borderRadius: 20,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },

  badgeText: {
    color: "#FFFFFF",
    fontSize: 11,
    fontWeight: "600",
  },

  actions: {
    justifyContent: "center",
    gap: 9,
  },

  icon: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#323C4D",
    justifyContent: "center",
    alignItems: "center",
  },

  deleteIcon: {
    backgroundColor: "#E50914",
  },
});
