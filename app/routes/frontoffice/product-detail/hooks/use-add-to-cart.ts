import { toast } from "sonner"
import { addVariantToCart } from "~/api/http-requests"
import { useRefreshCart } from "../../../../hooks/use-cart"
import { HttpException, type FormatedResponse } from "~/api/app-fetch";

export function useAddToCart() {
    const refreshCart = useRefreshCart();

    return async function (data: { variant_id: number, count: number }, options?: {
        onSuccess?: (response: FormatedResponse<{ cart_item: CartItem }>) => void,
        onError?: (e: HttpException) => void
    }) {
        toast.promise(addVariantToCart(data), {
            loading: "Adding to cart...",
            success: (response) => {
                refreshCart();
                options?.onSuccess?.(response);
                return "Product successfully added to your cart!";
            },
            error: (error) => {
                if (error instanceof HttpException) {
                    console.log(error.data.message);
                    options?.onError?.(error);
                    return error.data?.message || "Something went wrong, please, try again";
                }
            }
        })
    }
}
