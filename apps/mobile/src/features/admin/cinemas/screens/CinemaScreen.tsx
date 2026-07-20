import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StatusBar,
  Platform,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { RefreshControl } from "react-native";
import { Cinema } from "@/shared/types/cinema";
import {
  deleteCinema,
  getCinemas,
  searchCinemas,
} from "@/shared/services/CinemaService";
import { useRouter, useNavigation } from "expo-router";
import { Ionicons, MaterialCommunityIcons, Feather } from "@expo/vector-icons";

const STATUS_COLORS = {
  Active: { bg: "rgba(46, 204, 113, 0.15)", text: "#2ECC71", dot: "#2ECC71" },
  Maintenance: {
    bg: "rgba(243, 156, 18, 0.15)",
    text: "#F39C12",
    dot: "#F39C12",
  },
  Inactive: { bg: "rgba(150,150,150,0.15)", text: "#999", dot: "#999" },
};

function StatusBadge({ status }: { status: "Active" | "Inactive" }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.Inactive;

  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <View style={[styles.badgeDot, { backgroundColor: c.dot }]} />
      <Text style={[styles.badgeText, { color: c.text }]}>{status}</Text>
    </View>
  );
}

function CinemaCard({
  cinema,
  onEdit,
  onDelete,
  onPress,
}: {
  cinema: Cinema;
  onEdit: (cinema: Cinema) => void;
  onDelete: (cinema: Cinema) => void;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.card}>
      <View style={styles.cardImageWrap}>
        <Image
          source={{
            uri: cinema.coverPhoto?.trim()
              ? cinema.coverPhoto
              : "https://via.placeholder.com/600x400?text=Cinema",
          }}
          style={styles.cardImage}
        />

        <View style={styles.cardImageOverlay} />

        <View style={styles.badgeWrap}>
          <StatusBadge status={cinema.isActive ? "Active" : "Inactive"} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <Text style={styles.cardTitle}>{cinema.cinemaName}</Text>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={13} color="#8A8A8E" />

          <Text style={styles.cardLocation}>
            {cinema.address}, {cinema.city}
          </Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>HALLS</Text>

            <Text style={styles.statValue}>{cinema.totalHalls}</Text>
          </View>

          <View style={styles.statBlock}>
            <Text style={styles.statLabel}>CAPACITY</Text>

            <Text style={styles.statValue}>{cinema.totalCapacity}</Text>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={() => onEdit(cinema)}
            >
              <Feather name="edit-2" size={15} color="#E5E5E7" />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.iconBtn, styles.iconBtnDanger]}
              onPress={() => onDelete(cinema)}
            >
              <Feather name="trash-2" size={15} color="#E74C3C" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

