export function SkeletonCard({ mode }: { mode: "grid" | "list" }) {
    if (mode === "list") {
        return (
            <div className="flex h-[140px] animate-pulse overflow-hidden rounded-xl border border-border/50 bg-card">
                <div className="h-full w-36 shrink-0 bg-muted" />
                <div className="flex flex-1 flex-col justify-between p-4">
                    <div className="space-y-2">
                        <div className="h-4 w-3/4 rounded bg-muted" />
                        <div className="h-3 w-full rounded bg-muted" />
                        <div className="h-3 w-2/3 rounded bg-muted" />
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="h-5 w-20 rounded bg-muted" />
                        <div className="h-8 w-24 rounded-md bg-muted" />
                    </div>
                </div>
            </div>
        );
    }
    return (
        <div className="animate-pulse overflow-hidden rounded-xl border border-border/50 bg-card">
            <div className="h-44 bg-muted" />
            <div className="space-y-3 p-4">
                <div className="h-4 w-3/4 rounded bg-muted" />
                <div className="h-3 w-full rounded bg-muted" />
                <div className="flex items-center justify-between pt-1">
                    <div className="h-5 w-16 rounded bg-muted" />
                    <div className="h-8 w-16 rounded-md bg-muted" />
                </div>
            </div>
        </div>
    );
}