import type { Product } from "wle-core";
import { ProductCard } from "~/components/product-card";

interface ProductGridProps {
    products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {products.map((product, i) => (
                <ProductCard key={product.id} product={product} />
            ))}
        </div>
    );
}