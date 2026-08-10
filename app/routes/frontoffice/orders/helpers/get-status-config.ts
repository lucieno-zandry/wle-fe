import { CheckCircle2, CircleOff, Clock, Wallet, type LucideProps } from "lucide-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import type { Order } from "wle-core";
import { getActiveShipment } from "./shipment-helpers";
import { t } from "i18next";

export type StatusConfig = {
    label: string;
    variant: "default" | "outline" | "secondary";
    icon: ForwardRefExoticComponent<Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>>;
    colorClass: string;
    requiresReview: boolean;
    showCTA?: boolean;
    canCancel?: boolean;
}

export const getStatusConfig = (order: Order): StatusConfig => {
    const transactions = order.transactions ?? [];
    const hasSucceeded = transactions.some(t => t.status === 'SUCCESS');
    const hasPending = transactions.some(t => t.status === 'PENDING');
    const isCancelled = order.status === 'CANCELLED';
    const isCompleted = order.status === 'COMPLETED';

    let statusConfig: StatusConfig = {
        label: t("orders:status.awaitingPayment"),
        variant: "secondary" as 'default' | 'outline' | 'secondary',
        icon: Wallet,
        colorClass: "text-muted-foreground",
        requiresReview: true,
        showCTA: true,
    };

    if (isCancelled) {
        statusConfig = {
            label: t("orders:status.cancelled"),
            variant: "secondary" as const,
            icon: CircleOff,
            colorClass: "",
            requiresReview: false,
        };
    } else if (isCompleted) {
        statusConfig = {
            label: t("orders:status.completed"),
            variant: "default" as const,
            icon: CheckCircle2,
            colorClass: "text-primary",
            requiresReview: false
        };
    } else if (hasSucceeded) {

        const canCancel = (hasSucceeded && order.shipments) && getActiveShipment(order.shipments)?.status === 'PENDING';

        statusConfig = {
            label: t("orders:status.paid"),
            variant: "default" as const,
            icon: CheckCircle2,
            colorClass: "text-primary",
            requiresReview: false,
            canCancel: canCancel,
        };
    } else if (hasPending) {
        statusConfig = {
            label: t("orders:status.processing"),
            variant: "outline" as const,
            icon: Clock,
            colorClass: "text-orange-500",
            requiresReview: false
        };
    }

    return statusConfig;
}