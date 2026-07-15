import { FontAwesome } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { getAdminDashboardSummary } from "@/shared/services/DashboardService";
import type { AdminDashboardSummary } from "@/shared/types/dashboard";

import StatCard from "./component/StatCard";
import QuickAction from "../screens/component/QuickAction";
import TopMovies from "./component/TopMovies";

export default function AdminDashBoardScreen() {
  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const today = new Date().toLocaleDateString();

  const revenueLabel = useMemo(() => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(summary?.totalRevenue || 0);
  }, [summary?.totalRevenue]);

  const loadSummary = async (isRefresh = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }

    setError("");

    try {
      const data = await getAdminDashboardSummary();
      setSummary(data);
    } catch (loadError) {
      const message =
        loadError instanceof Error
          ? loadError.message
          : "Failed to load dashboard data";

      setError(message);
    } finally {
      if (isRefresh) {
        setRefreshing(false);
      } else {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    loadSummary();
  }, []);

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadSummary(true)}
            tintColor="#E50914"
          />
        }
      >
      <View style={styles.header}>
        <View>
          <Text style={styles.admin}>Admin dashboard</Text>
          <Text style={styles.subtitle}>
        Live overview on {today}
          </Text>
        </View>

        <TouchableOpacity style={styles.searchBtn}>
          <FontAwesome name="user-circle" size={24} color="#E50914" />
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator
          size="large"
          color="#E50914"
          style={styles.loader}
        />
      ) : error ? (
        <View style={styles.errorCard}>
          <Text style={styles.errorTitle}>Cannot load dashboard</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => loadSummary()}
          >
            <Text style={styles.retryText}>Try again</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <View style={styles.statcards}>
          <StatCard
            icon="cash"
            title="Total Revenue"
            value={revenueLabel}
            subtitle={`${summary?.totalBookings || 0} paid bookings`}
          />

          <StatCard
            icon="ticket"
            title="Tickets Sold"
            value={(summary?.ticketsSold || 0).toLocaleString()}
            subtitle="Confirmed seats"
          />

          <StatCard
            icon="film"
            title="Movies"
            value={summary?.totalMovies || 0}
            subtitle={`${summary?.totalShowtimes || 0} showtimes`}
          />

          <StatCard
            icon="people"
            title="Customers"
            value={(summary?.totalCustomers || 0).toLocaleString()}
            subtitle="Registered customer accounts"
          />
          </View>

          <QuickAction />
          <TopMovies movies={summary?.topMovies || []} />
        </>
      )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d141d",
    paddingHorizontal: 16,
    paddingTop: 42,
  },

  subtitle: {
    color: "#9AA3B2",
    fontSize: 14,
    marginTop: 4,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  admin: {
    color: "#E50914",
    fontSize: 24,
    fontWeight: "700",
  },

  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A2333",
    borderWidth: 1,
    borderColor: "#222A36",
    justifyContent: "center",
    alignItems: "center",
  },

  statcards: {
    justifyContent: "space-between",
    marginTop: 18,
  },

  loader: {
    marginTop: 60,
  },

  errorCard: {
    marginTop: 28,
    backgroundColor: "#171E29",
    borderColor: "#2A3140",
    borderWidth: 1,
    borderRadius: 16,
    padding: 16,
  },

  errorTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },

  errorText: {
    color: "#A5ADBA",
    fontSize: 13,
    lineHeight: 18,
  },

  retryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#E50914",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },

  retryText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
  },

});
