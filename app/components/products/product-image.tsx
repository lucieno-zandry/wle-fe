// components/products/ProductImage.tsx
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { ProductBadges } from "./product-badges";

interface ProductImageProps {
    imgSrc: string;
    title: string;
    slug: string;
    hasSale: boolean;
    discountPercent: number;
    variantCount: number;
}

export function ProductImage({
    imgSrc,
    title,
    slug,
    hasSale,
    discountPercent,
    variantCount
}: ProductImageProps) {
    return (
        <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-muted">
            <Link to={`/product/${slug}`}>
                <img
                    src={imgSrc}
                    alt={title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
            </Link>

            <ProductBadges
                hasSale={hasSale}
                discountPercent={discountPercent}
                variantCount={variantCount}
            />

            <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                <Button className="w-full shadow-xl bg-primary text-primary-foreground font-bold" asChild>
                    <Link to={`/product/${slug}`}>
                        Quick View <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                </Button>
            </div>
        </div>
    );
}