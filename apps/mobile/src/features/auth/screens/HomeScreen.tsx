import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import HomeMovieCard from "@/features/auth/components/HomeMovieCard";
import { favouriteService } from "@/shared/services/FavouriteService";
import { movieService } from "@/shared/services/MovieService";
import type { Movie } from "@/shared/types/movie";

type MovieFilter =
  | "all"
  | "now_showing"
  | "coming_soon";

interface StoredUser {
  name?: string;
  username?: string;
  email?: string;
  role?: string;
}

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [filter, setFilter] =
    useState<MovieFilter>("all");
  const [selectedGenre, setSelectedGenre] =
    useState("All");

  const [keyword, setKeyword] = useState("");
  const [userName, setUserName] = useState("Guest");
  const [favouriteIds, setFavouriteIds] = useState<string[]>([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] =
    useState(false);
  const [error, setError] = useState("");

  const loadUser = useCallback(async () => {
    try {
      const storedUser =
        await AsyncStorage.getItem("user");

      if (!storedUser) {
        return;
      }

      const user = JSON.parse(
        storedUser,
      ) as StoredUser;

      setUserName(
        user.name ||
        user.username ||
        user.email ||
        "Guest",
      );
    } catch {
      setUserName("Guest");
    }
  }, []);

  const loadFavourites = useCallback(async () => {
    try {
      const ids = await favouriteService.getFavouriteMovieIds();
      setFavouriteIds(ids);
    } catch {
      setFavouriteIds([]);
    }
  }, []);

  const loadMovies = useCallback(
    async (searchTerm = "") => {
      try {
        setError("");

        const searchKeyword = searchTerm.trim();

        const shouldSearch =
          searchKeyword.length >= 2;

        const data =
          shouldSearch
            ? await movieService.searchMovies(searchKeyword)
            : await movieService.getMovies();

        setMovies(data);
      } catch (loadError) {
        const message =
          loadError instanceof Error
            ? loadError.message
            : "Unable to load movies";

        setError(message);
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const handleRefresh = useCallback(async () => {
    try {
      setRefreshing(true);
      setError("");

      const searchKeyword = keyword.trim();
      const shouldSearch =
        searchKeyword.length >= 2;

      const data = shouldSearch
        ? await movieService.searchMovies(searchKeyword)
        : await movieService.getMovies();

      setMovies(data);
    } catch (refreshError) {
      const message =
        refreshError instanceof Error
          ? refreshError.message
          : "Unable to refresh movies";

      setError(message);
    } finally {
      setRefreshing(false);
    }
  }, [keyword]);

  const toggleFavourite = useCallback(async (movieId: string) => {
    try {
      const next = await favouriteService.toggleFavourite(movieId);
      if (next.isFavourite) {
        setFavouriteIds((prev) => [...prev, movieId]);
      } else {
        setFavouriteIds((prev) => prev.filter((id) => id !== movieId));
      }
    } catch {
      setError("Unable to update favourite list");
    }
  }, []);

  useEffect(() => {
    loadUser();
    loadFavourites();
  }, [loadUser, loadFavourites]);

  useEffect(() => {
    void loadMovies("");
  }, [loadMovies]);


  const filteredMovies = useMemo(() => {
    const normalizedKeyword = keyword
      .trim()
      .toLowerCase();
    const normalizedSelectedGenre =
      selectedGenre.toLowerCase();

    const shouldFilterByKeyword =
      normalizedKeyword.length > 0;

    return movies.filter((movie) => {
      const matchesFilter =
        filter === "all" ||
        movie.status === filter;

      const matchesSearch =
        !shouldFilterByKeyword ||
        movie.title
          ?.toLowerCase()
          .includes(normalizedKeyword);

      const matchesGenre =
        selectedGenre === "All" ||
        String(movie.genre || "")
          .split(/[,&/]/)
          .map((genre) =>
            genre.trim().toLowerCase(),
          )
          .some(
            (genre) =>
              genre === normalizedSelectedGenre,
          );

      return (
        matchesFilter &&
        matchesSearch &&
        matchesGenre
      );
    });
  }, [filter, keyword, movies, selectedGenre]);

  const suggestedMovies = useMemo(() => {
    const normalizedKeyword = keyword
      .trim()
      .toLowerCase();

    if (!normalizedKeyword) {
      return [];
    }

    return movies
      .filter((movie) =>
        movie.title
          ?.toLowerCase()
          .includes(normalizedKeyword),
      )
      .slice(0, 5);
  }, [keyword, movies]);

  const exploreGenres = useMemo(() => {
    const parsedGenres = movies
      .flatMap((movie) =>
        String(movie.genre || "")
          .split(/[,&/]/)
          .map((genre) => genre.trim())
          .filter(Boolean),
      )
      .filter((genre, index, array) => {
        return (
          array.findIndex(
            (item) =>
              item.toLowerCase() ===
              genre.toLowerCase(),
          ) === index
        );
      })
      .slice(0, 10);

    if (parsedGenres.length > 0) {
      return parsedGenres;
    }

    return [
      "Action",
      "Sci-Fi",
      "Drama",
      "Horror",
      "Animation",
      "Comedy",
    ];
  }, [movies]);

  const genreOptions = useMemo(
    () => ["All", ...exploreGenres],
    [exploreGenres],
  );

  const headerComponent = (
    <>
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Welcome back,
            </Text>

            <Text
              style={styles.userName}
              numberOfLines={1}
            >
              {userName}
            </Text>
          </View>

          <Pressable
            style={styles.profileButton}
            onPress={() => {
              // Chưa thêm màn hình profile nên chưa điều hướng.
            }}
          >
            <Ionicons
              name="person-outline"
              size={22}
              color="#FFFFFF"
            />
          </Pressable>
        </View>

        <View style={styles.hero}>
          <View style={styles.heroContent}>
            <Text style={styles.heroLabel}>
              CINE
              <Text style={styles.heroAccent}>
                PREMIUM
              </Text>
            </Text>

            <Text style={styles.heroTitle}>
              Experience movies like never before
            </Text>

            <Text style={styles.heroDescription}>
              Discover the latest blockbusters and
              reserve your perfect seat.
            </Text>
          </View>

          <View style={styles.heroIcon}>
            <Ionicons
              name="film"
              size={39}
              color="#FFFFFF"
            />
          </View>
        </View>

        <View style={styles.searchBox}>
          <Ionicons
            name="search-outline"
            size={20}
            color="#9CA3AF"
          />

          <TextInput
            value={keyword}
            onChangeText={setKeyword}
            placeholder="Search movie title..."
            placeholderTextColor="#6B7280"
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.searchInput}
            returnKeyType="search"
            selectionColor="#E50914"
            blurOnSubmit={false}
            onSubmitEditing={() => {
              const searchKeyword = keyword.trim();
              void loadMovies(searchKeyword);
            }}
          />

          {keyword.length > 0 && (
            <Pressable
              hitSlop={10}
              onPress={() => {
                setKeyword("");
                void loadMovies("");
              }}
            >
              <Ionicons
                name="close-circle"
                size={20}
                color="#9CA3AF"
              />
            </Pressable>
          )}
        </View>

        {keyword.trim().length > 0 &&
          suggestedMovies.length > 0 && (
            <View style={styles.suggestionBox}>
              {suggestedMovies.map((movie) => (
                <Pressable
                  key={movie._id}
                  style={styles.suggestionItem}
                  onPress={() => {
                    setKeyword(movie.title);
                    void loadMovies(movie.title);
                  }}
                >
                  <Ionicons
                    name="film-outline"
                    size={16}
                    color="#9CA3AF"
                  />

                  <Text
                    style={styles.suggestionText}
                    numberOfLines={1}
                  >
                    {movie.title}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

        <View style={styles.tabs}>
          <FilterButton
            title="All Movies"
            active={filter === "all"}
            onPress={() => setFilter("all")}
          />

          <FilterButton
            title="Now Showing"
            active={filter === "now_showing"}
            onPress={() =>
              setFilter("now_showing")
            }
          />

          <FilterButton
            title="Coming Soon"
            active={filter === "coming_soon"}
            onPress={() =>
              setFilter("coming_soon")
            }
          />
        </View>

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>
              Featured Movies
            </Text>

            <Text style={styles.sectionSubtitle}>
              {filteredMovies.length} movie
              {filteredMovies.length === 1 ? "" : "s"}
            </Text>
          </View>

          <Ionicons
            name="sparkles-outline"
            size={22}
            color="#E50914"
          />
        </View>
    </>
  );

  const footerComponent = (
    <View style={styles.genreSection}>
      <View style={styles.genreSectionHeader}>
        <View>
          <Text style={styles.genreSectionTitle}>
            Explore Genres
          </Text>

          <Text style={styles.genreSectionSubtitle}>
            Pick your vibe for tonight
            {selectedGenre !== "All"
              ? ` - ${selectedGenre}`
              : ""}
          </Text>
        </View>

        <Ionicons
          name="grid-outline"
          size={20}
          color="#E50914"
        />
      </View>

      <View style={styles.genreGrid}>
        {genreOptions.map((genre) => (
          <Pressable
            key={genre}
            onPress={() => setSelectedGenre(genre)}
            style={[
              styles.genreChip,
              selectedGenre === genre &&
                styles.genreChipActive,
            ]}
          >
            <Text
              style={[
                styles.genreChipText,
                selectedGenre === genre &&
                  styles.genreChipTextActive,
              ]}
            >
              {genre}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator
          size="large"
          color="#E50914"
        />

        <Text style={styles.loadingText}>
          Loading movies...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <FlatList
        data={filteredMovies}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <HomeMovieCard
            movie={item}
            isFavourite={favouriteIds.includes(item._id)}
            onFavouriteToggle={() => toggleFavourite(item._id)}
          />
        )}
        ListHeaderComponent={headerComponent}
        ListFooterComponent={footerComponent}
        ListEmptyComponent={
          <EmptyMovies
            error={error}
            onRetry={loadMovies}
          />
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
        <Pressable style={styles.navItem}>
          <Ionicons
            name="home"
            size={22}
            color="#E50914"
          />

          <Text style={styles.activeNavText}>
            Home
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/my-ticket")}
        >
          <Ionicons
            name="ticket-outline"
            size={22}
            color="#6B7280"
          />

          <Text style={styles.navText}>
            Bookings
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/favourite")}
        >
          <Ionicons
            name="heart-outline"
            size={22}
            color="#6B7280"
          />

          <Text style={styles.navText}>
            Favourite
          </Text>
        </Pressable>

        <Pressable
          style={styles.navItem}
          onPress={() => router.replace("/profile")}
        >
          <Ionicons
            name="person-outline"
            size={22}
            color="#6B7280"
          />

          <Text style={styles.navText}>
            Profile
          </Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

interface FilterButtonProps {
  title: string;
  active: boolean;
  onPress: () => void;
}

function FilterButton({
  title,
  active,
  onPress,
}: FilterButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.tabButton,
        active && styles.activeTabButton,
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
    </Pressable>
  );
}

interface EmptyMoviesProps {
  error: string;
  onRetry: () => void;
}

function EmptyMovies({
  error,
  onRetry,
}: EmptyMoviesProps) {
  return (
    <View style={styles.emptyContainer}>
      <Ionicons
        name={
          error
            ? "alert-circle-outline"
            : "film-outline"
        }
        size={52}
        color={error ? "#E50914" : "#6B7280"}
      />

      <Text style={styles.emptyTitle}>
        {error
          ? "Unable to load movies"
          : "No movies found"}
      </Text>

      <Text style={styles.emptyDescription}>
        {error ||
          "Try changing the search keyword or filter."}
      </Text>

      {error ? (
        <Pressable
          style={styles.retryButton}
          onPress={onRetry}
        >
          <Text style={styles.retryText}>
            Try again
          </Text>
        </Pressable>
      ) : null}
    </View>
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

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  greeting: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  userName: {
    color: "#FFFFFF",
    fontSize: 22,
    fontWeight: "800",
    marginTop: 3,
    maxWidth: 250,
  },

  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151D27",
    borderWidth: 1,
    borderColor: "#29313D",
  },

  hero: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    padding: 19,
    borderRadius: 20,
    backgroundColor: "#201114",
    borderWidth: 1,
    borderColor: "#5E252B",
    overflow: "hidden",
  },

  heroContent: {
    flex: 1,
  },

  heroLabel: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },

  heroAccent: {
    color: "#E50914",
  },

  heroTitle: {
    color: "#FFFFFF",
    fontSize: 21,
    fontWeight: "800",
    lineHeight: 27,
    marginTop: 9,
  },

  heroDescription: {
    color: "#C1A8AA",
    fontSize: 12,
    lineHeight: 18,
    marginTop: 8,
  },

  heroIcon: {
    width: 74,
    height: 74,
    borderRadius: 37,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#E50914",
    marginLeft: 13,
  },

  searchBox: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 22,
    paddingHorizontal: 15,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#29313D",
    backgroundColor: "#151D27",
  },

  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 14,
  },

  suggestionBox: {
    marginTop: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#29313D",
    backgroundColor: "#111821",
    overflow: "hidden",
  },

  suggestionItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    minHeight: 42,
    paddingHorizontal: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#1D2733",
  },

  suggestionText: {
    flex: 1,
    color: "#E5E7EB",
    fontSize: 13,
  },

  tabs: {
    flexDirection: "row",
    gap: 8,
    marginTop: 18,
  },

  tabButton: {
    flex: 1,
    minHeight: 42,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 6,
    borderRadius: 13,
    borderWidth: 1,
    borderColor: "#29313D",
    backgroundColor: "#151D27",
  },

  activeTabButton: {
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
    marginTop: 25,
    marginBottom: 14,
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  sectionSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 3,
  },

  genreSection: {
    marginTop: 8,
    marginBottom: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#29313D",
    backgroundColor: "#111821",
  },

  genreSectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 12,
  },

  genreSectionTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },

  genreSectionSubtitle: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },

  genreGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  genreChip: {
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#39485A",
    backgroundColor: "#151D27",
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  genreChipActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },

  genreChipText: {
    color: "#E5E7EB",
    fontSize: 12,
    fontWeight: "700",
  },

  genreChipTextActive: {
    color: "#FFFFFF",
  },

  emptyContainer: {
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 28,
  },

  emptyTitle: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    marginTop: 14,
  },

  emptyDescription: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 8,
  },

  retryButton: {
    marginTop: 18,
    paddingHorizontal: 22,
    paddingVertical: 11,
    borderRadius: 11,
    backgroundColor: "#E50914",
  },

  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
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
    fontWeight: "600",
  },
});
