import { useEffect, useCallback } from "react";
import { useNotificationsStore } from "../stores/use-notifications-store";
import {
  loadNotifications,
  changeFilter,
  loadMore,
} from "../actions/notification-actions";
import type { NotificationFilter } from "../types/notification-types";

export function useNotifications() {
  const store = useNotificationsStore();

  // Initial load
  useEffect(() => {
    if (!store.notifications)
      loadNotifications(1);
  }, [store.notifications]);

  const handleFilterChange = useCallback((filter: NotificationFilter) => {
    changeFilter(filter);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (!store.isLoadingMore && store.currentPage < store.totalPages) {
      loadMore();
    }
  }, [store.isLoadingMore, store.currentPage, store.totalPages]);

  const hasMore = store.currentPage < store.totalPages;
  const hasUnread = store.unreadCount > 0;
  const readCount = store.notifications?.filter((n) => !!n.read_at).length;
  const selectedArray = Array.from(store.selectedIds);
  const allSelected =
    store.notifications && store.notifications.length > 0 &&
    store.notifications.every((n) => store.selectedIds.has(n.id));

  return {
    ...store,
    selectedArray,
    hasMore,
    hasUnread,
    readCount,
    allSelected,
    handleFilterChange,
    handleLoadMore,
  };
}