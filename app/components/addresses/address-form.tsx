import { useEffect, useMemo, useState } from "react";
import { Card } from "../ui/card";
import Button from "../custom-components/button";
import AddressList from "../checkout/address-list";
import AddressDialog from "./address-dialog";
import { getAuthAddresses } from "~/api/http-requests";
import { Plus, MapPin } from "lucide-react";
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
            <Card className="p-6 md:p-8 overflow-hidden shadow-sm border-muted/60">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                    <div className="space-y-1">
                        <h2 className="text-2xl font-semibold tracking-tight">{t('checkout:shippingAddress')}</h2>
                        <p className="text-sm text-muted-foreground">
                            {t('checkout:selectDeliveryLocation')}
                        </p>
                    </div>
                    {authAddresses.length > 0 && (
                        <Button
                            onClick={onAddNewClick}
                            variant="secondary"
                            size="sm"
                            className="gap-2 shrink-0"
                        >
                            <Plus className="h-4 w-4" />
                            {t('checkout:addNew')}
                        </Button>
                    )}
                </div>

                {authAddresses.length === 0 ? (
                    <div className="text-center py-12 px-4 rounded-xl border border-dashed border-muted-foreground/25 bg-muted/10">
                        <div className="mx-auto bg-muted/30 w-12 h-12 rounded-full flex items-center justify-center mb-4">
                            <MapPin className="h-6 w-6 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-medium mb-1">No addresses found</h3>
                        <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                            Please add a shipping address to proceed with your checkout.
                        </p>
                        <Button onClick={onAddNewClick} className="gap-2">
                            <Plus className="h-4 w-4" />
                            {t('checkout:addNew')}
                        </Button>
                    </div>
                ) : (
                    <div className="bg-muted/5 rounded-xl p-1">
                        <AddressList
                            addresses={authAddresses}
                            selectedId={selectedAddressId}
                            onSelect={setSelectedAddressId}
                            onAddNewClick={onAddNewClick}
                        />
                    </div>
                )}

                <div className="mt-10 border-t pt-6 flex justify-end">
                    <Button
                        onClick={handleNext}
                        disabled={!canNext}
                        size="lg"
                        className="w-full sm:w-auto px-10 shadow-sm"
                    >
                        {t('checkout:proceedToPayment')}
                    </Button>
                </div>
            </Card>

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
        if (authAddresses) return;

        getAuthAddresses().then(res => {
            if (res.data?.addresses) {
                const list = res.data.addresses;
                setAuthAddresses(list);

                const defaultAddr = list.find(addr => addr.is_default);
                setSelectedAddressId(defaultAddr?.id ?? list[0]?.id ?? null);
            }
        });
    }, [authAddresses, setAuthAddresses, setSelectedAddressId]);

    useEffect(() => {
        if (!actionData?.address || !actionData?.user) return;

        setAuthAddresses(prev => {
            if (!prev) return [actionData.address];
            if (prev.some(a => a.id === actionData.address.id)) return prev;
            return [...prev, actionData.address];
        });

        if (actionData.address.is_default) {
            setSelectedAddressId(actionData.address.id);
        }

        setUser(actionData.user);
        setIsDialogOpen(false);

        toast.success(t('addresses:notifications.created'));
    }, [actionData, setAuthAddresses, setUser, setSelectedAddressId]);

    const handleNext = () => {
        if (!canNext) return;
        onNext();
    };

    const onAddNewClick = () => setIsDialogOpen(true);

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
    />;
}