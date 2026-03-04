import { Link } from "react-router";
import { Card, CardContent, CardFooter } from "../ui/card";
import formatMoney from "~/lib/format-money";
import Button from "../custom-components/button";
import { Badge } from "../ui/badge";
import { useUserStore } from "~/hooks/use-user";
import useRouterStore from "~/hooks/use-router-store";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";

type ProductCardProps = {
    lang: string;
    product: Product;
    mainImage?: string;
    showsSpecialPrice?: boolean;
    lowestPrice?: number;
    originalPrice?: number;
    hasDiscount?: boolean;
    formatMoney: (value?: number) => string;
    t: TFunction;
};

export function ProductCard({
    lang,
    product,
    mainImage,
    showsSpecialPrice = false,
    lowestPrice,
    originalPrice,
    hasDiscount = false,
    formatMoney,
    t
}: ProductCardProps) {
    return (
        <Link to={`/${lang}/product/${product.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full relative group">
                {showsSpecialPrice && (
                    <div className="absolute top-2 right-2 z-10">
                        <Badge className="bg-green-600 shadow-sm border-none">
                            {t('partnerPrice')}
                        </Badge>
                    </div>
                )}

                <div className="aspect-square overflow-hidden bg-muted">
                    {mainImage ? (
                        <img
                            src={mainImage}
                            alt={product.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground">{t('noImage')}</span>
                        </div>
                    )}
                </div>

                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            {product.category && (
                                <Badge
                                    variant="secondary"
                                    className="mb-1 text-[10px] uppercase tracking-wider"
                                >
                                    {product.category.title}
                                </Badge>
                            )}
                            <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                            {product.description && (
                                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                    {product.description}
                                </p>
                            )}
                        </div>
                    </div>
                </CardContent>

                <CardFooter className="p-4 pt-0">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex flex-col">
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg text-primary">
                                    {formatMoney(lowestPrice)}
                                </span>
                                {showsSpecialPrice && hasDiscount && originalPrice && (
                                    <span className="text-sm text-muted-foreground line-through decoration-destructive/50">
                                        {formatMoney(originalPrice)}
                                    </span>
                                )}
                            </div>
                            {showsSpecialPrice && (
                                <span className="text-[10px] text-green-600 font-medium">
                                    {t('memberSavings')}
                                </span>
                            )}
                        </div>
                        <Button size="sm">{t('viewDetails')}</Button>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}

export default function ({ product }: { product: Product }) {
    const { user } = useUserStore();
    const { lang } = useRouterStore();
    const { t } = useTranslation("products");

    const canSeeSpecial = user?.permissions?.can_use_special_prices ?? false;

    // Calculate lowest price using effective_price if available
    const lowestPrice = product.variants?.reduce((min, variant) => {
        const effective = variant.effective_price ?? variant.price;
        return effective < min ? effective : min;
    }, product.variants?.[0]?.price || 0);

    const originalPrice = product.variants?.[0]?.price;

    // Determine if any variant has a discount for this user
    const hasDiscount = canSeeSpecial && product.variants?.some(v =>
        (v.effective_price ?? v.price) < v.price
    );
    const showsSpecialPrice = hasDiscount; // we can show the badge if any discount exists

    const mainImage = product.images?.[0]?.url;

    return (
        <ProductCard
            formatMoney={formatMoney}
            lang={lang}
            product={product}
            mainImage={mainImage}
            lowestPrice={lowestPrice}
            originalPrice={originalPrice}
            showsSpecialPrice={showsSpecialPrice}
            hasDiscount={hasDiscount}
            t={t}
        />
    );
}