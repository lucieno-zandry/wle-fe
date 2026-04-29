import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router";
import { HttpException } from "~/api/app-fetch";
import { getAuthUser } from "~/api/http-requests";
import Footer from "~/components/layout/footer";
import Navbar from "~/components/layout/navbar";
import { useRefreshCart } from "~/hooks/use-cart";
import { useUserStore } from "~/hooks/use-user";
import handleHttpExceptionError from "~/lib/handle-http-exception-error";
import { ClientCodeDialog } from "../../components/layout/client-code-dialog";
import { AuthDialog } from "~/components/layout/auth-dialog";

export default function () {
    const { setUser, clearUser } = useUserStore();

    const refreshCart = useRefreshCart();
    const navigate = useNavigate();

    useEffect(() => {
        getAuthUser()
            .then((response) => {
                if (response.data?.user) {
                    setUser(response.data.user);
                    refreshCart();
                }
            }).catch((error) => {
                clearUser();
                if (error instanceof HttpException) {
                    handleHttpExceptionError({ status: error.status, navigate });
                }
            });
    }, []);

    return <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1">
            <Outlet />
        </main>
        <Footer />
        <ClientCodeDialog />
        <AuthDialog />
    </div>
}