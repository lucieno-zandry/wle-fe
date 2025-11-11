import { Button } from "~/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuPortal,
    DropdownMenuSeparator,
    DropdownMenuShortcut,
    DropdownMenuSub,
    DropdownMenuSubContent,
    DropdownMenuSubTrigger,
    DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu"
import { useUserStore } from "~/hooks/use-user"
import UserAvatar from "./user-avatar";
import { LogoutDialog } from "./logout-dialog";
import React from "react";
import { Link } from "react-router";

export default function () {
    const { user } = useUserStore();
    const [logoutOpen, setLogoutOpen] = React.useState(false);

    if (!user) return;

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost">
                        <UserAvatar
                            avatarFallBack={user.name.substring(0, 2)}
                            avatarImageUrl={user.image || undefined} />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="start">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <Link to={'/settings'}>Settings</Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                            Billing
                        </DropdownMenuItem>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Support</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onSelect={() => setLogoutOpen(true)}>
                        Log out
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
        </>
    )
}
