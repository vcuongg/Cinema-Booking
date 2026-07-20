import AsyncStorage from "@react-native-async-storage/async-storage";
import type { User } from "@/shared/types/auth";
import { Redirect } from "expo-router";
import {
  useEffect,
  useState,
} from "react";
import {
  ActivityIndicator,
  StyleSheet,
  View,
} from "react-native";

export default function IndexRoute() {
  const [checkingSession, setCheckingSession] =
    useState(true);

  const [hasToken, setHasToken] =
    useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkSession() {
      try {
        const token = await AsyncStorage.getItem("token");
        const savedUser = await AsyncStorage.getItem("user");
        let isAdmin = false;
        if (savedUser) {
          try {
            isAdmin = (JSON.parse(savedUser) as User).role === "admin";
          } catch { /* expired/invalid session data */ }
        }

        setHasToken(Boolean(token));
        setIsAdmin(Boolean(token) && isAdmin);
      } catch {
        setHasToken(false);
      } finally {
        setCheckingSession(false);
      }
    }

    void checkSession();
  }, []);

  if (checkingSession) {
    return (
      <View style={styles.container}>
        <ActivityIndicator
          size="large"
          color="#E50914"
        />
      </View>
    );
  }

  return <Redirect href={hasToken ? (isAdmin ? "/admin/DashBoardAdmin" : "/home") : "/login"} />;

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080D14",
  },
});
