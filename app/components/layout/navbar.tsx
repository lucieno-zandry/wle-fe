import { Link, useLocation } from "react-router"
import { useUserStore } from "~/hooks/use-user"
import { Button } from "../ui/button";
import UserDropdown from "./user-dropdown";
import Cart from "../cart/cart";
import { LanguageSwitcher } from "~/components/layout/language-switcher";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { CurrencySelector } from "./currency-selector";
import appPathname, { useAppPathname } from "~/lib/app-pathname";
import { ThemeSelector } from "./theme-selector";
import { useMemo } from "react";
import { NavSearch } from "./nav-search";
import { NotificationsPopover } from "../notifications/notifications-popover";

type NavbarProps = {
    isUnAuthenticated: boolean,
    isAuthenticated: boolean,
    t: TFunction;
    navbarSearchVisible: boolean,
    appPathname: typeof appPathname
}

export function NavbarView({ isAuthenticated, isUnAuthenticated, t, navbarSearchVisible, appPathname }: NavbarProps) {
    return (
        <header className="flex flex-wrap justify-between items-center px-4 sm:px-8 py-3 shadow-sm bg-white/95 backdrop-blur-sm sticky top-0 z-50 gap-4 border-b border-gray-100">
            <div className="flex items-center gap-4 md:gap-8">
                <h1>
                    <Link to={appPathname('/')} className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 transition-colors hover:text-gray-700">
                        ShopEase
                    </Link>
                </h1>
                <nav className="space-x-6 hidden lg:block">
                    <Link
                        to={appPathname('/products')}
                        className="text-sm font-medium text-gray-600 transition-colors hover:text-gray-900"
                    >
                        {t('common:products')}
                    </Link>
                </nav>
            </div>

            {/* Middle Search - Hidden on small mobile to avoid layout breaking, expanded on larger screens */}
            {
                navbarSearchVisible &&
                <div className="flex-1 max-w-md hidden md:block">
                    <NavSearch />
                </div>
            }

            <div className="flex gap-2 sm:gap-4 items-center">
                {isUnAuthenticated && (
                    <div className="flex gap-1 sm:gap-2 items-center overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        <LanguageSwitcher />
                        <CurrencySelector />
                        <ThemeSelector />
                        <Button variant="default" size="sm" className="ml-1 sm:ml-2" asChild>
                            <Link to={appPathname('/auth')}>{t('common:logIn')}</Link>
                        </Button>
                    </div>
                )}

                {isAuthenticated && (
                    <div className="flex gap-3 sm:gap-4 items-center">
                        <Cart />
                        <NotificationsPopover />
                        <UserDropdown />
                    </div>
                )}
            </div>

            {/* Mobile Search Bar - Shows up as a full-width block under the main header on small screens if needed */}
            {navbarSearchVisible &&
                <div className="w-full block md:hidden mt-2">
                    <NavSearch />
                </div>}
        </header>
    )
}

export default function Navbar() {
    const { authStatus } = useUserStore();
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const appPathname = useAppPathname();

    const isUnAuthenticated = useMemo(() => authStatus === "unauthenticated", [authStatus])
    const isAuthenticated = useMemo(() => authStatus === "authenticated", [authStatus])
    const navbarSearchVisible = useMemo(() => (!pathname.includes('/search')) && (isAuthenticated || isUnAuthenticated), [pathname, isAuthenticated, isUnAuthenticated]);

    return <NavbarView
        t={t}
        isAuthenticated={isAuthenticated}
        isUnAuthenticated={isUnAuthenticated}
        navbarSearchVisible={navbarSearchVisible}
        appPathname={appPathname}
    />
}