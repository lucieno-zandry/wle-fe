// routes/checkout/components/order-summary.tsx
import { useTranslation } from "react-i18next";
import useCheckoutStore from "../stores/use-checkout-store";
import { useFormatMoney } from "~/lib/format-money";
import { AlertCircle, Receipt, Scale, Truck } from "lucide-react";
import { cn } from "~/lib/utils";
import type { CartItem, Coupon } from "wle-core";

type Props = {
    cartItems: CartItem[];
    coupon: Coupon | null;
};

export default function OrderSummary({ cartItems, coupon }: Props) {
    const { t } = useTranslation("checkout");
    const { shippingCost } = useCheckoutStore();
    const formatMoney = useFormatMoney();

    const subtotal = cartItems.reduce((sum, item) => sum + item.total, 0);

    const couponIsApplicable =
        coupon ?
            ((coupon as unknown as { is_applicable?: boolean }).is_applicable ?? subtotal >= coupon.min_order_value)
            : true;

    let couponDiscount = 0;

    if (coupon) {
        if (coupon.type === "FIXED_AMOUNT") {
            couponDiscount = Math.min(coupon.discount, subtotal);
        } else {
            couponDiscount = (subtotal * coupon.discount) / 100;
        }
        couponDiscount = Math.round(couponDiscount * 100) / 100;
    }

    if (!couponIsApplicable) {
        couponDiscount = 0;
    }

    const shipping = shippingCost ?? 0;
    const total = subtotal - couponDiscount + shipping;

    const totalWeightKg = cartItems.reduce((sum, item) => {
        const weight = item.variant_snapshot.weight_kg ?? 0;
        return sum + weight * item.count;
    }, 0);

    return (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-sm sticky top-8">
            <div className="flex items-center gap-2 border-b bg-muted/30 px-6 py-4">
                <Receipt className="h-5 w-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold tracking-tight">{t("summary.title", "Order Summary")}</h2>
            </div>

            <div className="p-6">
                <dl className="space-y-4 text-sm">
                    {/* Subtotal */}
                    <div className="flex justify-between items-center">
                        <dt className="text-muted-foreground">{t("summary.subtotal", "Subtotal")}</dt>
                        <dd className="font-medium text-base">{formatMoney(subtotal)}</dd>
                    </div>

                    {/* Coupon */}
                    {coupon && (
                        <div className="space-y-3">
                            <div className={cn("flex justify-between items-center", couponIsApplicable ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground opacity-50")}>
                                <dt className="flex items-center gap-1">
                                    {t("summary.coupon", "Discount")}
                                    <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400">
                                        {coupon.code}
                                    </span>
                                </dt>
                                <dd className="font-medium">-{formatMoney(couponDiscount)}</dd>
                            </div>

                            {!couponIsApplicable && (
                                <div className="flex items-start gap-2.5 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
                                    <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                                    <span className="leading-relaxed">
                                        {t("summary.coupon_not_applicable", {
                                            min: formatMoney(coupon.min_order_value),
                                            defaultValue: `Add ${formatMoney(coupon.min_order_value - subtotal)} more to use this coupon.`
                                        })}
                                    </span>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Shipping */}
                    <div className="flex justify-between items-center">
                        <dt className="flex items-center gap-2 text-muted-foreground">
                            {t("summary.shipping", "Shipping")}
                        </dt>
                        <dd className="font-medium">
                            {shippingCost !== null ? (
                                shippingCost === 0 ? (
                                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                        <Truck className="h-3 w-3" />
                                        {t("summary.free", "Free")}
                                    </span>
                                ) : (
                                    formatMoney(shippingCost)
                                )
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </dd>
                    </div>

                    {/* Weight */}
                    {totalWeightKg > 0 && (
                        <div className="flex justify-between items-center text-muted-foreground">
                            <dt className="flex items-center gap-2">
                                <Scale className="h-3.5 w-3.5" />
                                {t("summary.weight", "Weight")}
                            </dt>
                            <dd>{totalWeightKg.toFixed(1)} kg</dd>
                        </div>
                    )}

                    {/* Total */}
                    <div className="mt-6 flex items-end justify-between border-t border-dashed pt-6">
                        <dt className="text-base font-semibold text-foreground">{t("summary.total", "Total")}</dt>
                        <dd className="text-2xl font-bold tracking-tight text-foreground">
                            {formatMoney(total)}
                        </dd>
                    </div>
                </dl>
            </div>
        </div>
    );
}