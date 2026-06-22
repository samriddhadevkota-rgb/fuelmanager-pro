import { apiClient } from "./api-client";

export interface CompanySettings {
  id: string;
  name: string;
  slug: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  country: string;
  postal_code: string | null;
  tax_id: string | null;
  currency: string;
  timezone: string;
  website: string | null;
  tax_rate: number;
  fuel_price_markup: number;
  created_at: string;
  updated_at: string;
}

export const settingsService = {
  get: () => apiClient.get<CompanySettings>("/settings"),
  update: (data: Partial<CompanySettings>) =>
    apiClient.patch<CompanySettings>("/settings", data),
};
