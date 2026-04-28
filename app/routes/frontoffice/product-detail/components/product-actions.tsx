// routes/frontoffice/product-detail/components/product-actions.tsx

import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Minus, Plus, ShoppingCart } from "lucide-react"; // assuming lucide-react is installed
import { useAddToCart } from "../hooks/use-add-to-cart";
import { useBuyNow } from "../hooks/use-buy-now";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductActionsViewProps {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    onAddToCart: () => void;
    onBuyNow: () => void;
    isDisabled: boolean;
    isOutOfStock: boolean;
}

export function ProductActionsView({
    quantity,
    onIncrease,
    onDecrease,
    onAddToCart,
    onBuyNow,
    isDisabled,
    isOutOfStock,
}: ProductActionsViewProps) {
    return (
        <div className="space-y-4">
            {/* Quantity selector */}
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="icon"
                    disabled={isDisabled || quantity <= 1}
                    onClick={onDecrease}
                >
                    <Minus className="h-4 w-4" />
                </Button>
                <span className="w-8 text-center text-lg font-medium">{quantity}</span>
                <Button
                    variant="outline"
                    size="icon"
                    disabled={isDisabled}
                    onClick={onIncrease}
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
                    Add to Cart
                </Button>
                <Button
                    variant="secondary"
                    className="flex-1"
                    onClick={onBuyNow}
                    disabled={isDisabled}
                >
                    Buy Now
                </Button>
            </div>
            {isOutOfStock && (
                <p className="text-sm text-destructive">This item is currently out of stock.</p>
            )}
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductActionsProps {
    variant: Variant | null;
}

export function ProductActions({ variant }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);
    const addToCart = useAddToCart();
    const buyNow = useBuyNow();

    const isOutOfStock = variant ? variant.stock <= 0 : false;
    const isDisabled = !variant || isOutOfStock;

    const handleAddToCart = () => {
        if (!variant) return;
        addToCart({ variant_id: variant.id, count: quantity });
    };

    const handleBuyNow = () => {
        if (!variant) return;
        buyNow({ variant_id: variant.id, count: quantity });
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
        />
    );
}