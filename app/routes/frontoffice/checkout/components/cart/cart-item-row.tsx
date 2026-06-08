// routes/checkout/components/cart/cart-item-row.tsx
import { Minus, Plus, Trash2, Image as ImageIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useTranslation } from "react-i18next";
import PromotionBadge from "./promotion-badge";
import { useFormatMoney } from "~/lib/format-money";
import { useEffect, useRef, useState } from "react";
import useDebounce from "~/hooks/use-debounce";
import { cn } from "~/lib/utils";
import type { CartItem } from "wle-core";

type Props = {
    item: CartItem;
    onQuantityCommit: (newCount: number) => void;
    onRemove: () => void;
    isUpdating?: boolean;
};

export default function CartItemRow({ item, onQuantityCommit, onRemove, isUpdating }: Props) {
    const { t } = useTranslation("checkout");
    const formatMoney = useFormatMoney();
    const { product_snapshot, variant_snapshot, variant_options_snapshot, count, unit_price, promotion_discount_applied, total, applied_promotions_snapshot } = item;
    const [localCount, setLocalCount] = useState(count);
    const debouncedCount = useDebounce(localCount, 450);
    const onQuantityCommitRef = useRef(onQuantityCommit);

    useEffect(() => {
        onQuantityCommitRef.current = onQuantityCommit;
    }, [onQuantityCommit]);

    useEffect(() => {
        setLocalCount(count);
    }, [count]);

    useEffect(() => {
        if (debouncedCount !== count && debouncedCount > 0) {
            onQuantityCommitRef.current(debouncedCount);
        }
    }, [debouncedCount, count]);

    const variantOptionsText = Object.entries(variant_options_snapshot)
        .map(([group, value]) => `${group}: ${value}`)
        .join(" • ");

    return (
        <div className={cn("group flex gap-4 p-4 sm:gap-6 sm:p-6 transition-opacity", isUpdating && "opacity-60 pointer-events-none")}>
            {/* Thumbnail */}
            <div className="relative aspect-square h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0 overflow-hidden rounded-xl border bg-muted/50">
                {product_snapshot.main_image ? (
                    <img
                        src={product_snapshot.main_image}
                        alt={product_snapshot.title}
                        className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
                    />
                ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground">
                        <ImageIcon className="h-6 w-6 opacity-40 mb-1" />
                        <span className="text-[10px] uppercase tracking-wider">{t("cart.no_image")}</span>
                    </div>
                )}
            </div>

            {/* Content Container */}
            <div className="flex flex-1 flex-col justify-between">
                <div className="flex justify-between gap-4">
                    {/* Info */}
                    <div className="space-y-1">
                        <h3 className="line-clamp-2 font-medium text-sm sm:text-base leading-snug">{product_snapshot.title}</h3>
                        <p className="text-xs text-muted-foreground">{variantOptionsText}</p>
                        <p className="text-[11px] uppercase tracking-widest text-muted-foreground/70">SKU: {variant_snapshot.sku}</p>
                    </div>

                    {/* Desktop Price (Hidden on mobile for better flow) */}
                    <div className="hidden sm:flex flex-col items-end text-right">
                        <div className="text-base font-semibold">{formatMoney(total)}</div>
                        <div className="mt-1 flex flex-col items-end gap-1 text-xs text-muted-foreground">
                            {promotion_discount_applied > 0 && (
                                <span className="line-through opacity-70">{formatMoney(unit_price)}</span>
                            )}
                            <span>{formatMoney(unit_price - promotion_discount_applied)} / unit</span>
                        </div>
                    </div>
                </div>

                {/* Actions & Mobile Price */}
                <div className="mt-4 flex items-center justify-between">
                    {/* Quantity Stepper */}
                    <div className="flex items-center gap-1 rounded-full border bg-background p-0.5 shadow-sm">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-muted"
                            disabled={isUpdating || localCount <= 1}
                            onClick={() => setLocalCount((prev) => Math.max(1, prev - 1))}
                        >
                            <Minus className="h-3 w-3" />
                        </Button>
                        <span className="w-8 text-center text-sm font-medium tabular-nums">{localCount}</span>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 rounded-full hover:bg-muted"
                            disabled={isUpdating}
                            onClick={() => setLocalCount((prev) => prev + 1)}
                        >
                            <Plus className="h-3 w-3" />
                        </Button>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* Mobile Price */}
                        <div className="flex flex-col items-end sm:hidden">
                            <span className="text-sm font-semibold">{formatMoney(total)}</span>
                        </div>

                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-full text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                            disabled={isUpdating}
                            onClick={onRemove}
                        >
                            <Trash2 className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Promotions badges */}
                {applied_promotions_snapshot && applied_promotions_snapshot.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {applied_promotions_snapshot.map((promo) => (
                            <PromotionBadge key={promo.id} promotion={promo} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}