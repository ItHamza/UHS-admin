// src/store/useNotificationStore.ts
import { create } from "zustand";

type Notification = {
  id: string;
  title: string;
  metadata: any;
  createdAt: string;
  read?: boolean;
};

type NotificationStore = {
  notifications: Notification[];
  unreadCount: number;
  page: number;
  hasMore: boolean;

  setNotifications: (data: Notification[]) => void;
  addNotification: (notif: Notification) => void;
  markAsRead: (id: string | number) => void;
  markAllAsRead: () => void;
  fetchNextPage: () => Promise<void>;
};

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: 0,
  page: 1,
  hasMore: true,

  setNotifications: (data) =>
    set({
      notifications: data,
      unreadCount: data.filter((n) => !n.read).length,
    }),

  addNotification: (notif) =>
    set((state) => ({
      notifications: [notif, ...state.notifications],
      unreadCount: notif.read ? state.unreadCount : state.unreadCount + 1,
    })),

  markAsRead: (id) =>
    set((state) => {
      const wasUnread = state.notifications.some((n) => n.id === id && !n.read);
      return {
        notifications: state.notifications.map((n) =>
          n.id === id ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - (wasUnread ? 1 : 0)),
      };
    }),

  markAllAsRead: () =>
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, read: true })),
      unreadCount: 0,
    })),

  fetchNextPage: async () => {
    const { page, notifications } = get();
    const res = await fetch(`/api/notification?page=${page + 1}`);
    const newNotifications = await res.json();

    if (!Array.isArray(newNotifications) || newNotifications.length === 0) {
      set({ hasMore: false });
      return;
    }

    set({
      notifications: [...notifications, ...newNotifications],
      page: page + 1,
    });
  },
}));
