import React from "react";
import { Outlet, useLoaderData } from "react-router";
import { getAuthUser, getCartItems } from "~/api/http-requests";
import Footer from "~/components/footer";
import Navbar from "~/components/navbar";
import { useRefreshCart } from "~/hooks/use-cart";
import { useUserStore } from "~/hooks/use-user";

export default function () {
    const { setUser } = useUserStore();
    const refreshCart = useRefreshCart();

    React.useEffect(() => {
        getAuthUser()
            .then((response) => {
                if (response.data?.user) {
                    setUser(response.data.user);
                    refreshCart();
                }

            }).catch(() => { });
    }, []);

    return <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100">
        <Navbar />
        <Outlet />
        <Footer />
    </div>
}