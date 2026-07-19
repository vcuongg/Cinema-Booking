import { apiRequest, resolveAssetUrl } from "./api";

import type { AdminDashboardSummary } from "@/shared/types/dashboard";

interface AdminSummaryResponse {
  success?: boolean;
  summary: AdminDashboardSummary;
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const data = await apiRequest<AdminSummaryResponse>("/bookings/admin/summary", {
    method: "GET",
    auth: true,
  });

  return {
    ...data.summary,
    topMovies: (data.summary.topMovies || []).map((movie) => {
      const poster = resolveAssetUrl(movie.poster || movie.posterUrl) || "";

      return {
        ...movie,
        poster,
        posterUrl: poster,
      };
    }),
  };
}
