import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

const ATTRIBUTES = ["IMAX", "3D Support", "Dolby Audio", "4DX"];

type Props = {
  selected: string[];
  onChange: (val: string[]) => void;
};

export default function AttributePicker({ selected, onChange }: Props) {
  const toggle = (attr: string) => {
    if (selected.includes(attr)) {
      onChange(selected.filter((a) => a !== attr));
    } else {
      onChange([...selected, attr]);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>ATTRIBUTES</Text>
      <View style={styles.grid}>
        {ATTRIBUTES.map((attr) => {
          const active = selected.includes(attr);
          return (
            <TouchableOpacity
              key={attr}
              style={[styles.tag, active && styles.tagActive]}
              onPress={() => toggle(attr)}
              activeOpacity={0.7}
            >
              <Text style={[styles.tagText, active && styles.tagTextActive]}>
                {attr}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  label: {
    color: "#8F98A8",
    fontSize: 13,
    fontWeight: "600",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  tag: {
    backgroundColor: "#1A2333",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#222A36",
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  tagActive: {
    backgroundColor: "#E50914",
    borderColor: "#E50914",
  },
  tagText: {
    color: "#8F98A8",
    fontSize: 14,
    fontWeight: "500",
  },
  tagTextActive: {
    color: "#fff",
  },
});
