// routes/checkout/components/cart/cart-item-list.ts
import CartItemRow from "./cart-item-row";
import { useRevalidator } from "react-router";
import { removeCartItem, updateCartItem } from "~/api/http-requests";
import { useState } from "react";
import { toast } from "sonner";
import { HttpException } from "~/api/app-fetch";
import { useTranslation } from "react-i18next";
import { Loader2, ShoppingCart } from "lucide-react";
import type { CartItem } from "wle-core";

type CartItemListSmartProps = {
    items: CartItem[];
};

// Dumb view
type CartItemListViewProps = {
    items: CartItem[];
    onQuantityCommit: (id: number, newCount: number) => void;
    onRemove: (id: number) => void;
    updatingIds: Set<number>;
    isLoading: boolean;
};

function CartItemListView({ items, onQuantityCommit, onRemove, updatingIds, isLoading }: CartItemListViewProps) {
    const { t } = useTranslation("checkout");

    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                    <ShoppingCart className="h-8 w-8 text-muted-foreground/60" />
                </div>
                <h3 className="text-lg font-medium">{t("cart.empty_title", "Your cart is empty")}</h3>
                <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                    {t("cart.empty_description", "Looks like you haven't added anything to your cart yet.")}
                </p>
            </div>
        );
    }

    return (
        <div className="relative">
            {/* Loading Overlay Bar */}
            <div className="absolute -top-10 right-0 flex h-8 items-center">
                {isLoading && (
                    <div className="inline-flex animate-pulse items-center gap-2 rounded-full bg-muted/50 px-3 py-1 text-xs font-medium text-muted-foreground">
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        {t("cart.updating")}
                    </div>
                )}
            </div>

            <ul className="divide-y divide-border/50">
                {items.map((item) => (
                    <li key={item.id} className="transition-colors hover:bg-muted/10 first:rounded-t-2xl last:rounded-b-2xl">
                        <CartItemRow
                            item={item}
                            onQuantityCommit={(newCount) => onQuantityCommit(item.id, newCount)}
                            onRemove={() => onRemove(item.id)}
                            isUpdating={updatingIds.has(item.id)}
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
}

// Smart wrapper
export default function CartItemList({ items }: CartItemListSmartProps) {
    const revalidator = useRevalidator();
    const [updatingIds, setUpdatingIds] = useState<Set<number>>(new Set());
    const [isRemoving, setIsRemoving] = useState(false);
    const { t } = useTranslation("checkout");

    const handleQuantityCommit = async (id: number, newCount: number) => {
        if (newCount < 1) return;

        setUpdatingIds((prev) => {
            const next = new Set(prev);
            next.add(id);
            return next;
        });

        try {
            await updateCartItem(id, { count: newCount });
            revalidator.revalidate();
        } catch (err) {
            if (err instanceof HttpException) {
                toast.error(err.data?.message || t("cart.update_quantity_failed"));
            }
        } finally {
            setUpdatingIds((prev) => {
                const next = new Set(prev);
                next.delete(id);
                return next;
            });
        }
    };

    const handleRemove = async (id: number) => {
        setIsRemoving(true);
        try {
            await removeCartItem(id);
            revalidator.revalidate();
        } catch (err) {
            if (err instanceof HttpException) {
                toast.error(err.data?.message || t("cart.remove_item_failed"));
            }
        } finally {
            setIsRemoving(false);
        }
    };

    return (
        <CartItemListView
            items={items}
            onQuantityCommit={handleQuantityCommit}
            onRemove={handleRemove}
            updatingIds={updatingIds}
            isLoading={isRemoving || revalidator.state !== "idle" || updatingIds.size > 0}
        />
    );
}