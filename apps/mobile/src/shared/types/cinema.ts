export interface Cinema {
  _id: string;

  cinemaName: string;

  address: string;

  city: string;

  coverPhoto: string;

  totalHalls: number;

  totalCapacity: number;

  isActive: boolean;

  createdAt: string;

  updatedAt: string;
}

export interface CreateCinemaRequest {
  cinemaName: string;

  address: string;

  city: string;

  coverPhoto?: string;

  totalHalls: number;

  totalCapacity: number;

  isActive?: boolean;
}

export interface UpdateCinemaRequest {
  cinemaName?: string;

  address?: string;

  city?: string;

  coverPhoto?: string;

  totalHalls?: number;

  totalCapacity?: number;

  isActive?: boolean;
}