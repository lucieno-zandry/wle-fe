import { useNavigate } from "react-router";
import { useAppPathname } from "~/lib/app-pathname";
import { checkout } from "~/api/http-requests";
import { toast } from "sonner";
import { HttpException } from "~/api/app-fetch";
import { useAuthDialogStore } from "~/components/stores/use-auth-dialog-store";
import { useState } from "react";

export type BuyNow = ((data: {
    variant_id: number;
    count: number;
}) => Promise<void>) & {
    loading: boolean
}

export function useBuyNow() {
    const [loading, setLoading] = useState(false);

    const navigate = useNavigate();
    const appPathname = useAppPathname();

    const { openDialog } = useAuthDialogStore();

    const buyNow: BuyNow = async (cartItemData: { variant_id: number, count: number }) => {
        setLoading(true);

        const loadingToast = toast.loading('Preparing checkout page ...');

        try {
            const response = await checkout({ variants: [cartItemData] });
            const data = await response.json();
            if (!response.ok) throw new HttpException(response.status, data);

            navigate(appPathname('/checkout'));
        } catch (e) {
            if (e instanceof HttpException) {
                if (e.status === 403 && e.data) {
                    if (e.data.action === "AUTHENTICATE" || e.data.action === "VERIFY_EMAIL") {
                        return openDialog({
                            action: e.data.action,
                            onSuccessParams: cartItemData,
                            successAction: 'BUY_NOW',
                            title: "Sign in to checkout",
                            description: "Please log in to securely complete your purchase and track your order.",
                        });
                    }
                }

                toast.error(e.data?.message || "Failed to buy now.");
            }
        } finally {
            setLoading(false);
            toast.dismiss(loadingToast);
        }
    }

    buyNow.loading = loading;

    return buyNow;
}