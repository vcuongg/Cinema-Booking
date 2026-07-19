import { View, Text, StyleSheet } from "react-native";

import type { DashboardTopMovie } from "@/shared/types/dashboard";

import MovieCard from "./MovieCard";

interface TopMoviesProps {
  movies: DashboardTopMovie[];
}

export default function TopMovies({ movies }: TopMoviesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Top Movies
      </Text>

      {movies.length === 0 ? (
        <Text style={styles.emptyText}>
          No paid bookings yet.
        </Text>
      ) : (
        movies.map((movie, index) => (
          <MovieCard
            key={movie.movieId}
            rank={index + 1}
            title={movie.title}
            sold={movie.ticketsSold}
            revenue={movie.revenue}
            image={movie.poster || movie.posterUrl}
          />
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 20,
  },

  heading: {
    color: "#FFF",
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },

  emptyText: {
    color: "#9AA3B2",
    fontSize: 14,
    textAlign: "center",
    backgroundColor: "#171E29",
    borderWidth: 1,
    borderColor: "#222A36",
    borderRadius: 16,
    paddingVertical: 16,
  },
});
