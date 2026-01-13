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
import Button from "../custom-components/button";
import { deleteOrder } from "~/api/http-requests";
import { toast } from "sonner";
import { useFetcher, useNavigate, useRevalidator } from "react-router";

interface DeleteOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderUuid: string;
    onSuccess?: () => void;
}

export function DeleteOrderDialog({ open, onOpenChange, orderUuid, onSuccess }: DeleteOrderDialogProps) {
    const [loading, setLoading] = useState(false);

    const orderNumber = useMemo(() => orderUuid.split("-")[0], [orderUuid]);

    const handleDelete = useCallback(() => {
        setLoading(true);
        deleteOrder(orderUuid)
            .then(() => {
                toast.success(`Order #${orderNumber} has been deleted.`);
                onOpenChange(false);
                onSuccess?.();
            })
            .catch(() => {
                toast.error(`Failed to delete order #${orderNumber}. Please try again.`);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [orderUuid, orderNumber]);

    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Delete Order?</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to delete order #{orderNumber}? This action cannot be undone and will permanently remove this order from your history.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <Button type="button" variant="destructive" onClick={handleDelete} isLoading={loading}>
                        Delete Order
                    </Button>
                    {/* <AlertDialogAction asChild>
                    </AlertDialogAction> */}
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}