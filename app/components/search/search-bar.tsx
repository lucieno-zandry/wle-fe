import { Search, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useSearchStore } from "~/hooks/use-search-store";
import { Input } from "../ui/input";
import { cn } from "~/lib/utils";

export interface SearchBarViewProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export function SearchBarView({
    value,
    onChange,
    placeholder = "Search products…",
    className,
}: SearchBarViewProps) {
    return (
        <div className={cn("relative flex items-center", className)}>
            <Search className="absolute left-3 size-4 text-muted-foreground pointer-events-none" />
            <Input
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                className="h-10 pl-9 pr-9 text-sm"
            />
            {value && (
                <button
                    onClick={() => onChange("")}
                    className="absolute right-3 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="size-4" />
                </button>
            )}
        </div>
    );
}

export function SearchBar({ className }: { className?: string }) {
    const storeSearch = useSearchStore((s) => s.filters.search);
    const setFilter = useSearchStore((s) => s.setFilter);

    const [localValue, setLocalValue] = useState(storeSearch);

    useEffect(() => {
        setLocalValue(storeSearch);
    }, [storeSearch]);

    useEffect(() => {
        const id = setTimeout(() => {
            if (localValue !== storeSearch) {
                setFilter("search", localValue);
            }
        }, 400);
        return () => clearTimeout(id);
    }, [localValue]);

    const handleChange = useCallback((value: string) => {
        setLocalValue(value);
    }, []);

    return (
        <SearchBarView
            value={localValue}
            onChange={handleChange}
            className={className}
        />
    );
}