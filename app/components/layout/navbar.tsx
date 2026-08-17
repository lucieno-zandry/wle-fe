import { Link, useLocation, useNavigate } from "react-router"
import { useUserStore } from "~/hooks/use-user"
import { Button } from "../ui/button";
import UserDropdown from "./user-dropdown";
import Cart from "../cart/cart";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import appPathname, { useAppPathname } from "~/lib/app-pathname";
import { useMemo } from "react";
import { NavSearch } from "./nav-search";
import { NotificationsPopover } from "../notifications/notifications-popover";
import { useSettings } from "~/hooks/use-settings";
import { ChevronLeft } from "lucide-react";
import { useAuthDialogStore } from "../../stores/use-auth-dialog-store";
import type { User } from "wle-core";

type NavbarProps = {
    isUnAuthenticated: boolean,
    t: TFunction;
    navbarSearchVisible: boolean,
    appPathname: typeof appPathname,
    name: string,
    appLogoUrl: string,
    user: User | null,
    showBackButton: boolean,
    onLogIn: () => void,
    onBackClick: () => void,
}

export function NavbarView({
    isUnAuthenticated,
    t,
    navbarSearchVisible,
    appPathname,
    name,
    appLogoUrl,
    user,
    showBackButton,
    onLogIn,
    onBackClick,
}: NavbarProps) {
    return (
        <header className="flex flex-wrap justify-between items-center px-4 sm:px-8 py-3 shadow-sm bg-background/95 backdrop-blur-md sticky top-0 z-50 gap-4 border-b border-border">

            {/* Left Section: Logo, Brand Name & Desktop Links */}
            <div className="flex items-center gap-6 md:gap-8">
                <h1 className="flex items-center gap-2.5">
                    {showBackButton &&
                        <Button
                            variant={'ghost'}
                            onClick={onBackClick}
                            aria-label={t('common:back_button_aria')}>
                            <ChevronLeft />
                        </Button>}

                    <Link
                        to={appPathname('')}
                        className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
                        {appLogoUrl && (
                            <img
                                src={appLogoUrl}
                                alt={`${name} logo`}
                                className="h-8 w-auto object-contain"
                            />
                        )}
                        <span className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">
                            {name}
                        </span>
                    </Link>
                </h1>

                <nav className="hidden lg:block space-x-6">
                    <Link
                        to={appPathname('/products')}
                        className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
                    >
                        {t('common:products')}
                    </Link>
                </nav>
            </div>

            {/* Middle Section: Desktop Search */}
            {
                navbarSearchVisible && (
                    <div className="flex-1 max-w-md hidden md:block">
                        <NavSearch />
                    </div>
                )
            }

            {/* Right Section: Settings & Auth/User Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
                <Cart />

                {(isUnAuthenticated || user?.permissions?.can_log_in) &&
                    <Button variant="default" size="sm" type="button" onClick={onLogIn} className="shadow-sm">
                        {t('common:logIn')}
                    </Button>}

                {user?.permissions?.can_use_notifications &&
                    <NotificationsPopover />}

                <UserDropdown />
            </div>

            {/* Mobile Search */}
            {
                navbarSearchVisible && (
                    <div className="w-full block md:hidden mt-1">
                        <NavSearch />
                    </div>
                )
            }
        </header >
    )
}

export default function Navbar() {
    const { get } = useSettings();

    const { authStatus, user } = useUserStore();
    const { t } = useTranslation();
    const { pathname } = useLocation();
    const appPathname = useAppPathname();
    const { openDialog } = useAuthDialogStore();
    const navigate = useNavigate();

    const name: string = get('app_name', '');
    const appLogoUrl: string = get('app_logo', '');

    const isUnAuthenticated = useMemo(() => authStatus === "unauthenticated", [authStatus])
    const navbarSearchVisible = useMemo(() => (!pathname.includes('/search') && !pathname.includes('/settings')), [pathname]);

    const showBackButton = pathname !== appPathname('') && pathname !== appPathname('/');

    const handleLogIn = () => {
        openDialog({
            action: 'AUTHENTICATE',
            title: t('common:logInTitle'),
            description: t('common:logInDescription')
        })
    }

    return <NavbarView
        t={t}
        isUnAuthenticated={isUnAuthenticated}
        navbarSearchVisible={navbarSearchVisible}
        appPathname={appPathname}
        name={name}
        appLogoUrl={appLogoUrl}
        user={user}
        showBackButton={showBackButton}
        onLogIn={handleLogIn}
        onBackClick={() => navigate(-1)}
    />
}