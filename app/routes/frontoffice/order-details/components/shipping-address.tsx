import { MapPin, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "~/components/ui/card";
import { useTranslation } from "react-i18next";
import type { Address } from "wle-core";

export function ShippingAddress({ address }: { address: Address }) {
    const { t } = useTranslation("order-details");
    const fullAddress = [
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
        <Card>
            <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    {t("shippingAddress.title")}
                </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
                <p className="font-bold text-base">{address.recipient_name}</p>
                <div className="text-muted-foreground leading-relaxed">
                    <p>{fullAddress}</p>
                </div>
                <div className="flex items-center gap-2 pt-2 text-foreground/80">
                    <Phone className="w-3.5 h-3.5" />
                    {address.phone}
                    {address.phone_alt && t("shippingAddress.altPhone", { phone: address.phone_alt })}
                </div>
            </CardContent>
        </Card>
    );
}