// routes/frontoffice/product-detail/components/product-actions.tsx
import { type Dispatch, type SetStateAction } from "react";
import { Button } from "~/components/ui/button";
import { Minus, Plus, ShoppingCart, Zap } from "lucide-react";
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
    addToCartLabel: string;
    buyNowLabel: string;
    outOfStockMessage: string;
    canIncrement: boolean;
    canDecrement: boolean;
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
    canDecrement,
    canIncrement
}: ProductActionsViewProps) {
    return (
        <div className="space-y-3">
            {/* Quantity + Add to Cart row */}
            <div className="flex gap-3">
                {/* Quantity selector */}
                <div className="flex items-center rounded-xl border border-input bg-background overflow-hidden shrink-0">
                    <button
                        disabled={!canDecrement}
                        onClick={onDecrease}
                        className="flex h-11 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-10 text-center text-sm font-semibold text-foreground select-none">
                        {quantity}
                    </span>
                    <button
                        disabled={!canIncrement}
                        onClick={onIncrease}
                        className="flex h-11 w-10 items-center justify-center text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        <Plus className="h-3.5 w-3.5" />
                    </button>
                </div>

                {/* Add to Cart */}
                <Button
                    variant="secondary"
                    className="flex-1 h-11 gap-2 rounded-xl font-medium text-sm transition-all duration-150 shadow-none"
                    onClick={onAddToCart}
                    disabled={isDisabled}
                >
                    <ShoppingCart className="h-4 w-4" />
                    {addToCartLabel}
                </Button>
            </div>

            {/* Buy Now — full width, primary accent */}
            <Button
                variant="default"
                className="w-full h-11 rounded-xl font-semibold text-sm gap-2 transition-all duration-150"
                onClick={onBuyNow}
                disabled={isDisabled}
            >
                <Zap className="h-4 w-4" />
                {buyNowLabel}
            </Button>

            {isOutOfStock && (
                <p className="text-xs text-destructive text-center font-medium">{outOfStockMessage}</p>
            )}
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductActionsProps {
    variant: Variant | null;
    couponCode: string;
    quantity: number;
    setQuantity: Dispatch<SetStateAction<number>>;
}

export function ProductActions({ variant, couponCode, quantity, setQuantity }: ProductActionsProps) {
    const { t } = useTranslation("product-detail");
    const addToCart = useAddToCart();
    const buyNow = useBuyNow();

    const isOutOfStock = variant ? variant.stock <= 0 : false;
    const isDisabled = buyNow.loading || !variant || isOutOfStock;

    const canIncrement = !isDisabled && variant.stock > quantity;
    const canDecrement = !isDisabled && quantity > 1;

    const handleAddToCart = () => {
        if (!variant) return;
        addToCart({ variant_id: variant.id, count: quantity });
    };

    const handleBuyNow = () => {
        if (!variant) return;
        buyNow({
            variants: [{ variant_id: variant.id, count: quantity }],
            coupon_code: couponCode,
        });
    };

    return (
        <ProductActionsView
            quantity={quantity}
            onIncrease={() => canIncrement && setQuantity((q) => q + 1)}
            onDecrease={() => canDecrement && setQuantity((q) => Math.max(1, q - 1))}
            onAddToCart={handleAddToCart}
            onBuyNow={handleBuyNow}
            isDisabled={isDisabled}
            isOutOfStock={isOutOfStock}
            addToCartLabel={t("actions.addToCart")}
            buyNowLabel={t("actions.buyNow")}
            outOfStockMessage={t("actions.outOfStockMessage")}
            canIncrement={canIncrement}
            canDecrement={canDecrement}
        />
    );
}