import { useEffect } from "react";
import { Outlet, useLoaderData, useNavigate, type LoaderFunctionArgs } from "react-router";
import { HttpException } from "~/api/app-fetch";
import { getAuthUser, getSettings } from "~/api/http-requests";
import Footer from "~/components/layout/footer";
import Navbar from "~/components/layout/navbar";
import { useRefreshCart } from "~/hooks/use-cart";
import { useUserStore } from "~/hooks/use-user";
import handleHttpExceptionError from "~/lib/handle-http-exception-error";
import { ClientCodeDialog } from "../../components/layout/client-code-dialog";
import { usePreferencesStore } from "~/hooks/use-user-preference-store";
import { toast } from "sonner";
import defaultSettings from "~/lib/default-settings";
import { useSettings } from "~/hooks/use-settings";

export async function loader() {
    try {
        const response = await getSettings();

        return {
            settings: response.data!,
        }
    } catch (e) {
        return {
            settings: defaultSettings
        }
    }
}

export default function () {
    const { setUser, clearUser } = useUserStore();
    const { setPreferences, preferences, rehydrated } = usePreferencesStore();

    const refreshCart = useRefreshCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (!rehydrated) return;

        const url = new URL(location.href);
        const urlCurrency = url.searchParams.get('currency');
        const urlTheme = url.searchParams.get('theme');

        let shouldReload = false;

        if (!urlTheme) {
            url.searchParams.append('theme', preferences.theme);
        } else if (urlTheme !== preferences.theme) {
            url.searchParams.set('theme', preferences.theme);
        }

        if (!urlCurrency) {
            url.searchParams.append('currency', preferences.currency);
        } else if (urlCurrency !== preferences.currency) {
            url.searchParams.set('currency', preferences.currency);
            shouldReload = true;
        }

        if (shouldReload) location.href = url.toString()
        else history.replaceState({ replace: true }, '', url);
    }, [preferences.currency, rehydrated, preferences.theme]);

    useEffect(() => {
        getAuthUser()
            .then((response) => {
                if (response.data?.user) {
                    setUser(response.data.user);
                    refreshCart();

                    if (response.data.user.preferences) {
                        setPreferences(response.data.user.preferences);
                    }
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
    </div>
}