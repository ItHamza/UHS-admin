/* eslint-disable @typescript-eslint/no-explicit-any */
import { apiRequest } from "../api";

export const getNotifications = async () => {
  return apiRequest<any>("/notification");
};

export const getNotificationById = async (id: string) => {
  return apiRequest<any>(`/notification/${id}`);
};

export async function updateNotification(data: any) {
  return apiRequest<any>("/notification", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
}

export async function deleteNotification(id: string) {
  return apiRequest<any>(`/notification/${id}`, {
    method: "DELETE",
  });
}
