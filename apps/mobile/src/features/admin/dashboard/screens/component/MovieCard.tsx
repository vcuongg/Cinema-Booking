import { Ionicons } from "@expo/vector-icons";
import { View, Text, StyleSheet, Image } from "react-native";

type Props = {
  rank: number;
  title: string;
  sold: number;
  revenue: number;
  image?: string;
};

function formatCompactMoney(value: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

export default function MovieCard({
  rank,
  title,
  sold,
  revenue,
  image,
}: Props) {
  return (
    <View style={styles.card}>
      {image ? (
        <Image
          source={{ uri: image }}
          style={styles.poster}
        />
      ) : (
        <View style={styles.posterPlaceholder}>
          <Ionicons
            name="film-outline"
            size={26}
            color="#9AA3B2"
          />
        </View>
      )}

      <View style={styles.info}>
        <View style={styles.rowTop}>
          <Text style={styles.title} numberOfLines={2}>{title}</Text>
          <View style={styles.rankBadge}>
            <Text style={styles.rankText}>#{rank}</Text>
          </View>
        </View>

        <Text style={styles.sold}>
          {sold.toLocaleString()} tickets sold
        </Text>

        <Text style={styles.revenue}>
          Revenue {formatCompactMoney(revenue)}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#171E29",
    borderRadius: 18,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222A36",
  },

  poster: {
    width: 60,
    height: 85,
    borderRadius: 10,
  },

  posterPlaceholder: {
    width: 60,
    height: 85,
    borderRadius: 10,
    backgroundColor: "#262F3A",
    alignItems: "center",
    justifyContent: "center",
  },

  info: {
    marginLeft: 15,
    flex: 1,
  },

  rowTop: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },

  title: {
    color: "#FFF",
    fontSize: 15,
    fontWeight: "700",
    flex: 1,
  },

  sold: {
    color: "#A5ADBA",
    fontSize: 13,
  },

  revenue: {
    color: "#D8E2F0",
    fontSize: 13,
    marginTop: 4,
    fontWeight: "600",
  },

  rankBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "#2A303B",
  },

  rankText: {
    color: "#E50914",
    fontSize: 11,
    fontWeight: "700",
  },
});