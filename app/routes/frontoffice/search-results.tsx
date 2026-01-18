// routes/frontoffice/search-results.tsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, Link } from 'react-router';
import { Card, CardContent, CardFooter } from '~/components/ui/card';
import { Input } from '~/components/ui/input';
import { Button } from '~/components/ui/button';
import { Badge } from '~/components/ui/badge';
import { Skeleton } from '~/components/ui/skeleton';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '~/components/ui/select';
import { Slider } from '~/components/ui/slider';
import { Checkbox } from '~/components/ui/checkbox';
import { Label } from '~/components/ui/label';
import { Separator } from '~/components/ui/separator';
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '~/components/ui/pagination';
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '~/components/ui/sheet';
import { RadioGroup, RadioGroupItem } from '~/components/ui/radio-group';
import { ScrollArea } from '~/components/ui/scroll-area';
import { Filter, Search, Grid, List, X, ChevronDown } from 'lucide-react';
import { getCategories, getProducts } from '~/api/http-requests';
import type { ProductQueryParams } from '~/lib/serialize-product-params';
import formatMoney from '~/lib/format-money';

export default function () {
    const { query } = useParams<{ query: string }>();
    const [searchParams, setSearchParams] = useSearchParams();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingCategories, setLoadingCategories] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [totalProducts, setTotalProducts] = useState(0);

    // Filter states
    const [selectedCategory, setSelectedCategory] = useState<number | undefined>(
        searchParams.get('category') ? parseInt(searchParams.get('category')!) : undefined
    );
    const [priceRange, setPriceRange] = useState<[number, number]>([
        searchParams.get('min_price') ? parseInt(searchParams.get('min_price')!) : 0,
        searchParams.get('max_price') ? parseInt(searchParams.get('max_price')!) : 1000
    ]);
    const [selectedOptions, setSelectedOptions] = useState<number[]>([]);
    const [sortBy, setSortBy] = useState<'created_at' | 'title'>(
        (searchParams.get('sort') as 'created_at' | 'title') || 'created_at'
    );
    const [sortDirection, setSortDirection] = useState<'ASC' | 'DESC'>(
        (searchParams.get('dir') as 'ASC' | 'DESC') || 'DESC'
    );
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

    // Pagination
    const limit = 12;
    const page = parseInt(searchParams.get('page') || '1');
    const offset = (page - 1) * limit;

    // Initialize URL parameters from state
    useEffect(() => {
        const params = new URLSearchParams(searchParams);

        if (selectedCategory) {
            params.set('category', selectedCategory.toString());
        } else {
            params.delete('category');
        }

        params.set('min_price', priceRange[0].toString());
        params.set('max_price', priceRange[1].toString());
        params.set('sort', sortBy);
        params.set('dir', sortDirection);

        // Only set page if it's not 1
        if (page === 1) {
            params.delete('page');
        } else {
            params.set('page', page.toString());
        }

        setSearchParams(params);
    }, [selectedCategory, priceRange, sortBy, sortDirection, page]);

    useEffect(() => {
        fetchCategories();
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [query, selectedCategory, priceRange, selectedOptions, sortBy, sortDirection, page]);

    const fetchCategories = async () => {
        setLoadingCategories(true);
        try {
            const response = await getCategories();
            setCategories(response.data?.categories || []);
        } catch (err) {
            console.error('Error fetching categories:', err);
        } finally {
            setLoadingCategories(false);
        }
    };

    const fetchProducts = async () => {
        if (!query) return;

        setLoading(true);
        setError(null);

        try {
            const params: ProductQueryParams = {
                search: query,
                category_id: selectedCategory,
                min_price: priceRange[0],
                max_price: priceRange[1],
                variant_option_ids: selectedOptions.length > 0 ? selectedOptions : undefined,
                order_by: sortBy,
                direction: sortDirection,
                limit,
                offset,
            };

            const response = await getProducts(params);
            setProducts(response.data?.products || []);
            // Note: You might need to adjust based on your actual API response structure
            // setTotalProducts(response.total || response.products.length);
            setTotalProducts(response.data?.products.length || 0); // Temporary, update based on your API
        } catch (err) {
            setError('Failed to load products. Please try again.');
            console.error('Error fetching products:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (newQuery: string) => {
        // Navigate to new search
        window.location.href = `/search/${encodeURIComponent(newQuery)}`;
    };

    const clearFilters = () => {
        setSelectedCategory(undefined);
        setPriceRange([0, 1000]);
        setSelectedOptions([]);
        setSortBy('created_at');
        setSortDirection('DESC');

        // Clear URL parameters except query
        setSearchParams({});
    };

    const handlePageChange = (newPage: number) => {
        setSearchParams(prev => {
            prev.set('page', newPage.toString());
            return prev;
        });
    };

    const handleCategoryChange = (categoryId: number | undefined) => {
        setSelectedCategory(categoryId);
        // Reset to first page when changing filters
        if (page !== 1) {
            setSearchParams(prev => {
                prev.set('page', '1');
                return prev;
            });
        }
    };

    // Organize categories by parent-child relationship
    const organizeCategories = (categories: Category[]) => {
        const categoryMap = new Map<number, Category & { children?: Category[] }>();
        const rootCategories: (Category & { children?: Category[] })[] = [];

        // First, create a map of all categories
        categories.forEach(category => {
            categoryMap.set(category.id, { ...category, children: [] });
        });

        // Then, build the hierarchy
        categories.forEach(category => {
            const categoryWithChildren = categoryMap.get(category.id)!;

            if (category.parent_id === null) {
                rootCategories.push(categoryWithChildren);
            } else {
                const parent = categoryMap.get(category.parent_id);
                if (parent) {
                    parent.children = parent.children || [];
                    parent.children.push(categoryWithChildren);
                }
            }
        });

        return rootCategories;
    };

    const organizedCategories = organizeCategories(categories);
    const totalPages = Math.ceil(totalProducts / limit);

    if (error) {
        return (
            <div className="container mx-auto px-4 py-8">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-destructive mb-4">{error}</h2>
                    <Button onClick={fetchProducts}>Try Again</Button>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">
                    Search Results for "{query}"
                </h1>
                <p className="text-muted-foreground">
                    {loading ? 'Loading...' : `${totalProducts} products found`}
                </p>
            </div>

            {/* Search Bar */}
            <div className="mb-6">
                <div className="relative max-w-xl">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                        defaultValue={query}
                        placeholder="Search for products..."
                        className="pl-10"
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                                handleSearch(e.currentTarget.value);
                            }
                        }}
                    />
                </div>
            </div>

            {/* Active Filters */}
            {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
                <div className="mb-6 flex flex-wrap gap-2 items-center">
                    <span className="text-sm font-medium">Active filters:</span>
                    {selectedCategory && categories.find(c => c.id === selectedCategory) && (
                        <Badge variant="secondary" className="gap-1">
                            Category: {categories.find(c => c.id === selectedCategory)?.title}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-3 w-3 ml-1 hover:bg-transparent"
                                onClick={() => handleCategoryChange(undefined)}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                    {(priceRange[0] > 0 || priceRange[1] < 1000) && (
                        <Badge variant="secondary" className="gap-1">
                            Price: ${priceRange[0]} - ${priceRange[1]}
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-3 w-3 ml-1 hover:bg-transparent"
                                onClick={() => setPriceRange([0, 1000])}
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </Badge>
                    )}
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearFilters}
                        className="ml-2"
                    >
                        Clear all
                    </Button>
                </div>
            )}

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Filters Sidebar - Desktop */}
                <div className="hidden lg:block w-64 flex-shrink-0">
                    <div className="sticky top-8 space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Filters</h3>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearFilters}
                                className="h-8 px-2"
                            >
                                <X className="h-4 w-4 mr-1" />
                                Clear
                            </Button>
                        </div>

                        {/* Category Filter */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Category</h4>
                            <ScrollArea className="h-[200px] pr-4">
                                {loadingCategories ? (
                                    <div className="space-y-2">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-6 w-full" />
                                        ))}
                                    </div>
                                ) : organizedCategories.length > 0 ? (
                                    <RadioGroup
                                        value={selectedCategory?.toString()}
                                        onValueChange={(value) => handleCategoryChange(value ? parseInt(value) : undefined)}
                                    >
                                        <div className="space-y-2">
                                            <div className="flex items-center space-x-2">
                                                <RadioGroupItem value="" id="all-categories" />
                                                <Label htmlFor="all-categories" className="cursor-pointer">
                                                    All Categories
                                                </Label>
                                            </div>
                                            {organizedCategories.map((category) => (
                                                <CategoryRadioItem
                                                    key={category.id}
                                                    category={category}
                                                    selectedCategory={selectedCategory}
                                                    onSelect={handleCategoryChange}
                                                />
                                            ))}
                                        </div>
                                    </RadioGroup>
                                ) : (
                                    <p className="text-sm text-muted-foreground">No categories available</p>
                                )}
                            </ScrollArea>
                        </div>

                        <Separator />

                        {/* Price Filter */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Price Range</h4>
                            <div className="px-1">
                                <Slider
                                    value={priceRange}
                                    onValueChange={(s) => setPriceRange(s as [number, number])}
                                    max={1000}
                                    step={10}
                                    className="w-full"
                                />
                                <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                    <span>${priceRange[0]}</span>
                                    <span>${priceRange[1]}</span>
                                </div>
                            </div>
                        </div>

                        <Separator />

                        {/* Sort Options */}
                        <div className="space-y-4">
                            <h4 className="font-medium">Sort By</h4>
                            <Select
                                value={sortBy}
                                onValueChange={(value: 'created_at' | 'title') => setSortBy(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at">Newest</SelectItem>
                                    <SelectItem value="title">Name</SelectItem>
                                </SelectContent>
                            </Select>

                            <Select
                                value={sortDirection}
                                onValueChange={(value: 'ASC' | 'DESC') => setSortDirection(value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Direction" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="DESC">Descending</SelectItem>
                                    <SelectItem value="ASC">Ascending</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </div>

                {/* Mobile Filters Sheet */}
                <div className="lg:hidden">
                    <Sheet>
                        <SheetTrigger asChild>
                            <Button variant="outline" className="gap-2">
                                <Filter className="h-4 w-4" />
                                Filters
                                {(selectedCategory || priceRange[0] > 0 || priceRange[1] < 1000) && (
                                    <Badge variant="secondary" className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                                        !
                                    </Badge>
                                )}
                            </Button>
                        </SheetTrigger>
                        <SheetContent side="left" className="w-full sm:w-96">
                            <SheetHeader className="border-b pb-4">
                                <SheetTitle>Filters</SheetTitle>
                            </SheetHeader>
                            <ScrollArea className="h-[calc(100vh-8rem)] pr-4">
                                <div className="py-6 space-y-6">
                                    {/* Category Filter for Mobile */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Category</h4>
                                        {loadingCategories ? (
                                            <div className="space-y-2">
                                                {[1, 2, 3].map((i) => (
                                                    <Skeleton key={i} className="h-6 w-full" />
                                                ))}
                                            </div>
                                        ) : organizedCategories.length > 0 ? (
                                            <RadioGroup
                                                value={selectedCategory?.toString()}
                                                onValueChange={(value) => handleCategoryChange(value ? parseInt(value) : undefined)}
                                            >
                                                <div className="space-y-2">
                                                    <div className="flex items-center space-x-2">
                                                        <RadioGroupItem value="" id="mobile-all-categories" />
                                                        <Label htmlFor="mobile-all-categories" className="cursor-pointer">
                                                            All Categories
                                                        </Label>
                                                    </div>
                                                    {organizedCategories.map((category) => (
                                                        <CategoryRadioItem
                                                            key={category.id}
                                                            category={category}
                                                            selectedCategory={selectedCategory}
                                                            onSelect={handleCategoryChange}
                                                        />
                                                    ))}
                                                </div>
                                            </RadioGroup>
                                        ) : (
                                            <p className="text-sm text-muted-foreground">No categories available</p>
                                        )}
                                    </div>

                                    <Separator />

                                    {/* Price Filter for Mobile */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Price Range</h4>
                                        <div className="px-1">
                                            <Slider
                                                value={priceRange}
                                                onValueChange={(s) => setPriceRange(s as [number, number])}
                                                max={1000}
                                                step={10}
                                                className="w-full"
                                            />
                                            <div className="flex justify-between mt-2 text-sm text-muted-foreground">
                                                <span>${priceRange[0]}</span>
                                                <span>${priceRange[1]}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <Separator />

                                    {/* Sort Options for Mobile */}
                                    <div className="space-y-4">
                                        <h4 className="font-medium">Sort By</h4>
                                        <Select
                                            value={sortBy}
                                            onValueChange={(value: 'created_at' | 'title') => setSortBy(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="created_at">Newest</SelectItem>
                                                <SelectItem value="title">Name</SelectItem>
                                            </SelectContent>
                                        </Select>

                                        <Select
                                            value={sortDirection}
                                            onValueChange={(value: 'ASC' | 'DESC') => setSortDirection(value)}
                                        >
                                            <SelectTrigger>
                                                <SelectValue placeholder="Direction" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="DESC">Descending</SelectItem>
                                                <SelectItem value="ASC">Ascending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="pt-4">
                                        <Button className="w-full" onClick={clearFilters}>
                                            Clear All Filters
                                        </Button>
                                    </div>
                                </div>
                            </ScrollArea>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Main Content */}
                <div className="flex-1">
                    {/* Toolbar */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <Button
                                    variant={viewMode === 'grid' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('grid')}
                                >
                                    <Grid className="h-4 w-4" />
                                </Button>
                                <Button
                                    variant={viewMode === 'list' ? 'default' : 'outline'}
                                    size="icon"
                                    onClick={() => setViewMode('list')}
                                >
                                    <List className="h-4 w-4" />
                                </Button>
                            </div>
                            <span className="text-sm text-muted-foreground">
                                {loading ? 'Loading...' : `Showing ${products.length} of ${totalProducts} products`}
                            </span>
                        </div>

                        {/* Sort dropdown for mobile */}
                        <div className="lg:hidden">
                            <Select
                                value={`${sortBy}-${sortDirection}`}
                                onValueChange={(value) => {
                                    const [by, dir] = value.split('-');
                                    setSortBy(by as 'created_at' | 'title');
                                    setSortDirection(dir as 'ASC' | 'DESC');
                                }}
                            >
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Sort by" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="created_at-DESC">Newest First</SelectItem>
                                    <SelectItem value="created_at-ASC">Oldest First</SelectItem>
                                    <SelectItem value="title-ASC">Name A-Z</SelectItem>
                                    <SelectItem value="title-DESC">Name Z-A</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    {/* Products Grid/List */}
                    {loading ? (
                        <ProductGridSkeleton count={limit} />
                    ) : products.length === 0 ? (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-semibold mb-2">No products found</h3>
                            <p className="text-muted-foreground mb-4">
                                Try adjusting your search or filters
                            </p>
                            <Button onClick={clearFilters}>Clear All Filters</Button>
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

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="mt-12">
                            <Pagination>
                                <PaginationContent>
                                    <PaginationItem>
                                        <PaginationPrevious
                                            onClick={() => page > 1 && handlePageChange(page - 1)}
                                            className={page <= 1 ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>

                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                        let pageNum = i + 1;
                                        if (totalPages > 5) {
                                            if (page > 3) pageNum = page - 3 + i;
                                            if (page > totalPages - 2) pageNum = totalPages - 4 + i;
                                        }
                                        return (
                                            <PaginationItem key={pageNum}>
                                                <PaginationLink
                                                    isActive={pageNum === page}
                                                    onClick={() => handlePageChange(pageNum)}
                                                >
                                                    {pageNum}
                                                </PaginationLink>
                                            </PaginationItem>
                                        );
                                    })}

                                    <PaginationItem>
                                        <PaginationNext
                                            onClick={() => page < totalPages && handlePageChange(page + 1)}
                                            className={page >= totalPages ? 'pointer-events-none opacity-50' : ''}
                                        />
                                    </PaginationItem>
                                </PaginationContent>
                            </Pagination>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// Recursive category radio item component
function CategoryRadioItem({
    category,
    selectedCategory,
    onSelect
}: {
    category: Category & { children?: Category[] };
    selectedCategory: number | undefined;
    onSelect: (categoryId: number | undefined) => void;
}) {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="space-y-1">
            <div className="flex items-center space-x-2">
                <RadioGroupItem
                    value={category.id.toString()}
                    id={`category-${category.id}`}
                />
                <Label
                    htmlFor={`category-${category.id}`}
                    className="cursor-pointer flex-1"
                >
                    {category.title}
                </Label>
                {category.children && category.children.length > 0 && (
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => setIsOpen(!isOpen)}
                    >
                        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                    </Button>
                )}
            </div>

            {isOpen && category.children && category.children.length > 0 && (
                <div className="ml-6 space-y-1 border-l pl-4">
                    {category.children.map((child) => (
                        <CategoryRadioItem
                            key={child.id}
                            category={child}
                            selectedCategory={selectedCategory}
                            onSelect={onSelect}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}

// Product Card Component (Grid View) - Same as before
function ProductCard({ product }: { product: Product }) {
    const lowestPrice = product.variants?.reduce((min, variant) =>
        variant.special_price && variant.special_price < min ? variant.special_price : variant.price,
        product.variants[0]?.price || 0
    );

    const originalPrice = product.variants?.[0]?.price;
    const hasDiscount = originalPrice && lowestPrice && lowestPrice < originalPrice;
    const mainImage = product.images?.[0]?.filename || '';

    return (
        <Link to={`/product/${product.slug}`}>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow h-full">
                <div className="aspect-square overflow-hidden bg-muted">
                    {mainImage ? (
                        <img
                            src={`/uploads/${mainImage}`}
                            alt={product.title}
                            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center">
                            <span className="text-muted-foreground">No image</span>
                        </div>
                    )}
                </div>
                <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                        <div>
                            {product.category && (
                                <Badge variant="secondary" className="mb-1">
                                    {product.category.title}
                                </Badge>
                            )}
                            <h3 className="font-semibold line-clamp-1">{product.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                {product.description}
                            </p>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="p-4 pt-0">
                    <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-lg">{formatMoney(lowestPrice)}</span>
                            {hasDiscount && (
                                <span className="text-sm text-muted-foreground line-through">
                                    {formatMoney(originalPrice)}
                                </span>
                            )}
                        </div>
                        <Button size="sm">View Details</Button>
                    </div>
                </CardFooter>
            </Card>
        </Link>
    );
}

// Product List Item Component (List View) - Same as before
function ProductListItem({ product }: { product: Product }) {
    const lowestPrice = product.variants?.reduce((min, variant) =>
        variant.special_price && variant.special_price < min ? variant.special_price : variant.price,
        product.variants[0]?.price || 0
    );

    const mainImage = product.images?.[0]?.filename || '';

    return (
        <Link to={`/product/${product.slug}`}>
            <Card className="overflow-hidden hover:shadow-md transition-shadow">
                <div className="flex">
                    <div className="w-32 h-32 flex-shrink-0 bg-muted">
                        {mainImage ? (
                            <img
                                src={`/uploads/${mainImage}`}
                                alt={product.title}
                                className="w-full h-full object-cover"
                                loading="lazy"
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center">
                                <span className="text-muted-foreground">No image</span>
                            </div>
                        )}
                    </div>
                    <div className="flex-1 p-4 flex flex-col justify-between">
                        <div>
                            <div className="flex items-start justify-between">
                                <div>
                                    <h3 className="font-semibold text-lg">{product.title}</h3>
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {product.description}
                                    </p>
                                </div>
                                <span className="font-bold text-xl">{formatMoney(lowestPrice)}</span>
                            </div>
                            {product.category && (
                                <Badge variant="outline" className="mt-2">
                                    {product.category.title}
                                </Badge>
                            )}
                        </div>
                        <div className="flex justify-end mt-4">
                            <Button>View Details</Button>
                        </div>
                    </div>
                </div>
            </Card>
        </Link>
    );
}

// Loading Skeleton - Same as before
function ProductGridSkeleton({ count }: { count: number }) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <Card key={i} className="overflow-hidden">
                    <Skeleton className="aspect-square w-full" />
                    <CardContent className="p-4">
                        <Skeleton className="h-4 w-1/3 mb-2" />
                        <Skeleton className="h-6 w-full mb-2" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3 mt-1" />
                    </CardContent>
                    <CardFooter className="p-4 pt-0">
                        <Skeleton className="h-10 w-full" />
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
}

// Export loader for React Router v7
export async function loader({ params }: { params: { query: string } }) {
    // You can preload data here if needed
    return { query: params.query };
}