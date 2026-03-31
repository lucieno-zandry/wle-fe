import { ShoppingCart, Tag } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { PriceDisplay } from "./price-display";
import { ProductImage } from "./product-image";
import { PromotionPill } from "./promotion-pill";

export function ListCard({
    product,
    onAddToCart,
}: {
    product: Product;
    onAddToCart: (variantId: number) => void;
}) {
    const defaultVariant = product.variants?.[0];
    const allPromotions =
        product.variants?.flatMap((v) => v.applied_promotions ?? []) ?? [];
    const uniquePromotions = allPromotions.filter(
        (p, i, arr) => arr.findIndex((x) => x.id === p.id) === i
    );
    const isLowStock =
        defaultVariant && defaultVariant.stock > 0 && defaultVariant.stock <= 5;
    const isOutOfStock = defaultVariant && defaultVariant.stock === 0;

    return (
        <Card className="group flex overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-200 hover:shadow-md hover:border-border">
            <ProductImage product={product} compact={false} />

            <CardContent className="flex flex-1 flex-col justify-between gap-3 p-4">
                <div>
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="text-base font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                            {product.title}
                        </h3>
                        {product.category && (
                            <Badge variant="secondary" className="shrink-0 text-[10px]">
                                <Tag className="mr-1 size-2.5" />
                                {product.category.title}
                            </Badge>
                        )}
                    </div>
                    {product.description && (
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">
                            {product.description}
                        </p>
                    )}
                </div>

                {uniquePromotions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {uniquePromotions.map((p) => (
                            <PromotionPill key={p.id} promotion={p} />
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4">
                    <div>
                        {defaultVariant ? (
                            <PriceDisplay variant={defaultVariant} />
                        ) : (
                            <span className="text-sm text-muted-foreground">No variants</span>
                        )}
                        {isLowStock && (
                            <p className="text-[10px] font-medium text-amber-500">
                                Only {defaultVariant!.stock} left
                            </p>
                        )}
                        {isOutOfStock && (
                            <p className="text-[10px] font-medium text-rose-500">
                                Out of stock
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        {product.variants && product.variants.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                                {product.variants.length} variants
                            </span>
                        )}
                        {defaultVariant && !isOutOfStock && (
                            <Button
                                size="sm"
                                variant="default"
                                className="h-8 gap-1.5 text-xs"
                                onClick={() => onAddToCart(defaultVariant.id)}
                            >
                                <ShoppingCart className="size-3" />
                                Add to cart
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}