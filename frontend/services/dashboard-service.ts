import { apiClient } from "./api-client";
import type { DashboardMetrics } from "@/types";

export const dashboardService = {
  async getMetrics(): Promise<DashboardMetrics> {
    return apiClient.get<DashboardMetrics>("/dashboard/metrics");
  },
};
