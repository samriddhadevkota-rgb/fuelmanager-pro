import { apiClient } from "./api-client";
import type { PaginatedResponse } from "@/types/api";

export interface Notification {
  id: string;
  title: string;
  message: string;
  notification_type: string;
  is_read: boolean;
  read_at: string | null;
  action_url: string | null;
  created_at: string;
}

export const notificationService = {
  list: (params?: Record<string, unknown>) =>
    apiClient.get<PaginatedResponse<Notification>>("/notifications", params),
  unreadCount: () => apiClient.get<{ unread_count: number }>("/notifications/unread-count"),
  markRead: (ids: string[]) =>
    apiClient.post<{ message: string }>("/notifications/mark-read", { notification_ids: ids }),
  markAllRead: () => apiClient.post<{ message: string }>("/notifications/mark-all-read"),
};
