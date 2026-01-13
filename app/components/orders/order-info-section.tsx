// components/orders/OrderInfoSection.tsx
import { MapPin, Ticket } from "lucide-react";

interface OrderInfoSectionProps {
    addressSnapshot: { fullname: string };
    couponSnapshot?: { code: string } | null;
}

export function OrderInfoSection({ addressSnapshot, couponSnapshot }: OrderInfoSectionProps) {
    return (
        <div className="space-y-3">
            <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                <div className="text-xs text-muted-foreground">
                    <p className="font-semibold text-foreground/80">Shipping to</p>
                    <p className="line-clamp-1">{addressSnapshot.fullname}</p>
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