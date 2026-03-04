import { Package, Tag } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Link } from "react-router";
import formatMoney from "~/lib/format-money";
import { Badge } from "../ui/badge"; // assuming you have a Badge component

function OrderItemList({ items, lang }: { items: CartItem[], lang: string }) {
    return (
        <Card>
            <CardHeader className="border-b pb-4">
                <CardTitle className="text-lg flex items-center gap-2">
                    <Package className="w-5 h-5 text-muted-foreground" />
                    Items ({items.length})
                </CardTitle>
            </CardHeader>
            <CardContent className="divide-y p-0">
                {items.map((item) => (
                    <div key={item.id} className="p-6 flex gap-4 transition-colors hover:bg-muted/30">
                        <Link
                            to={`/${lang}/product/${item.product_snapshot.slug}`}
                            className="w-20 h-20 rounded-lg bg-muted overflow-hidden border flex-shrink-0 hover:opacity-80 transition-opacity"
                        >
                            <img
                                src={item.variant_snapshot.image || item.product_snapshot.main_image || undefined}
                                alt={item.product_snapshot.title}
                                className="w-full h-full object-cover"
                            />
                        </Link>

                        <div className="flex-1 min-w-0">
                            <Link
                                to={`/${lang}/product/${item.product_snapshot.slug}`}
                                className="font-semibold text-base line-clamp-1 hover:text-primary transition-colors"
                            >
                                {item.product_snapshot.title}
                            </Link>

                            <div className="text-sm text-muted-foreground mt-1 flex flex-wrap gap-x-3">
                                <span>SKU: {item.variant_snapshot.sku}</span>
                                {Object.entries(item.variant_options_snapshot).map(([group, val]) => (
                                    <span key={group} className="flex items-center gap-1">
                                        <span className="capitalize text-xs font-medium text-foreground/70">{group}:</span> {val}
                                    </span>
                                ))}
                            </div>

                            {/* Promotion badges */}
                            {item.applied_promotions_snapshot && item.applied_promotions_snapshot.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {item.applied_promotions_snapshot.map((promo) => (
                                        <Badge
                                            key={promo.id}
                                            variant="secondary"
                                            className="text-[10px] px-1.5 py-0 h-4 font-mono"
                                        >
                                            <Tag className="w-3 h-3 mr-1 inline" />
                                            {promo.badge || promo.name}
                                        </Badge>
                                    ))}
                                </div>
                            )}

                            <div className="flex items-center justify-between mt-4">
                                <p className="text-sm text-muted-foreground">
                                    {formatMoney(item.unit_price)} × {item.count}
                                </p>
                                <p className="font-bold">{formatMoney(item.total)}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}

export default OrderItemList;