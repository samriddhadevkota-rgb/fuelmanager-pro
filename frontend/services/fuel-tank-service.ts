import { apiClient } from "./api-client";
import type { FuelTank, TankRefill } from "@/types";
import type { PaginatedResponse } from "@/types/api";

export const fuelTankService = {
  async list(): Promise<PaginatedResponse<FuelTank>> {
    return apiClient.get<PaginatedResponse<FuelTank>>("/fuel-tanks", { per_page: 100 } as Record<string, unknown>);
  },

  async get(id: string): Promise<FuelTank> {
    return apiClient.get<FuelTank>(`/fuel-tanks/${id}`);
  },

  async getLowStock(): Promise<FuelTank[]> {
    return apiClient.get<FuelTank[]>("/fuel-tanks/low-stock");
  },

  async create(data: Partial<FuelTank>): Promise<FuelTank> {
    return apiClient.post<FuelTank>("/fuel-tanks", data);
  },

  async update(id: string, data: Partial<FuelTank>): Promise<FuelTank> {
    return apiClient.patch<FuelTank>(`/fuel-tanks/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/fuel-tanks/${id}`);
  },

  async addRefill(tankId: string, data: Partial<TankRefill>): Promise<TankRefill> {
    return apiClient.post<TankRefill>(`/fuel-tanks/${tankId}/refills`, data);
  },
};
