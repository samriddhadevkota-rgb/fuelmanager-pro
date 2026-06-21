import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
} from "axios";
import { API_BASE_URL } from "@/lib/constants";

class ApiClient {
  private readonly client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/api/v1`,
      headers: { "Content-Type": "application/json" },
      timeout: 30_000,
    });

    this.client.interceptors.request.use((config) => {
      const token = this.getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (res) => res,
      async (error) => {
        const original = error.config as AxiosRequestConfig & {
          _retry?: boolean;
        };
        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;
          try {
            const refreshToken = this.getRefreshToken();
            if (!refreshToken) throw new Error("No refresh token");
            const { data } = await this.client.post("/auth/refresh", {
              refresh_token: refreshToken,
            });
            this.setTokens(data.access_token, data.refresh_token);
            original.headers = {
              ...original.headers,
              Authorization: `Bearer ${data.access_token}`,
            };
            return this.client(original);
          } catch {
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
            }
          }
        }
        return Promise.reject(error);
      }
    );
  }

  private getAccessToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("access_token");
  }

  private getRefreshToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("refresh_token");
  }

  setTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("refresh_token", refreshToken);
    document.cookie = `fuel_session=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }

  clearTokens(): void {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    document.cookie = "fuel_session=; path=/; max-age=0";
  }

  async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const res: AxiosResponse<T> = await this.client.get(url, { params });
    return res.data;
  }

  async post<T>(url: string, data?: unknown): Promise<T> {
    const res: AxiosResponse<T> = await this.client.post(url, data);
    return res.data;
  }

  async patch<T>(url: string, data?: unknown): Promise<T> {
    const res: AxiosResponse<T> = await this.client.patch(url, data);
    return res.data;
  }

  async put<T>(url: string, data?: unknown): Promise<T> {
    const res: AxiosResponse<T> = await this.client.put(url, data);
    return res.data;
  }

  async delete<T>(url: string): Promise<T> {
    const res: AxiosResponse<T> = await this.client.delete(url);
    return res.data;
  }
}

export const apiClient = new ApiClient();
