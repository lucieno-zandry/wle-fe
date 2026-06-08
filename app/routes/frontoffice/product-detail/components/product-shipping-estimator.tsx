// routes/frontoffice/product-detail/components/product-shipping-estimator.tsx
import { useEffect, useState, useCallback, type Dispatch, type SetStateAction } from "react";
import { fetchAvailableShippingMethods } from "~/api/http-requests";
import { useAddresses } from "../../../../hooks/use-addresses";
import { useFormatMoney } from "~/lib/format-money";
import { useTranslation } from "react-i18next";
import { Button } from "~/components/ui/button";
import { LocationSelector } from "./location-selector";
import type { ShippingOption } from "../types/shipping";
import { MapPin, Package, CheckCircle2, Truck } from "lucide-react";
import useDebounce from "~/hooks/use-debounce";
import { throttle } from "~/lib/throttle";
import type { Variant } from "wle-core";

interface ProductShippingEstimatorViewProps {
    options: ShippingOption[];
    loading: boolean;
    formatMoney: (n?: number) => string;
    location?: { country: string; city: string };
    variant?: Variant | null;
    selectedOption: ShippingOption | null;
    onOptionSelect: (option: ShippingOption) => void;
    hasDefaultAddress: boolean;
    customCountry: string;
    customCity: string;
    onCustomCountryChange: (val: string) => void;
    onCustomCityChange: (val: string) => void;
    onCalculateCustomShipping: () => void;
    selectVariantMessage: string;
    noShippingMessage: string;
    shippingTitle: string;
    toLocationTemplate: string;
    freeLabel: string;
    deliveryDaysTemplate: string;
    calculateLabel: string;
}

