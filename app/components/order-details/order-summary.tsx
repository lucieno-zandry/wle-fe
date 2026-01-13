import { CreditCard, Receipt, TicketPercent, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import formatMoney from "~/lib/format-money";
import { Separator } from "../ui/separator";
import { useState } from "react";
import { createTransaction } from "~/api/http-requests";
import { toast } from "sonner";
import Button from "../custom-components/button";
import { DeleteOrderDialog } from "~/components/orders/delete-order-dialog";
import { useNavigate } from "react-router";

function OrderSummary({ order, statusConfig, method }: { order: Order; statusConfig: any; method: Transaction['method'] }) {
    const navigate = useNavigate();
    const subtotal = order.cart_items?.reduce((acc, item) => acc + item.total, 0) ?? 0;
    const [loading, setLoading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    const handlePay = () => {
        setLoading(true);
        createTransaction({
            amount: order.total,
            method,
            order_uuid: order.uuid,
        })
            .then(response => {
                if (response.data?.transaction.payment_url)
                    location.href = response.data.transaction.payment_url;

            })
            .catch((error) => {
                toast.error(`Failed to initiate transaction with status : ${error.status}`);
            })
            .finally(() => {
                setLoading(false);
            })
    }

    const handleDeleteSuccess = () => {
        navigate("/orders");
    };

    return (
        <>
            <Card className="bg-primary/[0.02] border-primary/10">
                <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-muted-foreground" />
                        Payment Summary
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm text-muted-foreground">
                            <span>Subtotal</span>
                            <span>{formatMoney(subtotal)}</span>
                        </div>
                        {order.coupon_snapshot && (
                            <div className="flex justify-between text-sm text-emerald-600">
                                <span className="flex items-center gap-1">
                                    <TicketPercent className="w-4 h-4" />
                                    Coupon ({order.coupon_snapshot.code})
                                </span>
                                <span>-{formatMoney(order.coupon_discount_applied)}</span>
                            </div>
                        )}
                        <Separator className="my-4" />
                        <div className="flex justify-between items-center pt-2">
                            <span className="font-bold text-lg">Total</span>
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
                                Pay {formatMoney(order.total)}
                            </Button>
                        ) : (
                            <Button variant="outline" className="w-full text-xs" onClick={() => window.print()}>
                                Download Invoice (PDF)
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowDeleteDialog(true)}
                            className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 border-destructive/20"
                        >
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete Order
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