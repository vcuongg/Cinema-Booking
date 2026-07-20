import { Ionicons } from "@expo/vector-icons";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { deleteUser, getUsers, updateUser } from "@/shared/services/UserService";
import type { AdminUser } from "@/shared/types/user";

type RoleFilter = "all" | AdminUser["role"];
const roles: Array<AdminUser["role"]> = ["customer", "staff", "admin"];
const roleLabels: Record<AdminUser["role"], string> = {
  customer: "Customer",
  staff: "Staff",
  admin: "Admin",
};

export default function UserManagement() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [query, setQuery] = useState("");
  const [role, setRole] = useState<RoleFilter>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: "", username: "", email: "", role: "customer" as AdminUser["role"], password: "" });

  const load = useCallback(async (refresh = false) => {
    refresh ? setRefreshing(true) : setLoading(true);
    setError("");
    try {
      setUsers(await getUsers());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load users.");
    } finally {
      refresh ? setRefreshing(false) : setLoading(false);
    }
  }, []);

  useEffect(() => { void load(); }, [load]);

  const filtered = useMemo(() => users.filter((user) => {
    const text = `${user.name} ${user.username} ${user.email}`.toLowerCase();
    return (role === "all" || user.role === role) && text.includes(query.trim().toLowerCase());
  }), [users, query, role]);

  const closeEdit = () => setEditing(null);
  const openEdit = (user: AdminUser) => {
    setEditing(user);
    setForm({ name: user.name, username: user.username, email: user.email, role: user.role, password: "" });
  };

  const saveEdit = async () => {
    if (!editing || !form.name.trim() || !form.username.trim() || !form.email.trim()) {
      Alert.alert("Missing information", "Please complete all required fields.");
      return;
    }
    try {
      const saved = await updateUser(editing._id, form);
      setUsers((items) => items.map((item) => item._id === saved._id ? saved : item));
      closeEdit();
    } catch (e) {
      Alert.alert("Unable to update user", e instanceof Error ? e.message : "Something went wrong.");
    }
  };

  const removeUser = (user: AdminUser) => Alert.alert(
    "Delete user",
    `Are you sure you want to delete ${user.name}?`,
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await deleteUser(user._id);
            setUsers((items) => items.filter((item) => item._id !== user._id));
          } catch (e) {
            Alert.alert("Unable to delete user", e instanceof Error ? e.message : "Something went wrong.");
          }
        },
      },
    ],
  );

  return (
    <SafeAreaView style={styles.safe}>
      <Text style={styles.heading}>User Management</Text>
      <Text style={styles.sub}>{users.length} accounts</Text>
      <View style={styles.search}>
        <Ionicons name="search" size={18} color="#98A2B3" />
        <TextInput value={query} onChangeText={setQuery} placeholder="Search name, username, or email" placeholderTextColor="#98A2B3" style={styles.input} />
      </View>
      <View style={filterStyles.container}>
        {(["all", ...roles] as RoleFilter[]).map((item) => (
          <Pressable key={item} onPress={() => setRole(item)} style={[filterStyles.button, role === item && filterStyles.buttonActive]}>
            <Text numberOfLines={1} style={[filterStyles.text, role === item && filterStyles.textActive]}>{item === "all" ? "All" : roleLabels[item]}</Text>
          </Pressable>
        ))}
      </View>
      {loading ? <ActivityIndicator color="#E50914" style={styles.loader} /> : error ? (
        <View style={styles.center}><Text style={styles.error}>{error}</Text><Pressable onPress={() => void load()}><Text style={styles.retry}>Try again</Text></Pressable></View>
      ) : (
        <FlatList data={filtered} keyExtractor={(item) => item._id} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => void load(true)} tintColor="#E50914" />} renderItem={({ item }) => (
          <View style={styles.card}><View style={styles.avatar}><Text style={styles.avatarText}>{item.name?.charAt(0).toUpperCase() || "U"}</Text></View><View style={styles.info}><Text style={styles.name} numberOfLines={1}>{item.name}</Text><Text style={styles.meta} numberOfLines={1}>@{item.username}</Text><Text style={styles.meta} numberOfLines={1}>{item.email}</Text></View><View style={styles.cardActions}><Text style={styles.role}>{roleLabels[item.role]}</Text><Pressable onPress={() => openEdit(item)} hitSlop={8}><Ionicons name="create-outline" size={21} color="#FFF" /></Pressable><Pressable onPress={() => removeUser(item)} hitSlop={8}><Ionicons name="trash-outline" size={21} color="#FF6B6B" /></Pressable></View></View>
        )} ListEmptyComponent={<Text style={styles.empty}>No users found</Text>} />
      )}
      <Modal visible={!!editing} transparent animationType="slide" onRequestClose={closeEdit}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === "ios" ? "padding" : "height"}>
          <Pressable style={styles.backdrop} onPress={closeEdit} />
          <View style={styles.modal}>
            <View style={styles.handle} />
            <View style={styles.modalHeader}><View><Text style={styles.modalTitle}>Edit user</Text><Text style={styles.modalSubtitle}>Update account details and access level</Text></View><Pressable onPress={closeEdit} hitSlop={10} style={styles.closeButton}><Ionicons name="close" size={20} color="#D0D5DD" /></Pressable></View>
            <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={styles.modalContent}>
              {([ ["name", "Full name", "person-outline"], ["username", "Username", "at-outline"], ["email", "Email", "mail-outline"], ["password", "New password", "lock-closed-outline"] ] as const).map(([key, label, icon]) => (
                <View key={key} style={styles.fieldGroup}><Text style={styles.label}>{label}{key !== "password" ? " *" : " (optional)"}</Text><View style={styles.fieldWrap}><Ionicons name={icon} size={18} color="#98A2B3" /><TextInput value={form[key]} onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))} placeholder={label} placeholderTextColor="#667085" secureTextEntry={key === "password"} keyboardType={key === "email" ? "email-address" : "default"} autoCapitalize={key === "email" || key === "username" ? "none" : "words"} style={styles.field} /></View></View>
              ))}
              <View style={styles.fieldGroup}><Text style={styles.label}>Role</Text><View style={styles.roleRow}>{roles.map((value) => <Pressable key={value} onPress={() => setForm((current) => ({ ...current, role: value }))} style={[styles.roleOption, form.role === value && styles.roleOptionActive]}><Text style={[styles.roleOptionText, form.role === value && styles.roleOptionTextActive]}>{roleLabels[value]}</Text></Pressable>)}</View></View>
              <View style={styles.actions}><Pressable onPress={closeEdit} style={styles.cancel}><Text style={styles.cancelText}>Cancel</Text></Pressable><Pressable onPress={() => void saveEdit()} style={styles.save}><Text style={styles.saveText}>Save changes</Text></Pressable></View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const filterStyles = StyleSheet.create({
  container: { flexDirection: "row", gap: 6, paddingVertical: 16 },
  button: { flex: 1, minWidth: 0, height: 42, alignItems: "center", justifyContent: "center", backgroundColor: "#151D27", borderWidth: 1, borderColor: "#263241", borderRadius: 12, paddingHorizontal: 3 },
  buttonActive: { backgroundColor: "#E50914", borderColor: "#E50914" },
  text: { color: "#D0D5DD", fontSize: 10, fontWeight: "700", textAlign: "center" },
  textActive: { color: "#FFF" },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0B0F14", paddingHorizontal: 18 }, heading: { color: "#FFF", fontSize: 25, fontWeight: "800", marginTop: 8 }, sub: { color: "#98A2B3", marginTop: 4, marginBottom: 18 }, search: { flexDirection: "row", alignItems: "center", backgroundColor: "#151D27", borderRadius: 14, paddingHorizontal: 14 }, input: { flex: 1, color: "#FFF", padding: 14, marginLeft: 8 }, filters: { gap: 8, paddingVertical: 16 }, filter: { backgroundColor: "#151D27", borderWidth: 1, borderColor: "#263241", paddingHorizontal: 14, paddingVertical: 9, borderRadius: 20 }, filterActive: { backgroundColor: "#E50914", borderColor: "#E50914" }, filterText: { color: "#D0D5DD", fontSize: 12, fontWeight: "700" }, filterTextActive: { color: "#FFF" }, loader: { marginTop: 40 }, center: { alignItems: "center", marginTop: 40 }, error: { color: "#FF9E98", textAlign: "center" }, retry: { color: "#FFF", fontWeight: "700", marginTop: 10 }, card: { flexDirection: "row", alignItems: "center", backgroundColor: "#151D27", borderRadius: 16, padding: 14, marginBottom: 10 }, avatar: { width: 45, height: 45, borderRadius: 23, backgroundColor: "#E50914", justifyContent: "center", alignItems: "center" }, avatarText: { color: "#FFF", fontSize: 20, fontWeight: "800" }, info: { flex: 1, marginLeft: 12, marginRight: 8 }, name: { color: "#FFF", fontSize: 16, fontWeight: "700" }, meta: { color: "#98A2B3", fontSize: 12, marginTop: 3 }, cardActions: { alignItems: "flex-end", gap: 12 }, role: { color: "#FF9E98", fontSize: 11, fontWeight: "800" }, empty: { color: "#98A2B3", textAlign: "center", marginTop: 40 }, overlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.62)", justifyContent: "flex-end" }, backdrop: { ...StyleSheet.absoluteFillObject }, modal: { maxHeight: "92%", backgroundColor: "#151D27", borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingHorizontal: 20, paddingBottom: Platform.OS === "ios" ? 34 : 22 }, handle: { alignSelf: "center", width: 42, height: 4, backgroundColor: "#475467", borderRadius: 4, marginTop: 10, marginBottom: 18 }, modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingBottom: 18, borderBottomWidth: 1, borderBottomColor: "#263241" }, modalTitle: { color: "#FFF", fontSize: 20, fontWeight: "800" }, modalSubtitle: { color: "#98A2B3", fontSize: 13, marginTop: 4 }, closeButton: { width: 34, height: 34, borderRadius: 17, backgroundColor: "#202A36", alignItems: "center", justifyContent: "center" }, modalContent: { paddingTop: 18 }, fieldGroup: { marginBottom: 16 }, label: { color: "#D0D5DD", fontSize: 13, fontWeight: "700", marginBottom: 8 }, fieldWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#0B0F14", borderWidth: 1, borderColor: "#263241", borderRadius: 12, paddingHorizontal: 13 }, field: { flex: 1, color: "#FFF", paddingVertical: 13, paddingHorizontal: 10, fontSize: 15 }, roleRow: { flexDirection: "row", gap: 8 }, roleOption: { flex: 1, minWidth: 0, minHeight: 44, justifyContent: "center", alignItems: "center", backgroundColor: "#0B0F14", borderWidth: 1, borderColor: "#263241", borderRadius: 10, paddingHorizontal: 6 }, roleOptionActive: { backgroundColor: "#E50914", borderColor: "#E50914" }, roleOptionText: { color: "#D0D5DD", fontSize: 11, fontWeight: "700", textAlign: "center" }, roleOptionTextActive: { color: "#FFF" }, actions: { flexDirection: "row", gap: 12, marginTop: 8, paddingTop: 16, borderTopWidth: 1, borderTopColor: "#263241" }, cancel: { flex: 1, minHeight: 46, borderWidth: 1, borderColor: "#475467", borderRadius: 11, justifyContent: "center", alignItems: "center" }, cancelText: { color: "#D0D5DD", fontWeight: "700" }, save: { flex: 1.35, minHeight: 46, backgroundColor: "#E50914", borderRadius: 11, justifyContent: "center", alignItems: "center" }, saveText: { color: "#FFF", fontWeight: "800" },
});
