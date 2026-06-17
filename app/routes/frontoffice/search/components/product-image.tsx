import { ImageOff } from "lucide-react";
import { cn } from "~/lib/utils";
import { PromotionPill } from "./promotion-pill";
import type { Product } from "wle-core";

export function ProductImage({
    product,
    compact,
}: {
    product: Product;
    compact?: boolean;
}) {
    const firstImage = product.images?.[0];
    const promotions =
        product.variants?.flatMap((v) => v.applied_promotions ?? []) ?? [];

    return (
        <div
            className={cn(
                "relative overflow-hidden bg-white dark:bg-muted flex items-center justify-center p-4",
                compact ? "aspect-square w-full rounded-t-xl" : "h-52 w-36 shrink-0 rounded-l-xl"
            )}
        >
            {firstImage ? (
                <img
                    src={firstImage.url}
                    alt={product.title}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
            ) : (
                <ImageOff className="size-8 text-muted-foreground/40" />
            )}

            {promotions.length > 0 && (
                <div className="absolute left-2 top-2 flex flex-wrap gap-1">
                    {promotions.slice(0, 3).map((p, k) => (
                        <PromotionPill key={`${k}${p.id}`} promotion={p} />
                    ))}
                </div>
            )}

            {product.category && (
                <div className="absolute bottom-2 right-2">
                    <span className="rounded-full bg-background/80 px-2 py-0.5 text-[10px] font-medium text-foreground/80 backdrop-blur-sm">
                        {product.category.title}
                    </span>
                </div>
            )}
        </div>
    );
}