import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Pressable,
  TextInput,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";

// ==================== TYPES ====================
interface MenuItemProps {
  icon: string;
  label: string;
  onPress?: () => void;
  danger?: boolean;
}

interface UserProfile {
  name?: string;
  username?: string;
  email?: string;
  role?: string;
  avatar?: string | null;
  orders?: number;
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
            color={danger ? "#E50914" : "#aaa"}
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

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isHelpVisible, setIsHelpVisible] = useState(false); // State quản lý Popup Help Center

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            ...parsedUser,
            orders: 0,
            avatar: null,
          });
        } else {
          router.replace("/login");
        }
      } catch (error) {
        console.error("Lỗi khi load user data:", error);
      } finally {
        setLoading(false);
      }
    };

    void loadUserData();
  }, [router]);

  // Hàm xử lý chọn ảnh từ thư viện
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert("Bạn cần cấp quyền truy cập ảnh để đổi Avatar!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true, 
      aspect: [1, 1], 
      quality: 0.5, 
    });

    if (!result.canceled) {
      const newAvatarUri = result.assets[0].uri;

      // 1. Set URI ảnh mới vào state để UI cập nhật ngay lập tức
      setUser((prev) => (prev ? { ...prev, avatar: newAvatarUri } : null));
      
      // 2. Lưu URI này vào AsyncStorage để giữ lại khi chuyển tab hoặc tắt app
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.avatar = newAvatarUri; // Thêm trường avatar vào object user
          await AsyncStorage.setItem("user", JSON.stringify(parsedUser));
        }
      } catch (error) {
        console.error("Lỗi khi lưu avatar vào storage:", error);
      }

      // TODO: Sau này có API, bạn gọi thêm hàm upload ảnh lên server ở đây
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("user");
      await AsyncStorage.removeItem("token");
      router.replace("/login");
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#E50914" />
      </SafeAreaView>
    );
  }

  if (!user) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLocation}>
          <Ionicons name="location-sharp" size={14} color="#E50914" />
          <Text style={styles.headerLocationText}>New York, USA</Text>
        </View>
        <TouchableOpacity>
          <Ionicons name="search" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 100 }}>
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
            {/* Nút bấm để chọn ảnh */}
            <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name || user.username || "Guest"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <TouchableOpacity style={styles.editProfileBtn}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats - Đã bỏ Loyalty Points, cho Orders ra giữa */}
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Ionicons name="receipt-outline" size={26} color="#E50914" />
            <Text style={styles.statNumber}>{user.orders}</Text>
            <Text style={styles.statLabel}>TOTAL ORDERS</Text>
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
              onPress={() => setIsHelpVisible(true)} // Mở Popup
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

      {/* POPUP HELP CENTER */}
      <Modal
        visible={isHelpVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setIsHelpVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalIconBox}>
              <Ionicons name="headset" size={32} color="#E50914" />
            </View>
            <Text style={styles.modalTitle}>How can we help?</Text>
            <Text style={styles.modalText}>
              If you have any issues with your bookings, please contact our support team.
            </Text>
            
            <View style={styles.contactRow}>
              <Ionicons name="mail-outline" size={20} color="#9CA3AF" />
              <Text style={styles.contactText}>support@cinepremium.com</Text>
            </View>
            
            <View style={styles.contactRow}>
              <Ionicons name="call-outline" size={20} color="#9CA3AF" />
              <Text style={styles.contactText}>+1 (800) 123-4567</Text>
            </View>

            <TouchableOpacity 
              style={styles.closeModalBtn} 
              onPress={() => setIsHelpVisible(false)}
            >
              <Text style={styles.closeModalText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* BOTTOM NAVIGATION */}
      <View style={styles.bottomNavigation}>
        <Pressable style={styles.navItem} onPress={() => router.replace("/home")}>
          <Ionicons name="home-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Home</Text>
        </Pressable>

        <Pressable style={styles.navItem} onPress={() => router.replace("/tickets")}>
          <Ionicons name="ticket-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Bookings</Text>
        </Pressable>

        <Pressable style={styles.navItem} onPress={() => router.replace("/favourite")}>
          <Ionicons name="heart-outline" size={22} color="#6B7280" />
          <Text style={styles.navText}>Favourite</Text>
        </Pressable>

        <Pressable style={styles.navItem}>
          <Ionicons name="person" size={22} color="#E50914" />
          <Text style={styles.activeNavText}>Profile</Text>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#090D12",
  },
  loadingScreen: {
    flex: 1,
    backgroundColor: "#090D12",
    justifyContent: "center",
    alignItems: "center",
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
    borderColor: "#E50914",
  },
  avatarPlaceholder: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: "#151D27",
    borderWidth: 3,
    borderColor: "#E50914",
    justifyContent: "center",
    alignItems: "center",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#E50914",
    width: 30, // Đã tăng kích thước một chút cho dễ bấm
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#090D12",
  },
  userName: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "800",
    marginBottom: 4,
  },
  userEmail: {
    color: "#9CA3AF",
    fontSize: 13,
    marginBottom: 16,
  },
  editProfileBtn: {
    backgroundColor: "#E50914",
    paddingHorizontal: 32,
    paddingVertical: 10,
    borderRadius: 24,
  },
  editProfileBtnText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "700",
  },
  statsRow: {
    flexDirection: "row",
    marginHorizontal: 20,
    backgroundColor: "#111821",
    borderRadius: 16,
    paddingVertical: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: "#29313D",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
    gap: 6,
  },
  statNumber: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "800",
  },
  statLabel: {
    color: "#6B7280",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
  },
  section: {
    marginHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    color: "#6B7280",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 10,
  },
  menuCard: {
    backgroundColor: "#111821",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#29313D",
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
    backgroundColor: "#151D27",
    justifyContent: "center",
    alignItems: "center",
  },
  menuIconBoxDanger: {
    backgroundColor: "rgba(229, 9, 20, 0.1)",
  },
  menuLabel: {
    color: "#E5E7EB",
    fontSize: 14,
    fontWeight: "500",
  },
  menuLabelDanger: {
    color: "#E50914",
  },
  menuDivider: {
    height: 1,
    backgroundColor: "#1D2733",
    marginLeft: 62,
  },
  version: {
    color: "#4B5563",
    fontSize: 11,
    textAlign: "center",
    paddingBottom: 32,
  },

  // --- MODAL STYLES ---
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  modalContent: {
    width: "100%",
    backgroundColor: "#111821",
    borderRadius: 24,
    padding: 24,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#29313D",
  },
  modalIconBox: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "rgba(229, 9, 20, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  modalText: {
    color: "#9CA3AF",
    fontSize: 14,
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#151D27",
    width: "100%",
    padding: 14,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#1D2733",
  },
  contactText: {
    color: "#E5E7EB",
    fontSize: 15,
    fontWeight: "500",
  },
  closeModalBtn: {
    width: "100%",
    backgroundColor: "#E50914",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 12,
  },
  closeModalText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
  },

  // --- BOTTOM NAV ---
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