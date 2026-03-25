import { Card } from "../ui/card";
import { Skeleton } from "../ui/skeleton";

export function AddressListSkeleton() {
  return (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="relative border-muted opacity-70 shadow-sm">
          <div className="flex items-start gap-4 p-5">
            {/* Checkbox/Radio Skeleton */}
            <Skeleton className="mt-1 h-4 w-4 rounded-sm" />

            <div className="flex-1 space-y-3">
              <div className="flex items-center gap-3">
                {/* Title Skeleton */}
                <Skeleton className="h-5 w-1/4" />
                {/* Badges Skeleton */}
                {i === 1 && <Skeleton className="h-4 w-16 rounded-full" />}
              </div>

              <div className="space-y-2">
                {/* Address Line Skeletons */}
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>

              {/* Phone Skeletons */}
              <div className="pt-2 flex gap-4">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-24 hidden sm:block" />
              </div>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}