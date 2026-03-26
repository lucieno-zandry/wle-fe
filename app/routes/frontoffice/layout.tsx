import React from "react";
import { Outlet, useLoaderData, useNavigate } from "react-router";
import { HttpException } from "~/api/app-fetch";
import { getAuthUser, getCartItems } from "~/api/http-requests";
import Footer from "~/components/layout/footer";
import Navbar from "~/components/layout/navbar";
import { useRefreshCart } from "~/hooks/use-cart";
import { useUserStore } from "~/hooks/use-user";
import handleHttpExceptionError from "~/lib/handle-http-exception-error";
import { ClientCodeDialog } from "../../components/layout/client-code-dialog";
import { usePreferencesStore } from "~/hooks/use-user-preference-store";

export default function () {
    const { setUser, clearUser } = useUserStore();
    const { fetchPreferences } = usePreferencesStore();

    const refreshCart = useRefreshCart();
    const navigate = useNavigate();

    React.useEffect(() => {
        getAuthUser()
            .then((response) => {
                if (response.data?.user) {
                    setUser(response.data.user);
                    refreshCart();
                    fetchPreferences();
                }

            }).catch((error) => {
                clearUser();
                if (error instanceof HttpException) {
                    handleHttpExceptionError({ status: error.status, navigate });
                }
            });
    }, []);

    return <div className="flex flex-col min-h-screen bg-gradient-to-b from-white to-gray-100">
        <Navbar />
        <main className="flex-1">
            <Outlet />
        </main>
        <Footer />
        <ClientCodeDialog />
    </div>
}