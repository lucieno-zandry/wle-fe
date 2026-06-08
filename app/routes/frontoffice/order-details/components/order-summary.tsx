import { CreditCard, Receipt, TicketPercent, Trash2, Truck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../../../../components/ui/card";

import { Separator } from "../../../../components/ui/separator";
import { useState } from "react";
import { createTransaction } from "~/api/http-requests";
import { toast } from "sonner";
import Button from "../../../../components/custom-components/button";
import appNavigate from "~/lib/app-navigate";
import { useFormatMoney } from "~/lib/format-money";
import { HttpException, ValidationException } from "~/api/app-fetch";
import { DeleteOrderDialog } from "../../../../components/delete-order-dialog";
import { useTranslation } from "react-i18next";
import type { Order, Transaction } from "wle-core";

function OrderSummary({ order, statusConfig, method }: { order: Order; statusConfig: any; method: Transaction['payment_method'] }) {
    const subtotal = order.cart_items?.reduce((acc, item) => acc + item.total, 0) ?? 0;
    const shippingCost = order.shipping_cost ?? 0;
    const shippingMethodName = order.shipping_method_snapshot?.name;
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const formatMoney = useFormatMoney();
    const { t } = useTranslation("order-details");

    const handlePay = () => {
        setLoading(true);
        createTransaction({
            amount: order.total,
            payment_method: method,
            order_uuid: order.uuid,
        })
            .then(response => {
                if (response.data?.transaction.informations?.payment_url)
                    location.href = response.data.transaction.informations.payment_url;
            })
            .catch((error) => {
                if (error instanceof HttpException) {
                    toast.error(error.data?.message || t("summary.toast.failedToInitiate", { status: error.status }));
                } else if (error instanceof ValidationException) {
                    toast.error(error.message);
                } else {
                    toast.error(t("summary.toast.somethingWentWrong"), { description: error?.toString?.() });
                }
            })
            .finally(() => {
                setLoading(false);
            })
    }

    const handleDeleteSuccess = () => {
        appNavigate("/orders");
    };

    return (
        <>
            <Card className="bg-primary/[0.02] border-primary/10">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-muted-foreground" />
                        {t("summary.title")}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>{t("summary.subtotal")}</span>
                            <span>{formatMoney(subtotal)}</span>
                        </div>
                        {shippingCost > 0 && (
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span className="flex items-center gap-1">
                                    <Truck className="w-4 h-4" />
                                    {shippingMethodName
                                        ? t("summary.shippingWithMethod", { method: shippingMethodName })
                                        : t("summary.shipping")}
                                </span>
                                <span>{formatMoney(shippingCost)}</span>
                            </div>
                        )}
                        {order.coupon_snapshot && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span className="flex items-center gap-1">
                                    <TicketPercent className="w-4 h-4" />
                                    {t("summary.coupon", { code: order.coupon_snapshot.code })}
                                </span>
                                <span>-{formatMoney(order.coupon_discount_applied)}</span>
                            </div>
                        )}
                        <Separator className="my-4" />
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-lg">{t("summary.total")}</span>
                            <span className="font-bold text-2xl text-primary">{formatMoney(order.total)}</span>
                        </div>
                    </div>

                    <div className="pt-4 space-y-2">
                        {statusConfig.showCTA ? (
                            <Button
                                className="w-full flex items-center gap-2"
                                onClick={handlePay}
                                isLoading={loading}
                            >
                                <CreditCard className="w-4 h-4" />
                                {t("summary.pay", { amount: formatMoney(order.total) })}
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full text-xs" onClick={() => window.print()}>
                                {t("summary.downloadInvoice")}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            {t("summary.deleteOrder")}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <DeleteOrderDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
                orderUuid={order.uuid}
                onSuccess={handleDeleteSuccess}
            />
        </>
    );
}

export default OrderSummary;