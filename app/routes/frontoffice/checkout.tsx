//checkout.tsx

import { useState, useMemo, useEffect } from "react";
import AddressForm from "~/components/addresses/address-form";
import PaymentMethod from "~/components/checkout/payment-method";
import { OrderReview } from "~/components/checkout/order-review";
import Button from "~/components/custom-components/button";
import StepWrapper from "~/components/custom-components/step-wrapper";
import { redirect, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { createAddress, createOrder, createTransaction, getCartItems } from "~/api/http-requests";
import useAddressStore from "~/hooks/use-address-store";
import { toast } from "sonner";
import useCheckoutStore from "~/hooks/use-checkout-store";
import OrderSummary from "~/components/checkout/order-summary";
import { useRefreshCart } from "~/hooks/use-cart";
import { HttpException, ValidationException, type FormatedResponse } from "~/api/app-fetch";
import { useTranslation } from "react-i18next";
import i18next, { type TFunction } from "i18next";
import type { WhereInConditions } from "~/lib/build-where-param";
import appNavigate from "~/lib/app-navigate";

type Step = "address" | "payment" | "review";

export const clientLoader = async ({ request, params }: LoaderFunctionArgs) => {
    const url = new URL(request.url);
    const cartItemsIds = url.searchParams.get('cartItemIds')?.split(',')?.map(Number) ?? [];
    const whereIn: WhereInConditions | undefined = cartItemsIds.length > 0 ? { id: cartItemsIds } : undefined;

    const response = await getCartItems({ whereIn });
    const { lang } = params;

    if (response.data?.cart_items?.length === 0) {
        toast.error(i18next.t('checkout:errors.cart_empty'));
        return redirect(`/${lang}/orders`);
    }

    return response.data?.cart_items;
}

export const clientAction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const intent = formData.get('_intent');

    try {
        if (intent === 'create-address') {
            const response = await createAddress(formData);
            return {
                address: response.data!.address,
                user: response.data!.user,
            };
        }
    } catch (e) {
        return e;
    }

    return null;
};


type CheckoutProps = {
    activeStep: "address" | "payment" | "review";
    setActiveStep: (step: "address" | "payment" | "review") => void;
    completed: { address: boolean; payment: boolean; review: boolean };
    handleStepComplete: (step: "address" | "payment", nextStep: "payment" | "review") => void;
    handlePlaceOrder: () => void;
    loading: boolean;
    cartItems: CartItem[] | null;
    itemsCount: number;
    subtotal: number;
    discountAmount: number;
    total: number;
    t: TFunction;
    promotionDiscount: number;
};

