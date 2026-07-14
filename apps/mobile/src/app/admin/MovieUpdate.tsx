import { Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";

import MovieUpdateScreen from "@/features/admin/movies/screens/MovieUpdate";

export default function MovieUpdateRoute() {
  const { id } = useLocalSearchParams<{ id: string }>();

  if (!id) {
    return (
      <View style={{ flex: 1, backgroundColor: "#0d141d", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#E50914" }}>Missing movie id</Text>
      </View>
    );
  }

  return <MovieUpdateScreen movieId={id} />;
}
