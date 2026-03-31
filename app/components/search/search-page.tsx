// routes/frontoffice/search.tsx  (or wherever SearchPage lives)
// Only change vs. previous version: call useSearchUrlSync() inside SearchPage.

import { useEffect, type ReactNode } from "react";
import { getCategories, getPriceRange } from "~/api/http-requests";
import { useSearchStore } from "~/hooks/use-search-store";
import { useSearchUrlSync } from "~/hooks/use-search-url-sync";
import { SearchBar } from "./search-bar";
import { TopBar } from "./top-bar";
import { FilterSidebar } from "./filter-sidebar";
import { ActiveFilterTags } from "./active-filter-tags";
import { ProductGrid } from "./product-grid";
import { MobileFilterDrawer } from "./mobile-filter-drawer";

// ─── View (unchanged) ─────────────────────────────────────────────────────────

export interface SearchPageViewProps {
    searchBar: ReactNode;
    topBar: ReactNode;
    sidebar: ReactNode;
    activeFilterTags: ReactNode;
    productGrid: ReactNode;
    mobileDrawer: ReactNode;
}

export function SearchPageView({
    searchBar,
    topBar,
    sidebar,
    activeFilterTags,
    productGrid,
    mobileDrawer,
}: SearchPageViewProps) {
    return (
        <div className="min-h-screen bg-background">
            {mobileDrawer}

            <header className="sticky top-0 z-30 border-b border-border/60 bg-background/80 backdrop-blur-md">
                <div className="mx-auto max-w-screen-2xl px-4 py-3 sm:px-6">
                    <div className="flex items-center gap-3">
                        <div className="mr-auto max-w-xl flex-1">
                            {searchBar}
                        </div>
                        {topBar}
                    </div>
                </div>
            </header>

            <main className="mx-auto max-w-screen-2xl px-4 py-6 sm:px-6">
                <div className="flex gap-6">
                    <aside className="hidden w-[240px] shrink-0 lg:block xl:w-[260px]">
                        <div className="sticky top-[73px] max-h-[calc(100vh-73px)] overflow-hidden rounded-xl border border-border/60 bg-card shadow-sm">
                            {sidebar}
                        </div>
                    </aside>

                    <div className="min-w-0 flex-1">
                        <div className="mb-4">{activeFilterTags}</div>
                        {productGrid}
                    </div>
                </div>
            </main>
        </div>
    );
}

// ─── Smart (updated) ──────────────────────────────────────────────────────────

export function SearchPage() {
    const setPriceRangeMeta = useSearchStore((s) => s.setPriceRangeMeta);
    const setPriceRangeLoading = useSearchStore((s) => s.setPriceRangeLoading);
    const setCategories = useSearchStore((s) => s.setCategories);
    const setCategoriesLoading = useSearchStore((s) => s.setCategoriesLoading);

    useSearchUrlSync();

    useEffect(() => {
        const loadMeta = async () => {
            setPriceRangeLoading(true);
            const { data: priceData } = await getPriceRange();
            if (priceData) setPriceRangeMeta(priceData);
            setPriceRangeLoading(false);

            setCategoriesLoading(true);
            const { data: catData } = await getCategories();
            if (catData) setCategories(catData.categories);
            setCategoriesLoading(false);
        };
        loadMeta();
    }, []);

    return (
        <SearchPageView
            searchBar={<SearchBar />}
            topBar={<TopBar />}
            sidebar={<FilterSidebar />}
            activeFilterTags={<ActiveFilterTags />}
            productGrid={<ProductGrid />}
            mobileDrawer={<MobileFilterDrawer />}
        />
    );
}