import { apiClient } from "./api-client";
import type { PaginatedResponse } from "@/types/api";

export interface Driver {
  id: string;
  first_name: string;
  last_name: string;
  full_name: string;
  email: string | null;
  phone: string | null;
  license_number: string | null;
  license_expiry: string | null;
  employee_id: string | null;
  status: string;
  vehicle_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface DriverCreate {
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  license_number?: string;
  license_expiry?: string;
  employee_id?: string;
  status?: string;
}

export interface DriverUpdate extends Partial<DriverCreate> {}

export const driverService = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Driver>>("/drivers", params),
  get: (id: string) => apiClient.get<Driver>(`/drivers/${id}`),
  create: (data: DriverCreate) => apiClient.post<Driver>("/drivers", data),
  update: (id: string, data: DriverUpdate) => apiClient.patch<Driver>(`/drivers/${id}`, data),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/drivers/${id}`),
};
