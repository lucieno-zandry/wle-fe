// routes/frontoffice/product-detail/components/product-stock-badge.tsx
import { useTranslation } from "react-i18next";
import { AlertTriangle, CheckCircle2, XCircle, Package } from "lucide-react";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductStockBadgeViewProps {
    stock: number;
    isLowStock: boolean;
    isOutOfStock: boolean;
    outOfStockLabel: string;
    onlyLeftTemplate: string;
    lowStockMessage: string;
    inStockTemplate: string;
}

export function ProductStockBadgeView({
    stock,
    isLowStock,
    isOutOfStock,
    outOfStockLabel,
    onlyLeftTemplate,
    lowStockMessage,
    inStockTemplate,
}: ProductStockBadgeViewProps) {
    if (isOutOfStock) {
        return (
            <div className="flex items-center gap-2 rounded-lg bg-destructive/10 border border-destructive/20 px-3 py-2 text-sm text-destructive w-fit">
                <XCircle className="h-4 w-4 shrink-0" />
                <span className="font-medium">{outOfStockLabel}</span>
            </div>
        );
    }

    if (isLowStock) {
        return (
            <div className="flex items-center gap-2 rounded-lg bg-yellow-500/10 border border-yellow-500/20 px-3 py-2 text-sm text-yellow-600 dark:text-yellow-400 w-fit">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>
                    <span className="font-semibold">{onlyLeftTemplate.replace("{{stock}}", String(stock))}</span>
                    {" "}
                    <span className="opacity-90">{lowStockMessage}</span>
                </span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 rounded-lg bg-green-500/10 border border-green-500/20 px-3 py-2 text-sm text-green-600 dark:text-green-400 w-fit">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <span className="font-medium">{inStockTemplate.replace("{{stock}}", String(stock))}</span>
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
    const { t } = useTranslation("product-detail");

    if (!variant) return null;

    const stock = variant.stock;
    const isOutOfStock = stock <= 0;
    const isLowStock = stock > 0 && stock <= lowStockThreshold;

    return (
        <ProductStockBadgeView
            stock={stock}
            isLowStock={isLowStock}
            isOutOfStock={isOutOfStock}
            outOfStockLabel={t("stock.outOfStock")}
            onlyLeftTemplate={t("stock.onlyLeft")}
            lowStockMessage={t("stock.lowStockMessage")}
            inStockTemplate={t("stock.inStock")}
        />
    );
}