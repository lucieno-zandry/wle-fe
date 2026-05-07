// components/ui/payment-method-selector.tsx
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";
import { useTranslation } from "react-i18next";

export interface PaymentMethod {
    value: string;
    label: string;               // already translated
    disabledLabel?: string;      // optional, shown as a badge when disabled
    requiresPhone?: boolean;     // used by parent to conditionally show phone field
    disabled?: boolean;
}

type PaymentMethodOption = {
    value: string;
    labelKey: string;
    requiresPhone: boolean;
    disabled?: boolean;
    disabledLabelKey?: string;
};

interface PaymentMethodSelectorProps {
    selectedValue: string;
    onChange: (value: string) => void;
    className?: string;
}

export const paymentMethods: PaymentMethodOption[] = [
    {
        value: "card",
        labelKey: "payment.methods.card",
        requiresPhone: false,
        disabled: true,
        disabledLabelKey: "payment.coming_soon",
    },
    { value: "paypal", labelKey: "payment.methods.paypal", requiresPhone: false },
    // { value: "orangemoney", labelKey: "payment.methods.orangemoney", requiresPhone: true },
    // { value: "airtelmoney", labelKey: "payment.methods.airtelmoney", requiresPhone: true },
    // { value: "mvola", labelKey: "payment.methods.mvola", requiresPhone: true },
];


export function PaymentMethodSelector({
    selectedValue,
    onChange,
    className,
}: PaymentMethodSelectorProps) {
    const { t } = useTranslation('checkout');

    const methods: PaymentMethod[] = paymentMethods.map((method) => ({
        value: method.value,
        label: t(method.labelKey),
        disabledLabel: method.disabledLabelKey ? t(method.disabledLabelKey) : undefined,
        requiresPhone: method.requiresPhone,
        disabled: method.disabled,
    }));

    const handleValueChange = (value: string) => {
        const method = methods.find((m) => m.value === value);
        if (!method?.disabled) {
            onChange(value);
        }
    };

    return (
        <RadioGroup
            value={selectedValue}
            onValueChange={handleValueChange}
            className={cn("grid gap-3 sm:grid-cols-2", className)}
        >
            {methods.map((method) => {
                const isActive = selectedValue === method.value;
                return (
                    <Label
                        key={method.value}
                        className={cn(
                            "relative flex flex-col items-start gap-2 rounded-2xl border-2 p-4 transition-all cursor-pointer",
                            isActive
                                ? "border-primary bg-primary/[0.03] shadow-sm"
                                : "border-muted bg-muted/20 hover:bg-muted/40",
                            method.disabled && "cursor-not-allowed opacity-60 grayscale-[0.5]"
                        )}
                    >
                        <div className="flex w-full items-center justify-between">
                            <RadioGroupItem
                                value={method.value}
                                disabled={method.disabled}
                                className={cn(isActive && "border-primary text-primary")}
                            />
                            {method.disabled && method.disabledLabel && (
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-tight">
                                    {method.disabledLabel}
                                </Badge>
                            )}
                        </div>
                        <span className="mt-1 font-semibold text-foreground">{method.label}</span>
                    </Label>
                );
            })}
        </RadioGroup>
    );
}