import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

// ==================== TYPES ====================
interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

// ==================== SUB COMPONENTS ====================
function MenuItem({ icon, label, onPress, danger }: MenuItemProps) {
  return (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <View style={styles.menuLeft}>
        <View style={[styles.menuIconBox, danger && styles.menuIconBoxDanger]}>
          <Ionicons
            name={icon as any}
            size={18}
            color={danger ? "#E50000" : "#aaa"}
          />
        </View>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
          {label}
        </Text>
      </View>
      {!danger && (
        <Ionicons name="chevron-forward" size={16} color="#555" />
      )}
    </TouchableOpacity>
  );
}

// ==================== MAIN COMPONENT ====================
export default function ProfileScreen() {
  const router = useRouter();

  // TODO: thay bằng data thật từ auth context / API
  const user = {
    name: "Alex Thompson",
    email: "alex.thompson@cinema.com",
    avatar: null, // null = hiển thị placeholder
    orders: 12,
    loyaltyPoints: 2450,
  };

  const handleLogout = () => {
    // TODO: clear token, navigate về login
    router.replace("/login");
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLocation}>
          <Ionicons name="location-sharp" size={14} color="#E50000" />
          <Text style={styles.headerLocationText}>New York, USA</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Avatar + Info */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            {user.avatar ? (
              <Image source={{ uri: user.avatar }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={48} color="#555" />
              </View>
            )}
            <TouchableOpacity style={styles.editAvatarBtn}>
              <Ionicons name="pencil" size={12} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="receipt-outline" size={22} color="#E50000" />
            <Text style={styles.statNumber}>{user.orders}</Text>
            <Text style={styles.statLabel}>ORDERS</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Ionicons name="diamond-outline" size={22} color="#E50000" />
            <Text style={styles.statNumber}>
              {user.loyaltyPoints.toLocaleString()}
            </Text>
            <Text style={styles.statLabel}>LOYALTY POINTS</Text>
          </View>
        </View>

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ACCOUNT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="receipt-outline"
              label="My Orders"
              onPress={() => router.push("/tickets")}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="diamond-outline"
              label="Loyalty Rewards"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => {}}
            />
          </View>
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>SUPPORT</Text>
          <View style={styles.menuCard}>
            <MenuItem
              icon="help-circle-outline"
              label="Help Center"
              onPress={() => {}}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="log-out-outline"
              label="Logout"
              onPress={handleLogout}
              danger
            />
          </View>
        </View>

        {/* App version */}
        <Text style={styles.version}>Cinema Premium v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#111",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 14,
  },
  headerLocation: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  headerLocationText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },

  // Profile section
  profileSection: {
    alignItems: "center",
    paddingTop: 12,
    paddingBottom: 24,
  },
  avatarWrapper: {
    position: "relative",
    marginBottom: 14,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderWidth: 3,
    borderColor: "#E50000",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#1E1E1E",
    borderWidth: 3,
    borderColor: "#E50000",
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#E50000",
    width: 26,
    height: 26,
    borderRadius: 13,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#111",
  },
  userName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  userEmail: {
    color: "#888",
    fontSize: 13,
    marginBottom: 16,
  },
  editProfileBtn: {
    backgroundColor: "#E50000",
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 24,
  },
  editProfileBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#2A2A2A",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 4,
  },
  statDivider: {
    width: 1,
    backgroundColor: "#2A2A2A",
  },
  statNumber: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
  },
  statLabel: {
    color: "#666",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },

  // Menu sections
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#555",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: "#1A1A1A",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#2A2A2A",
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  menuLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  menuIconBox: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: "#252525",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconBoxDanger: {
    backgroundColor: "#2A0000",
  },
  menuLabel: {
    color: "#ddd",
    fontSize: 14,
    fontWeight: "500",
  },
  menuLabelDanger: {
    color: "#E50000",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#222",
    marginLeft: 62,
  },

  // Footer
  version: {
    color: "#444",
    fontSize: 11,
    textAlign: "center",
    paddingBottom: 32,
  },
});