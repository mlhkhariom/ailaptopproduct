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
  notifications: [
    { id: "1", title: "New Order Received", message: "Order #APC-008 from Karan Mehta — ₹2,499", type: "order", read: false, date: "2024-01-22" },
    { id: "2", title: "Contact Query", message: "Sunita Gupta — Payment issue (High Priority)", type: "contact", read: false, date: "2024-01-22" },
    { id: "3", title: "Low Stock Alert", message: "Triphala Capsules — Only 3 units left", type: "stock", read: false, date: "2024-01-21" },
    { id: "4", title: "Payment Failed", message: "Order #APC-007 — ₹1,833 (Razorpay)", type: "payment", read: false, date: "2024-01-22" },
    { id: "5", title: "Bhringraj Oil Out of Stock", message: "0 units remaining — restock needed", type: "stock", read: true, date: "2024-01-20" },
    { id: "6", title: "New Customer Registered", message: "Deepa Iyer joined from Bangalore", type: "system", read: true, date: "2024-01-19" },
  ],
  unreadCount: () => get().notifications.filter((n) => !n.read).length,
  markRead: (id) => set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) })),
  markAllRead: () => set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) })),
  dismiss: (id) => set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
}));
