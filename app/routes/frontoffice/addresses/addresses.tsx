import {
    redirect,
    useActionData,
    useLoaderData,
    useNavigation,
} from "react-router"
import type { ActionFunctionArgs } from "react-router"
import { useEffect, useState } from "react"
import { useTranslation } from "react-i18next";

import { Button } from "~/components/ui/button"
import { Checkbox } from "~/components/ui/checkbox"

import {
    Plus,
    Trash2,
    MapPin,
} from "lucide-react"

import { createAddress, getAuthAddresses, removeAddresses, updateAddress } from "~/api/http-requests"
import AddressDialog from "~/components/address-dialog"
import { toast } from "sonner"
import AddressCard from "~/routes/frontoffice/addresses/components/address-card"
import { useUserStore } from "~/hooks/use-user"
import useAddressStore from "~/stores/use-address-store"
import ConfirmDeleteDialog from "~/routes/frontoffice/addresses/components/confirm-delete-dialog"
import { HttpException, ValidationException } from "~/api/app-fetch"
import i18next from "i18next";
import type { Address } from "wle-core";

export async function clientLoader() {
    const { authAddresses, setAuthAddresses } = useAddressStore.getState();
    if (authAddresses) return authAddresses;

    const response = await getAuthAddresses();

    if (response.data?.addresses) {
        setAuthAddresses(response.data.addresses);
    }

    return response.data?.addresses;
}

export async function clientAction({ request, params }: ActionFunctionArgs) {
    const formData = await request.formData()
    const intent = formData.get("_intent");
    const { setUser, user } = useUserStore.getState();
    const { setAuthAddresses } = useAddressStore.getState();
    const { lang } = params;

    const isDefault = formData.get('is_default');
    if (!isDefault) formData.set("is_default", "0");

    try {
        if (intent === "create-address") {
            const response = await createAddress(formData);
            if (response.data) setUser(response.data.user);
            setAuthAddresses(null);
            toast.success(i18next.t('addresses:notifications.created'));
            return redirect(`/${lang}/addresses`)
        }

        if (intent === "update-address") {
            const id = Number(formData.get("id"));
            const response = await updateAddress(id, formData);
            if (response.data) setUser(response.data.user);
            setAuthAddresses(null);
            toast.success(i18next.t('addresses:notifications.updated'));
            return redirect(`/${lang}/addresses`)
        }

        if (intent === "delete") {
            const id = Number(formData.get("id"));
            await removeAddresses([id]);
            setAuthAddresses(null);
            toast.success(i18next.t('addresses:notifications.deleted'));

            return redirect(`/${lang}/addresses`)
        }

        if (intent === "bulk-delete") {
            const ids = formData.getAll("ids[]").map((v) => Number(v));
            await removeAddresses(ids as number[]);
            setAuthAddresses(null);
            toast.success(i18next.t('addresses:notifications.bulk_deleted'));
            return redirect(`/${lang}/addresses`)
        }
    } catch (error) {
        return error;
    }
    return null
}

export default function AddressesPage() {
    const { t } = useTranslation(["addresses", "common"]);
    const addresses = useLoaderData<Address[]>();
    const navigation = useNavigation();

    const selectedAddresses = useAddressStore((s) => s.selectedAddresses);
    const setSelectedAddresses = useAddressStore((s) => s.setSelectedAddresses);

    const [editing, setEditing] = useState<Address>();
    const [confirmDeleteDialogOpen, setConfirmDeleteDialogOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);
    const actionData = useActionData();

    const errors = actionData instanceof ValidationException ? actionData.errors : null;

    useEffect(() => {
        if (navigation.state === "idle" && !(actionData instanceof HttpException || actionData instanceof ValidationException)) {
            setDialogOpen(false);
            setConfirmDeleteDialogOpen(false);
            setSelectedAddresses([]);
        }
    }, [navigation.state, actionData, setSelectedAddresses]);

    return (
        <>
            <div className="space-y-8 p-6 max-w-5xl mx-auto">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">{t("addresses:title")}</h1>
                        <p className="text-muted-foreground mt-1">{t("addresses:page_subtitle")}</p>
                    </div>
                    {addresses.length > 0 && (
                        <Button
                            onClick={() => {
                                setEditing(undefined);
                                setDialogOpen(true);
                            }}
                            className="shadow-sm"
                        >
                            <Plus className="mr-2 h-4 w-4" />
                            {t("addresses:new_address")}
                        </Button>
                    )}
                </div>

                {/* Main Content Area */}
                {addresses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border rounded-2xl bg-muted/10 border-dashed">
                        <div className="bg-muted w-16 h-16 rounded-full flex items-center justify-center mb-6">
                            <MapPin className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">{t("addresses:no_addresses")}</h3>
                        <p className="text-muted-foreground max-w-sm mb-8">
                            {t("addresses:empty_description")}
                        </p>
                        <Button
                            size="lg"
                            onClick={() => {
                                setEditing(undefined);
                                setDialogOpen(true);
                            }}
                            className="shadow-sm"
                        >
                            <Plus className="mr-2 h-5 w-5" />
                            {t("addresses:new_address")}
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Contextual Bulk Action Bar */}
                        <div className={`flex items-center justify-between gap-4 p-3 rounded-lg border transition-all duration-300 ${selectedAddresses.length > 0
                                ? "bg-muted/40 opacity-100 translate-y-0"
                                : "opacity-0 -translate-y-2 pointer-events-none hidden"
                            }`}>
                            <div className="flex items-center gap-3 px-2">
                                <Checkbox
                                    checked={addresses.length > 0 && selectedAddresses.length === addresses.length}
                                    onCheckedChange={(v) => {
                                        v ? setSelectedAddresses(addresses) : setSelectedAddresses([]);
                                    }}
                                    id="select-all-addresses"
                                />
                                <label htmlFor="select-all-addresses" className="text-sm font-medium cursor-pointer">
                                    {t("addresses:selected_count", { count: selectedAddresses.length })}
                                </label>
                            </div>

                            <ConfirmDeleteDialog
                                ids={selectedAddresses.map((a) => a.id)}
                                open={confirmDeleteDialogOpen}
                                onOpenChange={setConfirmDeleteDialogOpen}
                                trigger={
                                    <Button type="button" variant="destructive" size="sm" className="shadow-sm">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        {t("addresses:delete_selected")}
                                    </Button>
                                }
                                isLoading={navigation.state === "submitting"}
                            />
                        </div>

                        {/* Address Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 xl:gap-6">
                            {addresses.map((address) => (
                                <AddressCard
                                    key={address.id}
                                    address={address}
                                    onEdit={(addr) => {
                                        setEditing(addr);
                                        setDialogOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <AddressDialog
                onOpenChange={setDialogOpen}
                open={dialogOpen}
                address={editing}
                errors={errors}
            />
        </>
    );
}