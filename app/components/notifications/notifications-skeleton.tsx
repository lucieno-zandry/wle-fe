import { Skeleton } from "~/components/ui/skeleton";

export default function NotificationsSkeleton() {
    return (
        <div className="divide-y">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="px-4 py-3 space-y-2"
                >
                    <Skeleton className="h-4 w-3/5" />
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                </div>
            ))}
        </div>
    );
}
