import { useTranslation } from "react-i18next";
import { ShoppingCart } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { PriceDisplay } from "./price-display";
import { ProductImage } from "./product-image";
import { PromotionPill } from "./promotion-pill";
import { useFormatMoney } from "~/lib/format-money";
import type { Product } from "wle-core";

export function GridCard({ product, onAddToCart }: { product: Product; onAddToCart: (variantId: number) => void }) {
    const { t } = useTranslation("search");
    const defaultVariant = product.variants?.[0];
    const allPromotions = product.variants?.flatMap((v) => v.applied_promotions ?? []) ?? [];
    const uniquePromotions = allPromotions.filter((p, i, arr) => arr.findIndex((x) => x.id === p.id) === i);
    const isLowStock = defaultVariant && defaultVariant.stock > 0 && defaultVariant.stock <= 5;
    const isOutOfStock = defaultVariant && defaultVariant.stock === 0;
    const formatMoney = useFormatMoney();

    return (
        <Card className="group relative flex flex-col overflow-hidden border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-border">
            <ProductImage product={product} compact />
            <CardContent className="flex flex-1 flex-col gap-3 p-4">
                <div>
                    <h3 className="line-clamp-2 text-sm font-semibold leading-snug text-foreground group-hover:text-primary transition-colors">
                        {product.title}
                    </h3>
                    {product.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
                    )}
                </div>

                {uniquePromotions.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                        {uniquePromotions.map((p, key) => (
                            <PromotionPill key={`${p.id}-${key}`} promotion={p} />
                        ))}
                    </div>
                )}

                <div className="mt-auto flex items-end justify-between gap-2">
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

                    {defaultVariant && !isOutOfStock && (
                        <Button
                            size="sm"
                            variant="default"
                            className="h-8 shrink-0 gap-1.5 text-xs"
                            onClick={(e) => {
                                e.stopPropagation();
                                onAddToCart(defaultVariant.id);
                            }}
                        >
                            <ShoppingCart className="size-3" />
                            {t("common.add")}
                        </Button>
                    )}
                </div>

                {product.variants && product.variants.length > 1 && (
                    <p className="text-[10px] text-muted-foreground">
                        {t("common.more_variants", { count: product.variants.length - 1 })}
                    </p>
                )}
            </CardContent>
        </Card>
    );
}