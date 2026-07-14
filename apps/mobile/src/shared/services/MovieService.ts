import { apiRequest } from "./api";

import type { Movie } from "../types/movie";

interface MoviesResponse {
  success?: boolean;
  count?: number;
  movies: Movie[];
}

interface MovieDetailResponse {
  success?: boolean;
  movie: Movie;
}

const normalizeMovie = (movie: Movie | Partial<Movie>): Movie => {
  const poster =
    (typeof movie.poster === "string" && movie.poster) ||
    (typeof movie.posterUrl === "string" && movie.posterUrl) ||
    "";

  const trailer =
    (typeof movie.trailer === "string" && movie.trailer) ||
    (typeof movie.trailerUrl === "string" && movie.trailerUrl) ||
    "";

  return {
    ...(movie as Movie),
    poster,
    trailer,
  };
};

export async function getMovies(): Promise<Movie[]> {
  const response = await apiRequest<
    Movie[] | MoviesResponse
  >("/movies");

  if (Array.isArray(response)) {
    return response.map(normalizeMovie);
  }

  return (response.movies || []).map(normalizeMovie);
}

export async function getNowShowing(): Promise<Movie[]> {
  const response = await apiRequest<MoviesResponse>(
    "/movies/now-showing",
  );

  return (response.movies || []).map(normalizeMovie);
}

export async function getComingSoon(): Promise<Movie[]> {
  const response = await apiRequest<MoviesResponse>(
    "/movies/coming-soon",
  );

  return (response.movies || []).map(normalizeMovie);
}

export async function getMovieById(
  id: string,
): Promise<Movie> {
  const response = await apiRequest<
    Movie | MovieDetailResponse
  >(`/movies/${id}`);

  if ("movie" in response) {
    return normalizeMovie(response.movie);
  }

  return normalizeMovie(response);
}

export async function searchMovies(
  keyword: string,
): Promise<Movie[]> {
  const encodedKeyword = encodeURIComponent(keyword);

  const response = await apiRequest<MoviesResponse>(
    `/movies/search?keyword=${encodedKeyword}`,
  );

  return (response.movies || []).map(normalizeMovie);
}

export interface CreateMoviePayload {
  title: string;
  description: string;
  genre: string[];
  duration: number;
  releaseDate: string;
  director?: string;
  actors?: string[];
  posterUrl?: string;
  trailerUrl?: string;
  status?: "now_showing" | "coming_soon";
  rating?: number;
  priceFrom?: number;
  isFeatured?: boolean;
}

export async function createMovie(
  payload: CreateMoviePayload,
): Promise<Movie> {
  const response = await apiRequest<MovieDetailResponse>(
    "/movies",
    {
      method: "POST",
      body: JSON.stringify(payload),
      auth: true,
    },
  );

  return normalizeMovie(response.movie);
}

export type UpdateMoviePayload = Partial<CreateMoviePayload>;

export async function updateMovie(
  id: string,
  payload: UpdateMoviePayload,
): Promise<Movie> {
  const response = await apiRequest<MovieDetailResponse>(
    `/movies/${id}`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
      auth: true,
    },
  );

  return normalizeMovie(response.movie);
}

export async function deleteMovie(id: string): Promise<void> {
  await apiRequest<MovieDetailResponse>(`/movies/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export const movieService = {
  getMovies,
  getNowShowing,
  getComingSoon,
  getMovieById,
  searchMovies,
  createMovie,
  updateMovie,
  deleteMovie,
};