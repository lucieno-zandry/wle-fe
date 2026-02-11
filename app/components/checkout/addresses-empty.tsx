import { MapPinOff } from "lucide-react";
import Button from "../custom-components/button";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";

type AddressesEmptyProps = {
    onAddNewClick: () => void;
    t: TFunction;
};

export function AddressesEmpty({ onAddNewClick, t }: AddressesEmptyProps) {
    return (
        <div className="flex min-h-[300px] flex-col items-center justify-center rounded-md border border-dashed p-8 text-center animate-in fade-in-50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                <MapPinOff className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">{t('addresses:noAddressesFound')}</h3>
            <p className="mb-4 mt-2 text-sm text-muted-foreground">
                {t('addresses:noAddressesDescription')}
            </p>
            <Button variant="outline" size="sm" type="button" onClick={onAddNewClick}>
                {t('addresses:addNewAddress')}
            </Button>
        </div>
    );
}

export default function (props: Pick<AddressesEmptyProps, "onAddNewClick">) {
    const { t } = useTranslation("addresses");

    return <AddressesEmpty t={t} {...props} />;
}