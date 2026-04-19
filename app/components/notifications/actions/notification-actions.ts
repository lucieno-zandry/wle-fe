import {
  getNotifications,
  getUnreadNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  removeNotification,
  clearReadNotifications,
} from "~/api/http-requests";
import { useNotificationsStore } from "../stores/use-notifications-store";
import { toast } from "sonner";
import type { NotificationFilter } from "../types/notification-types";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getStore() {
  return useNotificationsStore.getState();
}

function filterMatchesType(filter: NotificationFilter, notificationType: string): boolean {
  if (filter === "all" || filter === "unread") return true;
  return notificationType === filter;
}

// ─── Fetch ───────────────────────────────────────────────────────────────────

export async function loadNotifications(page = 1) {
  const store = getStore();
  const isFirstPage = page === 1;

  if (isFirstPage) {
    store.setLoading(true);
    store.setError(null);
  } else {
    store.setLoadingMore(true);
  }

  try {
    const res = await getNotifications({ page, per_page: 20 });

    if (!res.data) {
      throw new Error(res.error?.message ?? "Failed to load notifications");
    }

    const { notifications, unread_count } = res.data;

    if (isFirstPage) {
      store.setNotifications(notifications.data, unread_count, notifications.last_page, page);
    } else {
      store.appendNotifications(notifications.data, notifications.last_page, page);
    }
  } catch (err: any) {
    const msg = err?.message ?? "Could not load notifications";
    store.setError(msg);
    if (!isFirstPage) {
      toast.error(msg);
    }
  } finally {
    store.setLoading(false);
    store.setLoadingMore(false);
  }
}

export async function loadUnreadNotifications(page = 1) {
  const store = getStore();
  const isFirstPage = page === 1;

  if (isFirstPage) {
    store.setLoading(true);
    store.setError(null);
  } else {
    store.setLoadingMore(true);
  }

  try {
    const res = await getUnreadNotifications({ page, per_page: 20 });

    if (!res.data) {
      throw new Error(res.error?.message ?? "Failed to load notifications");
    }

    const { notifications, count } = res.data;

    if (isFirstPage) {
      store.setNotifications(notifications.data, count, notifications.last_page, page);
    } else {
      store.appendNotifications(notifications.data, notifications.last_page, page);
    }
  } catch (err: any) {
    const msg = err?.message ?? "Could not load unread notifications";
    store.setError(msg);
    if (!isFirstPage) toast.error(msg);
  } finally {
    store.setLoading(false);
    store.setLoadingMore(false);
  }
}

// ─── Mark single as read ─────────────────────────────────────────────────────

export async function markAsRead(id: string) {
  const store = getStore();
  const notification = store.notifications?.find((n) => n.id === id);

  // Already read — no-op
  if (notification?.read_at) return;

  // Optimistic update
  store.addPending(id);
  store.optimisticMarkRead(id);

  try {
    const res = await markNotificationAsRead(id);
    if (!res.data) throw new Error("Failed to mark as read");
    // Server confirms — update with real data
    store.confirmMarkRead(id, res.data.notification);
  } catch {
    // Rollback
    store.rollbackMarkRead(id);
    toast.error("Could not mark notification as read");
  } finally {
    store.removePending(id);
  }
}

// ─── Mark all as read ────────────────────────────────────────────────────────

export async function markAllAsRead() {
  const store = getStore();
  const unreadIds = store.notifications
    ?.filter((n) => !n.read_at)
    .map((n) => n.id) || [];

  if (unreadIds.length === 0) return;

  // Optimistic: mark all unread as read instantly
  store.optimisticMarkAllRead();

  try {
    const res = await markAllNotificationsAsRead();
    if (!res.data) throw new Error("Failed to mark all as read");
    toast.success("All notifications marked as read");
  } catch {
    // Rollback
    store.rollbackMarkAllRead(unreadIds);
    toast.error("Could not mark all as read. Please try again.");
  }
}

// ─── Remove single notification ───────────────────────────────────────────────

export async function deleteNotification(id: string) {
  const store = getStore();
  const snapshot = store.notifications?.find((n) => n.id === id);
  if (!snapshot) return;

  // Optimistic: remove from list immediately
  store.addPending(id);
  store.optimisticRemove(id);

  try {
    const res = await removeNotification(id);
    if (!res.data) throw new Error("Failed to delete notification");
    store.confirmRemove(id);
  } catch {
    // Rollback: put it back
    if (snapshot) store.rollbackRemove(snapshot);
    toast.error("Could not delete notification");
  } finally {
    store.removePending(id);
  }
}

// ─── Clear all read notifications ────────────────────────────────────────────

export async function clearRead() {
  const store = getStore();
  const readNotifications = store.notifications?.filter((n) => !!n.read_at) || [];

  if (readNotifications.length === 0) {
    toast.info("No read notifications to clear");
    return;
  }

  // Optimistic
  store.optimisticClearRead();

  try {
    const res = await clearReadNotifications();
    if (!res.data) throw new Error("Failed to clear read notifications");
    toast.success(`Cleared ${readNotifications.length} read notification${readNotifications.length !== 1 ? "s" : ""}`);
  } catch {
    // Rollback
    store.rollbackClearRead(readNotifications);
    toast.error("Could not clear read notifications");
  }
}

// ─── Filter change ────────────────────────────────────────────────────────────

export async function changeFilter(filter: NotificationFilter) {
  const store = getStore();
  store.setFilter(filter);
  store.clearSelection();

  if (filter === "unread") {
    await loadUnreadNotifications(1);
  } else {
    await loadNotifications(1);
  }
}

// ─── Load more (pagination) ───────────────────────────────────────────────────

export async function loadMore() {
  const store = getStore();
  const nextPage = store.currentPage + 1;
  if (nextPage > store.totalPages) return;

  if (store.filter === "unread") {
    await loadUnreadNotifications(nextPage);
  } else {
    await loadNotifications(nextPage);
  }
}

// ─── Selection helpers ────────────────────────────────────────────────────────

export function toggleSelection(id: string) {
  useNotificationsStore.getState().toggleSelected(id);
}

export function selectAll() {
  const store = getStore();
  const allIds = store.notifications?.map((n) => n.id) || [];
  store.selectAll(allIds);
}

export function clearSelection() {
  useNotificationsStore.getState().clearSelection();
}

// ─── Bulk actions ─────────────────────────────────────────────────────────────

export async function bulkMarkAsRead(ids: string[]) {
  if (ids.length === 0) return;

  // Fire all in parallel — optimistic per item
  await Promise.allSettled(ids.map((id) => markAsRead(id)));
  useNotificationsStore.getState().clearSelection();
  toast.success(`Marked ${ids.length} notification${ids.length !== 1 ? "s" : ""} as read`);
}

export async function bulkDelete(ids: string[]) {
  if (ids.length === 0) return;

  const store = getStore();
  const snapshots = store.notifications?.filter((n) => ids.includes(n.id));

  // Optimistic: remove all at once
  ids.forEach((id) => {
    store.addPending(id);
    store.optimisticRemove(id);
  });
  store.clearSelection();

  try {
    await Promise.all(ids.map((id) => removeNotification(id)));
    ids.forEach((id) => {
      store.confirmRemove(id);
      store.removePending(id);
    });
    toast.success(`Deleted ${ids.length} notification${ids.length !== 1 ? "s" : ""}`);
  } catch {
    // Rollback all
    snapshots?.forEach((n) => store.rollbackRemove(n));
    ids.forEach((id) => store.removePending(id));
    toast.error("Could not delete selected notifications");
  }
}