// routes/frontoffice/product-detail/components/product-pricing.tsx

import { useEffect, useState } from "react";
import { Badge } from "~/components/ui/badge";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { getCouponFromCode } from "~/api/http-requests";
import { HttpException } from "~/api/app-fetch";
import { useFormatMoney } from "~/lib/format-money";
import { useTranslation } from "react-i18next";

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
    // Translated strings
    activePromotionsLabel: string;
    haveCouponLabel: string;
    enterCodePlaceholder: string;
    applyButton: string;
    applyingButton: string;
    couponAppliedTemplate: string;
    removeButton: string;
    percentOffTemplate: string;
    amountOffTemplate: string;
    endsInTemplate: string;
    selectVariantMessage: string;
    invalidCouponError: string;
    failedApplyCouponError: string;
    genericError: string;
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
    activePromotionsLabel,
    haveCouponLabel,
    enterCodePlaceholder,
    applyButton,
    applyingButton,
    couponAppliedTemplate,
    removeButton,
    percentOffTemplate,
    amountOffTemplate,
    endsInTemplate,
    selectVariantMessage,
    invalidCouponError,
    failedApplyCouponError,
    genericError,
}: ProductPricingViewProps) {
    const hasDiscount = effectivePrice < originalPrice;

    return (
        <div className="space-y-4 rounded-lg border bg-card p-4 sm:p-5">
            {/* Price display */}
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                {hasDiscount ? (
                    <>
                        <span className="text-2xl font-bold text-destructive sm:text-3xl">
                            {formatMoney(effectivePrice)}
                        </span>
                        <span className="text-base text-muted-foreground line-through sm:text-lg">
                            {formatMoney(originalPrice)}
                        </span>
                    </>
                ) : (
                    <span className="text-2xl font-bold sm:text-3xl">
                        {formatMoney(originalPrice)}
                    </span>
                )}
            </div>

            {/* Active promotions */}
            {promotions.length > 0 && (
                <div className="space-y-2">
                    <p className="text-sm font-medium">{activePromotionsLabel}</p>
                    <ul className="space-y-1">
                        {promotions.map((promo) => (
                            <li key={promo.id} className="flex flex-wrap items-center gap-2 text-sm">
                                <Badge variant="secondary">{promo.badge || promo.name}</Badge>
                                <span>
                                    {promo.type === "PERCENTAGE"
                                        ? percentOffTemplate.replace("{{percent}}", String(promo.discount))
                                        : amountOffTemplate.replace("{{money}}", formatMoney(promo.discount))}
                                </span>
                                {countdowns[promo.id] && (
                                    <span className="text-xs text-muted-foreground">
                                        {endsInTemplate.replace("{{time}}", countdowns[promo.id])}
                                    </span>
                                )}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Coupon entry */}
            <div className="border-t pt-4">
                <p className="text-sm font-medium mb-2">{haveCouponLabel}</p>
                <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                        placeholder={enterCodePlaceholder}
                        value={couponCode}
                        onChange={(e) => onCouponChange(e.target.value)}
                        className="w-full sm:max-w-[220px]"
                        disabled={!!appliedCoupon}
                    />
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onCouponApply}
                        disabled={!couponCode || isApplyingCoupon || !!appliedCoupon}
                        className="w-full sm:w-auto"
                    >
                        {isApplyingCoupon ? applyingButton : applyButton}
                    </Button>
                </div>
                {couponError && (
                    <p className="text-xs text-destructive mt-1">{couponError}</p>
                )}
                {appliedCoupon && (
                    <div className="mt-2 text-sm text-green-600 flex items-center gap-2">
                        <span>{couponAppliedTemplate.replace("{{code}}", appliedCoupon.code)}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto p-0 text-xs underline"
                            onClick={() => onCouponChange("")}
                        >
                            {removeButton}
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
    couponCode: string;
    setCouponCode: (coupon: string) => void;
}

function formatCountdown(endDate: string): string {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Expired"; // will be overridden by t("pricing.expired") later

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
    if (days > 0) return `${days}d ${hours}h`;
    const minutes = Math.floor((diff / (1000 * 60)) % 60);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
}

export function ProductPricing({ variant, couponCode, setCouponCode }: ProductPricingProps) {
    const { t } = useTranslation("product-detail");
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
                const raw = formatCountdown(promo.end_date);
                // Replace "Expired" with translated version
                const display = raw === "Expired" ? t("pricing.expired") : raw;
                newCountdowns[promo.id] = display;
            });
            setCountdowns(newCountdowns);
        };

        update();
        const timer = setInterval(update, 1000 * 60);
        return () => clearInterval(timer);
    }, [variant, t]);

    const handleApplyCoupon = async () => {
        if (!couponCode.trim()) return;
        setIsApplyingCoupon(true);
        setCouponError("");
        try {
            const response = await getCouponFromCode(couponCode.trim());
            if (response.data?.coupon) {
                setAppliedCoupon(response.data.coupon);
                toast.success(t("pricing.couponApplied", { code: response.data.coupon.code }));
            } else {
                setCouponError(t("pricing.invalidCoupon"));
            }
        } catch (e) {
            if (e instanceof HttpException) {
                setCouponError(e.data?.message || t("pricing.failedApplyCoupon"));
            } else {
                setCouponError(t("pricing.genericError"));
            }
        } finally {
            setIsApplyingCoupon(false);
        }
    };

    if (!variant) {
        return <p className="text-sm text-muted-foreground">{t("pricing.selectVariant")}</p>;
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
            activePromotionsLabel={t("pricing.activePromotions")}
            haveCouponLabel={t("pricing.haveCoupon")}
            enterCodePlaceholder={t("pricing.enterCode")}
            applyButton={t("pricing.apply")}
            applyingButton={t("pricing.applying")}
            couponAppliedTemplate={t("pricing.couponApplied")}
            removeButton={t("pricing.removeCoupon")}
            percentOffTemplate={t("pricing.percentOff")}
            amountOffTemplate={t("pricing.amountOff")}
            endsInTemplate={t("pricing.endsIn")}
            selectVariantMessage={t("pricing.selectVariant")}
            invalidCouponError={t("pricing.invalidCoupon")}
            failedApplyCouponError={t("pricing.failedApplyCoupon")}
            genericError={t("pricing.genericError")}
        />
    );
}