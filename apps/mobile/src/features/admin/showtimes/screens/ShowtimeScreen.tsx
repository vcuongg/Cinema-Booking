import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  StatusBar,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";
import {
  getManageShowtimes,
  deleteShowtime,
} from "@/shared/services/ShowtimeService";
import { ManageShowtime } from "@/shared/types/showtime";
import { useRouter, useNavigation } from "expo-router";

// ===== Bảng màu =====
const COLORS = {
  gray: "#9CA3AF",
  black: "#000000",
  darkGray: "#1F1F1F",
  red: "#E50914",
  white: "#FFFFFF",
};

export default function ManageShowtimeScreen() {
  const router = useRouter();
  const navigation = useNavigation();
  const [movies, setMovies] = useState<ManageShowtime[]>([]);
  const [loading, setLoading] = useState(true);

  const loadShowtimes = async () => {
    try {
      setLoading(true);

      const data = await getManageShowtimes();
      setMovies(data);
    } catch (err) {
      console.log(err);
      Alert.alert("Error", "Cannot load showtimes");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadShowtimes();
    });

    // Cleanup listener khi component unmount
    return unsubscribe;
  }, [navigation]);
  const handleGoBack = () => {
    router.back();
  };

  const handleAddShowtime = (movieId: string) => {
    router.push({
      pathname: "/admin/CreateShowtime",
      params: {
        movieId,
      },
    });
  };

  const handleEditShowtime = (showtimeId: string) => {
    router.push({
      pathname: "/admin/UpdateShowtime",
      params: {
        showtimeId,
      },
    });
  };

  const handleDeleteShowtime = (showtimeId: string) => {
    Alert.alert(
      "Delete Showtime",
      "Are you sure you want to delete this showtime?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteShowtime(showtimeId);

              await loadShowtimes();
            } catch (err) {
              console.log(err);

              Alert.alert("Error", "Delete showtime failed");
            }
          },
        },
      ],
    );
  };
  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.black} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.headerIconBtn} onPress={handleGoBack}>
            <Ionicons name="arrow-back" size={24} color={COLORS.white} />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>Manage Showtimes</Text>

          <View style={styles.headerRightIcons}>
            <TouchableOpacity style={styles.headerIconBtn}>
              <Ionicons name="search" size={22} color={COLORS.white} />
            </TouchableOpacity>

            <View style={styles.avatar}>
              <Ionicons name="person" size={16} color={COLORS.gray} />
            </View>
          </View>
        </View>

        {loading && (
          <Text
            style={{
              color: COLORS.white,
              textAlign: "center",
              marginTop: 30,
            }}
          >
            Loading...
          </Text>
        )}

        {!loading &&
          movies.map((movieItem) => {
            // ===== Group showtime theo cinema =====

            const cinemaGroups: { [key: string]: any } = {};

            movieItem.showtimes.forEach((showtime: any) => {
              const cinema = showtime.roomId.cinemaId;

              const cinemaId = cinema._id;

              if (!cinemaGroups[cinemaId]) {
                cinemaGroups[cinemaId] = {
                  cinema,
                  showtimes: [],
                };
              }

              cinemaGroups[cinemaId].showtimes.push(showtime);
            });

            return (
              <View
                key={movieItem.movie._id}
                style={{
                  marginBottom: 30,
                }}
              >
                {/* Movie Card */}

                <View style={styles.movieCard}>
                  <Image
                    source={{
                      uri: movieItem.movie.posterUrl,
                    }}
                    style={styles.moviePoster}
                  />

                  <View style={styles.movieInfo}>
                    <Text style={styles.movieTitle}>
                      {movieItem.movie.title}
                    </Text>

                    <Text style={styles.movieMeta}>
                      {movieItem.movie.genre.join(", ")} •{" "}
                      {movieItem.movie.duration} mins
                    </Text>

                    <View style={styles.ratingRow}>
                      <Ionicons name="star" size={14} color={COLORS.red} />

                      <Text style={styles.ratingText}>
                        {movieItem.movie.rating}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Button */}

                <TouchableOpacity
                  style={styles.addButton}
                  activeOpacity={0.9}
                  onPress={() => handleAddShowtime(movieItem.movie._id)}
                >
                  <Ionicons
                    name="add-circle-outline"
                    size={20}
                    color={COLORS.white}
                    style={{
                      marginRight: 8,
                    }}
                  />

                  <Text style={styles.addButtonText}>Add New Showtime</Text>
                </TouchableOpacity>

                {/* Cinema */}

                {Object.values(cinemaGroups).map((cinemaGroup: any) => (
                  <View
                    key={cinemaGroup.cinema._id}
                    style={styles.cinemaSection}
                  >
                    <View style={styles.cinemaHeader}>
                      <MaterialCommunityIcons
                        name="star-four-points-outline"
                        size={16}
                        color={COLORS.red}
                      />

                      <Text style={styles.cinemaName}>
                        {cinemaGroup.cinema.cinemaName}
                      </Text>
                    </View>

                    {cinemaGroup.showtimes.map((show: any) => (
                      <View key={show._id} style={styles.showtimeRow}>
                        {/* Time */}

                        <View style={styles.timeBlock}>
                          <Text style={styles.timeText}>{show.startTime}</Text>

                          <Text style={styles.formatText}>{show.endTime}</Text>
                        </View>

                        {/* Room */}

                        <View style={styles.hallBlock}>
                          <Text style={styles.hallText}>
                            {show.roomId.roomName}
                          </Text>

                          <Text style={styles.statusText}>
                            {new Date(show.showDate).toLocaleDateString()}
                          </Text>

                          <Text
                            style={[
                              styles.statusText,
                              {
                                marginTop: 2,
                              },
                            ]}
                          >
                            ${show.price}
                          </Text>
                        </View>

                        {/* Action */}

                        <View style={styles.actionButtons}>
                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => handleEditShowtime(show._id)}
                          >
                            <Feather
                              name="edit-2"
                              size={16}
                              color={COLORS.red}
                            />
                          </TouchableOpacity>

                          <TouchableOpacity
                            style={styles.iconBtn}
                            onPress={() => handleDeleteShowtime(show._id)}
                          >
                            <Feather
                              name="trash-2"
                              size={16}
                              color={COLORS.red}
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            );
          })}
      </ScrollView>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  centerBox: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  errorText: {
    color: COLORS.gray,
    fontSize: 14,
    textAlign: "center",
    marginBottom: 14,
  },
  retryBtn: {
    backgroundColor: COLORS.red,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryText: {
    color: COLORS.white,
    fontWeight: "700",
  },
  emptyText: {
    color: COLORS.gray,
    fontSize: 13,
    textAlign: "center",
    marginTop: 20,
  },

  // Header
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  headerIconBtn: {
    padding: 4,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: "700",
  },
  headerRightIcons: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: COLORS.darkGray,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
  },

  // Movie Card
  movieCard: {
    flexDirection: "row",
    backgroundColor: COLORS.darkGray,
    borderRadius: 14,
    padding: 12,
    marginTop: 6,
    marginBottom: 18,
  },
  moviePoster: {
    width: 70,
    height: 96,
    borderRadius: 10,
    backgroundColor: COLORS.black,
  },
  movieInfo: {
    flex: 1,
    marginLeft: 14,
    justifyContent: "center",
  },
  movieTitle: {
    color: COLORS.red,
    fontSize: 17,
    fontWeight: "700",
    marginBottom: 6,
  },
  movieMeta: {
    color: COLORS.gray,
    fontSize: 13,
    marginBottom: 8,
  },
  ratingRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  ratingText: {
    color: COLORS.white,
    fontSize: 13,
    marginLeft: 4,
    fontWeight: "600",
  },

  // Add Button
  addButton: {
    flexDirection: "row",
    backgroundColor: COLORS.red,
    borderRadius: 12,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 22,
  },
  addButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },

  // Cinema Section
  cinemaSection: {
    marginBottom: 18,
  },
  cinemaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  cinemaName: {
    color: COLORS.gray,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginLeft: 6,
  },

  // Showtime Row
  showtimeRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: COLORS.darkGray,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
  },
  timeBlock: {
    width: 78,
  },
  timeText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
  },
  formatText: {
    color: COLORS.red,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 2,
  },
  hallBlock: {
    flex: 1,
  },
  hallText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: "600",
  },
  statusText: {
    color: COLORS.gray,
    fontSize: 12,
    marginTop: 3,
  },
  statusSoldOut: {
    color: COLORS.red,
  },
  actionButtons: {
    flexDirection: "row",
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "rgba(229,9,20,0.12)",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
  },
});
