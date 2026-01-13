import { Link } from "react-router";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Package, ChevronRight, Trash2 } from "lucide-react";
import formatMoney from "~/lib/format-money";
import { OrderStatusBadge } from "./order-status-badge";

interface OrderCardHeaderProps {
    order: Order;
    statusConfig: {
        colorClass: string;
    };
    onDelete: () => void;
}

export function OrderCardHeader({ order, statusConfig, onDelete }: OrderCardHeaderProps) {
    const date = new Date(order.created_at).toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
    });

    return (
        <CardHeader className="bg-muted/30 pb-4 border-b">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-background rounded-lg border shadow-sm">
                        <Package className={`w-5 h-5 ${statusConfig.colorClass}`} />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                                Order Number
                            </p>
                            <OrderStatusBadge transactions={order.transactions ?? []} />
                        </div>
                        <CardTitle className="text-base font-mono">#{order.uuid.split("-")[0]}</CardTitle>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="hidden sm:block text-right">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Date Placed</p>
                        <p className="text-sm font-medium">{date}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase mb-1">Total Amount</p>
                        <p className="text-sm font-bold text-primary">{formatMoney(order.total)}</p>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={onDelete}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                            <Trash2 className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                            <Link to={`/order/${order.uuid}`}>
                                <ChevronRight className="w-5 h-5" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </CardHeader>
    );
}