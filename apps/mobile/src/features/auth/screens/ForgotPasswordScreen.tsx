import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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
import { showMessage } from "@/shared/utils/showMessage";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ForgotStep = "email" | "otp" | "reset";

export default function ForgotPasswordScreen() {
  const [step, setStep] = useState<ForgotStep>("email");

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");

  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  const normalizedEmail = useMemo(
    () => email.trim().toLowerCase(),
    [email],
  );

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

  const handleSendOTP = async () => {
    if (!normalizedEmail) {
      showMessage(
        "Missing email",
        "Please enter your email address.",
      );

      return;
    }

    if (!emailRegex.test(normalizedEmail)) {
      showMessage(
        "Invalid email",
        "Please enter a valid email address.",
      );

      return;
    }

    try {
      setLoading(true);

      const response = await authService.forgotPassword({
        email: normalizedEmail,
      });

      showMessage(
        "OTP sent",
        response.message ||
          "Please check your email for the OTP code.",
      );

      setStep("otp");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to send OTP";

      showMessage("Send OTP failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    const normalizedOTP = otp.trim();

    if (!normalizedOTP) {
      showMessage(
        "Missing OTP",
        "Please enter the OTP sent to your email.",
      );

      return;
    }

    if (!/^\d{6}$/.test(normalizedOTP)) {
      showMessage(
        "Invalid OTP",
        "OTP must contain exactly 6 digits.",
      );

      return;
    }

    try {
      setLoading(true);

      const response = await authService.verifyOTP({
        email: normalizedEmail,
        otp: normalizedOTP,
      });

      showMessage(
        "OTP verified",
        response.message ||
          "You can now create a new password.",
      );

      setStep("reset");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to verify OTP";

      showMessage("OTP verification failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    const normalizedOTP = otp.trim();

    if (!newPassword || !confirmNewPassword) {
      showMessage(
        "Missing information",
        "Please enter and confirm your new password.",
      );

      return;
    }

    if (newPassword.length < 6) {
      showMessage(
        "Weak password",
        "New password must be at least 6 characters.",
      );

      return;
    }

    if (newPassword !== confirmNewPassword) {
      showMessage(
        "Password mismatch",
        "New password and confirmation do not match.",
      );

      return;
    }

    try {
      setLoading(true);

      const response = await authService.resetPassword({
        email: normalizedEmail,
        otp: normalizedOTP,
        newPassword,
        confirmNewPassword,
      });

      showMessage(
        "Password changed",
        response.message ||
          "Your password has been reset successfully.",
      );

      router.replace("/login");
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unable to reset password";

      showMessage("Reset password failed", message);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (step === "reset") {
      setStep("otp");
      return;
    }

    if (step === "otp") {
      setStep("email");
      setOtp("");
      return;
    }

    router.back();
  };

  const getStepNumber = () => {
    if (step === "email") return 1;
    if (step === "otp") return 2;

    return 3;
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
            <Pressable
              style={styles.backButton}
              onPress={handleBack}
            >
              <Ionicons
                name="chevron-back"
                size={24}
                color="#FFFFFF"
              />
            </Pressable>

            <View style={styles.header}>
              <View style={styles.iconBox}>
                <Ionicons
                  name="key-outline"
                  size={31}
                  color="#FFFFFF"
                />
              </View>

              <Text style={styles.title}>
                Forgot Password
              </Text>

              <Text style={styles.subtitle}>
                {step === "email" &&
                  "Enter your email to receive a verification code."}

                {step === "otp" &&
                  `Enter the 6-digit code sent to ${normalizedEmail}.`}

                {step === "reset" &&
                  "Create a strong new password for your account."}
              </Text>
            </View>

            <View style={styles.progressRow}>
              {[1, 2, 3].map((item) => {
                const active = item <= getStepNumber();

                return (
                  <View
                    key={item}
                    style={[
                      styles.progressItem,
                      active && styles.progressItemActive,
                    ]}
                  />
                );
              })}
            </View>

            <Text style={styles.stepText}>
              Step {getStepNumber()} of 3
            </Text>

            <View style={styles.card}>
              {step === "email" && (
                <>
                  <Text style={styles.sectionTitle}>
                    Recover your account
                  </Text>

                  <Text style={styles.sectionDescription}>
                    We will send a one-time password to your
                    registered email address.
                  </Text>

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
                        editable={!loading}
                        style={styles.input}
                      />
                    </View>
                  </View>

                  <Pressable
                    disabled={loading}
                    onPress={handleSendOTP}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.buttonPressed,
                      loading && styles.buttonDisabled,
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading
                        ? "Sending OTP..."
                        : "Send OTP"}
                    </Text>

                    {!loading && (
                      <Ionicons
                        name="arrow-forward"
                        size={19}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>
                </>
              )}

              {step === "otp" && (
                <>
                  <Text style={styles.sectionTitle}>
                    Verify OTP
                  </Text>

                  <Text style={styles.sectionDescription}>
                    The verification code expires after five
                    minutes.
                  </Text>

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      OTP code
                    </Text>

                    <View style={styles.otpInputBox}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={21}
                        color="#6B7280"
                      />

                      <TextInput
                        value={otp}
                        onChangeText={(value) =>
                          setOtp(
                            value
                              .replace(/[^0-9]/g, "")
                              .slice(0, 6),
                          )
                        }
                        placeholder="000000"
                        placeholderTextColor="#6B7280"
                        keyboardType="number-pad"
                        maxLength={6}
                        editable={!loading}
                        style={styles.otpInput}
                      />
                    </View>
                  </View>

                  <Pressable
                    disabled={loading}
                    onPress={handleVerifyOTP}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.buttonPressed,
                      loading && styles.buttonDisabled,
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading
                        ? "Verifying..."
                        : "Verify OTP"}
                    </Text>

                    {!loading && (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>

                  <Pressable
                    disabled={loading}
                    onPress={handleSendOTP}
                    style={({ pressed }) => [
                      styles.secondaryButton,
                      pressed && styles.buttonPressed,
                      loading && styles.buttonDisabled,
                    ]}
                  >
                    <Ionicons
                      name="refresh-outline"
                      size={18}
                      color="#FF9E98"
                    />

                    <Text style={styles.secondaryButtonText}>
                      Resend OTP
                    </Text>
                  </Pressable>
                </>
              )}

              {step === "reset" && (
                <>
                  <Text style={styles.sectionTitle}>
                    Create new password
                  </Text>

                  <Text style={styles.sectionDescription}>
                    Your new password must contain at least six
                    characters.
                  </Text>

                  <View style={styles.field}>
                    <Text style={styles.label}>
                      New password
                    </Text>

                    <View style={styles.inputBox}>
                      <Ionicons
                        name="lock-closed-outline"
                        size={19}
                        color="#6B7280"
                      />

                      <TextInput
                        value={newPassword}
                        onChangeText={setNewPassword}
                        placeholder="Enter new password"
                        placeholderTextColor="#6B7280"
                        secureTextEntry={!showNewPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                        style={styles.input}
                      />

                      <Pressable
                        hitSlop={10}
                        disabled={loading}
                        onPress={() =>
                          setShowNewPassword(
                            (value) => !value,
                          )
                        }
                      >
                        <Ionicons
                          name={
                            showNewPassword
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
                      Confirm new password
                    </Text>

                    <View style={styles.inputBox}>
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={19}
                        color="#6B7280"
                      />

                      <TextInput
                        value={confirmNewPassword}
                        onChangeText={setConfirmNewPassword}
                        placeholder="Confirm new password"
                        placeholderTextColor="#6B7280"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoCorrect={false}
                        editable={!loading}
                        style={styles.input}
                      />

                      <Pressable
                        hitSlop={10}
                        disabled={loading}
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
                    onPress={handleResetPassword}
                    style={({ pressed }) => [
                      styles.primaryButton,
                      pressed && styles.buttonPressed,
                      loading && styles.buttonDisabled,
                    ]}
                  >
                    <Text style={styles.primaryButtonText}>
                      {loading
                        ? "Updating password..."
                        : "Reset Password"}
                    </Text>

                    {!loading && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color="#FFFFFF"
                      />
                    )}
                  </Pressable>
                </>
              )}
            </View>

            <Pressable
              disabled={loading}
              style={styles.loginLinkButton}
              onPress={() => router.replace("/login")}
            >
              <Text style={styles.loginHint}>
                Remember your password?
              </Text>

              <Text style={styles.loginLink}>
                Back to Login
              </Text>
            </Pressable>
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

  contentWithKeyboard: {
    paddingTop: 8,
    paddingBottom: 36,
  },

  backButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#151D27",
    borderWidth: 1,
    borderColor: "#29313D",
  },

  header: {
    alignItems: "center",
    marginTop: 22,
  },

  iconBox: {
    width: 64,
    height: 64,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E50914",
    marginBottom: 18,
  },

  title: {
    color: "#FFFFFF",
    fontSize: 27,
    fontWeight: "800",
  },

  subtitle: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
    marginTop: 9,
    paddingHorizontal: 18,
  },

  progressRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 28,
  },

  progressItem: {
    flex: 1,
    height: 4,
    borderRadius: 4,
    backgroundColor: "#29313D",
  },

  progressItemActive: {
    backgroundColor: "#E50914",
  },

  stepText: {
    color: "#9CA3AF",
    textAlign: "right",
    fontSize: 11,
    marginTop: 8,
    marginBottom: 15,
  },

  card: {
    padding: 22,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#29313D",
    backgroundColor: "#111821",
  },

  sectionTitle: {
    color: "#FFFFFF",
    fontSize: 20,
    fontWeight: "800",
  },

  sectionDescription: {
    color: "#9CA3AF",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    marginBottom: 22,
  },

  field: {
    gap: 8,
    marginBottom: 17,
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
    paddingHorizontal: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#29313D",
    backgroundColor: "#151D27",
  },

  input: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 15,
  },

  otpInputBox: {
    minHeight: 62,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    paddingHorizontal: 17,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E50914",
    backgroundColor: "#151D27",
  },

  otpInput: {
    flex: 1,
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "800",
    letterSpacing: 10,
    textAlign: "center",
  },

  primaryButton: {
    minHeight: 53,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
    borderRadius: 12,
    backgroundColor: "#E50914",
  },

  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "800",
  },

  secondaryButton: {
    minHeight: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    marginTop: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#57353A",
    backgroundColor: "#1A171D",
  },

  secondaryButtonText: {
    color: "#FF9E98",
    fontSize: 13,
    fontWeight: "700",
  },

  buttonPressed: {
    opacity: 0.85,
  },

  buttonDisabled: {
    opacity: 0.55,
  },

  loginLinkButton: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 5,
    marginTop: 24,
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
});