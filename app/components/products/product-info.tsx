// components/products/ProductInfo.tsx
import { Link } from "react-router";
import { CardContent } from "~/components/ui/card";
import formatMoney from "~/lib/format-money";

interface ProductInfoProps {
    title: string;
    slug: string;
    categoryTitle?: string;
    displayPrice?: number;
    originalPrice?: number;
    hasSale: boolean;
}

export function ProductInfo({
    title,
    slug,
    categoryTitle,
    displayPrice,
    originalPrice,
    hasSale
}: ProductInfoProps) {
    return (
        <CardContent className="pt-4 px-1 pb-2">
            <div className="space-y-1">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">
                    {categoryTitle || 'General'}
                </p>
                <Link to={`/product/${slug}`} className="block">
                    <h3 className="text-lg font-bold group-hover:text-primary transition-colors line-clamp-1">
                        {title}
                    </h3>
                </Link>

                <div className="flex items-center gap-2 pt-1">
                    <span className="text-xl font-extrabold text-foreground">
                        {displayPrice ? formatMoney(displayPrice) : "—"}
                    </span>
                    {hasSale && originalPrice && (
                        <span className="text-sm text-muted-foreground line-through">
                            {formatMoney(originalPrice)}
                        </span>
                    )}
                </div>
            </div>
        </CardContent>
    );
}
