import { Movie } from "../types/movie";

// Android emulator: dùng 10.0.2.2 thay vì localhost
// Thiết bị thật/iOS simulator: đổi thành IP LAN của máy (vd: http://192.168.1.100:5001/api)
const API_BASE_URL = 'http://10.0.2.2:5001/api';

export async function getMovies(): Promise<Movie[]> {
	const response = await fetch(`${API_BASE_URL}/movies`);

	if (!response.ok) {
		throw new Error(`Failed to load movies: ${response.status}`);
	}

	const data = (await response.json()) as Movie[];
	return data;
}



