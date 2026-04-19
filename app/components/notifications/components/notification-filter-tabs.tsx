import { useNotificationsStore } from "../stores/use-notifications-store";
import { changeFilter } from "../actions/notification-actions";

import { cn } from "~/lib/utils";
import { FILTER_TABS } from "../helpers/notification-helpers";
import type { NotificationFilter } from "../types/notification-types";

type Props = {
  active: NotificationFilter;
  unreadCount: number;
  onChange: (filter: NotificationFilter) => void;
};

export function NotificationFilterTabsView({ active, unreadCount, onChange }: Props) {
  return (
    <div className="flex gap-0.5 overflow-x-auto border-b border-border/50 px-4 custom-scrollbar">
      {FILTER_TABS.map((tab) => {
        const isActive = active === tab.value;
        const showBadge = tab.value === "unread" && unreadCount > 0;

        return (
          <button
            key={tab.value}
            onClick={() => onChange(tab.value)}
            className={cn(
              "relative flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-xs font-medium transition-colors whitespace-nowrap",
              isActive
                ? "border-violet-500 text-violet-600 dark:text-violet-400"
                : "border-transparent text-muted-foreground hover:text-foreground"
            )}
          >
            {tab.label}
            {showBadge && (
              <span className="rounded-full bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold leading-none text-white">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

export function NotificationFilterTabs() {
  const { filter, unreadCount } = useNotificationsStore();

  return (
    <NotificationFilterTabsView
      active={filter}
      unreadCount={unreadCount}
      onChange={changeFilter}
    />
  );
}