import { View, Text, StyleSheet } from "react-native";
import MovieCard from "./MovieCard";

const movies = [
  {
    title: "Avengers: Endgame",
    sold: 1250,
    image:
      "https://image.tmdb.org/t/p/w500/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
  },
  {
    title: "Spider-Man: No Way Home",
    sold: 980,
    image:
      "https://image.tmdb.org/t/p/w500/1g0dhYtq4irTY1GPXvft6k4YLjm.jpg",
  },
  {
    title: "The Batman",
    sold: 740,
    image:
      "https://image.tmdb.org/t/p/w500/74xTEgt7R36Fpooo50r9T25onhq.jpg",
  },
];

export default function TopMovies() {
  return (
    <View style={styles.container}>
      <Text style={styles.heading}>
        Top Movies
      </Text>

      {movies.map((movie, index) => (
        <MovieCard
          key={index}
          title={movie.title}
          sold={movie.sold}
          image={movie.image}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
  },

  heading: {
    color: "#FFF",
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
  },
});