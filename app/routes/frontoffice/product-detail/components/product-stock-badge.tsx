import { Badge } from "~/components/ui/badge";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductStockBadgeViewProps {
    stock: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
}

export function ProductStockBadgeView({
    stock,
    isLowStock,
    isOutOfStock,
}: ProductStockBadgeViewProps) {
    if (isOutOfStock) {
        return <Badge variant="destructive">Out of stock</Badge>;
    }

    if (isLowStock) {
        return (
            <div className="flex items-center gap-2">
                <Badge variant="secondary">Only {stock} left</Badge>
                <span className="text-sm text-muted-foreground">
                    Low stock – order soon
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2">
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                In stock ({stock})
            </Badge>
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductStockBadgeProps {
    variant: Variant | null;
    lowStockThreshold?: number;
}

export function ProductStockBadge({
    variant,
    lowStockThreshold = 5,
}: ProductStockBadgeProps) {
    if (!variant) return null;

    const stock = variant.stock;
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= lowStockThreshold;

    return (
        <ProductStockBadgeView
            stock={stock}
            isLowStock={isLowStock}
            isOutOfStock={isOutOfStock}
        />
    );
}