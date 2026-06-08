import { useSearchStore } from "~/routes/frontoffice/search/stores/use-search-store";
import appNavigate from "~/lib/app-navigate";
import { GridCard } from "../routes/frontoffice/search/components/grid-card";
import { ListCard } from "../routes/frontoffice/search/components/list-card";
import { useAddToCart } from "~/routes/frontoffice/product-detail/hooks/use-add-to-cart";
import type { Product } from "wle-core";

export interface ProductCardViewProps {
    product: Product;
    viewMode: "grid" | "list";
    onAddToCart: (variantId: number) => void;
    onSelect: (productSlug: string) => void;
}

export function ProductCardView(props: ProductCardViewProps) {
    return (
        <div onClick={() => props.onSelect(props.product.slug)}>
            {props.viewMode === "grid" ? (
                <GridCard product={props.product} onAddToCart={props.onAddToCart} />
            ) : (
                <ListCard product={props.product} onAddToCart={props.onAddToCart} />
            )}
        </div>
    );
}

export function ProductCard({ product }: { product: Product }) {
    const viewMode = useSearchStore((s) => s.viewMode);
    const addToCart = useAddToCart();

    const handleAddToCart = (variantId: number) => {
        addToCart({ count: 1, variant_id: variantId });
    }

    return (
        <ProductCardView
            product={product}
            viewMode={viewMode}
            onAddToCart={handleAddToCart}
            onSelect={(slug) => appNavigate(`/product/${slug}`)}
        />
    );
}