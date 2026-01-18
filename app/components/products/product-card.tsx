// components/products/ProductCard.tsx
import { motion } from "framer-motion";
import { Card } from "~/components/ui/card";
import { ProductImage } from "./product-image";
import { ProductInfo } from "./product-info";

interface ProductCardProps {
    product: Product;
    index: number;
}

export function ProductCard({ product, index }: ProductCardProps) {
    const variantCount = product.variants?.length || 0;
    const prices = (product.variants || []).map((v) => v.price);
    const specialPrices = (product.variants || [])
        .map((v) => v.special_price)
        .filter((p): p is number => p != null);

    const minPrice = prices.length ? Math.min(...prices) : undefined;
    const minSpecial = specialPrices.length ? Math.min(...specialPrices) : undefined;
    const displayPrice = minSpecial ?? minPrice;
    const originalPrice = minPrice;

    const hasSale = minSpecial != null && originalPrice != null && originalPrice > minSpecial;
    const discountPercent = hasSale ? Math.round(((originalPrice! - minSpecial!) / originalPrice!) * 100) : 0;

    const variant = product.variants?.[0];
    const imgSrc = (variant?.image as string) || product.images?.[0]?.filename || "";

    return (
        <motion.div
            key={product.id}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
        >
            <Card className="group relative h-full overflow-hidden border-none shadow-none hover:shadow-2xl transition-all duration-500 bg-transparent">
                <ProductImage
                    imgSrc={imgSrc}
                    title={product.title}
                    slug={product.slug}
                    hasSale={hasSale}
                    discountPercent={discountPercent}
                    variantCount={variantCount}
                />
                <ProductInfo
                    title={product.title}
                    slug={product.slug}
                    categoryTitle={product.category?.title}
                    displayPrice={displayPrice}
                    originalPrice={originalPrice}
                    hasSale={hasSale}
                />
            </Card>
        </motion.div>
    );
}
