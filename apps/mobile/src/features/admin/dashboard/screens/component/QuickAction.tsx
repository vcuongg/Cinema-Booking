import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router, Href } from "expo-router";

type Action = {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  link?: Href;
};

const actions: Action[] = [
  {
    title: "Go to Home",
    icon: "home",
    link: "/home" as Href,
  },
  {
    title: "Manage Movies",
    icon: "film",
    link: "/admin/MoviesManagement" as Href,
  },
  {
    title: "Manage Rooms",
    icon: "grid",
    link: "/admin/RoomsManagement" as Href,
  },
  {
    title: "Manage Cinemas",
    icon: "business",
    link: "/admin/CinemaManagement" as Href,
  },
  {
    title: "Manage Showtimes",
    icon: "time",
    link: "/admin/ShowtimeManagement" as Href,
  },
  {
    title: "Manage Users",
    icon: "people",
    link: "/admin/UserManagement" as Href,
  },
];

export default function QuickAction() {
    return (
        <View style={styles.container}>
            <Text style={styles.heading}>Quick Actions</Text>
                <View style= {styles.grid}>
                    {actions.map((action, index) => (
                        <TouchableOpacity key={index} style={styles.card} activeOpacity={0.8} onPress={() => {
                            if (action.link) {
                                router.push(action.link);
                            }
                            }}
                        >
                             <View style={styles.iconContainer}>
                                <Ionicons
                                    name={action.icon}
                                    size={26}
                                    color="#FF2D2D"
                                />
                                </View>

                                <Text style={styles.title}>
                                    {action.title}
                                </Text>
                        </TouchableOpacity>
                    ))
                        }
                </View>
        </View>

    )
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 10,
  },

  heading: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },

  card: {
    width: "48%",
    backgroundColor: "#171E29",
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#222A36",
  },

  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#2A303B",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },

  title: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
  },
});

