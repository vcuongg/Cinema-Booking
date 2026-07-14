import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { showMessage } from "@/shared/utils/showMessage";
import {
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

export default function RegisterScreen() {
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const normalizedName = useMemo(() => name.trim(), [name]);
  const normalizedUsername = useMemo(() => username.trim().toLowerCase(), [username]);
  const normalizedEmail = useMemo(() => email.trim().toLowerCase(), [email]);
  const isFormValid =
    normalizedName.length > 0 &&
    normalizedUsername.length >= 4 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail) &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleRegister = async () => {
    if (!normalizedName) {
      showMessage(
        "Missing information",
        "Please enter your full name.",
      );
      return;
    }

    if (normalizedUsername.length < 4) {
      showMessage(
        "Invalid username",
        "Username must be at least 4 characters.",
      );
      return;
    }

    if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        normalizedEmail,
      )
    ) {
      showMessage(
        "Invalid email",
        "Please enter a valid email address.",
      );
      return;
    }

    if (password.length < 6) {
      showMessage(
        "Weak password",
        "Password must be at least 6 characters.",
      );
      return;
    }

    if (password !== confirmPassword) {
      showMessage(
        "Password mismatch",
        "Password and confirm password do not match.",
      );
      return;
    }

    try {
      setLoading(true);

      await authService.register({
        name: normalizedName,
        username: normalizedUsername,
        email: normalizedEmail,
        password,
        confirmPassword,
      });

      showMessage(
        "Registration successful",
        "Your account has been created.",
      );

      router.replace("/home");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to create account";

      showMessage(
        "Registration failed",
        message,
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          style={styles.keyboardView}
          behavior={
            Platform.OS === "ios" ? "padding" : undefined
          }
        >
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <Pressable
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.brandSection}>
              <View style={styles.logoBox}>
                <Ionicons
                  name="film"
                  size={27}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.brand}>
                CINE
                <Text style={styles.brandAccent}>
                  PREMIUM
                </Text>
              </Text>

              <Text style={styles.heading}>
                Create Account
              </Text>

              <Text style={styles.description}>
                Join the silver screen experience today.
              </Text>
            </View>

            <View style={styles.card}>
              <View style={styles.form}>
                <View style={styles.field}>
                  <Text style={styles.label}>
                    Full name
                  </Text>

                  <View style={styles.inputBox}>
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color="#6B7280"
                    />

                    <TextInput
                      value={name}
                      onChangeText={setName}
                      placeholder="John Doe"
                      placeholderTextColor="#6B7280"
                      autoCapitalize="words"
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Username
                  </Text>

                  <View style={styles.inputBox}>
                    <Ionicons
                      name="at-outline"
                      size={19}
                      color="#6B7280"
                    />

                    <TextInput
                      value={username}
                      onChangeText={setUsername}
                      placeholder="john123"
                      placeholderTextColor="#6B7280"
                      autoCapitalize="none"
                      autoCorrect={false}
                      style={styles.input}
                    />
                  </View>
                </View>

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Email address
                  </Text>

                  <View style={styles.inputBox}>
                    <Ionicons
                      name="mail-outline"
                      size={19}
                      color="#6B7280"
                    />

                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder="email@example.com"
                      placeholderTextColor="#6B7280"
                      keyboardType="email-address"
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
                      placeholder="Minimum 6 characters"
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

                <View style={styles.field}>
                  <Text style={styles.label}>
                    Confirm password
                  </Text>

                  <View style={styles.inputBox}>
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={19}
                      color="#6B7280"
                    />

                    <TextInput
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="Re-enter your password"
                      placeholderTextColor="#6B7280"
                      secureTextEntry={
                        !showConfirmPassword
                      }
                      autoCapitalize="none"
                      style={styles.input}
                    />

                    <Pressable
                      hitSlop={10}
                      onPress={() =>
                        setShowConfirmPassword(
                          (value) => !value,
                        )
                      }
                    >
                      <Ionicons
                        name={
                          showConfirmPassword
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
                  disabled={loading}
                  onPress={() => {
                    void handleRegister();
                  }}
                  style={({ pressed }) => [
                    styles.registerButton,
                    loading && styles.buttonDisabled,
                    pressed && !loading && styles.buttonPressed,
                  ]}
                >
                  <Text style={styles.registerButtonText}>
                    {loading
                      ? "Creating account..."
                      : "Register Now"}
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

              <View style={styles.loginRow}>
                <Text style={styles.loginHint}>
                  Already have an account?
                </Text>

                <Pressable
                  onPress={() => router.replace("/login")}
                >
                  <Text style={styles.loginLink}>
                    Login
                  </Text>
                </Pressable>
              </View>
            </View>

            <Text style={styles.termsText}>
              By registering, you agree to our Terms of
              Service and Privacy Policy.
            </Text>
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
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 30,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#151D27",
    borderWidth: 1,
    borderColor: "#29313D",
  },

  brandSection: {
    alignItems: "center",
    marginTop: 16,
    marginBottom: 22,
  },

  logoBox: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E50914",
    marginBottom: 13,
  },

  brand: {
    color: "#FFFFFF",
    fontSize: 23,
    fontWeight: "900",
  },

  brandAccent: {
    color: "#E50914",
  },

  heading: {
    color: "#FFFFFF",
    fontSize: 25,
    fontWeight: "800",
    marginTop: 17,
  },

  description: {
    color: "#9CA3AF",
    fontSize: 13,
    marginTop: 7,
    textAlign: "center",
  },

  card: {
    backgroundColor: "#111821",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#29313D",
    padding: 22,
  },

  form: {
    gap: 16,
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

  registerButton: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    backgroundColor: "#E50914",
    borderRadius: 12,
    marginTop: 4,
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  loginRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 22,
  },

  loginHint: {
    color: "#9CA3AF",
    fontSize: 13,
  },

  loginLink: {
    color: "#E50914",
    fontSize: 13,
    fontWeight: "700",
  },

  termsText: {
    color: "#6B7280",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 17,
    paddingHorizontal: 12,
  },
});