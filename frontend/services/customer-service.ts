import { apiClient } from "./api-client";
import type { Customer } from "@/types";
import type { PaginatedResponse, QueryParams } from "@/types/api";

export const customerService = {
  async list(params?: QueryParams & { customer_type?: string }): Promise<PaginatedResponse<Customer>> {
    return apiClient.get<PaginatedResponse<Customer>>("/customers", params as Record<string, unknown>);
  },

  async get(id: string): Promise<Customer> {
    return apiClient.get<Customer>(`/customers/${id}`);
  },

  async create(data: Partial<Customer>): Promise<Customer> {
    return apiClient.post<Customer>("/customers", data);
  },

  async update(id: string, data: Partial<Customer>): Promise<Customer> {
    return apiClient.patch<Customer>(`/customers/${id}`, data);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/customers/${id}`);
  },
};
