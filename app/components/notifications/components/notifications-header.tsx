import { useNotificationsStore } from "../stores/use-notifications-store";
import {
  markAllAsRead,
  clearRead,
  loadNotifications,
} from "../actions/notification-actions";

import { Bell, MailOpen, Trash2, RefreshCw } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";

type Props = {
  unreadCount: number;
  readCount: number;
  isLoading: boolean;
  onMarkAllRead: () => void;
  onClearRead: () => void;
  onRefresh: () => void;
};

export function NotificationsHeaderView({
  unreadCount,
  readCount,
  isLoading,
  onMarkAllRead,
  onClearRead,
  onRefresh,
}: Props) {
  return (
    <div className="flex items-center justify-between gap-2 px-3 py-4">
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-violet-600">
          <Bell className="h-4 w-4 text-white" />
        </div>

        <div className="min-w-0">
          <div className="flex items-center gap-1">
            <h1 className="truncate text-sm font-semibold">
              Notifications
            </h1>

            {unreadCount > 0 && (
              <span className="shrink-0 rounded-full bg-violet-500 px-1.5 text-[10px] font-bold text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </div>

          <p className="truncate text-[11px] text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} unread` : "All caught up"}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1 shrink-0">
        {/* Refresh */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
        </Button>

        {/* Dropdown only (no inline text buttons anymore) */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" className="w-44">
            {unreadCount > 0 && (
              <>
                <DropdownMenuItem onClick={onMarkAllRead}>
                  <MailOpen className="mr-2 h-4 w-4" />
                  Mark all as read
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </>
            )}

            <DropdownMenuItem
              onClick={onClearRead}
              disabled={readCount === 0}
              className="text-rose-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear read ({readCount})
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

export function NotificationsHeader() {
  const { unreadCount, notifications, isLoading } = useNotificationsStore();

  const readCount = notifications?.filter((n) => !!n.read_at).length || 0;

  return (
    <NotificationsHeaderView
      unreadCount={unreadCount}
      readCount={readCount}
      isLoading={isLoading}
      onMarkAllRead={markAllAsRead}
      onClearRead={clearRead}
      onRefresh={() => loadNotifications(1)}
    />
  );
}