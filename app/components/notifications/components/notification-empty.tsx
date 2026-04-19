import { useNotificationsStore } from "../stores/use-notifications-store";
import { changeFilter } from "../actions/notification-actions";

import { Bell, BellOff, Filter } from "lucide-react";
import { Button } from "~/components/ui/button";
import type { NotificationFilter } from "../types/notification-types";

type Props = {
  filter: NotificationFilter;
  onClearFilter: () => void;
};

export function NotificationEmptyView({ filter, onClearFilter }: Props) {
  const isFiltered = filter !== "all";

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-16 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
        {isFiltered ? (
          <Filter className="h-7 w-7 text-muted-foreground" />
        ) : (
          <BellOff className="h-7 w-7 text-muted-foreground" />
        )}
      </div>

      <div className="space-y-1">
        <p className="text-base font-semibold text-foreground">
          {isFiltered ? "No notifications in this category" : "You're all caught up"}
        </p>
        <p className="text-sm text-muted-foreground">
          {isFiltered
            ? "Try switching to a different filter to see more"
            : "New notifications will appear here as they arrive"}
        </p>
      </div>

      {isFiltered && (
        <Button variant="outline" size="sm" onClick={onClearFilter} className="gap-2">
          <Bell className="h-3.5 w-3.5" />
          Show all notifications
        </Button>
      )}
    </div>
  );
}

export function NotificationEmpty() {
  const { filter } = useNotificationsStore();

  return (
    <NotificationEmptyView
      filter={filter}
      onClearFilter={() => changeFilter("all")}
    />
  );
}