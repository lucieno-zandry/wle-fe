// components/search/SearchFilters.tsx
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import { Slider } from "~/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { X, SlidersHorizontal } from "lucide-react";
import formatMoney from "~/lib/format-money";
import type { ProductSortKey } from "~/lib/product-sort-map";

interface SearchFiltersProps {
    sortBy: ProductSortKey;
    onSortByChange: (value: ProductSortKey) => void;
    priceRange: [number, number];
    onPriceRangeChange: (range: [number, number]) => void;
    onSaleOnly: boolean;
    onSaleOnlyChange: (value: boolean) => void;
    onClearFilters: () => void;
}


export function SearchFilters({
    sortBy,
    onSortByChange,
    priceRange,
    onPriceRangeChange,
    onSaleOnly,
    onSaleOnlyChange,
    onClearFilters,
}: SearchFiltersProps) {
    const hasActiveFilters =
        sortBy !== 'relevance' ||
        onSaleOnly ||
        priceRange[0] > 0 ||
        priceRange[1] < 10000;

    return (
        <div className="space-y-6">
            {/* Sort */}
            <Card className="p-4">
                <h3 className="font-bold mb-4">Sort By</h3>
                <Select value={sortBy} onValueChange={onSortByChange}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="relevance">Relevance</SelectItem>
                        <SelectItem value="price-low">Price: Low to High</SelectItem>
                        <SelectItem value="price-high">Price: High to Low</SelectItem>
                        <SelectItem value="name-asc">Name: A to Z</SelectItem>
                        <SelectItem value="name-desc">Name: Z to A</SelectItem>
                    </SelectContent>
                </Select>
            </Card>

            {/* Price */}
            <Card className="p-4">
                <h3 className="font-bold mb-4">Price Range</h3>
                <Slider
                    value={priceRange}
                    min={0}
                    max={10000}
                    step={10}
                    onValueChange={(v) => onPriceRangeChange(v as [number, number])}
                />
                <div className="flex justify-between text-sm mt-2">
                    <span>{formatMoney(priceRange[0])}</span>
                    <span>{formatMoney(priceRange[1])}</span>
                </div>
            </Card>

            {/* On sale */}
            <Card className="p-4">
                <div className="flex items-center gap-2">
                    <Checkbox
                        checked={onSaleOnly}
                        onCheckedChange={(v) => onSaleOnlyChange(Boolean(v))}
                    />
                    <Label>Show only items on sale</Label>
                </div>
            </Card>

            {hasActiveFilters && (
                <Button variant="outline" onClick={onClearFilters}>
                    <X className="w-4 h-4 mr-2" />
                    Clear Filters
                </Button>
            )}
        </div>
    );
}
