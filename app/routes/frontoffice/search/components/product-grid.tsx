import { useTranslation } from "react-i18next";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import { getProducts } from "~/api/http-requests";
import { useSearchStore } from "~/routes/frontoffice/search/stores/use-search-store";
import { cn } from "~/lib/utils";
import { ProductCard } from "../../../../components/product-card";
import { SkeletonCard } from "./skeleton-card";
import { EmptyState } from "./empty-state";
import { ErrorState } from "./error-state";
import { useLoaderData, useLocation, useParams } from "react-router";
import { useFormatMoney } from "~/lib/format-money";
import type { loader } from "../search";
import type { Product } from "wle-core";

export function ProductGrid() {
    const { t } = useTranslation("search");
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
    const urlHydrated = useSearchStore((s) => s.urlHydrated);

    const { currency } = useFormatMoney();
    const { search } = useLocation();
    const { query = "" } = useParams();
    const sentinelRef = useRef<HTMLDivElement>(null);
    const isFetchingRef = useRef(false);

    // Flag to remember that we already used the initial loader data
    const hasUsedInitialData = useRef(false);
    const initialProducts = useLoaderData<typeof loader>().products;

    const fetchInitial = useCallback(async () => {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;
        setProductsLoading(true);
        setProductsError(null);

        const params = buildQueryParams();
        const { data, error } = await getProducts({ ...params, page: 1 });

        if (error || !data) {
            setProductsError(t("search.error.fetch_failed"));
        } else {
            setProducts(data.data, data.current_page, data.last_page, data.total);
        }

        setProductsLoading(false);
        isFetchingRef.current = false;
    }, [filters, query, search, currency, t]);

    // useEffect(() => {
    //     if (!urlHydrated) return;
    //     fetchInitial();
    // }, [fetchInitial, urlHydrated]);

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

    // 1) Populate store from loader data (once)
    useEffect(() => {
        if (initialProducts && !hasUsedInitialData.current) {
            setProducts(
                initialProducts.data,
                initialProducts.current_page,
                initialProducts.last_page,
                initialProducts.total
            );
            hasUsedInitialData.current = true;
        }
    }, []);

    //    - If we already used loader data, skip the very first automatic fetch
    //    - Otherwise (no loader data, or later filter changes), fetch normally
    useEffect(() => {
        if (!urlHydrated) return;

        // If we already populated from loader, clear the flag and do NOT fetch now.
        // The store already contains the initial products.
        if (hasUsedInitialData.current) {
            hasUsedInitialData.current = false; // allow future fetches (filter changes)
            return;
        }

        fetchInitial();
    }, [fetchInitial, urlHydrated]);

    useEffect(() => {
        const el = sentinelRef.current;
        if (!el) return;
        const observer = new IntersectionObserver((entries) => {
            if (entries[0].isIntersecting) fetchMore();
        }, { threshold: 0.1 });
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
    const { t } = useTranslation("search");

    if (loading) {
        return (
            <div
                className={cn(
                    viewMode === "grid"
                        ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
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
                {t("search.result_count", { total: totalProducts })}
            </p>

            <div
                className={cn(
                    viewMode === "grid"
                        ? "grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4"
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
                        {t("common.loading_more")}
                    </div>
                )}
                {!hasMore && products.length > 0 && (
                    <p className="text-xs text-muted-foreground">
                        {t("search.all_loaded", { total: totalProducts })}
                    </p>
                )}
            </div>
        </div>
    );
}