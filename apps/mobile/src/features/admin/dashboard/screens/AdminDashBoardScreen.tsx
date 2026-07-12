import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView } from "react-native";
import { FontAwesome, Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";
import StatCard from "./component/StatCard";
import QuickAction from "../screens/component/QuickAction";
import TopMovies from "./component/TopMovies";

export default function AdminDashBoardScreen() {

  const today = new Date().toLocaleDateString();

  return (
    <View  style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View>
          <Text style={styles.admin}>Admin dasboard</Text>
          <Text style={styles.subtitle}>
        Real-time tracking in {today}
          </Text>
        </View>

        <TouchableOpacity style={styles.searchBtn}>
          <FontAwesome name="user-circle" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.statcards}>
          <StatCard
            icon="cash"
            title="Total Revenue"
            value="$142,850"
          />

          <StatCard
            icon="ticket"
            title="Tickets Sold"
            value="12,402"
          />

          <StatCard
            icon="people"
            title="Active Users"
            value="4,892"
          />
          <QuickAction />
        </View>
        <TopMovies />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0d141d",
    paddingHorizontal: 18,
    paddingTop: 50,
  },

  subtitle: {
    color: "#9AA3B2",
    fontSize: 15,
    marginTop: 6,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  admin: {
    color: "#E50914",
    fontSize: 25,
    fontWeight: "700",
  },

  city: {
    color: "#999",
    marginTop: 2,
  },

  searchBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#1A2333",
    justifyContent: "center",
    alignItems: "center",
  },

  date: {
    color: "#9AA3B2",
    marginTop: 2,
    fontSize: 14,
  },

  statcards: {
    justifyContent: "space-between", 
    marginTop: 20
  }

});
