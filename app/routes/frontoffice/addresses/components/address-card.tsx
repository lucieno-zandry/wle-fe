import { Form, useNavigation } from "react-router";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Pencil, Trash2, MapPin, Phone, Building2 } from "lucide-react";
import useAddressStore from "~/stores/use-address-store";
import { Checkbox } from "../../../../components/ui/checkbox";
import { useTranslation } from "react-i18next";
import ConfirmDeleteDialog from "./confirm-delete-dialog";
import type { Address } from "wle-core";

type AddressCardProps = {
    address: Address;
    onEdit: (address: Address) => void;
};

export default function AddressCard({ address, onEdit }: AddressCardProps) {
    const navigation = useNavigation();
    const isSubmitting = navigation.state === "submitting";
    const { t } = useTranslation("addresses");

    const selectedAddresses = useAddressStore((s) => s.selectedAddresses);
    const setSelectedAddresses = useAddressStore((s) => s.setSelectedAddresses);

    const isChecked = selectedAddresses.some((a) => a.id === address.id);

    const toggleSelected = () => {
        if (isChecked) {
            setSelectedAddresses(selectedAddresses.filter((a) => a.id !== address.id));
        } else {
            setSelectedAddresses([...selectedAddresses, address]);
        }
    };

    // Build a compact address string
    const addressString = [
        address.line1,
        address.line2,
        address.city,
        address.state,
        address.postal_code,
        address.country
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <Card
            className={`transition-all duration-200 relative overflow-hidden ${isChecked
                ? "ring-2 ring-primary border-primary bg-primary/5"
                : "hover:border-primary/40 border-border"
                }`}
        >
            <CardHeader className="flex flex-row items-start justify-between pb-3">
                <div className="flex items-start gap-4">
                    <div className="mt-1">
                        <Checkbox
                            checked={isChecked}
                            onCheckedChange={toggleSelected}
                            aria-label={`Select address for ${address.recipient_name}`}
                        />
                    </div>

                    <div className="space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                            <CardTitle className="text-base flex items-center gap-2">
                                {address.address_type === 'billing' ? (
                                    <Building2 className="w-4 h-4 text-muted-foreground" />
                                ) : (
                                    <MapPin className="w-4 h-4 text-muted-foreground" />
                                )}
                                {address.recipient_name}
                            </CardTitle>

                            {address.label && (
                                <span className="rounded-full bg-secondary px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground">
                                    {address.label}
                                </span>
                            )}

                            {address.is_default && (
                                <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-primary">
                                    {t('default')}
                                </span>
                            )}
                        </div>
                        <CardDescription className="text-sm leading-relaxed max-w-[85%]">
                            {addressString}
                        </CardDescription>
                    </div>
                </div>

                <div className="flex gap-2 transition-opacity absolute right-4 top-4 sm:relative sm:right-auto sm:top-auto">
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => onEdit(address)}
                        title={t('edit')}
                    >
                        <Pencil className="h-4 w-4" />
                    </Button>

                    <ConfirmDeleteDialog
                        ids={[address.id]}
                        isLoading={isSubmitting}
                        trigger={
                            <Button
                                size="icon"
                                variant="ghost"
                                className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                disabled={isSubmitting}
                                title={t('delete')}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        }
                    />
                </div>
            </CardHeader>

            <CardContent className="pt-0 pb-4">
                <div className="pl-8 flex flex-wrap gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        <span>{address.phone}</span>
                    </div>
                    {address.phone_alt && (
                        <div className="flex items-center gap-1.5">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{address.phone_alt} {t('alt_phone_suffix')}</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}