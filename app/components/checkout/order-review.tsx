import { Card } from "~/components/ui/card";
import { ScrollArea } from "../ui/scroll-area";
import { useCallback } from "react";
import CartSheetItem from "../cart/cart-sheet-item";
import useCheckoutStore, { useRefreshCartItems } from "~/hooks/use-checkout-store";

export function OrderReview() {
    const { cartItems, setCartItems } = useCheckoutStore();
    const refreshCartItems = useRefreshCartItems();

    const onRemove = useCallback((id: number) => {
        setCartItems(cartItems.filter(item => item.id !== id));
    }, [cartItems]);

    return (
        <Card className="p-4 space-y-4">
            <ScrollArea className="pr-2 mt-4">
                <div className="flex flex-col gap-4">
                    {cartItems.map((item, key) => <CartSheetItem
                        refreshCart={refreshCartItems}
                        onRemove={onRemove}
                        key={key}
                        item={item} />)}
                </div>
            </ScrollArea>
        </Card>
    );
}