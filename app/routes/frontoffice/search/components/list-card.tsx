import { useTranslation } from "react-i18next";
import { ShoppingCart, Tag } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { PriceDisplay } from "./price-display";
import { ProductImage } from "./product-image";
import { PromotionPill } from "./promotion-pill";
import { useFormatMoney } from "~/lib/format-money";
import type { Product } from "wle-core";

export function ListCard({ product, onAddToCart }: { product: Product; onAddToCart: (variantId: number) => void }) {
    const { t } = useTranslation("search");
    const defaultVariant = product.variants?.[0];
    const allPromotions = product.variants?.flatMap((v) => v.applied_promotions ?? []) ?? [];
    const uniquePromotions = allPromotions.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
    const isLowStock = defaultVariant && defaultVariant.stock > 0 && defaultVariant.stock <= 5;
    const isOutOfStock = defaultVariant && defaultVariant.stock === 0;
    const formatMoney = useFormatMoney();

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
                        <p className="mt-1.5 line-clamp-2 text-sm text-muted-foreground">{product.description}</p>
                    )}
                </div>

                {uniquePromotions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {uniquePromotions.map((p, key) => (
                            <PromotionPill key={`${p.id}-${key}`} promotion={p} />
                        ))}
                    </div>
                )}

                <div className="flex items-center justify-between gap-4">
                    <div>
                        {defaultVariant ? (
                            <PriceDisplay variant={defaultVariant} formatMoney={formatMoney} />
                        ) : (
                            <span className="text-sm text-muted-foreground">{t("common.no_variants")}</span>
                        )}
                        {isLowStock && (
                            <p className="text-[10px] font-medium text-amber-500">
                                {t("common.low_stock", { count: defaultVariant!.stock })}
                            </p>
                        )}
                        {isOutOfStock && <p className="text-[10px] font-medium text-rose-500">{t("common.out_of_stock")}</p>}
                    </div>

                    <div className="flex items-center gap-2">
                        {product.variants && product.variants.length > 1 && (
                            <span className="text-xs text-muted-foreground">
                                {t("common.variants_count", { count: product.variants.length })}
                            </span>
                        )}
                        {defaultVariant && !isOutOfStock && (
                            <Button size="sm" variant="default" className="h-8 gap-1.5 text-xs" onClick={() => onAddToCart(defaultVariant.id)}>
                                <ShoppingCart className="size-3" />
                                {t("common.add_to_cart")}
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}