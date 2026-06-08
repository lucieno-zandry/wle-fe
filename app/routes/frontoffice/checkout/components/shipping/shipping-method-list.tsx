// routes/checkout/components/shipping/shipping-method-list.tsx
import { cn } from "~/lib/utils";
import { Truck, CheckCircle2, Clock } from "lucide-react";
import { useFormatMoney } from "~/lib/format-money";
import { useTranslation } from "react-i18next";
import type { ShippingMethod } from "wle-core";

type Props = {
    methods: { method: ShippingMethod; cost: number }[];
    selectedId: number | null;
    onSelect: (id: number, cost: number) => void;
};

export default function ShippingMethodList({ methods, selectedId, onSelect }: Props) {
    const formatMoney = useFormatMoney();
    const { t } = useTranslation('checkout');

    if (methods.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
                <p>{t('shipping.noMethodsAvailable')}</p>
            </div>
        );
    }

    return (
        <ul className="grid gap-3">
            {methods.map(({ method, cost }) => {
                const isSelected = selectedId === method.id;
                return (
                    <li key={method.id}>
                        <button
                            type="button"
                            className={cn(
                                "relative flex w-full items-center justify-between gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                                isSelected
                                    ? "border-primary bg-primary/[0.03] shadow-sm"
                                    : "border-transparent bg-muted/40 hover:bg-muted/60"
                            )}
                            onClick={() => onSelect(method.id, cost)}
                        >
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition-colors",
                                    isSelected ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground shadow-sm"
                                )}>
                                    <Truck className="h-5 w-5" />
                                </div>
                                <div className="space-y-1">
                                    <p className="font-semibold text-foreground leading-none">{method.name}</p>
                                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                            {method.carrier}
                                        </p>
                                        <p className="flex items-center gap-1 text-sm text-muted-foreground">
                                            <Clock className="h-3 w-3" />
                                            {method.min_delivery_days !== undefined && method.max_delivery_days !== undefined
                                                ? t('shipping.deliveryTimeRange', { min: method.min_delivery_days, max: method.max_delivery_days })
                                                : t('shipping.deliveryTimeNotSpecified')}
                                        </p>
                                    </div>
                                    {method.free_shipping_threshold && cost === 0 && (
                                        <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400">
                                            {t('shipping.freeShipping')}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-lg font-bold tabular-nums text-foreground">{formatMoney(cost)}</p>
                                </div>
                                {isSelected && (
                                    <CheckCircle2 className="h-6 w-6 shrink-0 text-primary animate-in zoom-in-50 duration-200" />
                                )}
                            </div>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}