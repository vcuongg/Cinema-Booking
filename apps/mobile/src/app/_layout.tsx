import {
  DarkTheme,
  DefaultTheme,
  Slot,
  ThemeProvider,
} from "expo-router";
import {
  Platform,
  StyleSheet,
  useColorScheme,
  View,
} from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <SafeAreaProvider>
      <ThemeProvider
        value={
          colorScheme === "dark"
            ? DarkTheme
            : DefaultTheme
        }
      >
        <StatusBar style="light" />

        <View style={styles.page}>
          <View style={styles.appContainer}>
            <Slot />
          </View>
        </View>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    backgroundColor: "#080D14",
    alignItems:
      Platform.OS === "web"
        ? "center"
        : "stretch",
  },

  appContainer: {
    flex: 1,
    width: "100%",
    maxWidth:
      Platform.OS === "web"
        ? 1440
        : undefined,
    backgroundColor: "#080D14",
  },
});