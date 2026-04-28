// routes/frontoffice/product-detail/components/product-cross-sell.tsx

import { useState, useEffect } from "react";
import { getProducts } from "~/api/http-requests";
import { useFormatMoney } from "~/lib/format-money";
import { Link } from "react-router";
import { useAppPathname } from "~/lib/app-pathname";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface CrossSellProduct {
    product: Product;
    cheapestVariant?: Variant;
}

interface ProductCrossSellViewProps {
    products: CrossSellProduct[];
    loading: boolean;
    formatMoney: (n?: number) => string;
    getProductUrl: (slug: string) => string;
}

export function ProductCrossSellView({
    products,
    loading,
    formatMoney,
    getProductUrl,
}: ProductCrossSellViewProps) {
    if (loading) {
        return (
            <div className="mt-12 space-y-4">
                <h2 className="text-xl font-semibold">You might also like</h2>
                <div className="flex gap-4 overflow-x-auto pb-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="w-48 shrink-0 animate-pulse space-y-2">
                            <div className="h-48 w-full rounded-lg bg-muted" />
                            <div className="h-4 w-3/4 rounded bg-muted" />
                            <div className="h-4 w-1/2 rounded bg-muted" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (!products.length) return null;

    return (
        <section className="mt-12">
            <h2 className="text-xl font-semibold mb-4">You might also like</h2>
            <div className="flex gap-4 overflow-x-auto pb-4 snap-x">
                {products.map(({ product, cheapestVariant }) => (
                    <Link
                        key={product.id}
                        to={getProductUrl(product.slug)}
                        className="w-48 shrink-0 snap-start group"
                    >
                        <div className="aspect-square rounded-lg overflow-hidden bg-muted mb-2">
                            {product.images?.[0] ? (
                                <img
                                    src={product.images[0].url}
                                    alt={product.title}
                                    className="h-full w-full object-cover group-hover:scale-105 transition-transform"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-muted-foreground">
                                    No image
                                </div>
                            )}
                        </div>
                        <p className="text-sm font-medium line-clamp-2">{product.title}</p>
                        {cheapestVariant && (
                            <p className="text-sm text-muted-foreground">
                                From {formatMoney(cheapestVariant.price)}
                            </p>
                        )}
                    </Link>
                ))}
            </div>
        </section>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductCrossSellProps {
    product: Product;
}

export function ProductCrossSell({ product }: ProductCrossSellProps) {
    const [products, setProducts] = useState<CrossSellProduct[]>([]);
    const [loading, setLoading] = useState(true);
    const formatMoney = useFormatMoney();
    const appPath = useAppPathname();
    const getProductUrl = (slug: string) => appPath(`/product/${slug}`);

    useEffect(() => {
        if (!product.category_id) {
            setLoading(false);
            return;
        }

        getProducts({
            category_id: product.category_id,
            limit: 8,
            with: ["images", "variants"],
        })
            .then((res) => {
                const data = res.data?.data ?? [];
                setProducts(
                    data
                        .filter((p) => p.id !== product.id)
                        .map((p) => ({
                            product: p,
                            cheapestVariant: p.variants?.reduce((min, v) =>
                                (v.price < min.price ? v : min), p.variants[0]),
                        }))
                );
            })
            .catch(() => setProducts([]))
            .finally(() => setLoading(false));
    }, [product.category_id, product.id]);

    return (
        <ProductCrossSellView
            products={products}
            loading={loading}
            formatMoney={formatMoney}
            getProductUrl={getProductUrl}
        />
    );
}