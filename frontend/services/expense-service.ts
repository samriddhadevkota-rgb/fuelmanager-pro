import { apiClient } from "./api-client";
import type { PaginatedResponse } from "@/types/api";

export interface Expense {
  id: string;
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  vendor: string | null;
  payment_method: string;
  reference_number: string | null;
  notes: string | null;
  is_recurring: boolean;
  status: string;
  created_at: string;
}

export interface ExpenseCreate {
  category: string;
  description: string;
  amount: number;
  expense_date: string;
  vendor?: string;
  payment_method?: string;
  reference_number?: string;
  notes?: string;
  is_recurring?: boolean;
}

export const expenseService = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Expense>>("/expenses", params),
  get: (id: string) => apiClient.get<Expense>(`/expenses/${id}`),
  create: (data: ExpenseCreate) => apiClient.post<Expense>("/expenses", data),
  update: (id: string, data: Partial<ExpenseCreate>) =>
    apiClient.patch<Expense>(`/expenses/${id}`, data),
  delete: (id: string) => apiClient.delete<{ message: string }>(`/expenses/${id}`),
};
