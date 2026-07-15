export interface DashboardTopMovie {
  movieId: string;
  title: string;
  poster: string;
  ticketsSold: number;
  revenue: number;
}

export interface AdminDashboardSummary {
  totalRevenue: number;
  ticketsSold: number;
  totalBookings: number;
  totalMovies: number;
  totalShowtimes: number;
  totalCustomers: number;
  topMovies: DashboardTopMovie[];
}
