import { useState, useMemo, useCallback, useEffect } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Checkbox } from "~/components/ui/checkbox";
import CartEmpty from "./cart-empty";
import CartSheetItem from "./cart-sheet-item";

import { Form } from "react-router";
import { toast } from "sonner";
import { removeCartItem } from "~/api/http-requests";
import { useRefreshCart } from "~/hooks/use-cart";
import type { TFunction } from "i18next";
import { useTranslation } from "react-i18next";
import { useFormatMoney } from "~/lib/format-money";
import { useBuyNow } from "~/routes/frontoffice/product-detail/hooks/use-buy-now";
import type { CartItem } from "wle-core";

type CartSheetProps = {
    open: boolean;
    setOpen: (open: boolean) => void;
    items: CartItem[];
    checkedIds: Set<number>;
    isAllSelected: boolean;
    toggleAll: () => void;
    toggleItem: (id: number) => void;
    checkedItemsCount: number;
    totals: { grandTotal: number; checkedTotal: number };
    formatMoney: (value: number) => string;
    canCheckout: boolean;
    handleCheckout: () => void;
    onRemove: (itemId: number) => void;
    refreshCart: () => Promise<void>;
    t: TFunction;
};

export function CartSheet({
    open,
    setOpen,
    items,
    checkedIds,
    isAllSelected,
    toggleAll,
    toggleItem,
    checkedItemsCount,
    totals,
    formatMoney,
    canCheckout,
    handleCheckout,
    onRemove,
    refreshCart,
    t
}: CartSheetProps) {
    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetContent side="right" className="p-0 w-full max-w-[400px]">
                <Form className="flex flex-col overflow-y-auto">
                    <div className="p-6 pb-2">
                        <SheetHeader>
                            <SheetTitle className="text-2xl">{t('common:yourCart')}</SheetTitle>
                            <SheetDescription className="sr-only">
                                {t('common:cartContents')}
                            </SheetDescription>
                        </SheetHeader>

                        {items.length > 0 && (
                            <div className="flex items-center justify-between mt-4 pb-2 border-b">
                                <div className="flex items-center gap-2">
                                    <Checkbox
                                        id="select-all"
                                        checked={isAllSelected}
                                        onCheckedChange={toggleAll}
                                    />
                                    <label
                                        htmlFor="select-all"
                                        className="text-sm font-medium cursor-pointer"
                                    >
                                        {t('common:selectAll', { count: items.length })}
                                    </label>
                                </div>
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">
                                    {t('common:selected', { count: checkedItemsCount })}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="flex-1 overflow-hidden px-6">
                        {items.length === 0 ? (
                            <CartEmpty onClose={() => setOpen(false)} />
                        ) : (
                            <ScrollArea className="h-full pr-4">
                                <div className="flex flex-col gap-1 py-2">
                                    {items.map((item) => (
                                        <div key={item.id} className="flex items-center gap-3">
                                            <Checkbox
                                                checked={checkedIds.has(item.id)}
                                                onCheckedChange={() => toggleItem(item.id)}
                                            />
                                            <div className="flex-1">
                                                <CartSheetItem
                                                    item={item}
                                                    onRemove={onRemove}
                                                    refreshCart={refreshCart}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </ScrollArea>
                        )}
                    </div>

                    <div className="p-6 bg-muted/30 border-t space-y-4 mt-4">
                        <div className="space-y-1.5">
                            <div className="flex justify-between text-sm text-muted-foreground">
                                <span>{t('common:cartSubtotal', { count: items.length })}</span>
                                <span>{formatMoney(totals.grandTotal)}</span>
                            </div>
                            <div className="flex justify-between text-lg font-bold text-foreground">
                                <span>{t('common:checkoutTotal')}</span>
                                <span className="text-primary">
                                    {formatMoney(totals.checkedTotal)}
                                </span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            className="w-full h-12 text-base font-bold shadow-lg shadow-primary/20"
                            disabled={!canCheckout}
                            onClick={handleCheckout}
                        >
                            {t('common:checkout')} ({checkedItemsCount}{" "}
                            {checkedItemsCount <= 1 ? t('common:item') : t('common:items')})
                        </Button>
                        <p className="text-[10px] text-center text-muted-foreground uppercase tracking-tighter">
                            {t('common:shippingTaxesCalculated')}
                        </p>
                    </div>
                </Form>
            </SheetContent>
        </Sheet>
    );
}


export default function ({ items, open, setOpen }: Pick<CartSheetProps, 'items' | 'open' | 'setOpen'>) {
    const refreshCart = useRefreshCart();
    const buyNow = useBuyNow();

    const { t } = useTranslation();
    const formatMoney = useFormatMoney();

    // 1. Manage checked state locally (assuming item.id is unique)
    const [checkedIds, setCheckedIds] = useState<Set<number>>(
        new Set(items.map((item) => item.id))
    );

    const toggleItem = (id: number) => {
        const next = new Set(checkedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setCheckedIds(next);
    };

    useEffect(() => {
        setCheckedIds((prev) => {
            const validIds = new Set(items.map((item) => item.id));
            return validIds;
        });
    }, [items]);

    const toggleAll = () => {
        if (checkedIds.size === items.length) setCheckedIds(new Set());
        else setCheckedIds(new Set(items.map((i) => i.id)));
    };

    // 2. Calculated values
    const checkedItemsCount = checkedIds.size;
    const isAllSelected = items.length > 0 && checkedItemsCount === items.length;

    const totals = useMemo(() => {
        return items.reduce(
            (acc, item) => {
                acc.grandTotal += item.total;
                if (checkedIds.has(item.id)) {
                    acc.checkedTotal += item.total;
                }
                return acc;
            },
            { grandTotal: 0, checkedTotal: 0 }
        );
    }, [items, checkedIds]);

    const canCheckout = useMemo(() => checkedItemsCount > 0, [checkedItemsCount]);

    const handleCheckout = useCallback(() => {
        setOpen(false);
        buyNow({ cart_items_ids: Array.from(checkedIds) })
    }, [checkedIds, setOpen]);

    const onRemove = useCallback((itemId: number) => {
        const loadingToast = toast.loading('Removing cart item...');

        removeCartItem(itemId)
            .then(() => {
                refreshCart()
                    .then(() => {
                        toast.dismiss(loadingToast);
                        toast.success('Cart item removed.');
                    });
            });
    }, []);

    return <CartSheet
        canCheckout={canCheckout}
        checkedIds={checkedIds}
        checkedItemsCount={checkedItemsCount}
        formatMoney={formatMoney}
        handleCheckout={handleCheckout}
        isAllSelected={isAllSelected}
        items={items}
        onRemove={onRemove}
        open={open}
        refreshCart={refreshCart}
        setOpen={setOpen}
        toggleAll={toggleAll}
        toggleItem={toggleItem}
        totals={totals}
        t={t}
    />
}