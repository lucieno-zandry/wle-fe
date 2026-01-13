// components/orders/OrderCard.tsx
import { Card, CardContent } from "~/components/ui/card";
import { OrderCardHeader } from "./order-card-header";
import { OrderItemsPreview } from "./order-items-preview";
import { OrderInfoSection } from "./order-info-section";
import { OrderActionButton } from "./order-action-button";
import { CheckCircle2, Clock, Wallet } from "lucide-react";
import { useState } from "react";
import { DeleteOrderDialog } from "./delete-order-dialog";
import { useRevalidator } from "react-router";

interface OrderCardProps {
    order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const transactions = order.transactions ?? [];
    const hasSucceeded = transactions.some(t => t.status === 'SUCCESS');
    const hasPending = transactions.some(t => t.status === 'PENDING');

    const revalidator = useRevalidator();

    let statusConfig = {
        label: "Awaiting Payment",
        variant: "secondary" as 'default' | 'outline' | 'secondary',
        icon: Wallet,
        colorClass: "text-muted-foreground",
        requiresReview: true
    };

    if (hasSucceeded) {
        statusConfig = {
            label: "Paid",
            variant: "default" as const,
            icon: CheckCircle2,
            colorClass: "text-primary",
            requiresReview: false
        };
    } else if (hasPending) {
        statusConfig = {
            label: "Processing",
            variant: "outline" as const,
            icon: Clock,
            colorClass: "text-orange-500",
            requiresReview: false
        };
    }

    return (
        <>
            <Card className="overflow-hidden transition-all hover:shadow-md border-muted/60">
                <OrderCardHeader
                    order={order}
                    statusConfig={statusConfig}
                    onDelete={() => setShowDeleteDialog(true)}
                />
                <CardContent className="p-0">
                    <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
                        <OrderItemsPreview items={order.cart_items ?? []} />
                        <div className={`p-6 flex flex-col justify-between space-y-4 ${statusConfig.requiresReview ? 'bg-primary/[0.03]' : 'bg-muted/10'}`}>
                            <OrderInfoSection
                                addressSnapshot={order.address_snapshot}
                                couponSnapshot={order.coupon_snapshot}
                            />
                            <OrderActionButton
                                orderUuid={order.uuid}
                                requiresReview={statusConfig.requiresReview}
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            <DeleteOrderDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                orderUuid={order.uuid}
                onSuccess={revalidator.revalidate}
            />
        </>
    );
}