import formatMoney from "~/lib/format-money";

interface Variant {
    price: number;
    effective_price?: number;
}

export function PriceDisplay({ variant }: { variant: Variant }) {
    const hasDiscount =
        variant.effective_price !== undefined &&
        variant.effective_price < variant.price;

    return (
        <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold tracking-tight text-foreground">
                {formatMoney(variant.effective_price ?? variant.price)}
            </span>
            {hasDiscount && (
                <span className="text-sm text-muted-foreground line-through">
                    {formatMoney(variant.price)}
                </span>
            )}
        </div>
    );
}