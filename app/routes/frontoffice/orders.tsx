import { useLoaderData } from "react-router";
import { useState } from "react";
import { EmptyOrdersState } from "~/components/orders/empty-orders-state";
import { OrdersHeader } from "~/components/orders/orders-header";
import { OrderCard } from "~/components/orders/order-card";
import { getOrders } from "~/api/http-requests";

export const clientLoader = async () => {
    const response = await getOrders();
    return response.data;
}

export default function OrdersPage() {
    const { orders } = useLoaderData<{ orders: Order[] }>();

    if (orders.length === 0) {
        return <EmptyOrdersState />;
    }

    return (
        <div className="container max-w-5xl mx-auto p-6 space-y-8">
            <OrdersHeader />
            <div className="grid gap-6">
                {orders.map((order) => (
                    <OrderCard
                        key={order.uuid}
                        order={order}
                    />
                ))}
            </div>
        </div>
    );
}