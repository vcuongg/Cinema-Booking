import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import type { Movie } from "@/shared/types/movie";

function getPosterUri(movie: Movie): string | undefined {
  const poster = movie.poster || movie.posterUrl || "";
  return poster ? poster : undefined;
}

interface HomeMovieCardProps {
  movie: Movie;
  isFavourite?: boolean;
  onFavouriteToggle?: () => void;
}

export default function HomeMovieCard({
  movie,
  isFavourite = false,
  onFavouriteToggle,
}: HomeMovieCardProps) {
  const posterUri = getPosterUri(movie);

  const openMovieDetail = () => {
    router.push({
      pathname: "/movies/[id]",
      params: {
        id: movie._id,
      },
    });
  };

  return (
    <Pressable
      onPress={openMovieDetail}
      style={({ pressed }) => [
        styles.card,
        pressed && styles.cardPressed,
      ]}
    >
      <View style={styles.posterContainer}>
        {posterUri ? (
          <Image
            source={{
              uri: posterUri,
            }}
            style={styles.poster}
            resizeMode="contain"
          />
        ) : (
          <View style={styles.posterPlaceholder}>
            <Ionicons
              name="film-outline"
              size={32}
              color="#6B7280"
            />

            <Text style={styles.placeholderText}>
              No poster
            </Text>
          </View>
        )}

        <View style={styles.ratingBadge}>
          <Ionicons
            name="star"
            size={13}
            color="#FFD166"
          />

          <Text style={styles.ratingBadgeText}>
            {movie.rating ?? 0}
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.topRow}>
          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {movie.status === "now_showing"
                ? "NOW SHOWING"
                : "COMING SOON"}
            </Text>
          </View>

          <Pressable
            onPress={(event) => {
              event.stopPropagation();
              onFavouriteToggle?.();
            }}
            style={styles.favoriteButton}
          >
            <Ionicons
              name={isFavourite ? "heart" : "heart-outline"}
              size={16}
              color={isFavourite ? "#FF6B81" : "#FFFFFF"}
            />
          </Pressable>
        </View>

        <View style={styles.ratingBox}>
          <Ionicons
            name="star"
            size={14}
            color="#FFD166"
          />

          <Text style={styles.ratingText}>
            {movie.rating ?? 0}
          </Text>
        </View>

        <Text
          style={styles.title}
          numberOfLines={2}
        >
          {movie.title}
        </Text>

        <Text
          style={styles.genre}
          numberOfLines={1}
        >
          {movie.genre}
        </Text>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Ionicons
              name="time-outline"
              size={15}
              color="#9CA3AF"
            />

            <Text style={styles.metaText}>
              {movie.duration} min
            </Text>
          </View>

          {movie.language ? (
            <View style={styles.metaItem}>
              <Ionicons
                name="language-outline"
                size={15}
                color="#9CA3AF"
              />

              <Text
                style={styles.metaText}
                numberOfLines={1}
              >
                {movie.language}
              </Text>
            </View>
          ) : null}
        </View>

        <View style={styles.footer}>
          <View>
            <Text style={styles.priceLabel}>
              From
            </Text>

            <Text style={styles.price}>
              {movie.priceFrom
                ? `${movie.priceFrom.toLocaleString(
                    "vi-VN",
                  )}đ`
                : "Contact"}
            </Text>
          </View>

          <View style={styles.detailButton}>
            <Text style={styles.detailButtonText}>
              Book Now
            </Text>

            <Ionicons
              name="arrow-forward"
              size={16}
              color="#FFFFFF"
            />
          </View>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    backgroundColor: "#111821",
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#29313D",
    marginBottom: 18,
    minHeight: 170,
  },

  cardPressed: {
    opacity: 0.88,
    transform: [{ scale: 0.995 }],
  },

  posterContainer: {
    width: 126,
    margin: 10,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#151D27",
    borderWidth: 1,
    borderColor: "#29313D",
    position: "relative",
  },

  poster: {
    width: "100%",
    height: "100%",
    backgroundColor: "#151D27",
  },

  posterPlaceholder: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151D27",
  },

  ratingBadge: {
    position: "absolute",
    right: 8,
    top: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: "rgba(7, 11, 18, 0.85)",
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 4,
  },

  ratingBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

  placeholderText: {
    color: "#6B7280",
    fontSize: 12,
    marginTop: 8,
  },

  content: {
    flex: 1,
    paddingVertical: 12,
    paddingRight: 14,
    paddingLeft: 2,
  },

  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  favoriteButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(17, 24, 39, 0.75)",
    borderWidth: 1,
    borderColor: "#3D4654",
  },

  statusBadge: {
    backgroundColor: "#2A171A",
    borderWidth: 1,
    borderColor: "#633036",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },

  statusText: {
    color: "#FF9E98",
    fontSize: 10,
    fontWeight: "800",
  },

  ratingBox: {
    display: "none",
  },

  ratingText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  title: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
    marginTop: 10,
  },

  genre: {
    color: "#E50914",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 6,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
    marginTop: 12,
  },

  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  metaText: {
    color: "#9CA3AF",
    fontSize: 12,
  },

  footer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: 14,
  },

  priceLabel: {
    color: "#6B7280",
    fontSize: 11,
  },

  price: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "800",
    marginTop: 3,
  },

  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#E50914",
    borderRadius: 10,
    paddingHorizontal: 13,
    paddingVertical: 10,
  },

  detailButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },
});