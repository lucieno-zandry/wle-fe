import { useCallback } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "~/components/ui/dialog"
import { Button } from "wle-ui-package"
import { useTranslation } from "react-i18next";
import { useLogout } from "~/hooks/use-logout"

export type LogoutDialogProps = {
    open: boolean,
    onOpenChange: (open: boolean) => void,
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
    const { t } = useTranslation();

    const logout = useLogout();

    const handleLogout = useCallback(() => logout({ onSuccess: () => onOpenChange(false) }), [logout]);

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md" aria-describedby={t('common:confirmLogout')}>
                <DialogHeader>
                    <DialogTitle>{t('common:logoutTitle')}</DialogTitle>
                    <DialogDescription>
                        {t('common:logoutDescription')}
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button type="button" variant="secondary">
                            {t('common:close')}
                        </Button>
                    </DialogClose>
                    <DialogClose asChild>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={handleLogout}
                            disabled={logout.loading}>{t('common:logOut')}</Button>
                    </DialogClose>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}