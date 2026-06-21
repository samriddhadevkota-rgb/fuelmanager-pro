import { apiClient } from "./api-client";
import type { AuthTokens } from "@/types";
import type { MessageResponse } from "@/types/api";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  company_name: string;
}

export const authService = {
  async login(payload: LoginPayload): Promise<AuthTokens> {
    const tokens = await apiClient.post<AuthTokens>("/auth/login", payload);
    apiClient.setTokens(tokens.access_token, tokens.refresh_token);
    return tokens;
  },

  async register(payload: RegisterPayload): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>("/auth/register", payload);
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post<MessageResponse>("/auth/logout");
    } finally {
      apiClient.clearTokens();
    }
  },

  async forgotPassword(email: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>("/auth/forgot-password", { email });
  },

  async resetPassword(token: string, password: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>("/auth/reset-password", { token, password });
  },

  async verifyEmail(token: string): Promise<MessageResponse> {
    return apiClient.post<MessageResponse>("/auth/verify-email", { token });
  },
};
