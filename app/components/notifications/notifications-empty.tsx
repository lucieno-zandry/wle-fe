import { BellOff } from "lucide-react";

export default function NotificationsEmpty() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-3 px-4 py-10 text-center">
            <BellOff className="h-8 w-8 text-muted-foreground" />

            <div className="space-y-1">
                <p className="text-sm font-medium">
                    No notifications
                </p>
                <p className="text-xs text-muted-foreground">
                    You’re all caught up 🎉
                </p>
            </div>
        </div>
    );
}
