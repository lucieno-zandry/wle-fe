// components/search/ProductSearch.tsx (Updated)
"use client";

import * as React from "react";
import { Search, Package, ArrowUpRight, Loader2, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "~/components/ui/command";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { getProducts } from "~/api/http-requests";

const Highlight = ({ text, query }: { text: string; query: string }) => {
    if (!query) return <span>{text}</span>;
    const parts = text.split(new RegExp(`(${query})`, "gi"));
    return (
        <span>
            {parts.map((part, i) =>
                part.toLowerCase() === query.toLowerCase() ? (
                    <span key={i} className="text-primary font-bold underline decoration-primary/30">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </span>
    );
};

export function ProductSearch() {
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [products, setProducts] = React.useState<Product[]>([]);
    const [isLoading, setIsLoading] = React.useState(false);
    const navigate = useNavigate();

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
            // Allow Enter to go to search results page
            if (e.key === "Enter" && open && query.trim() && !isLoading) {
                e.preventDefault();
                navigateToSearchResults();
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, [open, query, isLoading]);

    React.useEffect(() => {
        if (query.trim() === "") {
            setProducts([]);
            return;
        }

        setIsLoading(true);
        const delayDebounceFn = setTimeout(() => {
            getProducts({ search: query })
                .then(response => {
                    if (response.data?.products) {
                        setProducts(response.data.products);
                    }
                })
                .catch(err => console.error("Search failed", err))
                .finally(() => setIsLoading(false));
        }, 350);

        return () => clearTimeout(delayDebounceFn);
    }, [query]);

    const onSelectProduct = (slug: string) => {
        setOpen(false);
        navigate(`/product/${slug}`);
    };

    const navigateToSearchResults = () => {
        if (query.trim()) {
            setOpen(false);
            navigate(`/search/${encodeURIComponent(query.trim())}`);
        }
    };

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="relative flex h-9 w-full items-center justify-start rounded-full bg-muted/50 px-3 text-sm text-muted-foreground transition-all hover:bg-muted md:w-40 lg:w-64"
            >
                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                <span className="inline-flex">Search...</span>
                <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-6 select-none items-center gap-1 rounded border bg-background px-1.5 font-mono text-[10px] font-medium opacity-100 sm:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <Command shouldFilter={false} className="rounded-lg">
                    <CommandInput
                        placeholder="Search products, SKUs, or categories..."
                        onValueChange={setQuery}
                    />
                    <CommandList className="max-h-[450px]">
                        {isLoading && (
                            <div className="flex items-center justify-center py-6 text-sm text-muted-foreground">
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Finding products...
                            </div>
                        )}

                        {!isLoading && query && products.length === 0 && (
                            <CommandEmpty>No results found for "{query}".</CommandEmpty>
                        )}

                        {!isLoading && products.length > 0 && (
                            <>
                                {/* View All Results Button */}
                                <div className="border-b px-2 py-2">
                                    <Button
                                        variant="ghost"
                                        className="w-full justify-between h-9 text-sm font-semibold"
                                        onClick={navigateToSearchResults}
                                    >
                                        <span>View all {products.length} results</span>
                                        <ArrowRight className="h-4 w-4" />
                                    </Button>
                                </div>

                                <CommandGroup heading="Quick Results">
                                    {products.slice(0, 5).map((product) => {
                                        const mainVariant = product.variants?.[0];
                                        const price = mainVariant?.price;
                                        const hasDiscount = !!mainVariant?.special_price;

                                        return (
                                            <CommandItem
                                                key={product.id}
                                                onSelect={() => onSelectProduct(product.slug)}
                                                className="flex items-center gap-3 p-3 cursor-pointer group"
                                            >
                                                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border bg-muted overflow-hidden">
                                                    {product.images?.[0] ? (
                                                        <img
                                                            src={`/storage/${product.images[0].filename}`}
                                                            alt={product.title}
                                                            className="h-full w-full object-cover transition-transform group-hover:scale-110"
                                                        />
                                                    ) : (
                                                        <Package className="h-6 w-6 text-muted-foreground" />
                                                    )}
                                                </div>

                                                <div className="flex flex-1 flex-col overflow-hidden">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-semibold truncate">
                                                            <Highlight text={product.title} query={query} />
                                                        </span>
                                                        <div className="flex items-center gap-2">
                                                            {hasDiscount && (
                                                                <span className="text-xs text-muted-foreground line-through">
                                                                    ${price}
                                                                </span>
                                                            )}
                                                            <span className="font-bold text-primary">
                                                                ${mainVariant?.special_price ?? price}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-2 mt-1">
                                                        {product.category && (
                                                            <Badge variant="secondary" className="text-[10px] h-4 px-1 leading-none">
                                                                {product.category.title}
                                                            </Badge>
                                                        )}
                                                        <span className="text-xs text-muted-foreground truncate">
                                                            {product.description}
                                                        </span>
                                                    </div>
                                                </div>

                                                <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0" />
                                            </CommandItem>
                                        );
                                    })}
                                </CommandGroup>

                                {products.length > 5 && (
                                    <div className="border-t px-2 py-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full text-xs text-muted-foreground"
                                            onClick={navigateToSearchResults}
                                        >
                                            +{products.length - 5} more results
                                        </Button>
                                    </div>
                                )}
                            </>
                        )}
                    </CommandList>
                </Command>
            </CommandDialog>
        </>
    );
}