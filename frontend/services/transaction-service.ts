import { apiClient } from "./api-client";
import type { Transaction } from "@/types";
import type { PaginatedResponse, QueryParams } from "@/types/api";

export interface TransactionCreatePayload {
  customer_id?: string;
  vehicle_id?: string;
  driver_id?: string;
  fuel_tank_id?: string;
  transaction_type: string;
  fuel_type?: string;
  quantity_liters: number;
  unit_price: number;
  payment_method: string;
  mileage_km?: number;
  notes?: string;
}

export const transactionService = {
  async list(
    params?: QueryParams & { transaction_type?: string; payment_status?: string }
  ): Promise<PaginatedResponse<Transaction>> {
    return apiClient.get<PaginatedResponse<Transaction>>("/transactions", params as Record<string, unknown>);
  },

  async get(id: string): Promise<Transaction> {
    return apiClient.get<Transaction>(`/transactions/${id}`);
  },

  async create(data: TransactionCreatePayload): Promise<Transaction> {
    return apiClient.post<Transaction>("/transactions", data);
  },

  async update(id: string, data: Partial<Transaction>): Promise<Transaction> {
    return apiClient.patch<Transaction>(`/transactions/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/transactions/${id}`);
  },
};
