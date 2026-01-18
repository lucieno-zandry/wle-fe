// components/products/ProductBadges.tsx
import { Badge } from "~/components/ui/badge";

interface ProductBadgesProps {
    hasSale: boolean;
    discountPercent: number;
    variantCount: number;
}

export function ProductBadges({ hasSale, discountPercent, variantCount }: ProductBadgesProps) {
    return (
        <div className="absolute top-4 left-4 flex flex-col gap-2">
            {hasSale && (
                <Badge className="bg-emerald-500 hover:bg-emerald-600 border-none px-3 py-1 font-bold">
                    -{discountPercent}% OFF
                </Badge>
            )}
            <Badge variant="outline" className="bg-background/80 backdrop-blur-md border-none px-3 py-1 text-xs">
                {variantCount > 1 ? `${variantCount} Options` : 'Single Item'}
            </Badge>
        </div>
    );
}