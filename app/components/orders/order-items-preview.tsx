// components/orders/OrderItemsPreview.tsx
interface OrderItemsPreviewProps {
    items: CartItem[];
}

export function OrderItemsPreview({ items }: OrderItemsPreviewProps) {
    return (
        <div className="md:col-span-2 p-6 space-y-4">
            <p className="text-xs font-semibold uppercase text-muted-foreground">Items in this order</p>
            <div className="flex flex-wrap gap-4">
                {items.map((item) => (
                    <div key={item.id} className="group relative">
                        <div className="w-16 h-16 rounded-md border bg-muted overflow-hidden">
                            <img
                                src={item.variant_snapshot.image || item.product_snapshot.main_image || undefined}
                                alt={item.product_snapshot.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                            />
                        </div>
                        <span className="absolute -top-2 -right-2 bg-primary text-[10px] text-white font-bold px-1.5 py-0.5 rounded-full ring-2 ring-background shadow-sm">
                            x{item.count}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}