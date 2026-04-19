import { Skeleton } from "~/components/ui/skeleton";

function SkeletonItem() {
    return (
        <div className="flex items-start gap-3 border-b border-border/30 px-4 py-4 last:border-0">
            <Skeleton className="mt-0.5 h-3.5 w-3.5 rounded" />
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
                <div className="flex justify-between gap-4">
                    <Skeleton className="h-3 w-24" />
                    <Skeleton className="h-3 w-12" />
                </div>
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-20" />
            </div>
        </div>
    );
}

export function NotificationListSkeleton({ count = 6 }: { count?: number }) {
    return (
        <div>
            {Array.from({ length: count }).map((_, i) => (
                <SkeletonItem key={i} />
            ))}
        </div>
    );
}