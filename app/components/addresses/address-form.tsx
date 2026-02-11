import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import Button from "../custom-components/button";
import AddressList from "../checkout/address-list";
import AddressDialog from "./address-dialog"; // The component we just updated
import { getAuthAddresses } from "~/api/http-requests";
import { Plus } from "lucide-react"; // If you use lucide-icons
import useAddressStore from "~/hooks/use-address-store";
import { useUserStore } from "~/hooks/use-user";
import { useActionData } from "react-router";
import { toast } from "sonner";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type ShippingAddressProps = {
    authAddresses: any[];
    selectedAddressId: number | null;
    setSelectedAddressId: (id: number | null) => void;
    onAddNewClick: () => void;
    handleNext: () => void;
    canNext: boolean;
    isDialogOpen: boolean;
    setIsDialogOpen: (open: boolean) => void;
    t: TFunction;
};

export function ShippingAddressSection({
    authAddresses,
    selectedAddressId,
    setSelectedAddressId,
    onAddNewClick,
    handleNext,
    canNext,
    isDialogOpen,
    setIsDialogOpen,
    t
}: ShippingAddressProps) {
    return (
        <div className="space-y-6">
            <Card className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-xl font-bold tracking-tight">{t('checkout:shippingAddress')}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t('checkout:selectDeliveryLocation')}
                        </p>
                    </div>
                    <Button
                        onClick={onAddNewClick}
                        variant="outline"
                        size="sm"
                        className="gap-2"
                    >
                        <Plus className="h-4 w-4" />
                        {t('checkout:addNew')}
                    </Button>
                </div>

                <AddressList
                    addresses={authAddresses}
                    selectedId={selectedAddressId}
                    onSelect={setSelectedAddressId}
                    onAddNewClick={onAddNewClick}
                />

                <div className="mt-8 border-t pt-6 flex justify-end">
                    <Button onClick={handleNext} disabled={!canNext} className="px-8">
                        {t('checkout:proceedToPayment')}
                    </Button>
                </div>
            </Card>

            {/* Dialog stays separate so it doesn't hide the list */}
            <AddressDialog open={isDialogOpen} onOpenChange={setIsDialogOpen} />
        </div>
    );
}


export default function ({ onNext }: { onNext: () => void }) {
    const { authAddresses, setAuthAddresses, selectedAddressId, setSelectedAddressId } = useAddressStore();
    const { user, setUser } = useUserStore();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const actionData = useActionData();
    const { t } = useTranslation("addresses");

    const canNext = useMemo(() => !(!selectedAddressId || !authAddresses || authAddresses.length === 0), [selectedAddressId, authAddresses]);

    useEffect(() => {
        if (authAddresses) return; // Prevent refetching if already loaded

        getAuthAddresses().then(res => {
            if (res.data?.addresses) {
                const list = res.data.addresses;
                setAuthAddresses(list);

                // Auto-select default or the first one found
                setSelectedAddressId(user?.address_id ?? list[0]?.id ?? null);
            }
        });
    }, [authAddresses]);

    useEffect(() => {
        if (selectedAddressId || !user?.address_id) return;
        setSelectedAddressId(user.address_id)
    }, [selectedAddressId, user]);


    useEffect(() => {
        if (!actionData?.address || !actionData?.user) return;

        setAuthAddresses(prev => {
            if (!prev) return [actionData.address];
            if (prev.some(a => a.id === actionData.address.id)) return prev;
            return [...prev, actionData.address];
        });

        setUser(actionData.user);
        setSelectedAddressId(actionData.address.id);
        setIsDialogOpen(false);

        toast.success(t('addresses:notifications.created'));
    }, [actionData, setAuthAddresses, setUser, setSelectedAddressId]);

    const handleNext = () => {
        if (!canNext) return;
        onNext();
    }

    const onAddNewClick = () => {
        setIsDialogOpen(true)
    }

    return <ShippingAddressSection
        authAddresses={authAddresses || []}
        selectedAddressId={selectedAddressId}
        setSelectedAddressId={setSelectedAddressId}
        onAddNewClick={onAddNewClick}
        handleNext={handleNext}
        canNext={canNext}
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        t={t}
    />
}