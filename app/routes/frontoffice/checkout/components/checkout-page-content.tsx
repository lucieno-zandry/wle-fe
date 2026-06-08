// routes/checkout/components/checkout-page-content.tsx
import { useTranslation } from "react-i18next";
import ProgressIndicator from "./progress-indicator";
import CartStep from "./cart-step";
import AddressStep from "./address-step";
import ShippingStep from "./shipping-step";
import OrderSummary from "./order-summary";
import useCheckoutStore from "../stores/use-checkout-store";
import PaymentStep from "./payment-step";
import type { CartItem, Coupon } from "wle-core";

type Props = {
    initialData: {
        cart_items: CartItem[];
        coupon: Coupon | null;
    };
};

export default function CheckoutPageContent({ initialData }: Props) {
    const { step } = useCheckoutStore();
    const { t } = useTranslation("checkout");

    const steps = [
        { label: t("steps.cart", "Cart"), value: 0 },
        { label: t("steps.address", "Address"), value: 1 },
        { label: t("steps.shipping", "Shipping"), value: 2 },
        { label: t("steps.payment", "Payment"), value: 3 },
    ];

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:py-12 bg-background/50 min-h-screen">
            <div className="mb-10">
                <ProgressIndicator steps={steps} current={step} />
            </div>

            <div className="grid gap-8 lg:grid-cols-[1fr_400px] xl:gap-12">
                <main className="min-w-0">
                    {step === 0 && (
                        <CartStep cartItems={initialData.cart_items} coupon={initialData.coupon} />
                    )}
                    {step === 1 && <AddressStep />}
                    {step === 2 && <ShippingStep />}
                    {step === 3 && <PaymentStep />}
                </main>

                <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
                    <OrderSummary cartItems={initialData.cart_items} coupon={initialData.coupon} />
                </aside>
            </div>

            <div className="mt-8 lg:hidden">
                <OrderSummary cartItems={initialData.cart_items} coupon={initialData.coupon} />
            </div>
        </div>
    );
}