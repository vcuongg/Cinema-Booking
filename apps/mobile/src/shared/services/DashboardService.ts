import { apiRequest } from "./api";

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

  return data.summary;
}
