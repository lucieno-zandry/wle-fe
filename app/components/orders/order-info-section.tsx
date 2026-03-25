import { MapPin, Ticket } from "lucide-react";

interface OrderInfoSectionProps {
    addressSnapshot: {
        recipient_name: string;
        line1: string;
        line2?: string;
        city: string;
        state?: string;
        postal_code: string;
        country: string;
        phone: string;
        phone_alt?: string;
    };
    couponSnapshot?: { code: string } | null;
}

export function OrderInfoSection({ addressSnapshot, couponSnapshot }: OrderInfoSectionProps) {
    const fullAddress = [
        addressSnapshot.line1,
        addressSnapshot.line2,
        addressSnapshot.city,
        addressSnapshot.state,
        addressSnapshot.postal_code,
        addressSnapshot.country
    ]
        .filter(Boolean)
        .join(", ");

    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground/80">Shipping to</p>
                    <p className="font-medium text-foreground">{addressSnapshot.recipient_name}</p>
                    <p className="line-clamp-1">{fullAddress}</p>
                    <p>{addressSnapshot.phone}</p>
                </div>
            </div>

            {couponSnapshot && (
                <div className="flex items-start gap-2">
                    <Ticket className="w-4 h-4 text-emerald-600 mt-0.5" />
                    <div className="text-xs">
                        <p className="font-semibold text-emerald-700">Coupon Used</p>
                        <p className="text-muted-foreground">{couponSnapshot.code}</p>
                    </div>
                </div>
            )}
        </div>
    );
}