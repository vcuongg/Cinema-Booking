import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { ActivityIndicator, Alert, Keyboard, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getUsers, updateUser } from "@/shared/services/UserService";
import type { AdminUser } from "@/shared/types/user";

const roles: AdminUser["role"][] = ["customer", "staff", "admin"];

export default function UpdateUserScreen({ userId }: { userId: string }) {
  const router = useRouter();
  const [user, setUser] = useState<AdminUser | null>(null);
  const [form, setForm] = useState({ name: "", username: "", email: "", password: "", role: "customer" as AdminUser["role"] });
  const [saving, setSaving] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => { void getUsers().then((items) => {
    const found = items.find((item) => item._id === userId) ?? null;
    setUser(found);
    if (found) setForm({ name: found.name, username: found.username, email: found.email, password: "", role: found.role });
  }).catch((error) => Alert.alert("Error", error instanceof Error ? error.message : "Cannot load user")); }, [userId]);
  useEffect(() => {
    const show = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow", (event) => setKeyboardHeight(event.endCoordinates.height));
    const hide = Keyboard.addListener(Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide", () => setKeyboardHeight(0));
    return () => { show.remove(); hide.remove(); };
  }, []);

  const save = async () => {
    if (!user || !form.name.trim() || !form.username.trim() || !form.email.trim()) return Alert.alert("Missing information", "Please complete all required fields.");
    setSaving(true);
    try { await updateUser(user._id, form); router.replace("/admin/UserManagement"); }
    catch (error) { Alert.alert("Error", error instanceof Error ? error.message : "Cannot update user"); }
    finally { setSaving(false); }
  };

  if (!user) return <SafeAreaView style={styles.safe}><ActivityIndicator color="#E50914" /></SafeAreaView>;
  return <SafeAreaView style={styles.safe}><View style={styles.header}><Pressable onPress={() => router.back()} style={styles.back}><Ionicons name="arrow-back" size={22} color="#FFF" /></Pressable><Text style={styles.title}>Update User</Text></View><ScrollView ref={scrollRef} contentContainerStyle={[styles.content, { paddingBottom: keyboardHeight + 40 }]} keyboardShouldPersistTaps="handled">
    {(["name", "username", "email", "password"] as const).map((key, index) => <View key={key} style={styles.group}><Text style={styles.label}>{key === "password" ? "New password (optional)" : `${key[0].toUpperCase()}${key.slice(1)} *`}</Text><TextInput value={form[key]} onChangeText={(value) => setForm((current) => ({ ...current, [key]: value }))} onFocus={() => setTimeout(() => scrollRef.current?.scrollTo({ y: Math.max(0, index * 92 - 40), animated: true }), 100)} secureTextEntry={key === "password"} keyboardType={key === "email" ? "email-address" : "default"} autoCapitalize={key === "username" || key === "email" ? "none" : "words"} style={styles.input} /></View>)}
    <Text style={styles.label}>Role</Text><View style={styles.roles}>{roles.map((role) => <Pressable key={role} onPress={() => setForm((current) => ({ ...current, role }))} style={[styles.role, form.role === role && styles.active]}><Text style={styles.roleText}>{role}</Text></Pressable>)}</View>
    <Pressable onPress={() => void save()} disabled={saving} style={styles.save}><Text style={styles.saveText}>{saving ? "Saving..." : "Save changes"}</Text></Pressable>
  </ScrollView></SafeAreaView>;
}
const styles = StyleSheet.create({ safe:{flex:1,backgroundColor:"#0B0F14",paddingHorizontal:18},header:{height:60,flexDirection:"row",alignItems:"center",gap:14},back:{width:38,height:38,borderRadius:19,backgroundColor:"#202A36",alignItems:"center",justifyContent:"center"},title:{color:"#FFF",fontSize:21,fontWeight:"800"},content:{paddingVertical:14,paddingBottom:40},group:{marginBottom:16},label:{color:"#D0D5DD",fontWeight:"700",marginBottom:8,textTransform:"capitalize"},input:{color:"#FFF",backgroundColor:"#151D27",borderColor:"#263241",borderWidth:1,borderRadius:12,padding:14},roles:{flexDirection:"row",gap:8,marginBottom:26},role:{flex:1,paddingVertical:13,alignItems:"center",borderRadius:10,backgroundColor:"#151D27"},active:{backgroundColor:"#E50914"},roleText:{color:"#FFF",fontWeight:"700",textTransform:"capitalize"},save:{backgroundColor:"#E50914",borderRadius:12,alignItems:"center",padding:16},saveText:{color:"#FFF",fontWeight:"800"} });
