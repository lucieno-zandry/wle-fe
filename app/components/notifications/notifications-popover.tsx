import { useNotifications } from "./hooks/use-notifications";
import { NotificationsHeader } from "./components/notifications-header";
import { NotificationFilterTabs } from "./components/notification-filter-tabs";
import { BulkActionsBar } from "./components/bulk-actions-bar";
import { NotificationList } from "./components/notification-list";

import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "~/components/ui/popover";

import { Button } from "~/components/ui/button";
import { Bell } from "lucide-react";

/**
 * Notifications Popover
 *
 * Same orchestration logic, but rendered inside a popover.
 */
export function NotificationsPopover() {
    useNotifications();

    return (
        <Popover>
            {/* ── Trigger ───────────────────────────────────────────── */}
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Bell className="h-5 w-5" />
                </Button>
            </PopoverTrigger>

            {/* ── Content ───────────────────────────────────────────── */}
            <PopoverContent
                align="end"
                className="w-[380px] p-0 shadow-lg"
            >
                <div className="flex max-h-[500px] flex-col overflow-hidden rounded-xl border bg-card">

                    {/* Header */}
                    <NotificationsHeader />

                    {/* Tabs */}
                    <NotificationFilterTabs />

                    {/* Bulk actions */}
                    <BulkActionsBar />

                    {/* Scrollable list */}
                    <div className="overflow-y-auto">
                        <NotificationList />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}