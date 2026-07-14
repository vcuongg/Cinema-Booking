import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useCallback, useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HomeMovieCard from "@/features/auth/components/HomeMovieCard";
import { favouriteService } from "@/shared/services/FavouriteService";
import type { Movie } from "@/shared/types/movie";

export default function FavouriteScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadFavouriteMovies = useCallback(async () => {
    try {
      setError("");
      const data = await favouriteService.getFavouriteMovies();
      setMovies(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Unable to load favourite movies";

      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");

      const data = await favouriteService.getFavouriteMovies();
      setMovies(data);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Unable to refresh favourite movies";

      setError(message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  const removeFromFavourite = useCallback(async (movieId: string) => {
    try {
      await favouriteService.removeFavourite(movieId);
      setMovies((prev) => prev.filter((movie) => movie._id !== movieId));
    } catch {
      setError("Unable to update favourite list");
    }
  }, []);

  useEffect(() => {
    void loadFavouriteMovies();
  }, [loadFavouriteMovies]);

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading favourites...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={movies}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <HomeMovieCard
            movie={item}
            isFavourite={true}
            onFavouriteToggle={() => removeFromFavourite(item._id)}
          />
        )}
        ListHeaderComponent={
          <View style={styles.headerWrap}>
            <Text style={styles.title}>Your Favourites</Text>
            <Text style={styles.subtitle}>
              {movies.length} movie{movies.length === 1 ? "" : "s"}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name={error ? "alert-circle-outline" : "heart-outline"}
              size={52}
              color={error ? "#E50914" : "#6B7280"}
            />

            <Text style={styles.emptyTitle}>
              {error ? "Unable to load favourites" : "No favourite movies yet"}
            </Text>

            <Text style={styles.emptyDescription}>
              {error || "Tap the heart icon on a movie to save it here."}
            </Text>
          </View>
        }
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#E50914"
            colors={["#E50914"]}
            progressBackgroundColor="#111821"
          />
        }
      />

      <View style={styles.bottomNavigation}>
        <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
          <Ionicons name="home-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Ionicons name="ticket-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Bookings</Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Ionicons name="heart" size={22} color="#E50914" />
          <Text style={styles.activeNavText}>Favourite</Text>
        </Pressable>

        <Pressable style={styles.navItem} onPress={() => router.replace("/profile")}>
          <Ionicons name="person-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#090D12",
  },

  listContent: {
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 105,
    flexGrow: 1,
  },

  headerWrap: {
    marginBottom: 14,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "800",
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },

  loadingScreen: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#090D12",
  },

  loadingText: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 12,
  },

  emptyContainer: {
    flex: 1,
    minHeight: 320,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
    textAlign: "center",
  },

  emptyDescription: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  bottomNavigation: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    minHeight: 78,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingBottom: 10,
    backgroundColor: "#111821",
    borderTopWidth: 1,
    borderTopColor: "#29313D",
  },

  navItem: {
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    minWidth: 65,
  },

  activeNavText: {
    color: "#E50914",
    fontSize: 10,
    fontWeight: "700",
  },

  navText: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "500",
  },
});
