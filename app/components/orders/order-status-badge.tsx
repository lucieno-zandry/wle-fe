
// components/orders/OrderStatusBadge.tsx
import { Badge } from "~/components/ui/badge";
import { CheckCircle2, Clock, Wallet } from "lucide-react";

interface OrderStatusBadgeProps {
    transactions: Array<{ status: string }>;
}

export function OrderStatusBadge({ transactions }: OrderStatusBadgeProps) {
    const hasSucceeded = transactions.some(t => t.status === 'SUCCESS');
    const hasPending = transactions.some(t => t.status === 'PENDING');

    let config = {
        label: "Awaiting Payment",
        variant: "secondary" as 'default' | 'outline' | 'secondary',
        icon: Wallet,
        colorClass: "text-muted-foreground",
    };

    if (hasSucceeded) {
        config = {
            label: "Paid",
            variant: "default" as const,
            icon: CheckCircle2,
            colorClass: "text-primary",
        };
    } else if (hasPending) {
        config = {
            label: "Processing",
            variant: "outline" as const,
            icon: Clock,
            colorClass: "text-orange-500",
        };
    }

    return (
        <Badge variant={config.variant} className="text-[10px] px-1.5 py-0 h-4 uppercase font-semibold">
            {config.label}
        </Badge>
    );
}