export function Checkout({
    activeStep,
    setActiveStep,
    completed,
    handleStepComplete,
    handlePlaceOrder,
    loading,
    cartItems,
    itemsCount,
    subtotal,
    discountAmount,
    total,
    t,
    promotionDiscount
}: CheckoutProps) {
    return (
        <div className="container max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">{t('checkout:checkout')}</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Checkout Flow */}
                <div className="lg:col-span-2 space-y-4">
                    {/* STEP 1: ADDRESS */}
                    <StepWrapper
                        number={1}
                        title={t('checkout:shippingAddress')}
                        isActive={activeStep === "address"}
                        isCompleted={completed.address}
                        onEdit={() => setActiveStep("address")}
                    >
                        <AddressForm onNext={() => handleStepComplete("address", "payment")} />
                    </StepWrapper>

                    {/* STEP 2: PAYMENT */}
                    <StepWrapper
                        number={2}
                        title={t('checkout:paymentMethod')}
                        isActive={activeStep === "payment"}
                        isCompleted={completed.payment}
                        onEdit={() => setActiveStep("payment")}
                    >
                        <PaymentMethod onNext={() => handleStepComplete("payment", "review")} />
                    </StepWrapper>

                    {/* STEP 3: REVIEW */}
                    <StepWrapper
                        number={3}
                        title={t('checkout:reviewPlaceOrder')}
                        isActive={activeStep === "review"}
                        isCompleted={completed.review}
                    >
                        {cartItems && (
                            <OrderReview />
                        )}
                    </StepWrapper>
                </div>

                {/* Sticky Order Summary Sidebar */}
                {cartItems && (
                    <div className="lg:col-span-1">
                        <OrderSummary
                            cartItems={cartItems}
                            itemsCount={itemsCount}
                            subtotal={subtotal}
                            discountAmount={discountAmount}
                            total={total}
                            promotionDiscount={promotionDiscount}
                            loading={loading}
                            onPlaceOrder={handlePlaceOrder}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

export default function () {
    const [activeStep, setActiveStep] = useState<Step>("address");
    const [completed, setCompleted] = useState<Record<Step, boolean>>({
        address: false,
        payment: false,
        review: false,
    });
    const [loading, setLoading] = useState(false);
    const loaderCartItems = useLoaderData<CartItem[]>();

    const { selectedAddressId } = useAddressStore();
    const { appliedCoupon, setAppliedCoupon, setCartItemsIds, method, selectedShipping } = useCheckoutStore();
    const { cartItems, setCartItems } = useCheckoutStore();
    const { t } = useTranslation("checkout");

    const cartItemsIds = useMemo(() => cartItems.map((item) => item.id) || [], [cartItems]);
    const refreshCart = useRefreshCart();

    const subtotal = useMemo(() => {
        if (!cartItems || cartItems.length === 0) return 0;
        return cartItems.reduce((sum, it) => sum + (it.total || 0), 0);
    }, [cartItems]);

    const discountAmount = appliedCoupon
        ? appliedCoupon.type === "FIXED_AMOUNT"
            ? appliedCoupon.discount
            : (subtotal * appliedCoupon.discount) / 100
        : 0;

    const total = Math.max(0, subtotal - discountAmount);

    const itemsCount = useMemo(() => {
        if (!cartItems || cartItems.length === 0) return 0;
        return cartItems.reduce((sum, it) => sum + (it.count || 0), 0);
    }, [cartItems]);

    const promotionDiscount = useMemo(() => {
        return cartItems.reduce((sum, item) => sum + (item.promotion_discount_applied || 0), 0);
    }, [cartItems]);

    const handleStepComplete = (current: Step, next: Step) => {
        setCompleted(prev => ({ ...prev, [current]: true }));
        setActiveStep(next);
    };

    const handlePlaceOrder = () => {
        if (!selectedAddressId || cartItemsIds.length === 0 || !method) return;

        if (!selectedShipping) {
            toast.error(t('checkout:itemNotAvailable'));
            return;
        }

        setLoading(true);

        createOrder({ address_id: selectedAddressId, cart_item_ids: cartItemsIds, coupon_id: appliedCoupon?.id, shipping_method_id: selectedShipping.method.id })
            .then(async (response) => {
                if (response.data?.order) {
                    try {
                        const transactionResponse = await createTransaction({
                            method,
                            order_uuid: response.data.order.uuid,
                            amount: response.data.order.total,
                        });

                        if (transactionResponse.data?.transaction.payment_url) {
                            location.href = transactionResponse.data.transaction.payment_url;
                        }
                    } catch (e) {
                        if (e instanceof HttpException || e instanceof ValidationException) {
                            // Using interpolation for the status code
                            toast.error(t("errors.transaction_failed", { status: e.status }));
                        }

                        setCartItems([]);
                        appNavigate(`/orders/${response.data.order.uuid}`);
                    }
                }
            })
            .catch((error) => {
                // Using interpolation for message/status
                toast.error(t("errors.order_failed", {
                    message: error.message || error.status
                }));
            })
            .finally(() => {
                setLoading(false);
            });
    }

    useEffect(() => {
        if (loaderCartItems) {
            setCartItems(loaderCartItems);
        }

        return () => {
            setAppliedCoupon(null);
            setCartItemsIds([]);
            refreshCart();
        }
    }, [loaderCartItems, setCartItems]);

    return <Checkout
        activeStep={activeStep}
        cartItems={cartItems}
        completed={completed}
        discountAmount={discountAmount}
        handlePlaceOrder={handlePlaceOrder}
        handleStepComplete={handleStepComplete}
        itemsCount={itemsCount}
        loading={loading}
        setActiveStep={setActiveStep}
        subtotal={subtotal}
        total={total}
        t={t}
        promotionDiscount={promotionDiscount}
    />
}