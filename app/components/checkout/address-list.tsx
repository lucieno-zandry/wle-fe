import { Card } from "../ui/card";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Label } from "../ui/label";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button"; // Added Button for an Action
import { MapPinOff } from "lucide-react"; // Added an icon for the empty state
import { cn } from "~/lib/utils";
import { AddressListSkeleton } from "../addresses/address-list-skeleton";
import AddressesEmpty from "./addresses-empty";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type AddressListProps = {
    addresses: Address[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    t: TFunction
};

export function AddressList({ addresses, selectedId, onSelect, t }: AddressListProps) {
    // Format address for display (line1, line2, city, etc.)
    const formatAddress = (addr: Address) => {
        const parts = [addr.line1];
        if (addr.line2) parts.push(addr.line2);
        parts.push(addr.city);
        if (addr.state) parts.push(addr.state);
        parts.push(addr.postal_code);
        parts.push(addr.country);
        return parts.filter(Boolean).join(", ");
    };

    return (
        <RadioGroup
            value={selectedId?.toString()}
            onValueChange={(val) => onSelect(Number(val))}
            className="grid gap-4"
        >
            {addresses.map((addr) => {
                const isSelected = selectedId === addr.id;

                return (
                    <Card
                        key={addr.id}
                        className={cn(
                            "relative transition-all hover:border-primary/50",
                            isSelected ? "border-primary ring-1 ring-primary" : "border-muted"
                        )}
                    >
                        <Label
                            htmlFor={`addr-${addr.id}`}
                            className="flex items-start gap-4 p-4 cursor-pointer"
                        >
                            <RadioGroupItem
                                value={addr.id.toString()}
                                id={`addr-${addr.id}`}
                                className="mt-1"
                            />

                            <div className="flex-1 space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="font-semibold leading-none">{addr.recipient_name}</p>
                                    {addr.is_default && (
                                        <Badge variant="secondary" className="text-[10px] uppercase">
                                            {t('addresses:default')}
                                        </Badge>
                                    )}
                                </div>

                                <div className="text-sm text-muted-foreground">
                                    <p>{formatAddress(addr)}</p>
                                </div>

                                <p className="text-sm font-medium text-foreground/80 pt-1">
                                    {addr.phone}
                                    {addr.phone_alt && ` | ${addr.phone_alt}`}
                                </p>
                            </div>
                        </Label>
                    </Card>
                );
            })}
        </RadioGroup>
    );
}

export default function ({
    addresses,
    selectedId,
    onSelect,
    onAddNewClick
}: {
    addresses: Address[] | null;
    selectedId: number | null;
    onSelect: (id: number) => void;
    onAddNewClick: () => void;
}) {
    const { t } = useTranslation("addresses");

    if (!addresses) return <AddressListSkeleton />;

    if (addresses.length === 0) {
        return <AddressesEmpty onAddNewClick={onAddNewClick} />;
    }

    return <AddressList
        addresses={addresses}
        selectedId={selectedId}
        onSelect={onSelect}
        t={t} />;
}