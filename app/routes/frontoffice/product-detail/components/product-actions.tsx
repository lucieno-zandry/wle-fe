// routes/frontoffice/product-detail/components/product-actions.tsx

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react";
import { useAddToCart } from "../hooks/use-add-to-cart";
import { useBuyNow } from "../hooks/use-buy-now";
import { useTranslation } from "react-i18next";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductActionsViewProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
    isDisabled: boolean;
    isOutOfStock: boolean;
    // Translated strings
    addToCartLabel: string;
    buyNowLabel: string;
    outOfStockMessage: string;
}

export function ProductActionsView({
    quantity,
    onIncrease,
    onDecrease,
    onAddToCart,
    onBuyNow,
    isDisabled,
    isOutOfStock,
    addToCartLabel,
    buyNowLabel,
    outOfStockMessage,
}: ProductActionsViewProps) {
    return (
        <div className="space-y-4 rounded-lg border bg-card p-4 sm:p-5">
            {/* Quantity selector */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={isDisabled || quantity <= 1}
                    onClick={onDecrease}
                    className="h-10 w-10"
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-10 text-center text-lg font-medium">{quantity}</span>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={isDisabled}
                    onClick={onIncrease}
                    className="h-10 w-10"
                >
                    <Plus className="h-4 w-4" />
                </Button>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
                <Button
                    className="flex-1 gap-2"
                    onClick={onAddToCart}
                    disabled={isDisabled}
                >
                    <ShoppingCart className="h-4 w-4" />
                    {addToCartLabel}
                </Button>
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onBuyNow}
                    disabled={isDisabled}
                >
                    {buyNowLabel}
                </Button>
            </div>
            {isOutOfStock && (
                <p className="text-sm text-destructive">{outOfStockMessage}</p>
            )}
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductActionsProps {
    variant: Variant | null;
    couponCode: string;
}

export function ProductActions({ variant, couponCode }: ProductActionsProps) {
    const { t } = useTranslation("product-detail");
    const [quantity, setQuantity] = useState(1);
    const addToCart = useAddToCart();
    const buyNow = useBuyNow();

    const isOutOfStock = variant ? variant.stock <= 0 : false;
    const isDisabled = buyNow.loading || !variant || isOutOfStock;

    const handleAddToCart = () => {
        if (!variant) return;
        addToCart({ variant_id: variant.id, count: quantity });
    };

    const handleBuyNow = () => {
        if (!variant) return;
        buyNow({
            variants: [{
                variant_id: variant.id,
                count: quantity
            }], coupon_code: couponCode
        });
    };

    const increase = () => setQuantity((q) => q + 1);
    const decrease = () => setQuantity((q) => Math.max(1, q - 1));

    return (
        <ProductActionsView
            quantity={quantity}
            onIncrease={increase}
            onDecrease={decrease}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isDisabled={isDisabled}
            isOutOfStock={isOutOfStock}
            addToCartLabel={t("actions.addToCart")}
            buyNowLabel={t("actions.buyNow")}
            outOfStockMessage={t("actions.outOfStockMessage")}
        />
    );
}