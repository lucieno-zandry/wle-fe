import { useFetcher } from "react-router";
import { Button } from "~/components/ui/button";
import { Loader2, ShoppingCart } from "lucide-react";

import type { TFunction } from "i18next";
import type { useFormatMoney } from "~/lib/format-money";

type Props = {
    selectedVariant?: Variant | null;
    quantity: number;
    subtotal: number;
    isSubmitting: boolean;
    onBuyNow: () => void;
    t: TFunction;
    fetcher: ReturnType<typeof useFetcher>;
    formatMoney: ReturnType<typeof useFormatMoney>
};

export function CartActions({
    selectedVariant,
    quantity,
    subtotal,
    isSubmitting,
    onBuyNow,
    t,
    fetcher,
    formatMoney
}: Props) {
    const inStock = selectedVariant && selectedVariant.stock > 0;
    const effectivePrice = selectedVariant?.effective_price ?? selectedVariant?.price ?? 0;
    const hasDiscount = selectedVariant && effectivePrice < selectedVariant.price;

    return (
        <div className="p-6 rounded-[2.5rem] border border-border bg-card/50 space-y-6">
            <div className="space-y-3">
                <fetcher.Form method="post">
                    <input type="hidden" name="variant_id" value={selectedVariant?.id || ""} />
                    <input type="hidden" name="count" value={quantity} />
                    <Button
                        type="submit"
                        className="w-full h-16 rounded-2xl text-lg font-bold shadow-lg bg-foreground text-background hover:bg-foreground/90 transition-all"
                        disabled={!inStock || isSubmitting}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                            <div className="flex items-center justify-between w-full px-2">
                                <div className="flex items-center">
                                    <ShoppingCart className="w-5 h-5 mr-3" />
                                    <span>{t("addToCart")}</span>
                                </div>
                                <span className="text-sm opacity-80">{formatMoney(subtotal)}</span>
                            </div>
                        )}
                    </Button>
                </fetcher.Form>

                <Button
                    variant="outline"
                    onClick={onBuyNow}
                    className="w-full h-16 rounded-2xl text-lg font-bold border-2 border-border hover:border-foreground transition-all"
                    disabled={!inStock || isSubmitting}
                >
                    {t("buyNow")}
                </Button>
            </div>

            {hasDiscount && (
                <p className="text-center text-xs text-green-600 dark:text-green-400 font-medium italic">
                    {t("partnerDiscount", {
                        amount: formatMoney(selectedVariant.price - effectivePrice),
                    })}
                </p>
            )}
        </div>
    );
}