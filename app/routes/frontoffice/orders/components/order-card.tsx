// components/orders/OrderCard.tsx
import { Card, CardContent } from "~/components/ui/card";
import { OrderCardHeader } from "./order-card-header";
import { OrderItemsPreview } from "./order-items-preview";
import { OrderInfoSection } from "./order-info-section";
import { OrderActionButton } from "./order-action-button";
import { useState } from "react";
import { DeleteOrderDialog } from "../../../../components/delete-order-dialog";
import { useRevalidator } from "react-router";
import { useFormatMoney } from "~/lib/format-money";
import { useTranslation } from "react-i18next";
import type { Order } from "wle-core";
import { getStatusConfig } from "../helpers/get-status-config";

interface OrderCardProps {
    order: Order;
}

export function OrderCard({ order }: OrderCardProps) {
    const { t } = useTranslation("orders");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const statusConfig = getStatusConfig(order);

    const formatMoney = useFormatMoney();

    const revalidator = useRevalidator();

    return (
        <>
            <Card className="overflow-hidden transition-all hover:shadow-md border-muted/60">
                <OrderCardHeader
                    order={order}
                    statusConfig={statusConfig}
                    onDelete={() => setShowDeleteDialog(true)}
                    formatMoney={formatMoney}
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