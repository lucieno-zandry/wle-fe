// products.tsx
import { redirect, useFetcher, useLoaderData, useLocation, type LoaderFunctionArgs } from "react-router";
import { getProducts } from "~/api/http-requests";
import { HttpException, type PaginatedResponse } from "~/api/app-fetch";
import handleHttpExceptionError from "~/lib/handle-http-exception-error";
import ProductsHeader from "~/components/products/products-header";
import { ProductGrid } from "~/components/products/product-grid";
import { useEffect, useRef, useState } from "react";
import useDebounce from "~/hooks/use-debounce";
import { LoadMoreButton } from "~/components/custom-components/load-more-button";
import { ProductGridSkeleton } from "~/components/products/product-grid-skeleton";
import { getPreferencesFromLoaderFunctionArgs } from "~/lib/app-pathname";

export const loader = async (args: LoaderFunctionArgs) => {
    const { request } = args;
    const { currency } = getPreferencesFromLoaderFunctionArgs(args);

    try {
        const url = new URL(request.url);
        const page = Number(url.searchParams.get("page") ?? 1);
        const headers: HeadersInit = {};
        const cookie = request.headers.get('Cookie');

        if (cookie) {
            headers['Cookie'] = cookie;
        }

        headers['X-Currency'] = currency;
        headers['Accept'] = 'application/json';

        const response = await getProducts({
            page,
            limit: 12,
        }, {
            headers
        });

        return response.data;
    } catch (error) {
        if (error instanceof HttpException) {
            return handleHttpExceptionError({ status: error.status, navigate: redirect });
        }
    }
};
 
export default function ProductsPage() {
    const initialData = useLoaderData() as PaginatedResponse<Product>;
    const fetcher = useFetcher<PaginatedResponse<Product>>();
    const location = useLocation();

    const [products, setProducts] = useState<Product[]>(initialData.data);
    const [currentPage, setCurrentPage] = useState(initialData.current_page);
    const [hasMore, setHasMore] = useState(
        initialData.next_page_url !== null
    );
    const [isLoading, setIsLoading] = useState(false);

    const triggerRef = useRef<HTMLDivElement | null>(null);

    // Debounced page trigger
    const debouncedPage = useDebounce(currentPage, 200);

    /* ----------------------------------------
       RESET WHEN FILTERS / URL CHANGE
    ---------------------------------------- */
    useEffect(() => {
        setProducts(initialData.data);
        setCurrentPage(initialData.current_page);
        setHasMore(initialData.next_page_url !== null);
    }, [initialData]);

    /* ----------------------------------------
       FETCH WHEN PAGE CHANGES
    ---------------------------------------- */
    useEffect(() => {
        if (debouncedPage === initialData.current_page) return;
        if (!hasMore) return;

        const params = new URLSearchParams(location.search);
        params.set("page", String(debouncedPage));

        fetcher.load(`?${params.toString()}`);
    }, [debouncedPage]);

    /* ----------------------------------------
       HANDLE FETCH RESULT
    ---------------------------------------- */
    useEffect(() => {
        if (!fetcher.data) return;

        setProducts(prev => [...prev, ...fetcher.data!.data]);
        setHasMore(fetcher.data.next_page_url !== null);
        setIsLoading(false);
    }, [fetcher.data]);

    /* ----------------------------------------
       INTERSECTION OBSERVER
    ---------------------------------------- */
    useEffect(() => {
        if (!hasMore || isLoading) return;

        const element = triggerRef.current;
        if (!element) return;

        const observer = new IntersectionObserver(
            entries => {
                const entry = entries[0];

                if (
                    entry.isIntersecting &&
                    !isLoading &&
                    fetcher.state === "idle"
                ) {
                    observer.unobserve(element); // stop multiple triggers
                    setIsLoading(true);
                    setCurrentPage(prev => prev + 1);
                }
            },
            {
                rootMargin: "200px", // preload early
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [hasMore, isLoading, fetcher.state]);

    /* ----------------------------------------
       PRESERVE SCROLL POSITION
    ---------------------------------------- */
    useEffect(() => {
        const saved = sessionStorage.getItem("products-scroll");

        if (saved) {
            window.scrollTo(0, Number(saved));
        }

        const saveScroll = () => {
            sessionStorage.setItem(
                "products-scroll",
                String(window.scrollY)
            );
        };

        window.addEventListener("scroll", saveScroll);

        return () => {
            window.removeEventListener("scroll", saveScroll);
        };
    }, []);

    /* ----------------------------------------
       MANUAL LOAD MORE
    ---------------------------------------- */
    const handleLoadMore = () => {
        if (!hasMore || isLoading) return;
        setIsLoading(true);
        setCurrentPage(prev => prev + 1);
    };

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 space-y-10">
            <ProductsHeader productCount={initialData.total} />

            <ProductGrid products={products} />

            {isLoading && <ProductGridSkeleton count={4} />}

            {hasMore && (
                <>
                    {/* Invisible trigger */}
                    <div ref={triggerRef} className="h-1" />

                    {/* Manual fallback */}
                    <LoadMoreButton
                        onClick={handleLoadMore}
                        loading={isLoading}
                    />
                </>
            )}
        </div>
    );
}