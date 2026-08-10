import { useLoaderData } from "react-router";
import { EmptyOrdersState } from "./components/empty-orders-state";
import { OrdersHeader } from "./components/orders-header";
import { OrderCard } from "./components/order-card";
import { getOrders } from "~/api/http-requests";

export const clientLoader = async () => {
    const response = await getOrders();
    return response.data;
}

export default function OrdersPage() {
    const loaderData = useLoaderData<typeof clientLoader>();
    const orders = loaderData && loaderData.data;

    if (orders && orders.length === 0) {
        return <EmptyOrdersState />;
    }

    return (
        <div className="container max-w-5xl mx-auto p-6 space-y-8">
            <OrdersHeader />
            <div className="grid gap-6">
                {orders!.map((order) => (
                    <OrderCard
                        key={order.uuid}
                        order={order}
                    />
                ))}
            </div>
        </div>
    );
}