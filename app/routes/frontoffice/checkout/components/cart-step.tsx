// routes/checkout/components/cart-step.tsx
import { useTranslation } from "react-i18next";
import { ArrowRight, ShoppingBag } from "lucide-react";
import CartItemList from "./cart/cart-item-list";
import CouponSection from "./cart/coupon-section";
import { Button } from "~/components/ui/button";
import useCheckoutStore from "../stores/use-checkout-store";
import type { CartItem, Coupon } from "wle-core";

type Props = {
    cartItems: CartItem[];
    coupon: Coupon | null;
};

export default function CartStep({ cartItems, coupon }: Props) {
    const { t } = useTranslation("checkout");
    const { setStep } = useCheckoutStore();

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <ShoppingBag className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">{t("cart.title")}</h1>
            </div>

            <div className="rounded-2xl border bg-card shadow-sm">
                <CartItemList items={cartItems} />
            </div>

            <div className="mt-8">
                <CouponSection initialCoupon={coupon} />
            </div>

            <div className="mt-10 flex items-center justify-end border-t pt-6">
                <Button size="lg" className="h-12 rounded-full px-8 text-base transition-transform hover:scale-[1.02]" onClick={() => setStep(1)}>
                    {t("cart.continue_to_address")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </section>
    );
}