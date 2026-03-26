"use client"

import { Link } from "react-router"
import { useUserStore } from "~/hooks/use-user"
import { Button } from "../ui/button";
import UserDropdown from "./user-dropdown";
import Cart from "../cart/cart";
import Notifications from "../notifications/notifications";
import ProductSearch from "../search/product-search";
import { LanguageSwitcher } from "~/components/layout/language-switcher";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import { CurrencySelector } from "./currency-selector";
import appPathname from "~/lib/app-pathname";
import { ThemeSelector } from "./theme-selector";

type NavbarProps = {
    user: User | null;
    t: TFunction;
}

export function NavbarView({ user, t }: NavbarProps) {
    return (
        <header className="flex flex-wrap justify-between items-center px-4 sm:px-8 py-3 shadow-sm bg-white/95 backdrop-blur-sm sticky top-0 z-50 gap-4 border-b border-gray-100">
            <div className="flex items-center gap-4 md:gap-8">
                <h1>
                    <Link to="/" className="text-xl sm:text-2xl font-bold tracking-tight text-gray-900 transition-colors hover:text-gray-700">
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
            <div className="flex-1 max-w-md hidden md:block">
                <ProductSearch />
            </div>

            <div className="flex gap-2 sm:gap-4 items-center">
                {!user ? (
                    <div className="flex gap-1 sm:gap-2 items-center overflow-x-auto no-scrollbar pb-1 sm:pb-0">
                        <LanguageSwitcher />
                        <CurrencySelector />
                        <ThemeSelector />
                        <Button variant="default" size="sm" className="ml-1 sm:ml-2" asChild>
                            <Link to={appPathname('/auth')}>{t('common:logIn')}</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="flex gap-3 sm:gap-4 items-center">
                        <Cart />
                        <Notifications />
                        <UserDropdown />
                    </div>
                )}
            </div>

            {/* Mobile Search Bar - Shows up as a full-width block under the main header on small screens if needed */}
            <div className="w-full block md:hidden mt-2">
                <ProductSearch />
            </div>
        </header>
    )
}

export default function Navbar() {
    const { user } = useUserStore();
    const { t } = useTranslation();

    return <NavbarView user={user} t={t} />
}