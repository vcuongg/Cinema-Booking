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
  Switch, // Thêm Switch cho màn Settings
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ImagePicker from "@/shared/components/ImagePicker"; // Đảm bảo bạn đã config file này đúng chuẩn

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
  
  // States cho Modals
  const [isHelpVisible, setIsHelpVisible] = useState(false);
  const [isEditVisible, setIsEditVisible] = useState(false);
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);

  // States cho form Edit Profile
  const [editName, setEditName] = useState("");
  const [editUsername, setEditUsername] = useState("");
  
  // States cho Settings
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser({
            ...parsedUser,
            orders: 0,
            avatar: parsedUser.avatar || null,
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

  // --- LOGIC: CHỌN ẢNH ---
  const pickImage = async () => {
    try {
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

        setUser((prev) => (prev ? { ...prev, avatar: newAvatarUri } : null));
        
        const storedUser = await AsyncStorage.getItem("user");
        if (storedUser) {
          const parsedUser = JSON.parse(storedUser);
          parsedUser.avatar = newAvatarUri;
          await AsyncStorage.setItem("user", JSON.stringify(parsedUser));
        }
      }
    } catch (error) {
       console.log(error);
    }
  };

  // --- LOGIC: EDIT PROFILE ---
  const openEditProfile = () => {
    setEditName(user?.name || "");
    setEditUsername(user?.username || "");
    setIsEditVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    // Cập nhật State
    const updatedUser = { ...user, name: editName, username: editUsername };
    setUser(updatedUser);

    // Lưu đè vào Storage
    try {
      const storedUser = await AsyncStorage.getItem("user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        parsedUser.name = editName;
        parsedUser.username = editUsername;
        await AsyncStorage.setItem("user", JSON.stringify(parsedUser));
      }
    } catch (error) {
      console.error("Lỗi khi lưu profile:", error);
    }

    setIsEditVisible(false);
  };

  // --- LOGIC: ĐĂNG XUẤT ---
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
            <TouchableOpacity style={styles.editAvatarBtn} onPress={pickImage}>
              <Ionicons name="camera" size={14} color="#fff" />
            </TouchableOpacity>
          </View>

          <Text style={styles.userName}>{user.name || user.username || "Guest"}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>

          <TouchableOpacity style={styles.editProfileBtn} onPress={openEditProfile}>
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
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
              onPress={() => router.push("/my-ticket")}
            />
            <View style={styles.menuDivider} />
            <MenuItem
              icon="settings-outline"
              label="Settings"
              onPress={() => setIsSettingsVisible(true)}
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
              onPress={() => setIsHelpVisible(true)}
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

      {/* 1. POPUP EDIT PROFILE */}
      <Modal visible={isEditVisible} transparent={true} animationType="slide" onRequestClose={() => setIsEditVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: 30 }]}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name</Text>
              <TextInput
                style={styles.textInput}
                value={editName}
                onChangeText={setEditName}
                placeholder="Enter your name"
                placeholderTextColor="#6B7280"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Username</Text>
              <TextInput
                style={styles.textInput}
                value={editUsername}
                onChangeText={setEditUsername}
                placeholder="Enter username"
                placeholderTextColor="#6B7280"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.modalActionRow}>
              <TouchableOpacity style={[styles.actionBtn, styles.cancelBtn]} onPress={() => setIsEditVisible(false)}>
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity style={[styles.actionBtn, styles.saveBtn]} onPress={handleSaveProfile}>
                <Text style={styles.saveBtnText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* 2. POPUP SETTINGS */}
      <Modal visible={isSettingsVisible} transparent={true} animationType="slide" onRequestClose={() => setIsSettingsVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { paddingBottom: 30 }]}>
            <View style={styles.modalHeaderRow}>
              <Text style={styles.modalTitle}>Settings</Text>
              <TouchableOpacity onPress={() => setIsSettingsVisible(false)}>
                <Ionicons name="close-circle" size={26} color="#6B7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Ionicons name="notifications-outline" size={22} color="#E5E7EB" />
                <Text style={styles.settingText}>Push Notifications</Text>
              </View>
              <Switch
                trackColor={{ false: "#29313D", true: "#E50914" }}
                thumbColor={notificationsEnabled ? "#ffffff" : "#9CA3AF"}
                onValueChange={() => setNotificationsEnabled(!notificationsEnabled)}
                value={notificationsEnabled}
              />
            </View>
            
            <View style={styles.settingRow}>
              <View style={styles.settingRowLeft}>
                <Ionicons name="globe-outline" size={22} color="#E5E7EB" />
                <Text style={styles.settingText}>Language</Text>
              </View>
              <Text style={styles.settingValueText}>English</Text>
            </View>
          </View>
        </View>
      </Modal>

      {/* 3. POPUP HELP CENTER */}
      <Modal visible={isHelpVisible} transparent={true} animationType="fade" onRequestClose={() => setIsHelpVisible(false)}>
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

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setIsHelpVisible(false)}>
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

        <Pressable style={styles.navItem} onPress={() => router.replace("/my-ticket")}>
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
  container: { flex: 1, backgroundColor: "#090D12" },
  loadingScreen: { flex: 1, backgroundColor: "#090D12", justifyContent: "center", alignItems: "center" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingVertical: 14 },
  headerLocation: { flexDirection: "row", alignItems: "center", gap: 4 },
  headerLocationText: { color: "#fff", fontSize: 14, fontWeight: "600" },
  profileSection: { alignItems: "center", paddingTop: 12, paddingBottom: 24 },
  avatarWrapper: { position: "relative", marginBottom: 14 },
  avatar: { width: 90, height: 90, borderRadius: 45, borderWidth: 3, borderColor: "#E50914" },
  avatarPlaceholder: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#151D27", borderWidth: 3, borderColor: "#E50914", justifyContent: "center", alignItems: "center" },
  editAvatarBtn: { position: "absolute", bottom: 0, right: 0, backgroundColor: "#E50914", width: 30, height: 30, borderRadius: 15, justifyContent: "center", alignItems: "center", borderWidth: 2, borderColor: "#090D12" },
  userName: { color: "#fff", fontSize: 22, fontWeight: "800", marginBottom: 4 },
  userEmail: { color: "#9CA3AF", fontSize: 13, marginBottom: 16 },
  editProfileBtn: { backgroundColor: "#E50914", paddingHorizontal: 32, paddingVertical: 10, borderRadius: 24 },
  editProfileBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  statsRow: { flexDirection: "row", marginHorizontal: 20, backgroundColor: "#111821", borderRadius: 16, paddingVertical: 20, marginBottom: 28, borderWidth: 1, borderColor: "#29313D" },
  statItem: { flex: 1, alignItems: "center", gap: 6 },
  statNumber: { color: "#fff", fontSize: 26, fontWeight: "800" },
  statLabel: { color: "#6B7280", fontSize: 10, fontWeight: "700", letterSpacing: 0.8 },
  section: { marginHorizontal: 20, marginBottom: 24 },
  sectionTitle: { color: "#6B7280", fontSize: 11, fontWeight: "700", letterSpacing: 1.2, marginBottom: 10 },
  menuCard: { backgroundColor: "#111821", borderRadius: 16, borderWidth: 1, borderColor: "#29313D", overflow: "hidden" },
  menuItem: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 16, paddingVertical: 14 },
  menuLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  menuIconBox: { width: 34, height: 34, borderRadius: 8, backgroundColor: "#151D27", justifyContent: "center", alignItems: "center" },
  menuIconBoxDanger: { backgroundColor: "rgba(229, 9, 20, 0.1)" },
  menuLabel: { color: "#E5E7EB", fontSize: 14, fontWeight: "500" },
  menuLabelDanger: { color: "#E50914" },
  menuDivider: { height: 1, backgroundColor: "#1D2733", marginLeft: 62 },
  version: { color: "#4B5563", fontSize: 11, textAlign: "center", paddingBottom: 32 },

  // --- MODAL SHARED STYLES ---
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.7)", justifyContent: "center", alignItems: "center", paddingHorizontal: 20 },
  modalContent: { width: "100%", backgroundColor: "#111821", borderRadius: 24, padding: 24, alignItems: "center", borderWidth: 1, borderColor: "#29313D" },
  modalTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 16 },
  modalIconBox: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(229, 9, 20, 0.1)", justifyContent: "center", alignItems: "center", marginBottom: 16 },
  modalText: { color: "#9CA3AF", fontSize: 14, textAlign: "center", lineHeight: 22, marginBottom: 24 },
  modalHeaderRow: { flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },

  // --- EDIT PROFILE STYLES ---
  inputGroup: { width: "100%", marginBottom: 16 },
  inputLabel: { color: "#9CA3AF", fontSize: 12, fontWeight: "600", marginBottom: 8 },
  textInput: { backgroundColor: "#151D27", borderWidth: 1, borderColor: "#29313D", borderRadius: 12, color: "#FFFFFF", paddingHorizontal: 16, height: 50, fontSize: 15 },
  modalActionRow: { flexDirection: "row", gap: 12, marginTop: 10, width: "100%" },
  actionBtn: { flex: 1, height: 48, borderRadius: 12, justifyContent: "center", alignItems: "center" },
  cancelBtn: { backgroundColor: "#151D27", borderWidth: 1, borderColor: "#29313D" },
  saveBtn: { backgroundColor: "#E50914" },
  cancelBtnText: { color: "#9CA3AF", fontSize: 15, fontWeight: "700" },
  saveBtnText: { color: "#FFFFFF", fontSize: 15, fontWeight: "700" },

  // --- SETTINGS STYLES ---
  settingRow: { flexDirection: "row", width: "100%", justifyContent: "space-between", alignItems: "center", paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: "#1D2733" },
  settingRowLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  settingText: { color: "#E5E7EB", fontSize: 15, fontWeight: "500" },
  settingValueText: { color: "#9CA3AF", fontSize: 14, fontWeight: "600" },

  // --- HELP CENTER STYLES ---
  contactRow: { flexDirection: "row", alignItems: "center", gap: 12, backgroundColor: "#151D27", width: "100%", padding: 14, borderRadius: 12, marginBottom: 12, borderWidth: 1, borderColor: "#1D2733" },
  contactText: { color: "#E5E7EB", fontSize: 15, fontWeight: "500" },
  closeModalBtn: { width: "100%", backgroundColor: "#E50914", paddingVertical: 14, borderRadius: 12, alignItems: "center", marginTop: 12 },
  closeModalText: { color: "#fff", fontSize: 15, fontWeight: "700" },

  // --- BOTTOM NAV ---
  bottomNavigation: { position: "absolute", left: 0, right: 0, bottom: 0, minHeight: 78, flexDirection: "row", justifyContent: "space-around", alignItems: "center", paddingBottom: 10, backgroundColor: "#111821", borderTopWidth: 1, borderTopColor: "#29313D" },
  navItem: { alignItems: "center", justifyContent: "center", gap: 4, minWidth: 65 },
  activeNavText: { color: "#E50914", fontSize: 10, fontWeight: "700" },
  navText: { color: "#6B7280", fontSize: 10, fontWeight: "600" },
});