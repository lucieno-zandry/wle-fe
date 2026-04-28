// routes/frontoffice/product-detail/components/product-pricing.tsx

import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { getCouponFromCode } from "~/api/http-requests";
import { HttpException } from "~/api/app-fetch";
import { useFormatMoney } from "~/lib/format-money";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductPricingViewProps {
    originalPrice: number;
    effectivePrice: number;
    promotions: Promotion[];
    countdowns: Record<number, string>;
    couponCode: string;
    onCouponChange: (code: string) => void;
    onCouponApply: () => void;
    couponError?: string;
    appliedCoupon?: Coupon | null;
    isApplyingCoupon: boolean;
    formatMoney: (n?: number, fractionDigits?: number) => string;
}

export function ProductPricingView({
    originalPrice,
    effectivePrice,
    promotions,
    countdowns,
    couponCode,
    onCouponChange,
    onCouponApply,
    couponError,
    appliedCoupon,
    isApplyingCoupon,
    formatMoney,
}: ProductPricingViewProps) {
    const hasDiscount = effectivePrice < originalPrice;

    return (
        <div className="space-y-4">
            {/* Price display */}
            <div className="flex items-baseline gap-2">
                {hasDiscount ? (
                    <>
                        <span className="text-2xl font-bold text-destructive">
                            {formatMoney(effectivePrice)}
                        </span>
                        <span className="text-lg text-muted-foreground line-through">
                            {formatMoney(originalPrice)}
                        </span>
                    </>
                ) : (
                    <span className="text-2xl font-bold">
                        {formatMoney(originalPrice)}
                    </span>
                )}
            </div>

            {/* Active promotions */}
            {promotions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">Active Promotions</p>
                    <ul className="space-y-1">
                        {promotions.map((promo) => (
                            <li key={promo.id} className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="secondary">{promo.badge || promo.name}</Badge>
                                <span>
                                    {promo.type === "PERCENTAGE"
                                        ? `${promo.discount}% OFF`
                                        : `${formatMoney(promo.discount)} OFF`}
                                </span>
                                {countdowns[promo.id] && (
                                    <span className="text-xs text-muted-foreground">
                                        Ends in {countdowns[promo.id]}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Coupon entry */}
            <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">Have a coupon?</p>
                <div className="flex gap-2">
                    <Input
                        placeholder="Enter code"
                        value={couponCode}
                        onChange={(e) => onCouponChange(e.target.value)}
                        className="max-w-[200px]"
                        disabled={!!appliedCoupon}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCouponApply}
                        disabled={!couponCode || isApplyingCoupon || !!appliedCoupon}
                    >
                        {isApplyingCoupon ? "Applying..." : "Apply"}
                    </Button>
                </div>
                {couponError && (
                    <p className="text-xs text-destructive mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                        <span>Coupon <strong>{appliedCoupon.code}</strong> applied!</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs underline"
                            onClick={() => onCouponChange("")} // clearing handled by parent
                        >
                            Remove
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductPricingProps {
    variant: Variant | null;
}

function formatCountdown(endDate: string): string {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Expired";

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function ProductPricing({ variant }: ProductPricingProps) {
    const [couponCode, setCouponCode] = useState("");
    const [couponError, setCouponError] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
    const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
    const [countdowns, setCountdowns] = useState<Record<number, string>>({});
    const formatMoney = useFormatMoney();

    // Reset coupon when variant changes
    useEffect(() => {
        setAppliedCoupon(null);
        setCouponCode("");
        setCouponError("");
    }, [variant?.id]);

    // Countdown updater for each promotion
    useEffect(() => {
        if (!variant?.applied_promotions) return;

        const update = () => {
            const newCountdowns: Record<number, string> = {};
            variant.applied_promotions!.forEach((promo) => {
                newCountdowns[promo.id] = formatCountdown(promo.end_date);
            });
            setCountdowns(newCountdowns);
        };

        update();
        const timer = setInterval(update, 1000 * 60);
        return () => clearInterval(timer);
    }, [variant]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError("");
        try {
            const response = await getCouponFromCode(couponCode.trim());
            if (response.data?.coupon) {
                setAppliedCoupon(response.data.coupon);
                toast.success("Coupon applied!");
            } else {
                setCouponError("Invalid coupon code.");
            }
        } catch (e) {
            if (e instanceof HttpException) {
                setCouponError(e.data?.message || "Failed to apply coupon.");
            } else {
                setCouponError("Something went wrong.");
            }
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    if (!variant) {
        return <p className="text-sm text-muted-foreground">Select a variant to see pricing.</p>;
    }

    return (
        <ProductPricingView
            originalPrice={variant.price}
            effectivePrice={variant.effective_price ?? variant.price}
            promotions={variant.applied_promotions ?? []}
            countdowns={countdowns}
            couponCode={couponCode}
            onCouponChange={setCouponCode}
            onCouponApply={handleApplyCoupon}
            couponError={couponError}
            appliedCoupon={appliedCoupon}
            isApplyingCoupon={isApplyingCoupon}
            formatMoney={formatMoney}
        />
    );
}