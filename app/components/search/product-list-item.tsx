import { Link } from "react-router";
import { Card } from "../ui/card";
import formatMoney from "~/lib/format-money";
import { Badge } from "../ui/badge";
import Button from "../custom-components/button";
import { useUserStore } from "~/hooks/use-user";
import useRouterStore from "~/hooks/use-router-store";

export function ProductListItem({ product }: { product: Product }) {
    const { user } = useUserStore();
    const { lang } = useRouterStore();

    // Check if the user has permission to see special prices (still used for badge logic)
    const canSeeSpecial = user?.permissions?.can_use_special_prices ?? false;

    // Calculate the lowest price based on effective_price (if available)
    const lowestPrice = product.variants?.reduce((min, variant) => {
        const effective = variant.effective_price ?? variant.price;
        return effective < min ? effective : min;
    }, product.variants[0]?.price || 0);

    // Determine if any variant has a discount (effective_price < price)
    const hasDiscount = canSeeSpecial && product.variants?.some(v =>
        (v.effective_price ?? v.price) < v.price
    );

    const mainImage = product.images?.[0]?.url;

    return (
        <Link to={`/${lang}/product/${product.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow relative">
                {hasDiscount && (
                    <Badge className="absolute top-2 left-2 z-10 bg-green-600 hover:bg-green-700">
                        Partner Price
                    </Badge>
                )}
                <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0 bg-muted">
                        {mainImage ? (
                            <img
                                src={mainImage}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-muted-foreground">No image</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <div className="max-w-[70%]">
                                    <h3 className="font-semibold text-lg truncate">{product.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {product.description}
                                    </p>
                                </div>
                                <div className="flex flex-col items-end">
                                    <span className="font-bold text-xl text-primary">
                                        {formatMoney(lowestPrice)}
                                    </span>
                                    {/* Show original price crossed out if discounted */}
                                    {hasDiscount && product.variants?.[0] && (
                                        <span className="text-xs text-muted-foreground line-through">
                                            {formatMoney(product.variants[0].price)}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {product.category && (
                                <Badge variant="outline" className="mt-2">
                                    {product.category.title}
                                </Badge>
                            )}
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button size="sm">View Details</Button>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}