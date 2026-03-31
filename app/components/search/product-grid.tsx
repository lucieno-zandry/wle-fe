import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { getProducts } from "~/api/http-requests";
import { useSearchStore } from "~/hooks/use-search-store";
import { cn } from "~/lib/utils";
import { ProductCard } from "./product-card";
import { SkeletonCard } from "./skeleton-card";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { useLocation, useParams } from "react-router";

export function ProductGrid() {
    const products = useSearchStore((s) => s.products);
    const viewMode = useSearchStore((s) => s.viewMode);
    const loading = useSearchStore((s) => s.productsLoading);
    const loadingMore = useSearchStore((s) => s.productsLoadingMore);
    const error = useSearchStore((s) => s.productsError);
    const hasMore = useSearchStore((s) => s.hasMore);
    const currentPage = useSearchStore((s) => s.currentPage);
    const totalProducts = useSearchStore((s) => s.totalProducts);
    const setProductsLoading = useSearchStore((s) => s.setProductsLoading);
    const setProductsLoadingMore = useSearchStore((s) => s.setProductsLoadingMore);
    const setProductsError = useSearchStore((s) => s.setProductsError);
    const setProducts = useSearchStore((s) => s.setProducts);
    const appendProducts = useSearchStore((s) => s.appendProducts);
    const buildQueryParams = useSearchStore((s) => s.buildQueryParams);
    const filters = useSearchStore((s) => s.filters);
    // ← Gate: don't fetch until the URL has been read into the store
    const urlHydrated = useSearchStore((s) => s.urlHydrated);

    const { search } = useLocation();
    const { query = '' } = useParams();

    const sentinelRef = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef(false);

    // ── Initial / filter-change fetch ─────────────────────────────────────────
    const fetchInitial = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setProductsLoading(true);
        setProductsError(null);

        const params = buildQueryParams();
        const { data, error } = await getProducts({ ...params, page: 1 });

        if (error || !data) {
            setProductsError("Failed to load products. Please try again.");
        } else {
            setProducts(data.data, data.current_page, data.last_page, data.total);
        }

        setProductsLoading(false);
        isFetchingRef.current = false;
    }, [filters, query, search]);

    // Only start fetching once the URL params have been written to the store
    useEffect(() => {
        if (!urlHydrated) return;
        fetchInitial();
    }, [fetchInitial, urlHydrated]);

    // ── Load more ─────────────────────────────────────────────────────────────
    const fetchMore = useCallback(async () => {
        if (isFetchingRef.current || !hasMore) return;
        isFetchingRef.current = true;
        setProductsLoadingMore(true);

        const params = buildQueryParams();
        const nextPage = currentPage + 1;
        const { data, error } = await getProducts({ ...params, page: nextPage });

        if (!error && data) {
            appendProducts(data.data, data.current_page, data.last_page);
        }

        setProductsLoadingMore(false);
        isFetchingRef.current = false;
    }, [hasMore, currentPage, filters]);

    // ── Intersection observer for infinite scroll ──────────────────────────────
    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;

        const observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting) {
                    fetchMore();
                }
            },
            { threshold: 0.1 }
        );

        observer.observe(el);
        return () => observer.disconnect();
    }, [fetchMore]);

    return (
        <ProductGridView
            products={products}
            viewMode={viewMode}
            loading={loading || !urlHydrated}
            loadingMore={loadingMore}
            error={error}
            hasMore={hasMore}
            totalProducts={totalProducts}
            sentinelRef={sentinelRef}
            onRetry={fetchInitial}
        />
    );
}

export interface ProductGridViewProps {
    products: Product[];
    viewMode: "grid" | "list";
    loading: boolean;
    loadingMore: boolean;
    error: string | null;
    hasMore: boolean;
    totalProducts: number;
    sentinelRef: React.RefObject<HTMLDivElement | null>;
    onRetry?: () => void;
}

export function ProductGridView({
    products,
    viewMode,
    loading,
    loadingMore,
    error,
    hasMore,
    totalProducts,
    sentinelRef,
    onRetry,
}: ProductGridViewProps) {
    if (loading) {
        return (
            <div
                className={cn(
                    viewMode === "grid"
                        ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                        : "flex flex-col gap-3"
                )}
            >
                {Array.from({ length: 8 }).map((_, i) => (
                    <SkeletonCard key={i} mode={viewMode} />
                ))}
            </div>
        );
    }

    if (error) {
        return <ErrorState message={error} onRetry={onRetry} />;
    }

    if (products.length === 0) {
        return <EmptyState hasFilters={false} />;
    }

    return (
        <div>
            <p className="mb-4 text-sm text-muted-foreground">
                {totalProducts} product{totalProducts !== 1 ? "s" : ""} found
            </p>

            <div
                className={cn(
                    viewMode === "grid"
                        ? "grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
                        : "flex flex-col gap-3"
                )}
            >
                {products.map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            <div ref={sentinelRef} className="mt-8 flex items-center justify-center h-8">
                {loadingMore && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Loader2 className="size-4 animate-spin" />
                        Loading more…
                    </div>
                )}
                {!hasMore && products.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        All {totalProducts} product{totalProducts !== 1 ? "s" : ""} loaded
                    </p>
                )}
            </div>
        </div>
    );
}