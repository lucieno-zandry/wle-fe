import React from "react"
import { toast } from "sonner"
import { logout } from "~/api/http-requests"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import { useUserStore } from "~/hooks/use-user"
import Button from "../custom-components/button"

export type LogoutDialogProps = {
    open: boolean,
    onOpenChange: (open: boolean) => void,
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
    const { setUser } = useUserStore();

    const handleLogout = React.useCallback(() => {
        const loading = toast.loading('Logging you out!');

        logout()
            .then(res => {
                toast.success(res.data?.message || "You are now logged out!");
                onOpenChange(false);
            })
            .catch(e => {
                toast.error('Loggin out may have failed, please, make sure that your account has been removed from this device!');
            })
            .finally(() => {
                setUser(null);
                localStorage.removeItem('token');
                toast.dismiss(loading);
            });
    }, [setUser, onOpenChange]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" aria-describedby="Confirm logout">
                <DialogHeader>
                    <DialogTitle>Logout?</DialogTitle>
                    <DialogDescription>
                        Your session will be terminated!
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            Close
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleLogout}> Log out</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}