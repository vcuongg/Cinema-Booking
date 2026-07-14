import { MaterialIcons } from "@expo/vector-icons";
import FontAwesome from "@expo/vector-icons/FontAwesome";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getMovies } from "@/shared/services/MovieService";
import type { Movie } from "@/shared/types/movie";

import MovieCard from "./component/MovieCard";

type MovieTab = "all" | "now_showing" | "coming_soon";

export default function MovieManagementScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [keyword, setKeyword] = useState("");
  const [activeTab, setActiveTab] =
    useState<MovieTab>("all");

  const loadMovies = async () => {
    setLoading(true);
    setError("");

    try {
      const data = await getMovies();
      setMovies(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load movies";

      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setError("");

    try {
      const data = await getMovies();
      setMovies(data);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Failed to refresh movies";

      setError(message);
    } finally {
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadMovies();
  }, []);

  const filteredMovies = useMemo(() => {
    const normalizedKeyword = keyword.trim().toLowerCase();

    return movies.filter((movie) => {
      const matchesTab =
        activeTab === "all" ||
        movie.status === activeTab;

      const matchesKeyword =
        !normalizedKeyword ||
        movie.title
          .toLowerCase()
          .includes(normalizedKeyword) ||
        movie.genre
          .toLowerCase()
          .includes(normalizedKeyword) ||
        movie.director
          ?.toLowerCase()
          .includes(normalizedKeyword);

      return matchesTab && matchesKeyword;
    });
  }, [movies, keyword, activeTab]);

  const renderEmptyContent = () => {
    if (loading) {
      return (
        <View style={styles.stateContainer}>
          <ActivityIndicator
            size="large"
            color="#E50914"
          />
          <Text style={styles.stateText}>
            Loading movies...
          </Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.stateContainer}>
          <MaterialIcons
            name="error-outline"
            size={44}
            color="#E50914"
          />

          <Text style={styles.errorText}>{error}</Text>

          <TouchableOpacity
            style={styles.retryButton}
            onPress={loadMovies}
          >
            <Text style={styles.retryButtonText}>
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.stateContainer}>
        <MaterialIcons
          name="local-movies"
          size={48}
          color="#667085"
        />

        <Text style={styles.stateTitle}>
          No movies found
        </Text>

        <Text style={styles.stateText}>
          Try another keyword or movie category.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <View>
            <Text style={styles.admin}>Admin Panel</Text>
            <Text style={styles.city}>
              Cinema management
            </Text>
          </View>

          <TouchableOpacity style={styles.profileButton}>
            <FontAwesome
              name="user-circle"
              size={25}
              color="#FF9E98"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.searchBox}>
          <MaterialIcons
            name="search"
            color="#9CA3AF"
            size={21}
          />

          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Search movies, genres..."
            placeholderTextColor="#667085"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.input}
          />

          {keyword.length > 0 && (
            <TouchableOpacity
              onPress={() => setKeyword("")}
              hitSlop={10}
            >
              <MaterialIcons
                name="close"
                color="#9CA3AF"
                size={20}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.tabs}>
          <TabButton
            title="All Movies"
            active={activeTab === "all"}
            onPress={() => setActiveTab("all")}
          />

          <TabButton
            title="Now Showing"
            active={activeTab === "now_showing"}
            onPress={() =>
              setActiveTab("now_showing")
            }
          />

          <TabButton
            title="Coming Soon"
            active={activeTab === "coming_soon"}
            onPress={() =>
              setActiveTab("coming_soon")
            }
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Movie Library
            </Text>

            <Text style={styles.movieCount}>
              {filteredMovies.length} movie
              {filteredMovies.length === 1 ? "" : "s"}
            </Text>
          </View>

          <TouchableOpacity style={styles.addButton}>
            <MaterialIcons
              name="add"
              size={20}
              color="#FFFFFF"
            />

            <Text style={styles.addButtonText}>
              Add Movie
            </Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={filteredMovies}
          keyExtractor={(item) => item._id}
          renderItem={({ item }) => (
            <MovieCard movie={item} />
          )}
          contentContainerStyle={[
            styles.listContent,
            filteredMovies.length === 0 &&
              styles.emptyListContent,
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyContent}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#E50914"
              colors={["#E50914"]}
              progressBackgroundColor="#1A2333"
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

interface TabButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

function TabButton({
  title,
  active,
  onPress,
}: TabButtonProps) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.tab,
        active && styles.activeTab,
      ]}
    >
      <Text
        style={[
          styles.tabText,
          active && styles.activeTabText,
        ]}
      >
        {title}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#0B0F14",
  },

  container: {
    flex: 1,
    backgroundColor: "#0B0F14",
    paddingHorizontal: 18,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 14,
  },

  admin: {
    color: "#E50914",
    fontSize: 24,
    fontWeight: "800",
  },

  city: {
    color: "#9CA3AF",
    marginTop: 3,
    fontSize: 13,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#18212C",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#29313D",
  },

  searchBox: {
    minHeight: 52,
    marginTop: 24,
    backgroundColor: "#151D27",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#29313D",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    marginLeft: 10,
    fontSize: 15,
  },

  tabs: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 22,
    gap: 8,
  },

  tab: {
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#18212C",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#29313D",
    paddingHorizontal: 8,
  },

  activeTab: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },

  tabText: {
    color: "#9CA3AF",
    fontSize: 11,
    fontWeight: "600",
    textAlign: "center",
  },

  activeTabText: {
    color: "#FFFFFF",
    fontWeight: "800",
  },

  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 19,
    fontWeight: "800",
  },

  movieCount: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 3,
  },

  addButton: {
    minHeight: 42,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    borderRadius: 12,
    backgroundColor: "#E50914",
  },

  addButtonText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "700",
  },

  listContent: {
    paddingBottom: 30,
    gap: 13,
  },

  emptyListContent: {
    flexGrow: 1,
  },

  stateContainer: {
    flex: 1,
    minHeight: 300,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 30,
  },

  stateTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },

  stateText: {
    color: "#9CA3AF",
    marginTop: 9,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 20,
  },

  errorText: {
    color: "#FF9E98",
    marginTop: 12,
    fontSize: 14,
    textAlign: "center",
    lineHeight: 21,
  },

  retryButton: {
    marginTop: 18,
    minHeight: 42,
    justifyContent: "center",
    paddingHorizontal: 22,
    borderRadius: 11,
    backgroundColor: "#E50914",
  },

  retryButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
});