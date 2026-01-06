import { useNavigate } from "react-router";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Bell } from "lucide-react";
import NotificationsSkeleton from "./notifications-skeleton";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "~/lib/utils";
import NotificationsEmpty from "./notifications-empty";
import { Button } from "../ui/button";
import { SystemItem, TransactionItem } from "./notification-item";

type Props = {
    notifications: AppNotification[] | null;
    onMarkAsRead?: (id: string) => void;
    unreadCount: number;
    onMarkAllAsRead?: () => void;
    onRemove?: (id: string) => void;
};

export function NotificationsPopover({
    unreadCount,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onRemove
}: Props) {
    const navigate = useNavigate();

    const handleAction = (n: AppNotification) => {
        // 1. Mark as read immediately
        onMarkAsRead?.(n.id);

        // 2. Handle Navigation based on type
        if (n.data.notification_type === "transaction") {
            navigate(`/order/${n.data.order_uuid}`);
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative group">
                    <Bell className="h-5 w-5 transition-transform group-hover:rotate-12" />
                    {!!unreadCount && (
                        <div className="absolute -top-1 -right-1 h-5 min-w-[20px] rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center border-2 border-background px-1 animate-in zoom-in">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </div>
                    )}
                </Button>
            </PopoverTrigger>

            <PopoverContent align="end" className="w-96 p-0 shadow-2xl">
                <div className="flex items-center justify-between border-b px-4 py-3 bg-muted/20">
                    <h4 className="text-sm font-semibold text-foreground">Notifications</h4>
                    {unreadCount > 0 && (
                        <button
                            onClick={onMarkAllAsRead}
                            className="text-xs text-primary hover:text-primary/80 font-medium transition-colors"
                        >
                            Mark all as read
                        </button>
                    )}
                </div>

                <ScrollArea className="h-[450px]">
                    {!notifications && <NotificationsSkeleton />}

                    {notifications?.length === 0 && <NotificationsEmpty />}

                    <div className="flex flex-col">
                        {notifications?.map((n) => (
                            <div
                                key={n.id}
                                role="button"
                                tabIndex={0}
                                onClick={() => handleAction(n)}
                                className={cn(
                                    "relative w-full text-left px-4 py-4 transition-all hover:bg-muted/50 border-b last:border-0 cursor-pointer",
                                    !n.read_at && "bg-blue-50/30 dark:bg-blue-900/10"
                                )}
                            >
                                {n.data.notification_type === "transaction" ? (
                                    <TransactionItem
                                        data={n.data}
                                        isUnread={!n.read_at}
                                        onRemove={() => onRemove?.(n.id)}
                                    />
                                ) : (
                                    <SystemItem data={n.data} />
                                )}

                                <div className="mt-2 flex items-center gap-2">
                                    <time className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">
                                        {new Date(n.created_at).toLocaleDateString(undefined, {
                                            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                        })}
                                    </time>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>

                <div className="border-t p-2 bg-muted/5">
                    <Button variant="ghost" className="w-full text-xs h-9 justify-center font-medium" onClick={() => navigate('/notifications')}>
                        View all activity
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}