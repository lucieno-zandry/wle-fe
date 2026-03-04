// routes/frontoffice/search-results.tsx
import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';


import ProductCard from '~/components/products/product-card';
import { ProductGridSkeleton } from '~/components/product/product-grid-skeleton';
import { ProductListItem } from '~/components/search/product-list-item';
import { useSearchResults } from '~/hooks/use-search-results';
import { organizeCategories } from '~/lib/organize-categories';
import { ActiveFilters } from '~/components/search/active-filters';
import { SearchFilters } from '~/components/search/search-filters';
import { ProductsToolbar } from '~/components/search/products-toolbar';
import { SearchPagination } from '~/components/search/search-pagination';
import useRouterStore from '~/hooks/use-router-store';

export default function SearchResults() {
    const { t } = useTranslation('search_results');
    const { query } = useParams<{ query: string }>();
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    const {
        products,
        categories,
        totalProducts,
        totalPages,
        loading,
        loadingCategories,
        error,
        selectedCategory,
        priceRange,
        sortBy,
        sortDirection,
        page,
        setSelectedCategory,
        setPriceRange,
        setSortBy,
        setSortDirection,
        clearFilters,
        handlePageChange,
        refetch,
        rangeConfig,
    } = useSearchResults(query);

    const { lang } = useRouterStore();
    const navigate = useNavigate();
    const organizedCategories = organizeCategories(categories);

    const hasActiveFilters =
        Boolean(selectedCategory) || priceRange[0] > 0 || priceRange[1] < 1000;

    const handleSearch = (newQuery: string) => {
        if (!newQuery) return;
        navigate(`/${lang}/search/${encodeURIComponent(newQuery)}`);
    };

    const handleSortChange = (by: 'created_at' | 'title', dir: 'ASC' | 'DESC') => {
        setSortBy(by);
        setSortDirection(dir);
    };

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8 text-center">
                <h2 className="text-2xl font-bold text-destructive mb-4">{t(error)}</h2>
                <Button onClick={refetch}>{t('tryAgain')}</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    {t('searchResultsFor', { query })}
                </h1>
                <p className="text-muted-foreground">
                    {loading ? t('loading') : t('productsFound', { count: totalProducts })}
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-xl">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        defaultValue={query}
                        placeholder={t('searchPlaceholder')}
                        className="pl-10"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleSearch(e.currentTarget.value);
                        }}
                        required
                    />
                </div>
            </div>

            {/* Active filter badges */}
            <ActiveFilters
                selectedCategory={selectedCategory}
                categories={categories}
                priceRange={priceRange}
                onRemoveCategory={() => setSelectedCategory(undefined)}
                onRemovePrice={() => setPriceRange([0, 1000])}
                onClearAll={clearFilters}
            />

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters (desktop sidebar + mobile sheet) */}
                <SearchFilters
                    organizedCategories={organizedCategories}
                    loadingCategories={loadingCategories}
                    selectedCategory={selectedCategory}
                    priceRange={priceRange}
                    sortBy={sortBy}
                    sortDirection={sortDirection}
                    hasActiveFilters={hasActiveFilters}
                    onCategoryChange={setSelectedCategory}
                    onPriceRangeChange={setPriceRange}
                    onSortByChange={setSortBy}
                    onSortDirectionChange={setSortDirection}
                    onClearFilters={clearFilters}
                    rangeConfig={rangeConfig}
                />

                {/* Main content */}
                <div className="flex-1">
                    <ProductsToolbar
                        loading={loading}
                        products={products}
                        totalProducts={totalProducts}
                        viewMode={viewMode}
                        sortBy={sortBy}
                        sortDirection={sortDirection}
                        onViewModeChange={setViewMode}
                        onSortChange={handleSortChange}
                    />

                    {/* Product grid / list / empty / skeleton */}
                    {loading ? (
                        <ProductGridSkeleton count={12} />
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-semibold mb-2">{t('noProductsFound')}</h3>
                            <p className="text-muted-foreground mb-4">{t('tryAdjusting')}</p>
                            <Button onClick={clearFilters}>{t('clearAllFilters')}</Button>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <ProductCard key={product.id} product={product} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col space-y-4">
                            {products.map((product) => (
                                <ProductListItem key={product.id} product={product} />
                            ))}
                        </div>
                    )}

                    <SearchPagination
                        page={page}
                        totalPages={totalPages}
                        onPageChange={handlePageChange}
                    />
                </div>
            </div>
        </div>
    );
}