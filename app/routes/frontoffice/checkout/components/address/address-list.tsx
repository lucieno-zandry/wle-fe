// routes/checkout/components/address/address-list.tsx
import { useTranslation } from "react-i18next";
import { cn } from "~/lib/utils";
import { CheckCircle2, MapPinOff, Home } from "lucide-react";
import type { Address } from "wle-core";

type Props = {
    addresses: Address[];
    selectedId: number | null;
    onSelect: (id: number) => void;
};

export default function AddressList({ addresses, selectedId, onSelect }: Props) {
    const { t } = useTranslation("checkout");

    if (addresses.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted/50">
                    <MapPinOff className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-medium">{t("address.no_addresses_title", "No addresses found")}</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    {t("address.no_addresses_desc", "Please add a new delivery address to proceed with your order.")}
                </p>
            </div>
        );
    }

    return (
        <ul className="grid gap-3 sm:grid-cols-2">
            {addresses.map((addr) => {
                const isSelected = selectedId === addr.id;

                return (
                    <li key={addr.id}>
                        <button
                            type="button"
                            className={cn(
                                "group relative flex w-full flex-col items-start gap-4 rounded-xl border-2 p-5 text-left transition-all duration-200 focus:outline-none focus-visible:ring-4 focus-visible:ring-primary/20",
                                isSelected
                                    ? "border-primary bg-primary/[0.03] shadow-sm"
                                    : "border-transparent bg-muted/40 hover:bg-muted/60"
                            )}
                            onClick={() => onSelect(addr.id)}
                        >
                            <div className="flex w-full items-start justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className={cn(
                                        "flex h-8 w-8 items-center justify-center rounded-full transition-colors",
                                        isSelected ? "bg-primary/10 text-primary" : "bg-background text-muted-foreground shadow-sm"
                                    )}>
                                        <Home className="h-4 w-4" />
                                    </div>
                                    <div className="font-semibold tracking-tight text-foreground">
                                        {addr.recipient_name}
                                    </div>
                                </div>
                                {isSelected && (
                                    <CheckCircle2 className="h-6 w-6 shrink-0 text-primary animate-in zoom-in-50 duration-200" />
                                )}
                            </div>

                            <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                                <p className="leading-relaxed">
                                    {addr.line1}
                                    {addr.line2 && <><br />{addr.line2}</>}
                                </p>
                                <p>
                                    {addr.city}, {addr.state} {addr.postal_code}
                                </p>
                                <p className="font-medium text-foreground/80 pt-2">
                                    {addr.phone}
                                    {addr.phone_alt && <span className="text-muted-foreground font-normal"> / {addr.phone_alt}</span>}
                                </p>
                            </div>

                            {addr.label && (
                                <span className={cn(
                                    "absolute right-4 bottom-4 inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider",
                                    isSelected ? "bg-primary/10 text-primary" : "bg-muted-foreground/10 text-muted-foreground"
                                )}>
                                    {addr.label}
                                </span>
                            )}
                        </button>
                    </li>
                );
            })}
        </ul>
    );
}