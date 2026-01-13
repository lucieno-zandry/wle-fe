import { useState, useMemo, useEffect } from "react";
import { AddressForm } from "~/components/address/address-form";
import { PaymentMethod } from "~/components/checkout/payment-method";
import { OrderReview } from "~/components/checkout/order-review";
import Button from "~/components/custom-components/button";
import StepWrapper from "~/components/custom-components/step-wrapper";
import { redirect, useLoaderData, useNavigate, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { createAddress, createOrder, createTransaction, getCartItems } from "~/api/http-requests";
import useAddressStore from "~/hooks/use-address-store";
import { toast } from "sonner";
import useCheckoutStore from "~/hooks/use-checkout-store";
import OrderSummary from "~/components/checkout/order-summary";
import { useRefreshCart } from "~/hooks/use-cart";
import { HttpException, ValidationException } from "~/api/app-fetch";

type Step = "address" | "payment" | "review";

export const clientLoader = async ({ }: LoaderFunctionArgs) => {
    const { cartItemsIds } = useCheckoutStore.getState();
    const cartItems = await getCartItems({ whereIn: { id: cartItemsIds } });
    return cartItems.data?.cart_items;
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

export default function CheckoutPage() {
    const [activeStep, setActiveStep] = useState<Step>("address");
    const [completed, setCompleted] = useState<Record<Step, boolean>>({
        address: false,
        payment: false,
        review: false,
    });
    const [loading, setLoading] = useState(false);
    const loaderCartItems = useLoaderData<CartItem[]>();

    const { selectedAddressId } = useAddressStore();
    const { appliedCoupon, setAppliedCoupon, setCartItemsIds, method } = useCheckoutStore();
    const { cartItems, setCartItems } = useCheckoutStore();

    const cartItemsIds = useMemo(() => cartItems.map((item) => item.id) || [], [cartItems]);

    const navigate = useNavigate();
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

    const handleStepComplete = (current: Step, next: Step) => {
        setCompleted(prev => ({ ...prev, [current]: true }));
        setActiveStep(next);
    };

    const handlePlaceOrder = () => {
        if (!selectedAddressId || cartItemsIds.length === 0 || !method) return;
        setLoading(true);

        createOrder({ address_id: selectedAddressId, cart_item_ids: cartItemsIds, coupon_id: appliedCoupon?.id })
            .then(async (response) => {
                if (response.data?.order) {
                    try {
                        const transactionResponse = await createTransaction({
                            method,
                            order_uuid: response.data.order.uuid,
                            amount: total,
                        });

                        if (transactionResponse.data?.transaction.payment_url) {
                            location.href = transactionResponse.data.transaction.payment_url;
                        }
                    } catch (e) {
                        if (e instanceof HttpException || e instanceof ValidationException)
                            toast.error(`Failed to initiate transaction with status : ${e.status}`);

                        setCartItems([]);
                        navigate(`/order/${response.data.order.uuid}`);
                    }

                }
            })
            .catch((error) => {
                toast.error(`Failed to create order with status: ${error.message || error.status} `)
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

    useEffect(() => {
        if (itemsCount === 0) {
            navigate('/orders');
        }
    }, [itemsCount]);

    return (
        <div className="container max-w-4xl mx-auto p-4 md:p-8">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Checkout Flow */}
                <div className="lg:col-span-2 space-y-4">

                    {/* STEP 1: ADDRESS */}
                    <StepWrapper
                        number={1}
                        title="Shipping Address"
                        isActive={activeStep === "address"}
                        isCompleted={completed.address}
                        onEdit={() => setActiveStep("address")}
                    >
                        <AddressForm onNext={() => handleStepComplete("address", "payment")} />
                    </StepWrapper>

                    {/* STEP 2: PAYMENT */}
                    <StepWrapper
                        number={2}
                        title="Payment Method"
                        isActive={activeStep === "payment"}
                        isCompleted={completed.payment}
                        onEdit={() => setActiveStep("payment")}
                    >
                        <PaymentMethod onNext={() => handleStepComplete("payment", "review")} />
                    </StepWrapper>

                    {/* STEP 3: REVIEW */}
                    <StepWrapper
                        number={3}
                        title="Review & Place Order"
                        isActive={activeStep === "review"}
                        isCompleted={completed.review}
                    >
                        {cartItems && (
                            <OrderReview>
                                <Button className="w-full h-12 text-lg" type="button" isLoading={loading} onClick={handlePlaceOrder}>Place Order</Button>
                            </OrderReview>
                        )}
                    </StepWrapper>
                </div>

                {/* Sticky Order Summary Sidebar */}
                {cartItems &&
                    <div className="lg:col-span-1">
                        <OrderSummary
                            cartItems={cartItems}
                            itemsCount={itemsCount}
                            subtotal={subtotal}
                            discountAmount={discountAmount}
                            total={total} />
                    </div>}
            </div>
        </div>
    );
}