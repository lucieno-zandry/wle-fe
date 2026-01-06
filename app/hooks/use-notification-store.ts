import { create } from "zustand";
import {
    getNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    clearReadNotifications,
    removeNotification,
} from "~/api/http-requests";

type NotificationStore = {
    notifications: AppNotification[] | null;
    unreadCount: number;

    fetchNotifications: () => Promise<void>;
    markAsRead: (id: string) => Promise<void>;
    markAllAsRead: () => Promise<void>;
    clearRead: () => Promise<void>;
    remove: (id: string) => Promise<void>;
};

const useNotificationStore = create<NotificationStore>((set, get) => ({
    notifications: null,
    unreadCount: 0,

    async fetchNotifications() {
        set({ notifications: null }); // loading state
        const res = await getNotifications();

        if (res.data) {
            set({
                notifications: res.data.notifications,
                unreadCount: res.data.unread_count,
            });
        }
    },

    async markAsRead(id) {
        // optimistic update
        set((state) => ({
            notifications: state.notifications?.map((n) =>
                n.id === id ? { ...n, read_at: new Date().toISOString() } : n
            ) ?? null,
            unreadCount: Math.max(0, state.unreadCount - 1),
        }));

        await markNotificationAsRead(id);
    },

    async markAllAsRead() {
        set((state) => ({
            notifications: state.notifications?.map((n) => ({
                ...n,
                read_at: n.read_at ?? new Date().toISOString(),
            })) ?? null,
            unreadCount: 0,
        }));

        await markAllNotificationsAsRead();
    },

    async clearRead() {
        set((state) => ({
            notifications: state.notifications?.filter((n) => !n.read_at) ?? null,
        }));
        await clearReadNotifications();
    },

    async remove(id) {
        set((state) => ({
            notifications: state.notifications?.filter((n) => n.id !== id) ?? null,
        }));
        await removeNotification(id);
    },
}));

export default useNotificationStore;
