import { Ionicons } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import {
    useCallback,
    useEffect,
    useState,
} from "react";
import {
    ActivityIndicator,
    Image,
    Pressable,
    RefreshControl,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { movieService } from "@/shared/services/MovieService";
import type { Movie } from "@/shared/types/movie";

export default function MovieDetailScreen() {
    const params = useLocalSearchParams<{
        id?: string | string[];
    }>();

    const movieId = Array.isArray(params.id)
        ? params.id[0]
        : params.id;

    const [movie, setMovie] = useState<Movie | null>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] =
        useState(false);
    const [error, setError] = useState("");

    const loadMovie = useCallback(async () => {
        if (!movieId) {
            setError("Movie ID is missing");
            setLoading(false);
            return;
        }

        try {
            setError("");

            const data =
                await movieService.getMovieById(movieId);

            setMovie(data);
        } catch (loadError) {
            const message =
                loadError instanceof Error
                    ? loadError.message
                    : "Unable to load movie detail";

            setError(message);
        } finally {
            setLoading(false);
        }
    }, [movieId]);

    const handleRefresh = useCallback(async () => {
        if (!movieId) {
            return;
        }

        try {
            setRefreshing(true);
            setError("");

            const data =
                await movieService.getMovieById(movieId);

            setMovie(data);
        } catch (refreshError) {
            const message =
                refreshError instanceof Error
                    ? refreshError.message
                    : "Unable to refresh movie detail";

            setError(message);
        } finally {
            setRefreshing(false);
        }
    }, [movieId]);

    useEffect(() => {
        loadMovie();
    }, [loadMovie]);

    if (loading) {
        return (
            <SafeAreaView style={styles.loadingScreen}>
                <ActivityIndicator
                    size="large"
                    color="#E50914"
                />

                <Text style={styles.loadingText}>
                    Loading movie detail...
                </Text>
            </SafeAreaView>
        );
    }

    if (error || !movie) {
        return (
            <SafeAreaView style={styles.errorScreen}>
                <Pressable
                    style={styles.topBackButton}
                    onPress={() => router.back()}
                >
                    <Ionicons
                        name="chevron-back"
                        size={25}
                        color="#FFFFFF"
                    />
                </Pressable>

                <View style={styles.errorContent}>
                    <Ionicons
                        name="alert-circle-outline"
                        size={58}
                        color="#E50914"
                    />

                    <Text style={styles.errorTitle}>
                        Unable to load movie
                    </Text>

                    <Text style={styles.errorDescription}>
                        {error || "Movie not found"}
                    </Text>

                    <Pressable
                        style={styles.retryButton}
                        onPress={loadMovie}
                    >
                        <Text style={styles.retryText}>
                            Try again
                        </Text>
                    </Pressable>
                </View>
            </SafeAreaView>
        );
    }

    const formattedReleaseDate = movie.releaseDate
        ? new Date(movie.releaseDate).toLocaleDateString(
            "en-US",
            {
                day: "2-digit",
                month: "short",
                year: "numeric",
            },
        )
        : "Updating";

    const formattedPrice = movie.priceFrom
        ? `${movie.priceFrom.toLocaleString("vi-VN")}đ`
        : "Contact";

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.content}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={handleRefresh}
                        tintColor="#E50914"
                        colors={["#E50914"]}
                        progressBackgroundColor="#111821"
                    />
                }
            >
                <View style={styles.posterSection}>
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
                            <Ionicons
                                name="film-outline"
                                size={62}
                                color="#6B7280"
                            />

                            <Text style={styles.placeholderText}>
                                Poster unavailable
                            </Text>
                        </View>
                    )}

                    <View style={styles.posterOverlay} />

                    <View style={styles.posterTopBar}>
                        <Pressable
                            style={styles.roundButton}
                            onPress={() => router.back()}
                        >
                            <Ionicons
                                name="chevron-back"
                                size={25}
                                color="#FFFFFF"
                            />
                        </Pressable>

                        <Pressable style={styles.roundButton}>
                            <Ionicons
                                name="heart-outline"
                                size={23}
                                color="#FFFFFF"
                            />
                        </Pressable>
                    </View>

                    <View style={styles.posterBottomContent}>
                        <View style={styles.badgeRow}>
                            <View style={styles.statusBadge}>
                                <Text style={styles.statusText}>
                                    {movie.status === "now_showing"
                                        ? "NOW SHOWING"
                                        : "COMING SOON"}
                                </Text>
                            </View>

                            {movie.isFeatured ? (
                                <View style={styles.featuredBadge}>
                                    <Ionicons
                                        name="sparkles"
                                        size={12}
                                        color="#FFD166"
                                    />

                                    <Text style={styles.featuredText}>
                                        FEATURED
                                    </Text>
                                </View>
                            ) : null}
                        </View>

                        <Text style={styles.title}>
                            {movie.title}
                        </Text>

                        <View style={styles.ratingRow}>
                            <Ionicons
                                name="star"
                                size={18}
                                color="#FFD166"
                            />

                            <Text style={styles.ratingValue}>
                                {movie.rating ?? 0}
                            </Text>

                            <Text style={styles.ratingMax}>
                                /10
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.mainContent}>
                    <View style={styles.quickInfoRow}>
                        <QuickInfo
                            icon="time-outline"
                            label="Duration"
                            value={`${movie.duration} min`}
                        />

                        <QuickInfo
                            icon="language-outline"
                            label="Language"
                            value={movie.language || "Updating"}
                        />

                        <QuickInfo
                            icon="calendar-outline"
                            label="Release"
                            value={formattedReleaseDate}
                        />
                    </View>

                    <View style={styles.genreRow}>
                        <View style={styles.genreBadge}>
                            <Ionicons
                                name="pricetag-outline"
                                size={15}
                                color="#FF9E98"
                            />

                            <Text style={styles.genreText}>
                                {movie.genre}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            Synopsis
                        </Text>

                        <Text style={styles.description}>
                            {movie.description}
                        </Text>
                    </View>

                    {movie.director ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Director
                            </Text>

                            <View style={styles.personRow}>
                                <View style={styles.personIcon}>
                                    <Ionicons
                                        name="person-outline"
                                        size={22}
                                        color="#FF9E98"
                                    />
                                </View>

                                <Text style={styles.personName}>
                                    {movie.director}
                                </Text>
                            </View>
                        </View>
                    ) : null}

                    {movie.actors && movie.actors.length > 0 ? (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>
                                Cast
                            </Text>

                            <View style={styles.castContainer}>
                                {movie.actors.map((actor) => (
                                    <View
                                        key={actor}
                                        style={styles.castBadge}
                                    >
                                        <Ionicons
                                            name="person-circle-outline"
                                            size={17}
                                            color="#9CA3AF"
                                        />

                                        <Text style={styles.castText}>
                                            {actor}
                                        </Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    ) : null}

                    {movie.trailer ? (
                        <Pressable style={styles.trailerButton}>
                            <View style={styles.playIcon}>
                                <Ionicons
                                    name="play"
                                    size={20}
                                    color="#FFFFFF"
                                />
                            </View>

                            <View style={styles.trailerContent}>
                                <Text style={styles.trailerTitle}>
                                    Watch Trailer
                                </Text>

                                <Text style={styles.trailerSubtitle}>
                                    Preview this movie
                                </Text>
                            </View>

                            <Ionicons
                                name="open-outline"
                                size={21}
                                color="#9CA3AF"
                            />
                        </Pressable>
                    ) : null}

                    <View style={styles.bookingCard}>
                        <View>
                            <Text style={styles.priceLabel}>
                                Ticket price from
                            </Text>

                            <Text style={styles.priceValue}>
                                {formattedPrice}
                            </Text>
                        </View>

                        <Pressable style={styles.bookButton}>
                            <Ionicons
                                name="ticket-outline"
                                size={20}
                                color="#FFFFFF"
                            />

                            <Text style={styles.bookButtonText}>
                                Book Ticket
                            </Text>
                        </Pressable>
                    </View>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

interface QuickInfoProps {
    icon: keyof typeof Ionicons.glyphMap;
    label: string;
    value: string;
}

function QuickInfo({
    icon,
    label,
    value,
}: QuickInfoProps) {
    return (
        <View style={styles.quickInfoItem}>
            <View style={styles.quickInfoIcon}>
                <Ionicons
                    name={icon}
                    size={20}
                    color="#FF9E98"
                />
            </View>

            <Text style={styles.quickInfoLabel}>
                {label}
            </Text>

            <Text
                style={styles.quickInfoValue}
                numberOfLines={1}
            >
                {value}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: "#090D12",
    },

    content: {
        paddingBottom: 35,
    },

    loadingScreen: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#090D12",
    },

    loadingText: {
        color: "#9CA3AF",
        fontSize: 13,
        marginTop: 12,
    },

    errorScreen: {
        flex: 1,
        backgroundColor: "#090D12",
    },

    topBackButton: {
        width: 44,
        height: 44,
        marginTop: 12,
        marginLeft: 18,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#151D27",
        borderWidth: 1,
        borderColor: "#29313D",
    },

    errorContent: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        paddingHorizontal: 30,
    },

    errorTitle: {
        color: "#FFFFFF",
        fontSize: 20,
        fontWeight: "800",
        marginTop: 16,
    },

    errorDescription: {
        color: "#9CA3AF",
        fontSize: 13,
        lineHeight: 20,
        textAlign: "center",
        marginTop: 8,
    },

    retryButton: {
        backgroundColor: "#E50914",
        borderRadius: 11,
        paddingHorizontal: 23,
        paddingVertical: 12,
        marginTop: 20,
    },

    retryText: {
        color: "#FFFFFF",
        fontWeight: "700",
    },

    posterSection: {
        height: 470,
        backgroundColor: "#151D27",
        position: "relative",
    },

    poster: {
        width: "100%",
        height: "100%",
    },

    posterPlaceholder: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#151D27",
    },

    placeholderText: {
        color: "#6B7280",
        fontSize: 13,
        marginTop: 10,
    },

    posterOverlay: {
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundColor: "rgba(0, 0, 0, 0.28)",
    },

    posterTopBar: {
        position: "absolute",
        left: 18,
        right: 18,
        top: 14,
        flexDirection: "row",
        justifyContent: "space-between",
    },

    roundButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "rgba(9, 13, 18, 0.78)",
        borderWidth: 1,
        borderColor: "rgba(255,255,255,0.15)",
    },

    posterBottomContent: {
        position: "absolute",
        left: 20,
        right: 20,
        bottom: 22,
    },

    badgeRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },

    statusBadge: {
        alignSelf: "flex-start",
        backgroundColor: "#E50914",
        borderRadius: 20,
        paddingHorizontal: 11,
        paddingVertical: 6,
    },

    statusText: {
        color: "#FFFFFF",
        fontSize: 10,
        fontWeight: "900",
    },

    featuredBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 5,
        backgroundColor: "rgba(17, 24, 33, 0.9)",
        borderRadius: 20,
        paddingHorizontal: 10,
        paddingVertical: 6,
    },

    featuredText: {
        color: "#FFD166",
        fontSize: 10,
        fontWeight: "800",
    },

    title: {
        color: "#FFFFFF",
        fontSize: 31,
        lineHeight: 37,
        fontWeight: "900",
        marginTop: 14,
    },

    ratingRow: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 10,
    },

    ratingValue: {
        color: "#FFFFFF",
        fontSize: 17,
        fontWeight: "800",
        marginLeft: 6,
    },

    ratingMax: {
        color: "#9CA3AF",
        fontSize: 12,
        marginLeft: 2,
    },

    mainContent: {
        paddingHorizontal: 18,
        paddingTop: 20,
    },

    quickInfoRow: {
        flexDirection: "row",
        gap: 10,
    },

    quickInfoItem: {
        flex: 1,
        minHeight: 108,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 7,
        borderRadius: 15,
        backgroundColor: "#111821",
        borderWidth: 1,
        borderColor: "#29313D",
    },

    quickInfoIcon: {
        width: 36,
        height: 36,
        borderRadius: 18,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#27181C",
        marginBottom: 7,
    },

    quickInfoLabel: {
        color: "#6B7280",
        fontSize: 10,
    },

    quickInfoValue: {
        color: "#FFFFFF",
        fontSize: 11,
        fontWeight: "700",
        marginTop: 4,
        textAlign: "center",
    },

    genreRow: {
        flexDirection: "row",
        marginTop: 16,
    },

    genreBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 7,
        backgroundColor: "#27181C",
        borderWidth: 1,
        borderColor: "#57353A",
        borderRadius: 20,
        paddingHorizontal: 12,
        paddingVertical: 8,
    },

    genreText: {
        color: "#FF9E98",
        fontSize: 12,
        fontWeight: "700",
    },

    section: {
        marginTop: 26,
    },

    sectionTitle: {
        color: "#FFFFFF",
        fontSize: 19,
        fontWeight: "800",
        marginBottom: 11,
    },

    description: {
        color: "#B3BAC5",
        fontSize: 14,
        lineHeight: 23,
    },

    personRow: {
        flexDirection: "row",
        alignItems: "center",
        padding: 13,
        backgroundColor: "#111821",
        borderRadius: 14,
        borderWidth: 1,
        borderColor: "#29313D",
    },

    personIcon: {
        width: 42,
        height: 42,
        borderRadius: 21,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#27181C",
    },

    personName: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "700",
        marginLeft: 12,
    },

    castContainer: {
        flexDirection: "row",
        flexWrap: "wrap",
        gap: 9,
    },

    castBadge: {
        flexDirection: "row",
        alignItems: "center",
        gap: 6,
        backgroundColor: "#111821",
        borderRadius: 20,
        borderWidth: 1,
        borderColor: "#29313D",
        paddingHorizontal: 11,
        paddingVertical: 8,
    },

    castText: {
        color: "#D1D5DB",
        fontSize: 12,
    },

    trailerButton: {
        minHeight: 72,
        flexDirection: "row",
        alignItems: "center",
        marginTop: 26,
        paddingHorizontal: 14,
        borderRadius: 15,
        backgroundColor: "#111821",
        borderWidth: 1,
        borderColor: "#29313D",
    },

    playIcon: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "#E50914",
    },

    trailerContent: {
        flex: 1,
        marginLeft: 12,
    },

    trailerTitle: {
        color: "#FFFFFF",
        fontSize: 14,
        fontWeight: "800",
    },

    trailerSubtitle: {
        color: "#9CA3AF",
        fontSize: 11,
        marginTop: 4,
    },

    bookingCard: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginTop: 27,
        padding: 17,
        borderRadius: 18,
        backgroundColor: "#201114",
        borderWidth: 1,
        borderColor: "#5E252B",
    },

    priceLabel: {
        color: "#C1A8AA",
        fontSize: 11,
    },

    priceValue: {
        color: "#FFFFFF",
        fontSize: 22,
        fontWeight: "900",
        marginTop: 4,
    },

    bookButton: {
        minHeight: 48,
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
        backgroundColor: "#E50914",
        borderRadius: 12,
        paddingHorizontal: 17,
    },

    bookButtonText: {
        color: "#FFFFFF",
        fontSize: 13,
        fontWeight: "800",
    },
});