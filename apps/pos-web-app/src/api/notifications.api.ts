import api from "@/lib/api";
import type { NotificationItem } from "@/types/notifications.types";

export const fetchUnreadNotifications = async (): Promise<
  NotificationItem[]
> => {
  const res = await api.get("/notifications");
  return res.data.data;
};

export const fetchUnreadCount = async (): Promise<{ count: number }> => {
  const res = await api.get("/notifications/count");
  return res.data.data;
};

export const markNotificationRead = async (id: number) => {
  const res = await api.patch(`/notifications/${id}/read`);
  return res.data.data;
};

export const markAllNotificationsRead = async () => {
  const res = await api.patch("/notifications/read-all");
  return res.data.data;
};
