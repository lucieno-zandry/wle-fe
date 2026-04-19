import { Button } from '~/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '~/components/ui/dropdown-menu';
import { useUserStore } from '~/hooks/use-user';
import UserAvatar from './user-avatar';
import { LogoutDialog } from './logout-dialog';
import React from 'react';
import { Link } from 'react-router';
import useClientCodeDialogStore from '~/hooks/use-client-code-dialog-store';
import { MapPin, Package, Settings, TicketPercent, LifeBuoy, LogOut } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import appPathname from '~/lib/app-pathname';
import { LanguageSwitcher } from './language-switcher';
import { ThemeSelector } from './theme-selector';
import { CurrencySelector } from './currency-selector';

type UserDropdownProps = {
    user: User;
    setIsOpen: (open: boolean) => void;
    setLogoutOpen: (open: boolean) => void;
    logoutOpen: boolean;
    t: any;
};

export function UserDropdown({ user, setIsOpen, setLogoutOpen, logoutOpen, t }: UserDropdownProps) {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        <UserAvatar
                            avatarFallBack={user.name.substring(0, 2)}
                            avatarImageUrl={user.avatar_image?.url || undefined}
                        />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />

                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link to={appPathname('/addresses')} className="cursor-pointer">
                                <MapPin className="mr-2 h-4 w-4" />
                                <span>{t('common:addresses')}</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={appPathname('/orders')} className="cursor-pointer">
                                <Package className="mr-2 h-4 w-4" />
                                <span>{t('common:orders')}</span>
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <Link to={appPathname('/settings')} className="cursor-pointer">
                                <Settings className="mr-2 h-4 w-4" />
                                <span>{t('common:settings')}</span>
                            </Link>
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Preferences Section - prevents menu closure on click */}
                    <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                        {t('common:preferences')}
                    </div>
                    <DropdownMenuGroup>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-default focus:bg-transparent">
                            <LanguageSwitcher type="dropdown" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-default focus:bg-transparent">
                            <ThemeSelector type="dropdown" />
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()} className="cursor-default focus:bg-transparent">
                            <CurrencySelector type="dropdown" />
                        </DropdownMenuItem>
                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

                    {/* Unlock partner prices */}
                    {!user.permissions?.can_use_special_prices && (
                        <DropdownMenuItem
                            onClick={() => setIsOpen(true)}
                            className="text-primary focus:text-primary focus:bg-primary/5 cursor-pointer font-medium"
                        >
                            <TicketPercent className="mr-2 h-4 w-4" />
                            <span>{t('common:unlockPartnerPrices')}</span>
                        </DropdownMenuItem>
                    )}

                    <DropdownMenuItem className="cursor-pointer">
                        <LifeBuoy className="mr-2 h-4 w-4" />
                        <span>{t('common:support')}</span>
                    </DropdownMenuItem>
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                        variant="destructive" 
                        onSelect={() => setLogoutOpen(true)}
                        className="cursor-pointer"
                    >
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>{t('common:logOut')}</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
        </>
    );
}

export default function () {
    const { user } = useUserStore();
    const { setIsOpen } = useClientCodeDialogStore();
    const { t } = useTranslation();
    const [logoutOpen, setLogoutOpen] = React.useState(false);

    if (!user) return null;

    return (
        <UserDropdown
            user={user}
            setIsOpen={setIsOpen}
            setLogoutOpen={setLogoutOpen}
            logoutOpen={logoutOpen}
            t={t}
        />
    );
}