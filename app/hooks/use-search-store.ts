import { create } from "zustand";
import { devtools } from "zustand/middleware";
import type { ProductQueryParams } from "~/lib/serialize-product-params";

// ─── Types ────────────────────────────────────────────────────────────────────

export type ViewMode = "grid" | "list";
export type SortOption = {
    label: string;
    order_by: ProductQueryParams["order_by"];
    direction: ProductQueryParams["direction"];
};

export const SORT_OPTIONS: SortOption[] = [
    { label: "Newest first", order_by: "created_at", direction: "DESC" },
    { label: "Oldest first", order_by: "created_at", direction: "ASC" },
    { label: "Name A → Z", order_by: "title", direction: "ASC" },
    { label: "Name Z → A", order_by: "title", direction: "DESC" },
];

export interface PriceRange {
    min: number;
    max: number;
    step: number;
}

export interface SearchFilters {
    search: string;
    category_id: number | undefined;
    min_price: number | undefined;
    max_price: number | undefined;
    variant_option_ids: number[];
    sortIndex: number;
}

export interface SearchState {
    // UI state
    viewMode: ViewMode;
    isSidebarOpen: boolean;

    /**
     * True once useSearchUrlSync has finished reading the URL and writing
     * the initial filters into the store. ProductGrid must not fetch before
     * this is true, otherwise it fires with default (empty) filters.
     */
    urlHydrated: boolean;

    // Price range meta (from API)
    priceRangeMeta: PriceRange | null;
    priceRangeLoading: boolean;

    // Filters (what the user has picked)
    filters: SearchFilters;

    // Products
    products: Product[];
    currentPage: number;
    lastPage: number;
    totalProducts: number;
    productsLoading: boolean;
    productsLoadingMore: boolean;
    productsError: string | null;
    hasMore: boolean;

    // Categories
    categories: Category[];
    categoriesLoading: boolean;

    // Actions
    setViewMode: (mode: ViewMode) => void;
    setIsSidebarOpen: (open: boolean) => void;
    setPriceRangeMeta: (range: PriceRange) => void;
    setPriceRangeLoading: (loading: boolean) => void;
    setFilter: <K extends keyof SearchFilters>(key: K, value: SearchFilters[K]) => void;
    resetFilters: () => void;
    setUrlHydrated: (hydrated: boolean) => void;
    setProducts: (products: Product[], page: number, lastPage: number, total: number) => void;
    appendProducts: (products: Product[], page: number, lastPage: number) => void;
    setProductsLoading: (loading: boolean) => void;
    setProductsLoadingMore: (loading: boolean) => void;
    setProductsError: (error: string | null) => void;
    setCategories: (categories: Category[]) => void;
    setCategoriesLoading: (loading: boolean) => void;

    // Computed helpers
    getActiveFiltersCount: () => number;
    buildQueryParams: () => ProductQueryParams;
}

const DEFAULT_FILTERS: SearchFilters = {
    search: "",
    category_id: undefined,
    min_price: undefined,
    max_price: undefined,
    variant_option_ids: [],
    sortIndex: 0,
};

export const useSearchStore = create<SearchState>()(
    devtools(
        (set, get) => ({
            viewMode: "grid",
            isSidebarOpen: false,
            urlHydrated: false,

            priceRangeMeta: null,
            priceRangeLoading: false,

            filters: { ...DEFAULT_FILTERS },

            products: [],
            currentPage: 1,
            lastPage: 1,
            totalProducts: 0,
            productsLoading: false,
            productsLoadingMore: false,
            productsError: null,
            hasMore: false,

            categories: [],
            categoriesLoading: false,

            setViewMode: (mode) => set({ viewMode: mode }),
            setIsSidebarOpen: (open) => set({ isSidebarOpen: open }),
            setUrlHydrated: (hydrated) => set({ urlHydrated: hydrated }),

            setPriceRangeMeta: (range) => set({ priceRangeMeta: range }),
            setPriceRangeLoading: (loading) => set({ priceRangeLoading: loading }),

            setFilter: (key, value) =>
                set((s) => ({ filters: { ...s.filters, [key]: value } })),

            resetFilters: () => set({ filters: { ...DEFAULT_FILTERS }, urlHydrated: false }),

            setProducts: (products, page, lastPage, total) =>
                set({
                    products,
                    currentPage: page,
                    lastPage,
                    totalProducts: total,
                    hasMore: page < lastPage,
                    productsError: null,
                }),

            appendProducts: (products, page, lastPage) =>
                set((s) => ({
                    products: [...s.products, ...products],
                    currentPage: page,
                    lastPage,
                    hasMore: page < lastPage,
                })),

            setProductsLoading: (loading) => set({ productsLoading: loading }),
            setProductsLoadingMore: (loading) => set({ productsLoadingMore: loading }),
            setProductsError: (error) => set({ productsError: error }),

            setCategories: (categories) => set({ categories }),
            setCategoriesLoading: (loading) => set({ categoriesLoading: loading }),

            getActiveFiltersCount: () => {
                const { filters } = get();
                let count = 0;
                if (filters.search) count++;
                if (filters.category_id !== undefined) count++;
                if (filters.min_price !== undefined || filters.max_price !== undefined) count++;
                if (filters.variant_option_ids.length > 0) count++;
                if (filters.sortIndex !== 0) count++;
                return count;
            },

            buildQueryParams: (): ProductQueryParams => {
                const { filters } = get();
                const sort = SORT_OPTIONS[filters.sortIndex];
                return {
                    search: filters.search || undefined,
                    category_id: filters.category_id,
                    min_price: filters.min_price,
                    max_price: filters.max_price,
                    variant_option_ids: filters.variant_option_ids.length
                        ? filters.variant_option_ids
                        : undefined,
                    order_by: sort.order_by,
                    direction: sort.direction,
                    with: ["variants", "images", "category"],
                    limit: 12,
                };
            },
        }),
        { name: "search-store" }
    )
);