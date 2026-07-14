import { ActivityIndicator } from "react-native";
import {
  Pressable,
  StyleSheet,
  Text,
} from "react-native";

import { COLORS } from "../constants/colors";

interface PrimaryButtonProps {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}

export function PrimaryButton({
  title,
  onPress,
  loading = false,
  disabled = false,
}: PrimaryButtonProps) {
  const isDisabled = loading || disabled;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.button,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={COLORS.white} />
      ) : (
        <Text style={styles.title}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 52,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: COLORS.primary,
  },

  pressed: {
    opacity: 0.85,
  },

  disabled: {
    opacity: 0.55,
  },

  title: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: "700",
  },
});