import { useLoaderData, Link, type LoaderFunctionArgs, redirect, useRevalidator } from "react-router";

// Local Sub-components
import OrderHeader from "./components/order-header";
import OrderItemList from "./components/order-item-list";
import OrderSummary from "./components/order-summary";

import { getOrder } from "~/api/http-requests";
import useCheckoutStore from "~/hooks/use-checkout-store";
import { getOrderStatusConfig } from "~/lib/get-order-status-config";
import { ShippingAddress } from "./components/shipping-address";
import PaymentIncompleteAlert from "./components/payment-incomplete-alert";
import ShipmentStatus from "./components/shipment-status";
import { TransactionList } from "./components/transactions/transaction-list";
import { useFormatMoney } from "~/lib/format-money";
import NotFoundErrorPage from "~/routes/common/not-found-error-page";
import { PaymentMethodSelector } from "~/components/payment-method-selector";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
    if (!params.uuid) return redirect(`/${params.lang}/403`);
    const response = await getOrder(params.uuid);
    return response.data;
}

export default function OrderDetails() {
    const { order } = useLoaderData<{ order?: Order }>();
    const { method, setMethod } = useCheckoutStore();
    const revalidator = useRevalidator();

    if (!order) return <NotFoundErrorPage />;

    const statusConfig = getOrderStatusConfig(order);
    const handleActionComplete = () => revalidator.revalidate();
    const formatMoney = useFormatMoney();

    return (
        <div className="container max-w-6xl mx-auto p-4 md:p-10 space-y-8">
            <OrderHeader order={order} statusConfig={statusConfig} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Column (Items) */}
                {order.cart_items && (
                    <div className="lg:col-span-2 space-y-6">
                        {statusConfig.showCTA && <PaymentIncompleteAlert />}
                        <OrderItemList items={order.cart_items} formatMoney={formatMoney} />

                        {/* Transactions section */}
                        {order.transactions && order.transactions.length > 0 && (
                            <TransactionList
                                transactions={order.transactions}
                                onActionComplete={handleActionComplete}
                            />
                        )}
                    </div>
                )}

                {/* Sidebar Column (unchanged) */}
                <div className="space-y-6">
                    <ShippingAddress address={order.address_snapshot} />
                    {order.shipments && order.shipments.length > 0 && (
                        <ShipmentStatus shipments={order.shipments} />
                    )}
                    {statusConfig.showCTA && (
                        <PaymentMethodSelector
                            selectedValue={method}
                            onChange={setMethod}
                        />
                    )}
                    <OrderSummary
                        order={order}
                        statusConfig={statusConfig}
                        method={method}
                    />
                </div>
            </div>
        </div>
    );
}