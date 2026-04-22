import { useEffect, useState } from "react";
import { toast } from "sonner";
import { getCouponFromCode } from "~/api/http-requests";
import { fetchAvailableShippingMethods } from "~/api/http-requests"; // adjust import

import { Card } from "../ui/card";
import Button from "../custom-components/button";
import { Input } from "../ui/input";
import { Loader2, TicketPercent, Tag, X } from "lucide-react";
import useCheckoutStore from "~/hooks/use-checkout-store";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import useAddressStore from "~/hooks/use-address-store";
import { useFormatMoney } from "~/lib/format-money";

type OrderSummaryContainerProps = {
    cartItems: CartItem[];
    itemsCount: number;
    subtotal: number;
    discountAmount: number;
    total: number; // this is subtotal - discount (pre‑shipping)
    promotionDiscount: number;
    loading: boolean,
    onPlaceOrder: () => void;
};

export default function ({
    cartItems,
    itemsCount,
    subtotal,
    discountAmount,
    total,
    promotionDiscount,
    ...props
}: OrderSummaryContainerProps) {

    const { appliedCoupon, setAppliedCoupon, selectedShipping, setSelectedShipping } = useCheckoutStore();
    const { selectedAddressId } = useAddressStore();
    const [couponCode, setCouponCode] = useState("");
    const [isLoadingCoupon, setIsLoadingCoupon] = useState(false);
    const [shippingOptions, setShippingOptions] = useState<{ method: ShippingMethod; cost: number }[]>([]);
    const [isLoadingShipping, setIsLoadingShipping] = useState(false);
    const { t } = useTranslation("checkout");
    const formatMoney = useFormatMoney();

    // --- Coupon logic (unchanged) ---
    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsLoadingCoupon(true);
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
            setIsLoadingCoupon(false);
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

    // --- Shipping logic ---
    // Prepare cart items for shipping API
    const shippingCartItems = cartItems.map(item => ({
        weight: item.variant_snapshot?.weight_kg ?? 0,
        quantity: item.count,
        price: item.unit_price
    }));

    useEffect(() => {
        if (!selectedAddressId || shippingCartItems.length === 0) {
            setShippingOptions([]);
            setSelectedShipping(null);
            return;
        }

        const fetchShipping = async () => {
            setIsLoadingShipping(true);
            try {
                const response = await fetchAvailableShippingMethods({
                    address_id: selectedAddressId,
                    cart_items: shippingCartItems
                });
                // response.data is { method: ShippingMethod, cost: number }[]
                const options = response.data!;
                setShippingOptions(options);
                if (options.length > 0) {
                    setSelectedShipping(options[0]); // auto-select first
                } else {
                    setSelectedShipping(null);
                }
            } catch (error) {
                console.error("Failed to fetch shipping methods", error);
                toast.error(t('checkout:shippingFetchError'));
                setShippingOptions([]);
                setSelectedShipping(null);
            } finally {
                setIsLoadingShipping(false);
            }
        };

        fetchShipping();
    }, [selectedAddressId, cartItems]); // re-fetch when address or cart changes

    // Compute final total: pre‑shipping total + selected shipping cost
    const shippingCost = selectedShipping?.cost ?? 0;
    const finalTotal = total + shippingCost;

    return (
        <OrderSummary
            itemsCount={itemsCount}
            subtotal={subtotal}
            total={finalTotal}
            couponCode={couponCode}
            appliedCoupon={appliedCoupon}
            discountAmount={discountAmount}
            isLoadingCoupon={isLoadingCoupon}
            onCouponCodeChange={setCouponCode}
            onApplyCoupon={handleApplyCoupon}
            onRemoveCoupon={removeCoupon}
            t={t}
            promotionDiscount={promotionDiscount}
            shippingOptions={shippingOptions}
            selectedShipping={selectedShipping}
            isLoadingShipping={isLoadingShipping}
            onSelectShipping={setSelectedShipping}
            formatMoney={formatMoney}
            {...props}
        />
    );
}