export default function ManageCinemaScreen() {
  const router = useRouter();

  const navigation = useNavigation();

  const [cinemas, setCinemas] = useState<Cinema[]>([]);

  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState("theaters");

  const [refreshing, setRefreshing] = useState(false);

  const [searchText, setSearchText] = useState("");

  const onRefresh = async () => {
    try {
      setRefreshing(true);

      await loadCinemas();
    } finally {
      setRefreshing(false);
    }
  };

  const loadCinemas = async () => {
    try {
      setLoading(true);

      const data = await getCinemas();

      setCinemas(data);
    } catch (error) {
      console.error(error);

      Alert.alert("Error", "Failed to load cinemas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsubscribe = navigation.addListener("focus", () => {
      loadCinemas();
    });

    // Cleanup listener khi component unmount
    return unsubscribe;
  }, [navigation]);
  const handleGoBack = () => {
    router.back();
  };
  const handleGoBackDashboard = () => {
    router.replace("/admin/DashBoardAdmin");
  };

  const handleAddCinema = () => {
    router.push("/admin/CreateCinema");
  };

  const handleSearch = async (text: string) => {
    setSearchText(text);

    try {
      if (text.trim() === "") {
        await loadCinemas();
        return;
      }

      const result = await searchCinemas(text.trim());

      setCinemas(result);
    } catch (error) {
      console.error(error);

      Alert.alert("Error", "Failed to search cinemas.");
    }
  };

  useEffect(() => {
    const timer = setTimeout(async () => {
      try {
        if (searchText.trim() === "") {
          await loadCinemas();
        } else {
          const result = await searchCinemas(searchText.trim());
          setCinemas(result);
        }
      } catch (error) {
        console.error(error);
      }
    }, 400);

    return () => clearTimeout(timer);
  }, [searchText]);
  const handleEdit = (cinema: Cinema) => {
    router.push({
      pathname: "/admin/UpdateCinema",
      params: {
        id: cinema._id,
      },
    });
  };

  const handleDelete = async (cinema: Cinema) => {
    // ===== WEB =====
    if (Platform.OS === "web") {
      const confirmed = window.confirm(
        `Are you sure you want to delete "${cinema.cinemaName}"?`,
      );

      if (!confirmed) return;

      try {
        await deleteCinema(cinema._id);

        await loadCinemas();

        window.alert("Cinema deleted successfully.");
      } catch (error) {
        console.error(error);

        window.alert("Failed to delete cinema.");
      }

      return;
    }

    // ===== MOBILE =====
    Alert.alert(
      "Delete Cinema",
      `Are you sure you want to delete "${cinema.cinemaName}"?`,
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
              await deleteCinema(cinema._id);

              await loadCinemas();

              Alert.alert("Success", "Cinema deleted successfully.");
            } catch (error) {
              console.error(error);

              Alert.alert("Error", "Failed to delete cinema.");
            }
          },
        },
      ],
    );
  };

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0A0A0C",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 16,
          }}
        >
          Loading cinemas...
        </Text>
      </View>
    );
  }
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0A0A0C" />

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBackDashboard}
          style={styles.headerIconBtn}
        >
          <Ionicons name="chevron-back" size={22} color="#E74C3C" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Manage Cinemas</Text>

        <View style={styles.headerIconBtn} />
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#E74C3C"
          />
        }
      >
        <Text style={styles.pageTitle}>INVENTORY</Text>
        <Text style={styles.pageSubtitle}>
          Oversee and configure your theater network
        </Text>

        <View style={styles.searchContainer}>
          <Ionicons
            name="search"
            size={18}
            color="#8A8A8E"
            style={styles.searchIcon}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Search by cinema, address or city..."
            placeholderTextColor="#777"
            value={searchText}
            onChangeText={setSearchText}
          />

          {searchText.length > 0 && (
            <TouchableOpacity onPress={() => setSearchText("")}>
              <Ionicons name="close-circle" size={20} color="#777" />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={styles.addButton}
          activeOpacity={0.85}
          onPress={handleAddCinema}
        >
          <Ionicons name="add-circle-outline" size={20} color="#fff" />
          <Text style={styles.addButtonText}>Add New Cinema</Text>
        </TouchableOpacity>

        {cinemas.length === 0 ? (
          <View
            style={{
              marginTop: 60,
              alignItems: "center",
            }}
          >
            <MaterialCommunityIcons
              name="movie-open-outline"
              size={70}
              color="#555"
            />

            <Text
              style={{
                color: "#999",
                fontSize: 17,
                fontWeight: "600",
                marginTop: 15,
              }}
            >
              No cinemas found
            </Text>

            <Text
              style={{
                color: "#777",
                marginTop: 6,
                textAlign: "center",
              }}
            >
              Tap "Add New Cinema" to create one.
            </Text>
          </View>
        ) : (
          cinemas.map((cinema) => (
            <CinemaCard
              key={cinema._id}
              cinema={cinema}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onPress={() => console.log("clicked")}
            />
          ))
        )}
      </ScrollView>

      {/* Floating add button */}
      <TouchableOpacity
        style={styles.fab}
        activeOpacity={0.85}
        onPress={handleAddCinema}
      >
        <Ionicons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const RED = "#E74C3C";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0A0C",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "ios" ? 54 : 24,
    paddingBottom: 14,
  },
  headerIconBtn: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scroll: {
    flex: 1,
    paddingHorizontal: 18,
  },
  pageTitle: {
    color: RED,
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: 1,
    marginTop: 6,
  },
  pageSubtitle: {
    color: "#9A9AA0",
    fontSize: 13,
    marginTop: 4,
    marginBottom: 18,
  },
  addButton: {
    backgroundColor: RED,
    borderRadius: 14,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    marginBottom: 22,
    shadowColor: RED,
    shadowOpacity: 0.4,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  card: {
    backgroundColor: "#131316",
    borderRadius: 18,
    marginBottom: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#1E1E22",
  },
  cardImageWrap: {
    width: "100%",
    height: 140,
    position: "relative",
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardImageOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: "rgba(10,10,12,0.15)",
  },
  badgeWrap: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "700",
  },
  cardBody: {
    padding: 14,
  },
  cardTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 12,
  },
  cardLocation: {
    color: "#8A8A8E",
    fontSize: 12,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  statBlock: {
    marginRight: 26,
  },
  statLabel: {
    color: "#6B6B70",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  statValue: {
    color: "#E5E5E7",
    fontSize: 13,
    fontWeight: "600",
  },
  actionsRow: {
    flexDirection: "row",
    marginLeft: "auto",
    gap: 8,
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#1E1E22",
    alignItems: "center",
    justifyContent: "center",
  },
  iconBtnDanger: {
    backgroundColor: "rgba(231,76,60,0.12)",
  },
  fab: {
    position: "absolute",
    right: 20,
    bottom: 92,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: RED,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: RED,
    shadowOpacity: 0.5,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  bottomNav: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: "row",
    backgroundColor: "#0F0F12",
    borderTopWidth: 1,
    borderTopColor: "#1E1E22",
    paddingTop: 10,
    paddingBottom: Platform.OS === "ios" ? 26 : 14,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    gap: 3,
  },
  navLabel: {
    fontSize: 11,
    color: "#6B6B70",
  },
  navLabelActive: {
    color: RED,
    fontWeight: "600",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#17171A",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2B2B2F",
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 20,
  },

  searchIcon: {
    marginRight: 10,
  },

  searchInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },
});
