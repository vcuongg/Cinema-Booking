export interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string[]
  duration: number;
  director?: string;
  actors?: string[];
  releaseDate?: string;

  posterUrl?: string;
  trailerUrl?: string;
  // Normalized aliases populated by MovieService/FavouriteService for
  // components that display posters/trailers without caring which raw
  // backend field name was used.
  poster?: string;
  trailer?: string;

  status?: "now_showing" | "coming_soon";
  rating?: number;
  priceFrom?: number;
  isFeatured?: boolean;

  createdAt?: string;
  updatedAt?: string;
}