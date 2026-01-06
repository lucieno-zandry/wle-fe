import { useEffect } from "react";
import useNotificationStore from "~/hooks/use-notification-store";
import { NotificationsPopover } from "./notifications-popover";

export default function Notifications() {
  const {
    notifications,
    unreadCount,
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    remove
  } = useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <NotificationsPopover
      notifications={notifications}
      unreadCount={unreadCount}
      onMarkAsRead={markAsRead}
      onMarkAllAsRead={markAllAsRead}
      onRemove={remove}
    />
  );
}
