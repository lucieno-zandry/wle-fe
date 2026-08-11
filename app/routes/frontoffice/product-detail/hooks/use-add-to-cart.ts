import { toast } from "sonner"
import { addVariantToCart } from "~/api/http-requests"
import useCartStore, { useRefreshCart } from "../../../../hooks/use-cart"
import { HttpException, type FormatedResponse } from "~/api/app-fetch";
import type { CartItem } from "wle-core";
import { t } from "i18next";

export function useAddToCart() {
    const refreshCart = useRefreshCart();
    const { drawerOpen, setDrawerOpen } = useCartStore();

    return async function (data: { variant_id: number, count: number }, options?: {
        onSuccess?: (response: FormatedResponse<{ cart_item: CartItem }>) => void,
        onError?: (e: HttpException) => void
    }) {
        toast.promise(addVariantToCart(data), {
            loading: t('product-detail:toast.addingToCart'),
            success: async (response) => {
                await refreshCart();
                if (!drawerOpen) setDrawerOpen(true);
                options?.onSuccess?.(response);
                return t('product-detail:toast.addedToCart');
            },
            error: (error) => {
                if (error instanceof HttpException) {
                    options?.onError?.(error);
                    return error.data?.message || t('product-detail:toast.addToCartError');
                }
            }
        })
    }
}
