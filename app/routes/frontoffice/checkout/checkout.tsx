import { redirect, useActionData, useLoaderData, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { parseCookies } from "~/lib/cookie-helpers";
import { getCartItems, getCouponFromCode, createOrder, createTransaction } from "~/api/http-requests";
import { HttpException } from "~/api/app-fetch";
import appPathname from "~/lib/app-pathname";
import CheckoutPageContent from "./components/checkout-page-content";
import { useEffect } from "react";
import { toast } from "sonner";
import useCheckoutStore, { defaultCheckoutStoreState } from "./stores/use-checkout-store";

// loader as before
export async function loader({ request }: LoaderFunctionArgs) {
    const cookies = request.headers.get('cookie');
    const parsedCookies = parseCookies(cookies);
    const headers: HeadersInit = {};
    if (cookies) headers['Cookie'] = cookies;

    const cartItemsIds: number[] = parsedCookies.cart_items_ids?.split(',')?.map(Number) ?? [];
    const couponCode = parsedCookies.coupon_code || "";

    if (cartItemsIds.length === 0) return redirect(appPathname(''));

    try {
        const [cartItemsResponse, couponResponse] = await Promise.all([
            getCartItems({ whereIn: { id: cartItemsIds } }, { headers }),
            couponCode ? getCouponFromCode(couponCode) : Promise.resolve({ data: null }),
        ]);
        if (!cartItemsResponse.data?.cart_items?.length) throw new HttpException(403);
        return {
            cart_items: cartItemsResponse.data.cart_items,
            coupon: couponResponse.data?.coupon ?? null,
        };
    } catch {
        return redirect(appPathname('/'));
    }
}

// action for checkout
export async function action({ request }: ActionFunctionArgs) {
    try {
        const cookies = request.headers.get('cookie');
        const parsedCookies = parseCookies(cookies);
        const headers: HeadersInit = {};

        if (cookies) headers['Cookie'] = cookies;

        const formData = await request.formData();
        const addressId = Number(formData.get("address_id"));
        const shippingMethodId = Number(formData.get("shipping_method_id"));
        const paymentMethod = formData.get("payment_method") as string;

        // 1. Get cart items IDs
        const cartItemIds: number[] = parsedCookies.cart_items_ids?.split(',')?.map(Number) ?? [];

        if (cartItemIds.length === 0) {
            return { error: "No items in cart" };
        }

        // 2. Get coupon code from cookie
        const couponCode = parsedCookies.coupon_code || "";

        // 3. Get coupon ID if needed (the backend createOrder may accept coupon_code directly? but the http function expects coupon_id. We'll modify to accept coupon_code? We can fetch coupon id here.
        let couponId: number | undefined;

        if (couponCode) {
            const couponResp = await getCouponFromCode(couponCode);
            if (couponResp.data?.coupon?.id) {
                couponId = couponResp.data.coupon.id;
            } else {
                return { error: "Invalid coupon" };
            }
        }

        // 4. Create order
        let order;

        try {
            const orderResp = await createOrder({
                cart_item_ids: cartItemIds,
                address_id: addressId,
                shipping_method_id: shippingMethodId,
                ...(couponId ? { coupon_id: couponId } : {}),
            }, { headers });

            order = orderResp.data!.order;
        } catch (err) {
            if (err instanceof HttpException) {
                return { error: err.data?.message || "Order creation failed" };
            }

            return { error: "Order creation failed" };
        }

        // 5. Create transaction
        try {
            const transactionResp = await createTransaction(
                {
                    order_uuid: order.uuid,
                    payment_method: paymentMethod,
                    amount: order.total,
                },
                { headers } // pass cookies for authentication
            );

            const transaction = transactionResp.data!.transaction;

            // If the transaction contains a payment_url, redirect there
            if (transaction.informations?.payment_url) {
                const paymentUrl = decodeURIComponent(transaction.informations.payment_url);
                return redirect(paymentUrl);
            }

            throw new HttpException(500, { message: "Transaction created, but no payment_url returned!" });

            // Otherwise, redirect to a success/pending page
        } catch (err) {
            return redirect(appPathname(`/orders/${order.uuid}`));
        }
    } catch (e) {
        console.error(e);
        return { error: e };
    }
}

export default function () {
    const data = useLoaderData<typeof loader>();
    const actionData = useActionData();
    const resetStore = () => useCheckoutStore.setState(defaultCheckoutStoreState);

    useEffect(() => {
        if (actionData && actionData.error) {
            toast.error(actionData.error);
        }
    }, [actionData?.error]);

    useEffect(() => resetStore, [])

    return <CheckoutPageContent initialData={data} />;
}