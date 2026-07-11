import { View, Text, TextInput, StyleSheet, KeyboardTypeOptions } from "react-native";

type Props = {
  label: string;
  placeholder: string;
  value: string;
  onChangeText: (val: string) => void;
  multiline?: boolean;
  keyboardType?: KeyboardTypeOptions;
  flex?: number;
};

export default function FormField({
  label,
  placeholder,
  value,
  onChangeText,
  multiline = false,
  keyboardType = "default",
  flex,
}: Props) {
  return (
    <View style={[styles.container, flex !== undefined && { flex }]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={[styles.input, multiline && styles.multiline]}
        placeholder={placeholder}
        placeholderTextColor="#4A5568"
        value={value}
        onChangeText={onChangeText}
        multiline={multiline}
        keyboardType={keyboardType}
        textAlignVertical={multiline ? "top" : "center"}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    color: "#8F98A8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 8,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  input: {
    backgroundColor: "#1A2333",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#222A36",
    color: "#fff",
    fontSize: 15,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  multiline: {
    height: 100,
    paddingTop: 12,
  },
});
