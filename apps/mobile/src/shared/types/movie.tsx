export interface Movie {
  _id: string;
  title: string;
  description: string;
  genre: string;
  duration: number;
  language?: string;
  director?: string;
  actors?: string[];
  releaseDate?: string;

  poster?: string;
  posterUrl?: string;
  trailer?: string;
  trailerUrl?: string;

  status?: "now_showing" | "coming_soon";
  rating?: number;
  priceFrom?: number;
  isFeatured?: boolean;

  createdAt?: string;
  updatedAt?: string;
}