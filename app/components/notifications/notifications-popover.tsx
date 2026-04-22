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

import { NotificationBell } from "./components/notification-bell";
import { useState } from "react";

/**
 * Notifications Popover
 *
 * Same orchestration logic, but rendered inside a popover.
 */
export function NotificationsPopover() {

    const [open, setOpen] = useState(false);

    return (
        <>
            <NotificationBell onOpen={() => setOpen(true)} />
            <Popover open={open} onOpenChange={setOpen}>
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
                        <div className="overflow-y-auto ">
                            <NotificationList />
                        </div>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
}