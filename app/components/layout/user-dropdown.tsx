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
import { MapPin, Package, Settings, TicketPercent, LifeBuoy, LogOut, User } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import appPathname from '~/lib/app-pathname';
import { LanguageSwitcher } from './language-switcher';
import { ThemeSelector } from './theme-selector';
import { CurrencySelector } from './currency-selector';
import { useSettings } from '~/hooks/use-settings';
import * as Core from 'wle-core';

type UserDropdownProps = {
    user: Core.User | null;
    setIsOpen: (open: boolean) => void;
    setLogoutOpen: (open: boolean) => void;
    logoutOpen: boolean;
    t: any;
    clientCodeEnabled: boolean
};

export function UserDropdown({ user, setIsOpen, setLogoutOpen, logoutOpen, t, clientCodeEnabled }: UserDropdownProps) {
    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                        {user && user.role !== 'guest' &&
                            <UserAvatar
                                avatarFallBack={user?.name.substring(0, 2) || ''}
                                avatarImageUrl={user?.avatar_image?.url || undefined}
                            />}

                        {(!user || user.role === 'guest') &&
                            <User className='text-foreground' />}
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-64" align="end" sideOffset={8}>
                    {user && user.role !== 'guest' &&
                        <>
                            <DropdownMenuLabel className="font-normal">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-medium leading-none">{user.name}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator />
                        </>}

                    <DropdownMenuGroup>
                        {user &&
                            <DropdownMenuItem asChild>
                                <Link to={appPathname('/addresses')} className="cursor-pointer">
                                    <MapPin className="mr-2 h-4 w-4" />
                                    <span>{t('common:addresses')}</span>
                                </Link>
                            </DropdownMenuItem>}

                        {user && user.permissions?.can_use_order &&
                            <DropdownMenuItem asChild>
                                <Link to={appPathname('/orders')} className="cursor-pointer">
                                    <Package className="mr-2 h-4 w-4" />
                                    <span>{t('common:orders')}</span>
                                </Link>
                            </DropdownMenuItem>}

                        {user && user.permissions?.can_use_settings &&
                            <DropdownMenuItem asChild>
                                <Link to={appPathname('/settings')} className="cursor-pointer">
                                    <Settings className="mr-2 h-4 w-4" />
                                    <span>{t('common:settings')}</span>
                                </Link>
                            </DropdownMenuItem>}

                    </DropdownMenuGroup>

                    <DropdownMenuSeparator />

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

                    {clientCodeEnabled && (!user || !user.permissions?.can_use_special_prices) && (
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


                    {!user || !user.permissions?.can_log_in &&
                        <>
                            <DropdownMenuSeparator />

                            <DropdownMenuItem
                                variant="destructive"
                                onSelect={() => setLogoutOpen(true)}
                                className="cursor-pointer"
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                <span>{t('common:logOut')}</span>
                            </DropdownMenuItem>
                        </>
                    }
                </DropdownMenuContent>
            </DropdownMenu>

            <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
        </>
    );
}

export default function UserDropdownWrapper() {
    const { user } = useUserStore();
    const { setIsOpen } = useClientCodeDialogStore();
    const { t } = useTranslation();
    const [logoutOpen, setLogoutOpen] = React.useState(false);

    const settings = useSettings();
    const clientCodeEnabled = settings.get('client_code_enabled', false);

    return (
        <UserDropdown
            user={user}
            setIsOpen={setIsOpen}
            setLogoutOpen={setLogoutOpen}
            logoutOpen={logoutOpen}
            t={t}
            clientCodeEnabled={clientCodeEnabled}
        />
    );
}