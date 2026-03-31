import { RotateCcw, SlidersHorizontal } from "lucide-react";
import { useSearchStore, type PriceRange, type SearchFilters, type SortOption, SORT_OPTIONS } from "~/hooks/use-search-store";
import { cn } from "~/lib/utils";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { ScrollArea } from "../ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";
import { Slider } from "../ui/slider";
import { getCurrencySymbol } from "~/lib/format-money";
import { FilterSection } from "./filter-section";

export interface FilterSidebarViewProps {
    filters: SearchFilters;
    priceRangeMeta: PriceRange | null;
    priceRangeLoading: boolean;
    categories: Category[];
    categoriesLoading: boolean;
    sortOptions: SortOption[];
    activeFiltersCount: number;
    onFilterChange: <K extends keyof SearchFilters>(
        key: K,
        value: SearchFilters[K]
    ) => void;
    onReset: () => void;
    currencySymbol: string;
}

export function FilterSidebarView({
    filters,
    priceRangeMeta,
    priceRangeLoading,
    categories,
    categoriesLoading,
    sortOptions,
    activeFiltersCount,
    onFilterChange,
    onReset,
    currencySymbol,
}: FilterSidebarViewProps) {
    const priceValues = [
        filters.min_price ?? priceRangeMeta?.min ?? 0,
        filters.max_price ?? priceRangeMeta?.max ?? 1000,
    ];

    return (
        <aside className="flex h-full flex-col bg-card border-r border-border/60">
            <div className="flex items-center justify-between border-b border-border/60 px-5 py-4">
                <div className="flex items-center gap-2">
                    <SlidersHorizontal className="size-4 text-primary" />
                    <span className="font-semibold text-foreground">Filters</span>
                    {activeFiltersCount > 0 && (
                        <Badge variant="default" className="h-5 rounded-full px-1.5 text-[10px]">
                            {activeFiltersCount}
                        </Badge>
                    )}
                </div>
                {activeFiltersCount > 0 && (
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 gap-1 text-xs text-muted-foreground hover:text-foreground"
                        onClick={onReset}
                    >
                        <RotateCcw className="size-3" />
                        Reset
                    </Button>
                )}
            </div>

            <ScrollArea className="flex-1 px-5">
                <div className="divide-y divide-border/40 py-2">

                    <FilterSection title="Sort by">
                        <Select
                            value={String(filters.sortIndex)}
                            onValueChange={(v) => onFilterChange("sortIndex", Number(v))}
                        >
                            <SelectTrigger className="h-9 text-sm">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {sortOptions.map((opt, i) => (
                                    <SelectItem key={i} value={String(i)}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FilterSection>

                    <FilterSection title="Category">
                        {categoriesLoading ? (
                            <div className="space-y-2">
                                {[1, 2, 3].map((i) => (
                                    <div key={i} className="h-8 animate-pulse rounded-md bg-muted" />
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col gap-1">
                                <button
                                    onClick={() => onFilterChange("category_id", undefined)}
                                    className={cn(
                                        "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                                        filters.category_id === undefined
                                            ? "bg-primary text-primary-foreground"
                                            : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                    )}
                                >
                                    All categories
                                    {filters.category_id === undefined && (
                                        <span className="size-1.5 rounded-full bg-primary-foreground" />
                                    )}
                                </button>
                                {categories.map((cat) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => onFilterChange("category_id", cat.id)}
                                        className={cn(
                                            "flex items-center justify-between rounded-md px-3 py-2 text-sm transition-colors",
                                            filters.category_id === cat.id
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-accent hover:text-foreground"
                                        )}
                                    >
                                        {cat.title}
                                        {filters.category_id === cat.id && (
                                            <span className="size-1.5 rounded-full bg-primary-foreground" />
                                        )}
                                    </button>
                                ))}
                            </div>
                        )}
                    </FilterSection>

                    <FilterSection title="Price range">
                        {priceRangeLoading ? (
                            <div className="h-10 animate-pulse rounded-md bg-muted" />
                        ) : priceRangeMeta ? (
                            <div className="space-y-4">
                                <Slider
                                    min={priceRangeMeta.min}
                                    max={priceRangeMeta.max}
                                    step={priceRangeMeta.step}
                                    value={priceValues}
                                    onValueChange={([min, max]) => {
                                        onFilterChange("min_price", min === priceRangeMeta.min ? undefined : min);
                                        onFilterChange("max_price", max === priceRangeMeta.max ? undefined : max);
                                    }}
                                    className="mt-2"
                                />
                                <div className="flex items-center justify-between">
                                    <div className="flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm">
                                        {currencySymbol}{priceValues[0]}
                                    </div>
                                    <span className="text-xs text-muted-foreground">to</span>
                                    <div className="flex h-9 items-center rounded-md border border-input bg-background px-3 text-sm">
                                        {currencySymbol}{priceValues[1]}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <p className="text-xs text-muted-foreground">
                                Price range not available
                            </p>
                        )}
                    </FilterSection>

                </div>
            </ScrollArea>
        </aside>
    );
}

export function FilterSidebar() {
    const filters = useSearchStore((s) => s.filters);
    const priceRangeMeta = useSearchStore((s) => s.priceRangeMeta);
    const priceRangeLoading = useSearchStore((s) => s.priceRangeLoading);
    const categories = useSearchStore((s) => s.categories);
    const categoriesLoading = useSearchStore((s) => s.categoriesLoading);
    const getActiveFiltersCount = useSearchStore((s) => s.getActiveFiltersCount);
    const setFilter = useSearchStore((s) => s.setFilter);
    const resetFilters = useSearchStore((s) => s.resetFilters);
    const currencySymbol = getCurrencySymbol();

    return (
        <FilterSidebarView
            filters={filters}
            priceRangeMeta={priceRangeMeta}
            priceRangeLoading={priceRangeLoading}
            categories={categories}
            categoriesLoading={categoriesLoading}
            sortOptions={SORT_OPTIONS}
            activeFiltersCount={getActiveFiltersCount()}
            onFilterChange={setFilter}
            onReset={resetFilters}
            currencySymbol={currencySymbol}
        />
    );
}