import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCouponFromCode } from "~/api/http-requests";
import formatMoney from "~/lib/format-money";
import { Card } from "../ui/card";
import Button from "../custom-components/button";
import { Input } from "../ui/input";
import { Loader2, TicketPercent, Tag, X } from "lucide-react";
import useCheckoutStore from "~/hooks/use-checkout-store";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type OrderSummaryContainerProps = {
    cartItems: CartItem[];
    itemsCount: number;
    subtotal: number;
    discountAmount: number;
    total: number;
    promotionDiscount: number;
};

export default function ({
    cartItems,
    itemsCount,
    subtotal,
    discountAmount,
    total,
    promotionDiscount
}: OrderSummaryContainerProps) {

    const { appliedCoupon, setAppliedCoupon } = useCheckoutStore();

    const [couponCode, setCouponCode] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const { t } = useTranslation("checkout");

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;

        setIsLoading(true);
        try {
            const res = await getCouponFromCode(couponCode);
            const coupon = res.data?.coupon;

            if (!coupon || !coupon.is_active) {
                toast.error(t('checkout:invalidInactiveCoupon'));
            } else if (subtotal < coupon.min_order_value) {
                toast.error(
                    t('checkout:minOrderValue', {
                        amount: formatMoney(coupon.min_order_value)
                    })
                );
            } else {
                setAppliedCoupon(coupon);
                toast.success(t('checkout:couponApplied', { code: coupon.code }));
                setCouponCode("");
            }
        } catch {
            toast.error(t('checkout:failedFetchCoupon'));
        } finally {
            setIsLoading(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        toast.info(t('checkout:couponRemoved'));
    };

    useEffect(() => {
        if (!appliedCoupon) return;

        const noLongerValid =
            appliedCoupon.min_order_value &&
            subtotal < appliedCoupon.min_order_value;

        if (noLongerValid) {
            setAppliedCoupon(null);

            toast.warning(
                t('checkout:couponRemovedMinValue', {
                    code: appliedCoupon.code,
                    amount: formatMoney(appliedCoupon.min_order_value)
                })
            );
        }
    }, [subtotal, appliedCoupon, setAppliedCoupon, t]);


    return (
        <OrderSummary
            itemsCount={itemsCount}
            subtotal={subtotal}
            total={total}
            couponCode={couponCode}
            appliedCoupon={appliedCoupon}
            discountAmount={discountAmount}
            isLoading={isLoading}
            onCouponCodeChange={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={removeCoupon}
            t={t}
            promotionDiscount={promotionDiscount}
        />
    );
}


type OrderSummaryViewProps = {
    itemsCount: number;
    subtotal: number;
    total: number;

    couponCode: string;
    appliedCoupon: Coupon | null;
    discountAmount: number;
    isLoading: boolean;

    onCouponCodeChange: (value: string) => void;
    onApplyCoupon: () => void;
    onRemoveCoupon: () => void;
    t: TFunction;
    promotionDiscount: number;
};

export function OrderSummary({
    itemsCount,
    subtotal,
    total,
    couponCode,
    appliedCoupon,
    discountAmount,
    isLoading,
    onCouponCodeChange,
    onApplyCoupon,
    onRemoveCoupon,
    t,
    promotionDiscount
}: OrderSummaryViewProps) {
    return (
        <Card className="sticky top-20 p-6 bg-muted/30 border-dashed space-y-6">
            <div>
                <h3 className="font-semibold mb-4 flex items-center gap-2">
                    {t('checkout:orderSummary')}
                </h3>

                <div className="space-y-3 text-sm">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">
                            {t('checkout:items', { count: itemsCount })}
                        </span>
                        <span>{formatMoney(subtotal)}</span>
                    </div>

                    {appliedCoupon && (
                        <div className="flex justify-between text-emerald-600 animate-in fade-in slide-in-from-right-1">
                            <span className="flex items-center gap-1">
                                <TicketPercent className="w-4 h-4" />
                                {t('checkout:discount', { code: appliedCoupon.code })}
                            </span>
                            <span>-{formatMoney(discountAmount)}</span>
                        </div>
                    )}

                    <div className="flex justify-between font-bold text-lg pt-4 border-t border-muted">
                        <span>{t('checkout:total')}</span>
                        <span className="text-primary">{formatMoney(total)}</span>
                    </div>
                </div>
            </div>

            {/* Coupon Section */}
            <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('checkout:haveCoupon')}
                </p>

                {!appliedCoupon ? (
                    <div className="flex gap-2">
                        <Input
                            placeholder={t('checkout:enterCode')}
                            value={couponCode}
                            onChange={(e) =>
                                onCouponCodeChange(e.target.value.toUpperCase())
                            }
                            className="bg-background h-9 text-sm uppercase"
                            onKeyDown={(e) => e.key === "Enter" && onApplyCoupon()}
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onApplyCoupon}
                            disabled={!couponCode}
                            isLoading={isLoading}
                            className="h-9 px-4"
                        >
                            {isLoading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                t('checkout:apply')
                            )}
                        </Button>
                    </div>
                ) : (
                    <div className="flex items-center justify-between p-2 pl-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                        <div className="flex items-center gap-2 text-emerald-700">
                            <Tag className="w-3 h-3" />
                            <span className="text-sm font-bold uppercase">
                                {appliedCoupon.code}
                            </span>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onRemoveCoupon}
                            className="h-6 w-6 text-emerald-700 hover:bg-emerald-100"
                        >
                            <X className="w-3 h-3" />
                        </Button>
                    </div>
                )}

                {promotionDiscount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                        <span className="flex items-center gap-1">
                            <Tag className="w-4 h-4" />
                            Promotion savings
                        </span>
                        <span>-{formatMoney(promotionDiscount)}</span>
                    </div>
                )}
            </div>
        </Card>
    );
}