export function ProductShippingEstimatorView({
    options,
    loading,
    formatMoney,
    location,
    variant,
    selectedOption,
    onOptionSelect,
    hasDefaultAddress,
    customCountry,
    customCity,
    onCustomCountryChange,
    onCustomCityChange,
    onCalculateCustomShipping,
    selectVariantMessage,
    noShippingMessage,
    shippingTitle,
    toLocationTemplate,
    freeLabel,
    deliveryDaysTemplate,
    calculateLabel
}: ProductShippingEstimatorViewProps) {
    if (!variant) {
        return (
            <div className="rounded-2xl border border-dashed border-border bg-muted/50 px-4 py-5 text-sm text-muted-foreground text-center">
                {selectVariantMessage}
            </div>
        );
    }

    const showNoResults = !options.length && (hasDefaultAddress || (customCountry && customCity));

    return (
        <div className="rounded-2xl border border-border bg-background overflow-hidden shadow-sm">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 sm:px-5 border-b border-border/50 bg-muted/50">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                    <Truck className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                    <h3 className="text-sm font-semibold text-foreground">{shippingTitle}</h3>
                    {location && (
                        <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                            <MapPin className="h-3 w-3" />
                            {toLocationTemplate
                                .replace("{{city}}", location.city)
                                .replace("{{country}}", location.country)}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-4 sm:p-5 space-y-4">
                {/* Custom location picker */}
                {!hasDefaultAddress && (
                    <div className="space-y-2">
                        <LocationSelector
                            country={customCountry}
                            city={customCity}
                            onCountryChange={onCustomCountryChange}
                            onCityChange={onCustomCityChange}
                        />
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={onCalculateCustomShipping}
                            disabled={loading || !customCountry || !customCity}
                            className="w-full rounded-xl border-input hover:bg-accent hover:text-accent-foreground"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <span className="h-3 w-3 rounded-full border-2 border-current border-t-transparent animate-spin" />
                                    Loading...
                                </span>
                            ) : calculateLabel}
                        </Button>
                    </div>
                )}

                {/* Options */}
                {loading ? (
                    <div className="space-y-2">
                        {[1, 2].map((i) => (
                            <div key={i} className="h-16 w-full animate-pulse rounded-xl bg-muted" />
                        ))}
                    </div>
                ) : showNoResults ? (
                    <div className="flex items-center gap-2 rounded-xl bg-destructive/10 border border-destructive/20 px-4 py-3 text-sm text-destructive">
                        <Package className="h-4 w-4 shrink-0" />
                        {noShippingMessage}
                    </div>
                ) : (
                    <ul className="space-y-2">
                        {options.map((opt) => {
                            const isSelected = selectedOption?.method.id === opt.method.id;
                            const isFree = opt.cost === 0;

                            return (
                                <li
                                    key={opt.method.id}
                                    onClick={() => onOptionSelect(opt)}
                                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-3 text-sm transition-all duration-150 ${isSelected
                                        ? "border-primary bg-primary/5"
                                        : "border-border hover:border-border/80 hover:bg-muted/50"
                                        }`}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className={`h-4 w-4 rounded-full border-2 transition-colors flex items-center justify-center ${isSelected ? "border-primary bg-primary text-primary-foreground" : "border-input"}`}>
                                            {isSelected && <CheckCircle2 className="h-full w-full" />}
                                        </div>
                                        <div>
                                            <span className="font-medium text-foreground">{opt.method.name}</span>
                                            <p className="text-xs text-muted-foreground mt-0.5">
                                                {deliveryDaysTemplate
                                                    .replace("{{min}}", String(opt.method.min_delivery_days ?? "?"))
                                                    .replace("{{max}}", String(opt.method.max_delivery_days ?? "?"))}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`shrink-0 font-semibold ${isFree ? "text-green-600 dark:text-green-400" : "text-foreground"}`}>
                                        {isFree ? freeLabel : formatMoney(opt.cost)}
                                    </span>
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductShippingEstimatorProps {
    variant: Variant | null;
    quantity?: number;
    selectedOption: ShippingOption | null;
    setSelectedOption: Dispatch<SetStateAction<ShippingOption | null>>;
}

export function ProductShippingEstimator({
    variant,
    selectedOption,
    setSelectedOption,
    ...props
}: ProductShippingEstimatorProps) {
    const { t } = useTranslation("product-detail");
    const [options, setOptions] = useState<ShippingOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [location, setLocation] = useState<{ country: string; city: string } | undefined>();
    const [customCountry, setCustomCountry] = useState("");
    const [customCity, setCustomCity] = useState("");

    const formatMoney = useFormatMoney();
    const { addresses } = useAddresses();
    const defaultAddress = addresses?.find((a) => a.is_default) || addresses?.at(0);
    const quantity = useDebounce(props.quantity || 1);

    const fetchRates = useCallback(
        (forceCustom = false) => {
            if (!variant) return;

            const cartItemPayload = {
                weight: (variant.weight_kg ?? 0),
                quantity,
                price: (variant.effective_price ?? variant.price),
            };

            const payload: any = { cart_items: [cartItemPayload] };

            if (defaultAddress && !forceCustom) {
                payload.address_id = defaultAddress.id;
            } else if (customCountry && customCity) {
                payload.location = { country: customCountry.toUpperCase(), city: customCity };
            }

            setLoading(true);
            fetchAvailableShippingMethods(payload)
                .then((res) => {
                    if (res.data?.available) {
                        const opts = res.data.available;

                        setOptions(opts);
                        setLocation(res.data.location);

                        setSelectedOption(opts[0] || null);
                    } else {
                        setOptions([]);
                        setSelectedOption(null);
                    }
                })
                .catch(() => {
                    setOptions([]);
                    setSelectedOption(null);
                })
                .finally(() => setLoading(false));
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [variant?.id, variant?.weight_kg, quantity, defaultAddress?.id, customCountry, customCity]
    );

    useEffect(() => {
        if (addresses === null) return;

        const t = setTimeout(() => {
            fetchRates();
        }, 300);

        return () => clearTimeout(t);
    }, [
        variant?.id,
        variant?.weight_kg,
        quantity,
        defaultAddress?.id,
        addresses
    ]);

    return (
        <ProductShippingEstimatorView
            options={options}
            loading={loading}
            formatMoney={formatMoney}
            location={location}
            variant={variant}
            selectedOption={selectedOption}
            onOptionSelect={setSelectedOption}
            hasDefaultAddress={!!defaultAddress}
            customCountry={customCountry}
            customCity={customCity}
            onCustomCountryChange={setCustomCountry}
            onCustomCityChange={setCustomCity}
            onCalculateCustomShipping={() => fetchRates(true)}
            selectVariantMessage={t("shipping.selectVariant")}
            noShippingMessage={t("shipping.noShipping")}
            shippingTitle={t("shipping.title")}
            toLocationTemplate={t("shipping.toLocation")}
            freeLabel={t("shipping.free")}
            deliveryDaysTemplate={t("shipping.deliveryDays")}
            calculateLabel={t("shipping.calculateRates", "Calculate Rates")}
        />
    );
}