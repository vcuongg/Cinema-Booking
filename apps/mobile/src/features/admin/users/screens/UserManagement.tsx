import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUsers } from "@/shared/services/UserService";
import type { AdminUser } from "@/shared/types/user";

type RoleFilter = "all" | AdminUser["role"];

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try { setUsers(await getUsers()); }
    catch (e) { setError(e instanceof Error ? e.message : "Không thể tải danh sách người dùng"); }
    finally { refresh ? setRefreshing(false) : setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);
  const filtered = useMemo(() => users.filter((user) => {
    const text = `${user.name} ${user.username} ${user.email}`.toLowerCase();
    return (role === "all" || user.role === role) && text.includes(query.trim().toLowerCase());
  }), [users, query, role]);

  return <SafeAreaView style={styles.safe}>
    <Text style={styles.heading}>Quản lý người dùng</Text>
    <Text style={styles.sub}>{users.length} tài khoản</Text>
    <View style={styles.search}><Ionicons name="search" size={18} color="#98A2B3" /><TextInput value={query} onChangeText={setQuery} placeholder="Tìm theo tên, username, email" placeholderTextColor="#98A2B3" style={styles.input} /></View>
    <View style={styles.filters}>{(["all", "customer", "staff", "admin"] as const).map((item) => <Pressable key={item} onPress={() => setRole(item)} style={[styles.filter, role === item && styles.active]}><Text style={styles.filterText}>{item === "all" ? "Tất cả" : item}</Text></Pressable>)}</View>
    {loading ? <ActivityIndicator color="#E50914" style={styles.loader} /> : error ? <View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void load()}><Text style={styles.retry}>Thử lại</Text></Pressable></View> : <FlatList data={filtered} keyExtractor={(item) => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#E50914" />} renderItem={({ item }) => <View style={styles.card}><View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase() || "U"}</Text></View><View style={styles.info}><Text style={styles.name}>{item.name}</Text><Text style={styles.meta}>@{item.username}</Text><Text style={styles.meta}>{item.email}</Text></View><Text style={styles.role}>{item.role}</Text></View>} ListEmptyComponent={<Text style={styles.empty}>Không tìm thấy người dùng</Text>} />}
  </SafeAreaView>;
}

const styles = StyleSheet.create({ safe: { flex: 1, backgroundColor: "#0B0F14", padding: 18 }, heading: { color: "#FFF", fontSize: 25, fontWeight: "800" }, sub: { color: "#98A2B3", marginTop: 4, marginBottom: 18 }, search: { flexDirection: "row", alignItems: "center", backgroundColor: "#151D27", borderRadius: 14, paddingHorizontal: 14 }, input: { flex: 1, color: "#FFF", padding: 14, marginLeft: 8 }, filters: { flexDirection: "row", gap: 8, marginVertical: 16 }, filter: { backgroundColor: "#151D27", paddingHorizontal: 13, paddingVertical: 8, borderRadius: 20 }, active: { backgroundColor: "#E50914" }, filterText: { color: "#FFF", fontSize: 12, textTransform: "capitalize" }, loader: { marginTop: 40 }, center: { alignItems: "center", marginTop: 40 }, error: { color: "#FF9E98", textAlign: "center" }, retry: { color: "#FFF", marginTop: 14, fontWeight: "700" }, card: { flexDirection: "row", alignItems: "center", backgroundColor: "#151D27", borderRadius: 16, padding: 14, marginBottom: 10 }, avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: "#E50914", justifyContent: "center", alignItems: "center" }, avatarText: { color: "#FFF", fontSize: 20, fontWeight: "800" }, info: { flex: 1, marginLeft: 12 }, name: { color: "#FFF", fontSize: 16, fontWeight: "700" }, meta: { color: "#98A2B3", fontSize: 12, marginTop: 3 }, role: { color: "#FF9E98", fontSize: 11, fontWeight: "800" }, empty: { color: "#98A2B3", textAlign: "center", marginTop: 40 } });
