"use client"

import { Link } from "react-router"
import { useUserStore } from "~/hooks/use-user"
import { Button } from "./ui/button";
import UserDropdown from "./user-dropdown";
import Cart from "./cart/cart";
import Notifications from "./notifications/notifications";
import ProductSearch from "./search/product-search";
import { LanguageSwitcher } from "~/components/i18n/language-switcher";
import useRouterStore from "~/hooks/use-router-store";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

type NavbarProps = {
    user: User | null;
    lang: string;
    t: TFunction;
}

export function Navbar({ user, lang, t }: NavbarProps) {
    return (
        <header className="flex justify-between items-center px-8 py-4 shadow-sm bg-white sticky top-0 z-25 gap-4">
            <div className="flex items-center gap-8">
                <h1>
                    <Link to="/" className="text-2xl font-bold text-gray-800">ShopEase</Link>
                </h1>
                <nav className="space-x-6 hidden lg:block">
                    <Link to={`/${lang}/products`} className="text-sm font-medium text-gray-600 hover:text-gray-900">{t('common:products')}</Link>
                </nav>
            </div>

            <div className="flex-1 max-w-md hidden sm:block">
                <ProductSearch />
            </div>

            <div className="flex gap-4 items-center">
                {/* 🌍 Language Switcher placed here */}
                <LanguageSwitcher />

                <div className="h-6 w-[1px] bg-gray-200 hidden sm:block" />

                {!user ? (
                    <Button variant="default" asChild>
                        <Link to={`/${lang}/auth`}>{t('common:logIn')}</Link>
                    </Button>
                ) : (
                    <div className="flex gap-2 items-center">
                        <Cart />
                        <Notifications />
                        <UserDropdown />
                    </div>
                )}
            </div>
        </header>
    )
}


export default function () {
    const { user } = useUserStore();
    const { lang } = useRouterStore();
    const { t } = useTranslation();

    return <Navbar
        user={user}
        lang={lang}
        t={t} />
}
