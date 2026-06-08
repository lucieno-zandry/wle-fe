// routes/checkout/components/coupon-section.tsx
import { useEffect, useState } from "react";
import { useRevalidator } from "react-router";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { getCouponFromCode, unuseCoupon } from "~/api/http-requests";
import { toast } from "sonner";
import { HttpException } from "~/api/app-fetch";
import { Ticket, X, CheckCircle2 } from "lucide-react";
import type { Coupon } from "wle-core";

type CouponSectionSmartProps = {
    initialCoupon: Coupon | null;
};

type CouponSectionViewProps = {
    coupon: Coupon | null;
    codeInput: string;
    onCodeChange: (val: string) => void;
    onApply: () => void;
    onRemove: () => void;
    loading: boolean;
};

// Dumb
function CouponSectionView({ coupon, codeInput, onCodeChange, onApply, onRemove, loading }: CouponSectionViewProps) {
    const { t } = useTranslation("checkout");

    return (
        <div className="group relative overflow-hidden rounded-2xl border border-dashed bg-card p-5 transition-all focus-within:border-primary/50 focus-within:ring-4 focus-within:ring-primary/5">
            <div className="mb-4 flex items-center gap-2 text-sm font-medium text-foreground">
                <Ticket className="h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                {t("coupon.label", "Have a promo code?")}
            </div>

            {coupon ? (
                <div className="flex items-center justify-between rounded-xl border bg-emerald-50/50 p-3 px-4 dark:bg-emerald-950/20 dark:border-emerald-900/50">
                    <div className="flex items-center gap-3">
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                        <div>
                            <p className="font-semibold text-emerald-700 dark:text-emerald-400">{coupon.code}</p>
                            <p className="text-xs text-emerald-600/80 dark:text-emerald-500/80">
                                {coupon.type === "PERCENTAGE" ? `${coupon.discount}% off` : `${coupon.discount} € off`} applied
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 rounded-full text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-900/50"
                        onClick={onRemove}
                        disabled={loading}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            ) : (
                <div className="flex gap-2">
                    <Input
                        placeholder={t("coupon.code_placeholder", "Enter code")}
                        value={codeInput}
                        onChange={(e) => onCodeChange(e.target.value)}
                        className="h-10 flex-1 rounded-xl bg-background shadow-none"
                    />
                    <Button
                        size="sm"
                        className="h-10 rounded-xl px-6"
                        onClick={onApply}
                        disabled={loading || !codeInput.trim()}
                    >
                        {t("coupon.apply", "Apply")}
                    </Button>
                </div>
            )}
        </div>
    );
}

// Smart
export default function CouponSection({ initialCoupon }: CouponSectionSmartProps) {
    const revalidator = useRevalidator();
    const [codeInput, setCodeInput] = useState("");
    const [coupon, setCoupon] = useState<Coupon | null>(initialCoupon);
    const [loading, setLoading] = useState(false);
    const { t } = useTranslation("checkout");

    useEffect(() => {
        setCoupon(initialCoupon);
    }, [initialCoupon]);

    const handleApply = async () => {
        if (!codeInput.trim()) return;
        setLoading(true);
        try {
            await getCouponFromCode(codeInput.trim().toUpperCase());
            revalidator.revalidate();
            toast.success(t("coupon.applied_success"));
            setCodeInput("");
        } catch (err) {
            if (err instanceof HttpException) {
                toast.error(err.data?.message || t("coupon.invalid"));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async () => {
        setLoading(true);
        try {
            await unuseCoupon();
            revalidator.revalidate();
            toast.success(t("coupon.removed_success"));
        } catch (err) {
            if (err instanceof HttpException) {
                toast.error(err.data?.message || t("coupon.remove_failed"));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <CouponSectionView
            coupon={coupon}
            codeInput={codeInput}
            onCodeChange={setCodeInput}
            onApply={handleApply}
            onRemove={handleRemove}
            loading={loading}
        />
    );
}