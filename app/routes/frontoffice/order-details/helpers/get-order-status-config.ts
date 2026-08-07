import { AlertCircle, CheckCircle2, Clock, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { Order } from "wle-core";
import { getActiveShipment } from "./shipment-helpers";

export type OrderStatusConfig = {
    labelKey: string;
    variant: string;
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    showCTA: boolean;
    canCancel?: boolean;
}

// lib/order-utils.ts
export function getOrderStatusConfig(order: Order): OrderStatusConfig {
    const transactions = order.transactions ?? [];
    const hasSucceeded = transactions.some(t => t.status === 'SUCCESS');
    const hasPending = transactions.some(t => t.status === 'PENDING');

    const canCancel = (hasSucceeded && order.shipments) && getActiveShipment(order.shipments)?.status === 'PENDING';

    if (hasSucceeded) return { labelKey: "status.paid", variant: "default", icon: CheckCircle2, showCTA: false, canCancel };
    if (hasPending) return { labelKey: "status.paymentPending", variant: "outline", icon: Clock, showCTA: false };
    return { labelKey: "status.paymentRequired", variant: "destructive", icon: AlertCircle, showCTA: true };
}