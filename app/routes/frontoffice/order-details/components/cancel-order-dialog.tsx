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
import Button from "~/components/custom-components/button";
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
                toast.success(t("cancelOrder.toastSuccess", { orderNumber }));
                onOpenChange(false);
                onSuccess?.();
            })
            .catch(() => {
                toast.error(t("cancelOrder.toastError", { orderNumber }));
            })
            .finally(() => {
                setLoading(false);
            });
    }, [orderUuid, orderNumber, onOpenChange, onSuccess, t]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>{t("cancelOrder.title")}</AlertDialogTitle>
                    <AlertDialogDescription>
                        {t("cancelOrder.description", { orderNumber })}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>{t("cancelOrder.cancel")}</AlertDialogCancel>
                    <Button type="button" variant="destructive" onClick={handleCancel} isLoading={loading}>
                        {t("cancelOrder.confirm")}
                    </Button>
                    {/* <AlertDialogAction asChild>
                    </AlertDialogAction> */}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}