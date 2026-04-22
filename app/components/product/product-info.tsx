import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import { cn } from "~/lib/utils";

import { CheckCircle2, Tag } from "lucide-react";
import type { useFormatMoney } from "~/lib/format-money";

type Props = {
    title: string;
    categoryTitle?: string;
    unitPrice: number;
    originalPrice?: number;
    stock: number;
    appliedPromotions?: AppliedPromotion[];
    t: (key: string) => string;
    formatMoney: ReturnType<typeof useFormatMoney>
};

export function ProductInfo({
    title,
    categoryTitle,
    unitPrice,
    originalPrice,
    stock,
    appliedPromotions = [],
    t,
    formatMoney
}: Props) {
    const inStock = stock > 0;
    const hasDiscount = originalPrice !== undefined && unitPrice < originalPrice;
    const discountPercent = hasDiscount && originalPrice
        ? Math.round(((originalPrice - unitPrice) / originalPrice) * 100)
        : 0;

    return (
        <header className="space-y-4">
            {categoryTitle && (
                <Badge variant="outline" className="rounded-full px-4 py-1 text-muted-foreground border-border">
                    {categoryTitle}
                </Badge>
            )}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
                {title}
            </h1>

            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-foreground">
                        {formatMoney(unitPrice)}
                    </span>
                    {hasDiscount && (
                        <span className="text-xl text-muted-foreground line-through">
                            {formatMoney(originalPrice)}
                        </span>
                    )}
                </div>
                <Separator orientation="vertical" className="h-6 hidden sm:block" />
                <span
                    className={cn(
                        "text-sm font-semibold flex items-center gap-1.5",
                        inStock ? "text-emerald-600 dark:text-emerald-400" : "text-rose-500 dark:text-rose-400"
                    )}
                >
                    {inStock ? (
                        <>
                            <CheckCircle2 className="w-4 h-4" /> {t("inStock")}
                        </>
                    ) : (
                        t("outOfStock")
                    )}
                </span>
            </div>

            {appliedPromotions.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2">
                    {hasDiscount && discountPercent > 0 && (
                        <Badge className="bg-rose-500 text-white border-none px-3 py-1 text-sm font-bold">
                            -{discountPercent}%
                        </Badge>
                    )}
                    {appliedPromotions.map((promo) => (
                        <Badge
                            key={promo.id}
                            variant="secondary"
                            className="flex items-center gap-1 px-3 py-1 text-xs font-medium"
                        >
                            <Tag className="w-3 h-3" />
                            {promo.badge || promo.name}
                        </Badge>
                    ))}
                </div>
            )}
        </header>
    );
}