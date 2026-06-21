import { apiClient } from "./api-client";
import type { Invoice } from "@/types";
import type { PaginatedResponse, QueryParams } from "@/types/api";

export interface InvoiceLineItemPayload {
  description: string;
  quantity: number;
  unit: string;
  unit_price: number;
}

export interface InvoiceCreatePayload {
  customer_id: string;
  issue_date: string;
  due_date: string;
  tax_rate?: number;
  discount_amount?: number;
  notes?: string;
  terms?: string;
  line_items: InvoiceLineItemPayload[];
}

export const invoiceService = {
  async list(params?: QueryParams & { status?: string }): Promise<PaginatedResponse<Invoice>> {
    return apiClient.get<PaginatedResponse<Invoice>>("/invoices", params as Record<string, unknown>);
  },

  async get(id: string): Promise<Invoice> {
    return apiClient.get<Invoice>(`/invoices/${id}`);
  },

  async create(data: InvoiceCreatePayload): Promise<Invoice> {
    return apiClient.post<Invoice>("/invoices", data);
  },

  async update(id: string, data: Partial<Invoice>): Promise<Invoice> {
    return apiClient.patch<Invoice>(`/invoices/${id}`, data);
  },

  async send(id: string): Promise<Invoice> {
    return apiClient.post<Invoice>(`/invoices/${id}/send`);
  },

  async delete(id: string): Promise<void> {
    await apiClient.delete(`/invoices/${id}`);
  },
};
