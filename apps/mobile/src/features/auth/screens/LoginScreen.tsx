import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { showMessage } from "@/shared/utils/showMessage";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService } from "@/shared/services/authService";

export default function LoginScreen() {
  const [account, setAccount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const normalizedAccount = useMemo(() => account.trim(), [account]);
  const isFormValid = normalizedAccount.length > 0 && password.length >= 6;

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setIsKeyboardVisible(true);
    });

    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setIsKeyboardVisible(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const handleLogin = async () => {
    if (!normalizedAccount) {
      showMessage("Missing information", "Please enter your email or username.");
      return;
    }

    if (password.length < 6) {
      showMessage("Invalid password", "Password must be at least 6 characters.");
      return;
    }

    try {
      setLoading(true);

      const response = await authService.login({
        account: normalizedAccount,
        password,
      });

      if (response.user.role === "admin") {
        router.replace("/admin/DashBoardAdmin");
      } else {
        router.replace("/home");
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to login";

      showMessage("Login failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
        >
          <ScrollView
            contentContainerStyle={[
              styles.content,
              isKeyboardVisible && styles.contentWithKeyboard,
            ]}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode={Platform.OS === "ios" ? "interactive" : "on-drag"}
            showsVerticalScrollIndicator={false}
          >
            <View style={styles.logoWrapper}>
              <View style={styles.logoBox}>
                <Ionicons
                  name="film"
                  size={30}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.brand}>
                CINE
                <Text style={styles.brandAccent}>
                  PREMIUM
                </Text>
              </Text>
            </View>

            <View style={styles.card}>
              <Text style={styles.title}>
                Welcome back
              </Text>

              <Text style={styles.subtitle}>
                Enter your credentials to continue
              </Text>

              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>
                    Email address or username
                  </Text>

                  <View style={styles.inputBox}>
                    <Ionicons
                      name="mail-outline"
                      size={19}
                      color="#6B7280"
                    />

                    <TextInput
                      value={account}
                      onChangeText={setAccount}
                      placeholder="name@example.com"
                      placeholderTextColor="#6B7280"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Password
                  </Text>

                  <View style={styles.inputBox}>
                    <Ionicons
                      name="lock-closed-outline"
                      size={19}
                      color="#6B7280"
                    />

                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder="Enter your password"
                      placeholderTextColor="#6B7280"
                      secureTextEntry={!showPassword}
                      autoCapitalize="none"
                      style={styles.input}
                    />

                    <Pressable
                      hitSlop={10}
                      onPress={() =>
                        setShowPassword((value) => !value)
                      }
                    >
                      <Ionicons
                        name={
                          showPassword
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={20}
                        color="#6B7280"
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={styles.forgotButton}
                  onPress={() =>
                    router.push("/forgot-password")
                  }
                >
                  <Text style={styles.forgotText}>
                    Forgot password?
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void handleLogin();
                  }}
                  disabled={loading}
                  style={({ pressed }) => [
                    styles.loginButton,
                    loading && styles.disabledButton,
                    pressed && !loading && styles.pressedButton,
                  ]}
                >
                  <Text style={styles.loginText}>
                    {loading ? "Signing in..." : "Sign in"}
                  </Text>

                  {!loading && (
                    <Ionicons
                      name="arrow-forward"
                      size={19}
                      color="#FFFFFF"
                    />
                  )}
                </Pressable>
              </View>

              <View style={styles.registerRow}>
                <Text style={styles.registerHint}>
                  Don&apos;t have an account?
                </Text>

                <Pressable
                  onPress={() =>
                    router.push("/register")
                  }
                >
                  <Text style={styles.registerLink}>
                    Register now
                  </Text>
                </Pressable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#090D12",
  },

  safeArea: {
    flex: 1,
  },

  keyboardView: {
    flex: 1,
  },

  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 22,
    paddingVertical: 30,
  },

  logoWrapper: {
    alignItems: "center",
    marginBottom: 26,
  },

  logoBox: {
    width: 60,
    height: 60,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E50914",
    marginBottom: 14,
  },

  brand: {
    color: "#FFFFFF",
    fontSize: 26,
    fontWeight: "900",
  },

  brandAccent: {
    color: "#E50914",
  },

  card: {
    backgroundColor: "#111821",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#29313D",
    padding: 22,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    textAlign: "center",
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    textAlign: "center",
    marginTop: 7,
    marginBottom: 24,
  },

  form: {
    gap: 17,
  },

  field: {
    gap: 8,
  },

  label: {
    color: "#F1F1F1",
    fontSize: 13,
    fontWeight: "600",
  },

  inputBox: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    backgroundColor: "#151D27",
    borderWidth: 1,
    borderColor: "#29313D",
    borderRadius: 12,
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },

  forgotButton: {
    alignSelf: "flex-end",
    marginTop: -4,
  },

  forgotText: {
    color: "#E50914",
    fontSize: 13,
    fontWeight: "600",
  },

  loginButton: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 12,
    backgroundColor: "#E50914",
  },

  pressedButton: {
    opacity: 0.85,
  },

  disabledButton: {
    opacity: 0.55,
  },

  loginText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  registerRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 23,
  },

  registerHint: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  registerLink: {
    color: "#E50914",
    fontSize: 13,
    fontWeight: "700",
  },

  contentWithKeyboard: {
    justifyContent: "flex-start",
    paddingTop: 12,
    paddingBottom: 36,
  },
});