// --- View Props ---
type OrderSummaryViewProps = {
    itemsCount: number;
    subtotal: number;
    total: number;
    couponCode: string;
    appliedCoupon: Coupon | null;
    discountAmount: number;
    isLoadingCoupon: boolean;
    onCouponCodeChange: (value: string) => void;
    onApplyCoupon: () => void;
    onRemoveCoupon: () => void;
    t: TFunction;
    promotionDiscount: number;
    // shipping
    shippingOptions: { method: ShippingMethod; cost: number }[];
    selectedShipping: { method: ShippingMethod; cost: number } | null;
    isLoadingShipping: boolean;
    onSelectShipping: (option: { method: ShippingMethod; cost: number }) => void;
    formatMoney: ReturnType<typeof useFormatMoney>;
    loading: boolean,
    onPlaceOrder: () => void;
};

export function OrderSummary({
    itemsCount,
    subtotal,
    total,
    couponCode,
    appliedCoupon,
    discountAmount,
    isLoadingCoupon,
    onCouponCodeChange,
    onApplyCoupon,
    onRemoveCoupon,
    t,
    promotionDiscount,
    shippingOptions,
    selectedShipping,
    isLoadingShipping,
    onSelectShipping,
    formatMoney,
    loading,
    onPlaceOrder
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

                    {/* Shipping section */}
                    {isLoadingShipping ? (
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>{t('checkout:shipping')}</span>
                            <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                    ) : shippingOptions.length > 0 && selectedShipping ? (
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">{t('checkout:shipping')}</span>
                                <span>{formatMoney(selectedShipping.cost)}</span>
                            </div>
                            <div className="pl-2 border-l-2 border-muted">
                                {shippingOptions.map((option, idx) => (
                                    <label key={option.method.id} className="flex items-center gap-2 py-1 cursor-pointer">
                                        <input
                                            type="radio"
                                            name="shippingMethod"
                                            checked={selectedShipping.method.id === option.method.id}
                                            onChange={() => onSelectShipping(option)}
                                            className="accent-primary"
                                        />
                                        <span className="text-sm">
                                            {option.method.name} – {formatMoney(option.cost)}
                                            {option.method.free_shipping_threshold &&
                                                subtotal >= option.method.free_shipping_threshold &&
                                                option.cost === 0 && (
                                                    <span className="text-green-600 text-xs ml-1">(Free)</span>
                                                )}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex justify-between text-muted-foreground">
                            <span>{t('checkout:shipping')}</span>
                            <span>{t('checkout:unavailable')}</span>
                        </div>
                    )}

                    <div className="flex justify-between font-bold text-lg pt-4 border-t border-muted">
                        <span>{t('checkout:total')}</span>
                        <span className="text-primary">{formatMoney(total)}</span>
                    </div>
                </div>
            </div>

            {/* Coupon Section (unchanged) */}
            <div className="space-y-3">
                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    {t('checkout:haveCoupon')}
                </p>

                {!appliedCoupon ? (
                    <div className="flex gap-2">
                        <Input
                            placeholder={t('checkout:enterCode')}
                            value={couponCode}
                            onChange={(e) => onCouponCodeChange(e.target.value.toUpperCase())}
                            className="bg-background h-9 text-sm uppercase"
                            onKeyDown={(e) => e.key === "Enter" && onApplyCoupon()}
                        />
                        <Button
                            variant="secondary"
                            size="sm"
                            onClick={onApplyCoupon}
                            disabled={!couponCode}
                            isLoading={isLoadingCoupon}
                            className="h-9 px-4"
                        >
                            {isLoadingCoupon ? (
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
                            <span className="text-sm font-bold uppercase">{appliedCoupon.code}</span>
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

                <Button
                    className="w-full"
                    type="button"
                    isLoading={loading}
                    onClick={onPlaceOrder}
                >
                    {t('checkout:placeOrder')}
                </Button>
            </div>
        </Card>
    );
}