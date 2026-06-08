import type { CartItem, Coupon, ShippingMethod, Transaction } from "wle-core";
import { create } from "zustand";
import { getCartItems } from "~/api/http-requests";

type CheckoutStore = {
    cartItemsIds: number[],
    setCartItemsIds: (cartItemIds: CheckoutStore['cartItemsIds']) => void;
    appliedCoupon: Coupon | null;
    setAppliedCoupon: (appliedCoupon: CheckoutStore['appliedCoupon']) => void;
    cartItems: CartItem[];
    setCartItems: (cartItems: CheckoutStore['cartItems']) => void;
    method: Transaction['payment_method'];
    setMethod: (method: CheckoutStore['method']) => void;
    selectedShipping: {
        method: ShippingMethod,
        cost: number
    } | null;
    setSelectedShipping: (shipping: CheckoutStore['selectedShipping']) => void;
}

const useCheckoutStore = create<CheckoutStore>(
    (set) => ({
        cartItemsIds: [],
        setCartItemsIds: cartItemsIds => set({ cartItemsIds }),
        appliedCoupon: null,
        setAppliedCoupon: (appliedCoupon) => set({ appliedCoupon }),
        cartItems: [],
        setCartItems: (cartItems) => set({ cartItems }),
        method: 'VISA',
        setMethod: (method) => {
            set({ method });
        },
        selectedShipping: null,
        setSelectedShipping: (selectedShipping) => set({ selectedShipping })
    })
);


export const useRefreshCartItems = () => {
    const { setCartItems, cartItems } = useCheckoutStore.getState();

    return () =>
        getCartItems({ whereIn: { id: cartItems.map(item => item.id) } })
            .then((response) => {
                const cartItems = response.data?.cart_items || [];
                setCartItems(cartItems);
            });
}

export default useCheckoutStore;