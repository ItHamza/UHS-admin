"use server";
import { deleteNotification, getNotifications, updateNotification } from "@/lib/service/notification";

export default async function NotificationAction() {
  const notifications = await getNotifications();
  return notifications.data;
}

export async function NotificationUpdateAction(data: any) {
  const notifications = await updateNotification(data);
  return notifications.data;
}

export async function notificationDeleteAction(id?: string) {
  const res = await deleteNotification(id || '');
  return res.data;
}
