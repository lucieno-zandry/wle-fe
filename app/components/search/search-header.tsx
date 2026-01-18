// components/search/SearchHeader.tsx
import { Search } from "lucide-react";
import { Badge } from "~/components/ui/badge";

interface SearchHeaderProps {
    query: string;
    resultCount: number;
    totalCount: number;
}

export function SearchHeader({ query, resultCount, totalCount }: SearchHeaderProps) {
    const hasFilters = resultCount !== totalCount;

    return (
        <header className="border-b pb-6">
            <div className="flex items-center gap-3 mb-3">
                <Search className="w-6 h-6 text-muted-foreground" />
                <h1 className="text-3xl font-extrabold tracking-tight">
                    Search Results
                </h1>
            </div>
            <div className="flex flex-wrap items-center gap-3">
                <p className="text-muted-foreground text-lg">
                    Showing results for <span className="font-semibold text-foreground">"{query}"</span>
                </p>
                <Badge variant="secondary" className="px-3 py-1 text-sm">
                    {resultCount} {hasFilters && `of ${totalCount}`} {resultCount === 1 ? 'Product' : 'Products'}
                </Badge>
            </div>
        </header>
    );
}