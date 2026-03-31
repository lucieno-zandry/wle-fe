import { useEffect, useRef } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
import { useSearchStore } from "./use-search-store";
import appPathname from "~/lib/app-pathname";

export const QUERY_PLACEHOLDER = "all"; // path segment when no keyword

export function useSearchUrlSync() {
    const navigate = useNavigate();
    const { query: urlQuery } = useParams<{ query: string }>();
    const [searchParams] = useSearchParams();

    const filters = useSearchStore((s) => s.filters);
    const setFilter = useSearchStore((s) => s.setFilter);
    const resetFilters = useSearchStore((s) => s.resetFilters);
    const setUrlHydrated = useSearchStore((s) => s.setUrlHydrated);

    const hydratedRef = useRef(false);
    const isFirstRender = useRef(true);

    // ── 1. Hydrate store from URL on mount ───────────────────────────────────
    useEffect(() => {
        resetFilters();

        const keyword = urlQuery === QUERY_PLACEHOLDER ? "" : (urlQuery ?? "");
        setFilter("search", decodeURIComponent(keyword));

        const cat = searchParams.get("category");
        if (cat) setFilter("category_id", Number(cat));

        const minP = searchParams.get("min_price");
        if (minP) setFilter("min_price", Number(minP));

        const maxP = searchParams.get("max_price");
        if (maxP) setFilter("max_price", Number(maxP));

        const sort = searchParams.get("sort");
        if (sort) setFilter("sortIndex", Number(sort));

        // ← Signal ProductGrid that it's now safe to fetch with correct filters
        setUrlHydrated(true);
        hydratedRef.current = true;
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // intentionally only on mount

    // ── 2. Push store → URL whenever filters change ──────────────────────────
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        if (!hydratedRef.current) return;

        const keyword = filters.search
            ? encodeURIComponent(filters.search)
            : QUERY_PLACEHOLDER;

        const params = new URLSearchParams();
        if (filters.category_id !== undefined)
            params.set("category", String(filters.category_id));
        if (filters.min_price !== undefined)
            params.set("min_price", String(filters.min_price));
        if (filters.max_price !== undefined)
            params.set("max_price", String(filters.max_price));
        if (filters.sortIndex !== 0)
            params.set("sort", String(filters.sortIndex));

        const qs = params.toString();
        const newPath = appPathname(`/search/${keyword}${qs ? `?${qs}` : ""}`);

        navigate(newPath, { replace: true });
    }, [filters, hydratedRef]);
}