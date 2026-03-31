import { toast } from "sonner";
import { addVariantToCart } from "~/api/http-requests";
import { useSearchStore } from "~/hooks/use-search-store";
import appNavigate from "~/lib/app-navigate";
import { GridCard } from "./grid-card";
import { ListCard } from "./list-card";
import { useRefreshCart } from "~/hooks/use-cart";

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
    const refreshCart = useRefreshCart();

    const handleAddToCart = async (variantId: number) => {
        const loadingToast = toast.loading('Adding to cart');
        try {
            await addVariantToCart({ variant_id: variantId, count: 1 });
            refreshCart();
            toast.success("Added to cart!");
        } catch (error) {
            toast.error("Couldn't add to cart. Please try again.");
        } finally {
            toast.dismiss(loadingToast);
        }
    };

    return (
        <ProductCardView
            product={product}
            viewMode={viewMode}
            onAddToCart={handleAddToCart}
            onSelect={(slug) => appNavigate(`/product/${slug}`)}
        />
    );
}