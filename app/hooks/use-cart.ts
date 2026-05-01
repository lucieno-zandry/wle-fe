import React from 'react'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { getCartItems } from '~/api/http-requests'

// Define the Zustand store type
export interface CartStore {
    items: CartItem[] | null,
    setItems: (items: CartStore['items']) => void,
    drawerOpen: boolean,
    setDrawerOpen: (open: boolean) => void;
}

// Create the store
const useCartStore = create<CartStore>(set => ({
    items: null,
    drawerOpen: false,
    setDrawerOpen: (drawerOpen) => set({ drawerOpen }),
    setItems: (items) => {
        set({ items })
    },
}))

export const useRefreshCart = () => {
    const { setItems } = useCartStore.getState();

    return () =>
        getCartItems()
            .then((response) => {
                const cartItems = response.data?.cart_items || [];
                setItems(cartItems);
            });
}

export default useCartStore;