import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

type Props = {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string | number;
  subtitle?: string;
};

export default function StatCard({
  icon,
  title,
  value,
  subtitle,
}: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconContainer}>
        <Ionicons
          name={icon}
          size={26}
          color="#E50914"
        />
      </View>

      <Text style={styles.title}>{title}</Text>

      <Text style={styles.value}>{value}</Text>

      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "rgba(25, 32, 41, 0.7)",
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#222A36",
  },

  iconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,

    backgroundColor: "#2A303B",

    justifyContent: "center",
    alignItems: "center",

    marginBottom: 18,
  },

  title: {
    color: "#8F98A8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
  },

  value: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "700",
  },

  subtitle: {
    color: "#738099",
    fontSize: 12,
    marginTop: 6,
  },
});