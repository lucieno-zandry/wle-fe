import { useCallback, useMemo, useState } from "react";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Button } from "wle-ui-package"
import { cancelOrder } from "~/api/http-requests";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface CancelOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderUuid: string;
    onSuccess?: () => void;
}

export function CancelOrderDialog({ open, onOpenChange, orderUuid, onSuccess }: CancelOrderDialogProps) {
    const { t } = useTranslation('orders');
    const [loading, setLoading] = useState(false);

    const orderNumber = useMemo(() => orderUuid.split("-")[0], [orderUuid]);

    const handleCancel = useCallback(() => {
        setLoading(true);
        cancelOrder(orderUuid)
            .then(() => {
                toast.success(t("cancelDialog.toastSuccess", { orderNumber }));
                onOpenChange(false);
                onSuccess?.();
            })
            .catch(() => {
                toast.error(t("cancelDialog.toastError", { orderNumber }));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [orderUuid, orderNumber, onOpenChange, onSuccess, t]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("cancelDialog.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("cancelDialog.description", { orderNumber })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancelDialog.cancel")}</AlertDialogCancel>
                    <Button type="button" variant="destructive" onClick={handleCancel} isLoading={loading}>
                        {t("cancelDialog.confirm")}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}