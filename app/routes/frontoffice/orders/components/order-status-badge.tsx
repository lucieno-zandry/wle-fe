
// components/orders/OrderStatusBadge.tsx
import { Badge } from "~/components/ui/badge";
import type { StatusConfig } from "../helpers/get-status-config";

interface OrderStatusBadgeProps {
    transactions: Array<{ status: string }>;
    statusConfig: StatusConfig
}

export function OrderStatusBadge({ transactions, statusConfig }: OrderStatusBadgeProps) {
    return (
        <Badge variant={statusConfig.variant} className="text-[10px] px-1.5 py-0 h-4 uppercase font-semibold">
            {statusConfig.label}
        </Badge>
    );
}
