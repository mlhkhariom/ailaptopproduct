import { create } from "zustand";

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: "order" | "contact" | "stock" | "payment" | "system";
  read: boolean;
  date: string;
}

interface NotificationStore {
  notifications: Notification[];
  unreadCount: () => number;
  markRead: (id: string) => void;
  markAllRead: () => void;
  dismiss: (id: string) => void;
}

export const useNotificationStore = create<NotificationStore>((set, get) => ({
  notifications: [],
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  dismiss: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));
