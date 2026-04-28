import { useNavigate } from "react-router";
import { useAddToCart } from "./use-add-to-cart";
import { useAppPathname } from "~/lib/app-pathname";
import { checkout } from "~/api/http-requests";
import { toast } from "sonner";
import { HttpException } from "~/api/app-fetch";

export function useBuyNow() {
    const addToCart = useAddToCart();
    const navigate = useNavigate();
    const appPathname = useAppPathname();

    return (data: { variant_id: number, count: number }) => {
        addToCart(data, {
            onSuccess: async (response) => {
                try {
                    await checkout([response.data!.cart_item.id]);
                    navigate(appPathname('/checkout'));
                } catch (e) {
                    if (e instanceof HttpException)
                        toast.error(e.data?.message || "Failed to buy now");
                }
            }
        })
    }
}