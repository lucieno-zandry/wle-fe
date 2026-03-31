import { PackageSearch } from "lucide-react";

export function EmptyState({ hasFilters }: { hasFilters: boolean }) {
    return (
        <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-muted p-6">
                <PackageSearch className="size-10 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground">No products found</h3>
            <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                {hasFilters
                    ? "Try adjusting or clearing your filters to see more results."
                    : "There are no products available at this time."}
            </p>
        </div>
    );
}