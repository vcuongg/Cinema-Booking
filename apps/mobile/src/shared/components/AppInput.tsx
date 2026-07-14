import { Ionicons } from "@expo/vector-icons";
import {
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { COLORS } from "../constants/colors";

interface AppInputProps {
  label: string;
  value: string;
  placeholder: string;
  onChangeText: (value: string) => void;
  icon?: keyof typeof Ionicons.glyphMap;
  secureTextEntry?: boolean;
  keyboardType?: "default" | "email-address" | "numeric";
  autoCapitalize?: "none" | "sentences" | "words";
}

export function AppInput({
  label,
  value,
  placeholder,
  onChangeText,
  icon = "person-outline",
  secureTextEntry = false,
  keyboardType = "default",
  autoCapitalize = "none",
}: AppInputProps) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name={icon}
          size={19}
          color={COLORS.textMuted}
        />

        <TextInput
          value={value}
          placeholder={placeholder}
          placeholderTextColor={COLORS.textMuted}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          style={styles.input}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: 8,
  },

  label: {
    color: COLORS.text,
    fontSize: 13,
    fontWeight: "600",
  },

  inputContainer: {
    minHeight: 52,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    paddingHorizontal: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 12,
    backgroundColor: COLORS.input,
  },

  input: {
    flex: 1,
    color: COLORS.white,
    fontSize: 15,
  },
});