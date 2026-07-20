import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import PosterPicker from "./component/PosterPicker";
import FormField from "./component/FormField";
import AttributePicker from "./component/AttributePicker";
import { getMovieById, updateMovie } from "@/shared/services/MovieService";

const GENRE_OPTIONS = [
  "Action",
  "Comedy",
  "Drama",
  "Horror",
  "Sci-Fi",
  "Romance",
  "Animation",
  "Thriller",
  "Adventure",
  "Fantasy",
];

const STATUS_OPTIONS: {
  value: "now_showing" | "coming_soon";
  label: string;
}[] = [
  { value: "coming_soon", label: "Coming Soon" },
  { value: "now_showing", label: "Now Showing" },
];

// Converts a "dd/mm/yyyy" input into an ISO date string the backend can parse.
function parseReleaseDate(value: string): string | null {
  const match = value.trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const [, day, month, year] = match;
  const iso = `${year}-${month}-${day}`;
  const date = new Date(iso);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return iso;
}

// Converts an ISO date string coming from the backend into "dd/mm/yyyy" for the input.
function formatReleaseDate(value?: string): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}

type Props = {
  movieId: string;
};

export default function MovieUpdateScreen({ movieId }: Props) {
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<string[]>([]);
  const [duration, setDuration] = useState("");
  const [releaseDate, setReleaseDate] = useState("");
  const [description, setDescription] = useState("");
  const [director, setDirector] = useState("");
  const [actors, setActors] = useState("");
  const [posterUrl, setPosterUrl] = useState("");
  const [trailerUrl, setTrailerUrl] = useState("");
  const [rating, setRating] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [status, setStatus] =
    useState<"now_showing" | "coming_soon">("coming_soon");
  const [isFeatured, setIsFeatured] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadMovie = async () => {
      setLoading(true);
      setLoadError("");

      try {
        const movie = await getMovieById(movieId);

        if (!isMounted) {
          return;
        }

        setTitle(movie.title ?? "");
        setGenre(movie.genre ?? []);
        setDuration(
          movie.duration !== undefined ? String(movie.duration) : "",
        );
        setReleaseDate(formatReleaseDate(movie.releaseDate));
        setDescription(movie.description ?? "");
        setDirector(movie.director ?? "");
        setActors((movie.actors ?? []).join(", "));
        setPosterUrl(movie.posterUrl ?? movie.poster ?? "");
        setTrailerUrl(movie.trailerUrl ?? movie.trailer ?? "");
        setRating(
          movie.rating !== undefined ? String(movie.rating) : "",
        );
        setPriceFrom(
          movie.priceFrom !== undefined ? String(movie.priceFrom) : "",
        );
        setStatus(movie.status ?? "coming_soon");
        setIsFeatured(Boolean(movie.isFeatured));
      } catch (error) {
        if (!isMounted) {
          return;
        }

        const message =
          error instanceof Error ? error.message : "Failed to load movie";

        setLoadError(message);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadMovie();

    return () => {
      isMounted = false;
    };
  }, [movieId]);

  const handleUpdate = async () => {
    if (
      !title.trim() ||
      !description.trim() ||
      genre.length === 0 ||
      !duration.trim() ||
      !releaseDate.trim()
    ) {
      Alert.alert(
        "Missing information",
        "Title, description, genre, duration and release date are required.",
      );
      return;
    }

    const durationValue = Number(duration.trim());

    if (Number.isNaN(durationValue) || durationValue <= 0) {
      Alert.alert("Invalid duration", "Duration must be a positive number.");
      return;
    }

    const isoReleaseDate = parseReleaseDate(releaseDate);

    if (!isoReleaseDate) {
      Alert.alert(
        "Invalid release date",
        "Release date must be in dd/mm/yyyy format.",
      );
      return;
    }

    const ratingValue = rating.trim() ? Number(rating.trim()) : undefined;

    if (
      ratingValue !== undefined &&
      (Number.isNaN(ratingValue) || ratingValue < 0 || ratingValue > 10)
    ) {
      Alert.alert("Invalid rating", "Rating must be a number between 0 and 10.");
      return;
    }

    const priceFromValue = priceFrom.trim()
      ? Number(priceFrom.trim())
      : undefined;

    if (
      priceFromValue !== undefined &&
      (Number.isNaN(priceFromValue) || priceFromValue < 0)
    ) {
      Alert.alert("Invalid price", "Price from must be a positive number.");
      return;
    }

    setSubmitting(true);

    try {
      await updateMovie(movieId, {
        title: title.trim(),
        description: description.trim(),
        genre,
        duration: durationValue,
        releaseDate: isoReleaseDate,
        director: director.trim() || undefined,
        actors: actors
          .split(",")
          .map((actor) => actor.trim())
          .filter(Boolean),
        posterUrl: posterUrl.trim() || undefined,
        trailerUrl: trailerUrl.trim() || undefined,
        status,
        rating: ratingValue,
        priceFrom: priceFromValue,
        isFeatured,
      });

      Alert.alert("Success", "Movie updated successfully.", [
        { text: "OK", onPress: () => router.replace("/admin/DashBoardAdmin") },
      ]);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to update movie";

      Alert.alert("Update movie failed", message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#E50914" />
        <Text style={styles.loadingText}>Loading movie...</Text>
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <Text style={styles.errorText}>{loadError}</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/admin/DashBoardAdmin")}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace("/admin/DashBoardAdmin")}>
          <Ionicons name="arrow-back" size={22} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.title}>Update Movie</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.body}>
        {/* Poster */}
        {/* <PosterPicker /> */}

        {/* Movie Title */}
        <FormField
          label="Movie Title"
          placeholder="Enter movie title"
          value={title}
          onChangeText={setTitle}
        />

        {/* Genre */}
        <AttributePicker
          label="Genre"
          options={GENRE_OPTIONS}
          selected={genre}
          onChange={setGenre}
        />

        {/* Duration + Release Date in one row */}
        <View style={styles.row}>
          <FormField
            label="Duration"
            placeholder="120 min"
            value={duration}
            onChangeText={setDuration}
            keyboardType="numeric"
            flex={1}
          />
          <View style={styles.rowGap} />
          <FormField
            label="Release Date"
            placeholder="dd/mm/yyyy"
            value={releaseDate}
            onChangeText={setReleaseDate}
            flex={1}
          />
        </View>

        {/* Description */}
        <FormField
          label="Description"
          placeholder="Enter movie description..."
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Director + Actors */}
        <FormField
          label="Director"
          placeholder="Enter director name"
          value={director}
          onChangeText={setDirector}
        />

        <FormField
          label="Actors"
          placeholder="Comma separated, e.g. Tom Hanks, Emma Watson"
          value={actors}
          onChangeText={setActors}
        />

        {/* Poster / Trailer URL */}
        <FormField
          label="Poster URL"
          placeholder="https://..."
          value={posterUrl}
          onChangeText={setPosterUrl}
        />

        <FormField
          label="Trailer URL"
          placeholder="https://..."
          value={trailerUrl}
          onChangeText={setTrailerUrl}
        />

        {/* Rating + Price From */}
        <View style={styles.row}>
          <FormField
            label="Rating (0-10)"
            placeholder="8.5"
            value={rating}
            onChangeText={setRating}
            keyboardType="numeric"
            flex={1}
          />
          <View style={styles.rowGap} />
          <FormField
            label="Price From"
            placeholder="75000"
            value={priceFrom}
            onChangeText={setPriceFrom}
            keyboardType="numeric"
            flex={1}
          />
        </View>

        {/* Status */}
        <View style={styles.statusSection}>
          <Text style={styles.statusLabel}>STATUS</Text>
          <View style={styles.statusRow}>
            {STATUS_OPTIONS.map((option) => {
              const active = status === option.value;
              return (
                <TouchableOpacity
                  key={option.value}
                  style={[styles.statusTag, active && styles.statusTagActive]}
                  onPress={() => setStatus(option.value)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.statusTagText,
                      active && styles.statusTagTextActive,
                    ]}
                  >
                    {option.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Featured toggle */}
        <View style={styles.featuredRow}>
          <Text style={styles.statusLabel}>FEATURED MOVIE</Text>
          <Switch
            value={isFeatured}
            onValueChange={setIsFeatured}
            trackColor={{ false: "#222A36", true: "#E50914" }}
            thumbColor="#fff"
          />
        </View>

        {/* Action Buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.cancelBtn}
            onPress={() => router.replace("/admin/DashBoardAdmin")}
            disabled={submitting}
          >
            <Text style={styles.cancelText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.createBtn, submitting && styles.createBtnDisabled]}
            onPress={handleUpdate}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createText}>Save Changes</Text>
            )}
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
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#8F98A8",
    fontSize: 14,
    marginTop: 12,
  },
  errorText: {
    color: "#E50914",
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 16,
    textAlign: "center",
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
  statusSection: {
    marginBottom: 20,
  },
  statusLabel: {
    color: "#8F98A8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  statusRow: {
    flexDirection: "row",
    gap: 10,
  },
  statusTag: {
    backgroundColor: "#1A2333",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#222A36",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  statusTagActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  statusTagText: {
    color: "#8F98A8",
    fontSize: 14,
    fontWeight: "500",
  },
  statusTagTextActive: {
    color: "#fff",
  },
  featuredRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
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
  createBtnDisabled: {
    opacity: 0.6,
  },
  createText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },
});
