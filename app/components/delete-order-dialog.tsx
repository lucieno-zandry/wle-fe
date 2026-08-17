// components/orders/DeleteOrderDialog.tsx
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
import { deleteOrder } from "~/api/http-requests";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";

interface DeleteOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderUuid: string;
    onSuccess?: () => void;
}

export function DeleteOrderDialog({ open, onOpenChange, orderUuid, onSuccess }: DeleteOrderDialogProps) {
    const { t } = useTranslation('orders');
    const [loading, setLoading] = useState(false);

    const orderNumber = useMemo(() => orderUuid.split("-")[0], [orderUuid]);

    const handleDelete = useCallback(() => {
        setLoading(true);
        deleteOrder(orderUuid)
            .then(() => {
                toast.success(t("deleteDialog.toastSuccess", { orderNumber }));
                onOpenChange(false);
                onSuccess?.();
            })
            .catch(() => {
                toast.error(t("deleteDialog.toastError", { orderNumber }));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [orderUuid, orderNumber, onOpenChange, onSuccess, t]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("deleteDialog.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("deleteDialog.description", { orderNumber })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("deleteDialog.cancel")}</AlertDialogCancel>
                    <Button type="button" variant="destructive" onClick={handleDelete} isLoading={loading}>
                        {t("deleteDialog.confirm")}
                    </Button>
                    {/* <AlertDialogAction asChild>
                    </AlertDialogAction> */}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}