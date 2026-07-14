import AsyncStorage from "@react-native-async-storage/async-storage";
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

  useEffect(() => {
    async function checkSession() {
      try {
        const token =
          await AsyncStorage.getItem("token");

        setHasToken(Boolean(token));
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

  return (
    <Redirect
      href={hasToken ? "/home" : "/login"}
    />
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#080D14",
  },
});