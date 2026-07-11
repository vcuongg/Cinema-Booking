import { useEffect, useState } from 'react';
import { Button, FlatList, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { getMovies } from '@/shared/services/MovieService';
import { Movie } from '@/shared/types/movie';
import { MaterialCommunityIcons, MaterialIcons } from "@expo/vector-icons";
import Feather from '@expo/vector-icons/Feather';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import MovieCard from './component/MovieCard';



export default function MovieManagementScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const LoadMovie = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await getMovies();
      setMovies(data);
    } catch (loadError) {
      const message = loadError instanceof Error ? loadError.message : 'Failed to load movies';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    LoadMovie();
  }, []);

  return (
    <View style={styles.container}>
       <View style={styles.header}>
        <View>
          <Text style={styles.admin}>Admin Panel</Text>
          <Text style={styles.city}>New York, USA</Text>
        </View>

        <TouchableOpacity style={styles.searchBtn}>
          <FontAwesome name="user-circle" size={24} color="black" />
        </TouchableOpacity>
      </View>
      <View style={styles.searchBox}>
        <MaterialIcons
          name="search"
          color="#999"
          size={20}
        />

        <TextInput
          placeholder="Search movies..."
          placeholderTextColor="#666"
          style={styles.input}
        />
      </View>

      <View style={styles.tabs}>
        <TouchableOpacity style={styles.activeTab}>
          <Text style={styles.activeText}>All Movies</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}>
          <Text style={styles.text}>Now Showing</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.tab}>
          <Text style={styles.text}>Coming Soon</Text>
        </TouchableOpacity>
      </View>

        <TouchableOpacity style={styles.button} onPress={() => router.push('/admin/MovieCreate')}>
          <Text style={styles.buttonText}>Add Movie</Text>
        </TouchableOpacity>
       {/* List */}

      <FlatList
        data={movies}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <MovieCard movie={item} />
        )}
        showsVerticalScrollIndicator={false}
      />

    </View>

    
    
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F1724",
    paddingHorizontal: 18,
    paddingTop: 50,
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  admin: {
    color: "#FF3B3B",
    fontSize: 22,
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

  searchBox: {
    marginTop: 25,
    backgroundColor: "#1A2333",
    borderRadius: 15,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
  },

  input: {
    flex: 1,
    color: "white",
    marginLeft: 10,
  },

  tabs: {
    flexDirection: "row",
    marginVertical: 20,
  },

  activeTab: {
    backgroundColor: "#E50914",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 10,
  },

  tab: {
    backgroundColor: "#1A2333",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 18,
    marginRight: 10,
  },

  activeText: {
    color: "white",
    fontWeight: "700",
    fontSize: 12,
  },

  text: {
    color: "#bbb",
    fontSize: 12,
  },

  button: {
  backgroundColor: "#E50914",
  paddingVertical: 14,
  borderRadius: 12,
  alignItems: "center",
  marginBottom: 20,
},

buttonText: {
  color: "#fff",
  fontSize: 16,
  fontWeight: "600",
},
});
