import { apiRequest } from "./api";

import type { Movie } from "../types/movie";

interface FavouriteListResponse {
  success?: boolean;
  message?: string;
  movies?: Array<{ _id?: string; movie?: unknown; movieId?: string }>;
  favourites?: Array<{ _id?: string; movie?: unknown; movieId?: string }>;
}

interface FavouriteActionResponse {
  success?: boolean;
  message?: string;
  favourite?: { _id?: string };
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

export async function getFavouriteMovieIds(): Promise<string[]> {
  const response = await apiRequest<FavouriteListResponse>("/favourites", {
    auth: true,
  });

  const rawItems = response.movies || response.favourites || [];

  return rawItems
    .map((item) => {
      if (typeof item.movie === "object" && item.movie && "_id" in item.movie) {
        return (item.movie as { _id?: string })._id || "";
      }

      return item.movieId || "";
    })
    .filter((movieId): movieId is string => Boolean(movieId));
}

export async function getFavouriteMovies(): Promise<Movie[]> {
  const response = await apiRequest<FavouriteListResponse>("/favourites", {
    auth: true,
  });

  const rawItems = response.movies || response.favourites || [];

  return rawItems
    .map((item) => item.movie)
    .filter(
      (movie): movie is Movie | Partial<Movie> =>
        typeof movie === "object" && movie !== null && "_id" in movie,
    )
    .map(normalizeMovie);
}

export async function addFavourite(movieId: string): Promise<FavouriteActionResponse> {
  return apiRequest<FavouriteActionResponse>("/favourites", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ movieId }),
  });
}

export async function removeFavourite(movieId: string): Promise<FavouriteActionResponse> {
  return apiRequest<FavouriteActionResponse>(`/favourites/${movieId}`, {
    method: "DELETE",
    auth: true,
  });
}

export async function toggleFavourite(movieId: string): Promise<{
  isFavourite: boolean;
  message: string;
}> {
  const existingIds = await getFavouriteMovieIds();

  if (existingIds.includes(movieId)) {
    await removeFavourite(movieId);

    return {
      isFavourite: false,
      message: "Removed from favourites",
    };
  }

  await addFavourite(movieId);

  return {
    isFavourite: true,
    message: "Added to favourites",
  };
}

export const favouriteService = {
  getFavouriteMovieIds,
  getFavouriteMovies,
  addFavourite,
  removeFavourite,
  toggleFavourite,
};
