// routes/checkout/components/shipping-step.tsx
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLoaderData } from "react-router";
import { ArrowLeft, ArrowRight, Truck } from "lucide-react";
import { fetchAvailableShippingMethods } from "~/api/http-requests";
import { useAddresses } from "~/hooks/use-addresses";
import ShippingMethodList from "./shipping/shipping-method-list";
import ShippingMethodSkeleton from "./shipping/shipping-method-skeleton";
import { Button } from "~/components/ui/button";
import { toast } from "sonner";
import { HttpException } from "~/api/app-fetch";
import useCheckoutStore from "../stores/use-checkout-store";
import type { CartItem, ShippingMethod } from "wle-core";

let promise: Promise<void> | null = null;

export default function ShippingStep() {
    const { t } = useTranslation("checkout");
    const { selectedAddressId, selectedShippingMethodId, setSelectedShippingMethodId, setShippingCost, setStep } = useCheckoutStore();
    const { addresses } = useAddresses();
    const loaderData = useLoaderData() as { cart_items: CartItem[] };
    const [available, setAvailable] = useState<{ method: ShippingMethod; cost: number }[] | null>(null);
    const [loading, setLoading] = useState(false);

    const selectedAddress = addresses?.find(a => a.id === selectedAddressId) ?? null;

    const handleSelect = (methodId: number, cost: number) => {
        setSelectedShippingMethodId(methodId);
        setShippingCost(cost);
    }

    useEffect(() => {
        if (!selectedAddressId || !selectedAddress || !loaderData?.cart_items) {
            setAvailable(null);
            return;
        }

        const cartItems = loaderData.cart_items.map(item => ({
            weight: item.variant_snapshot.weight_kg ?? 0,
            quantity: item.count,
            price: item.unit_price,
        }));

        if (promise) return;

        setLoading(true);

        promise = fetchAvailableShippingMethods({
            address_id: selectedAddressId,
            cart_items: cartItems,
        })
            .then(response => {
                if (response.data?.available) {
                    setAvailable(response.data.available);
                    const toSelect = response.data.available.at(0);
                    if (toSelect && !selectedShippingMethodId) {
                        handleSelect(toSelect.method.id, toSelect.cost);
                    }
                    return;
                }
                throw new HttpException(500, { message: "Failed to fetch available shipping methods" });
            })
            .catch(err => {
                if (err instanceof HttpException) {
                    toast.error(err.data?.message || t("shipping_toasts.load_methods_failed"));
                }
                setAvailable([]);
            })
            .finally(() => {
                setLoading(false);
                promise = null;
            });
    }, [selectedAddressId, selectedAddress, loaderData.cart_items]);

    const handleContinue = () => {
        if (selectedShippingMethodId) setStep(3);
    };

    return (
        <section className="animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="mb-8 flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <Truck className="h-5 w-5" />
                </div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {t("shipping.title", "Shipping Method")}
                </h1>
            </div>

            <div className="rounded-2xl border bg-card p-2 shadow-sm sm:p-4">
                {loading ? (
                    <ShippingMethodSkeleton />
                ) : available ? (
                    <ShippingMethodList
                        methods={available}
                        selectedId={selectedShippingMethodId}
                        onSelect={handleSelect}
                    />
                ) : (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center text-muted-foreground">
                        <p>{t("shipping.select_address_first", "Please select a shipping address first.")}</p>
                    </div>
                )}
            </div>

            <div className="mt-10 flex flex-col-reverse items-center justify-between gap-4 border-t pt-6 sm:flex-row">
                <Button variant="ghost" className="w-full rounded-full sm:w-auto" onClick={() => setStep(1)}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t("common.back_to_address", "Back to address")}
                </Button>
                <Button
                    size="lg"
                    className="w-full rounded-full px-8 text-base transition-transform hover:scale-[1.02] sm:w-auto"
                    disabled={!selectedShippingMethodId}
                    onClick={handleContinue}
                >
                    {t("shipping.continue_to_payment", "Continue to payment")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
            </div>
        </section>
    );
}