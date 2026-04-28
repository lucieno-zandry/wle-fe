// routes/frontoffice/product-detail/components/product-shipping-estimator.tsx

import { useEffect, useState } from "react";
import { fetchAvailableShippingMethods } from "~/api/http-requests";
import { useAddresses } from "../hooks/use-addresses";
import { useUserStore } from "~/hooks/use-user";
import { useFormatMoney } from "~/lib/format-money";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ShippingOption {
    method: ShippingMethod;
    cost: number;
    isFree: boolean;
}

interface ProductShippingEstimatorViewProps {
    options: ShippingOption[];
    loading: boolean;
    formatMoney: (n?: number) => string;
    location?: { country: string; city: string };
    variant?: Variant | null;
}

export function ProductShippingEstimatorView({
    options,
    loading,
    formatMoney,
    location,
    variant,
}: ProductShippingEstimatorViewProps) {
    if (!variant) {
        return <p className="text-sm text-muted-foreground">Select a variant to see shipping</p>;
    }

    if (loading) {
        return (
            <div className="animate-pulse space-y-2">
                <div className="h-4 w-2/3 rounded bg-muted" />
                <div className="h-4 w-1/2 rounded bg-muted" />
            </div>
        );
    }

    if (!options.length) {
        return <p className="text-sm text-destructive">No shipping available for your location</p>;
    }

    return (
        <div className="space-y-3 border rounded-lg p-4">
            <h3 className="text-sm font-semibold">Shipping</h3>
            {location && (
                <p className="text-xs text-muted-foreground">
                    To: {location.city}, {location.country}
                </p>
            )}
            <ul className="space-y-2">
                {options.map((opt) => (
                    <li key={opt.method.id} className="flex justify-between text-sm">
                        <div className="flex flex-col">
                            <span className="font-medium">{opt.method.name}</span>
                            <span className="text-xs text-muted-foreground">
                                {opt.method.min_delivery_days ?? "?"}-{opt.method.max_delivery_days ?? "?"} days
                            </span>
                        </div>
                        <span className={opt.isFree ? "text-green-600 font-medium" : ""}>
                            {opt.isFree ? "Free" : formatMoney(opt.cost)}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductShippingEstimatorProps {
    variant: Variant | null;
    quantity?: number;
}

export function ProductShippingEstimator({ variant, quantity = 1 }: ProductShippingEstimatorProps) {
    const [options, setOptions] = useState<ShippingOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ country: string; city: string } | undefined>();
    const formatMoney = useFormatMoney();
    const { addresses } = useAddresses();

    useEffect(() => {
        if (!variant) {
            setOptions([]);
            return;
        }

        const defaultAddress = addresses?.find((a) => a.is_default);

        const cartItemPayload = {
            weight: (variant.weight_kg ?? 0) * quantity,
            quantity,
            price: (variant.effective_price ?? variant.price) * quantity,
        };

        setLoading(true);
        fetchAvailableShippingMethods({
            address_id: defaultAddress?.id,
            cart_items: [cartItemPayload],
        })
            .then((res) => {
                if (res.data?.available) {
                    const opts = res.data.available.map((item) => ({
                        method: item.method,
                        cost: item.cost,
                        isFree: item.cost === 0,
                    }));
                    setOptions(opts);
                    setLocation(res.data.location);
                } else {
                    setOptions([]);
                }
            })
            .catch(() => setOptions([]))
            .finally(() => setLoading(false));
    }, [variant?.weight_kg, quantity, addresses]);

    return (
        <ProductShippingEstimatorView
            options={options}
            loading={loading}
            formatMoney={formatMoney}
            location={location}
            variant={variant}
        />
    );
}