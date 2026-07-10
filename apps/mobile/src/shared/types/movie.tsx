

export type MovieStatus = | "now_showing" | "coming_soon" | "ended";

export interface Movie { 
    _id: string;
    title: string; 
    description: string; 
    duration: number; 
    genre: string[]; 
    director: string; 
    actors: string[]; 
    posterUrl: string; 
    trailerUrl: string; 
    releaseDate: string; 
    status: MovieStatus; 
    rating: number; 
    priceFrom: number;
    isFeatured: boolean; }