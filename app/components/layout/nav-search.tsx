import {
    useCallback,
    useEffect,
    useRef,
    useState,
} from "react";
import { useParams } from "react-router";
import { getCategories, getProducts } from "~/api/http-requests";
import { Search, X, ArrowRight, Tag, Package, Clock, Loader2, TrendingUp } from "lucide-react";
import { cn } from "~/lib/utils";
import appNavigate from "~/lib/app-navigate";

export interface NavSearchViewProps {
    value: string;
    open: boolean;
    loading: boolean;
    suggestions: SearchSuggestion[];
    recentSearches: string[];
    activeIndex: number;
    containerRef: React.RefObject<HTMLDivElement | null>;
    inputRef: React.RefObject<HTMLInputElement | null>;
    onChange: (v: string) => void;
    onFocus: () => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
    onSubmit: () => void;
    onSelectSuggestion: (suggestion: SearchSuggestion) => void;
    onSelectRecent: (term: string) => void;
    onRemoveRecent: (term: string, e: React.MouseEvent) => void;
    onClear: () => void;
}

function SuggestionRow({
    suggestion,
    active,
    onSelect,
}: {
    suggestion: SearchSuggestion;
    active: boolean;
    onSelect: () => void;
}) {
    return (
        <button
            onMouseDown={(e) => { e.preventDefault(); onSelect(); }}
            className={cn(
                "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                active ? "bg-accent text-accent-foreground" : "hover:bg-accent/60"
            )}
        >
            <span className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-md text-xs",
                suggestion.type === "category"
                    ? "bg-violet-500/10 text-violet-500 dark:bg-violet-500/20 dark:text-violet-400"
                    : "bg-primary/10 text-primary"
            )}>
                {suggestion.type === "category"
                    ? <Tag className="size-3.5" />
                    : suggestion.image
                        ? <img src={suggestion.image} alt="" className="size-7 rounded-md object-cover" />
                        : <Package className="size-3.5" />
                }
            </span>

            <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-foreground">
                    {suggestion.label}
                </p>
                {suggestion.sublabel && (
                    <p className="truncate text-xs text-muted-foreground">
                        {suggestion.sublabel}
                    </p>
                )}
            </div>

            <span className={cn(
                "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium",
                suggestion.type === "category"
                    ? "bg-violet-500/10 text-violet-600 dark:text-violet-400 dark:bg-violet-500/20"
                    : "bg-primary/10 text-primary"
            )}>
                {suggestion.type === "category" ? "Category" : "Product"}
            </span>
        </button>
    );
}

function SectionLabel({ label }: { label: string }) {
    return (
        <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
        </p>
    );
}

export function NavSearchView({
    value,
    open,
    loading,
    suggestions,
    recentSearches,
    activeIndex,
    containerRef,
    inputRef,
    onChange,
    onFocus,
    onKeyDown,
    onSubmit,
    onSelectSuggestion,
    onSelectRecent,
    onRemoveRecent,
    onClear,
}: NavSearchViewProps) {
    const productSuggestions = suggestions.filter((s) => s.type === "product");
    const categorySuggestions = suggestions.filter((s) => s.type === "category");
    const hasAnySuggestions = suggestions.length > 0;
    const showRecents = !value && recentSearches.length > 0;
    const showPanel = open && (loading || hasAnySuggestions || showRecents || value.length >= 2);

    return (
        <div ref={containerRef} className="relative w-full">
            <div className={cn(
                "flex items-center gap-2 rounded-xl border bg-background/60 px-3 shadow-sm backdrop-blur-sm transition-all duration-200",
                open
                    ? "border-primary/50 bg-background shadow-md ring-2 ring-primary/10"
                    : "border-border/60 hover:border-border"
            )}>
                <Search className={cn(
                    "size-4 shrink-0 transition-colors",
                    open ? "text-primary" : "text-muted-foreground"
                )} />

                <input
                    ref={inputRef}
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onFocus={onFocus}
                    onKeyDown={onKeyDown}
                    placeholder="Search products, categories…"
                    className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground/70"
                    autoComplete="off"
                    spellCheck={false}
                />

                {loading && (
                    <Loader2 className="size-3.5 shrink-0 animate-spin text-muted-foreground" />
                )}
                {value && !loading && (
                    <button
                        onMouseDown={(e) => { e.preventDefault(); onClear(); }}
                        className="shrink-0 rounded-full p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                        <X className="size-3.5" />
                    </button>
                )}

                <button
                    onMouseDown={(e) => { e.preventDefault(); onSubmit(); }}
                    className={cn(
                        "flex h-7 shrink-0 items-center gap-1.5 rounded-lg px-3 text-xs font-medium transition-all",
                        value
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
                    )}
                >
                    Search
                    <ArrowRight className="size-3" />
                </button>
            </div>

            {showPanel && (
                <div className={cn(
                    "absolute left-0 right-0 top-[calc(100%+8px)] z-50 overflow-hidden rounded-xl border border-border/60 bg-popover shadow-xl",
                    "animate-in fade-in-0 slide-in-from-top-2 duration-150"
                )}>
                    {loading && suggestions.length === 0 && (
                        <div className="space-y-1 p-3">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-2.5">
                                    <div className="size-7 animate-pulse rounded-md bg-muted" />
                                    <div className="flex-1 space-y-1.5">
                                        <div className="h-3 w-2/3 animate-pulse rounded bg-muted" />
                                        <div className="h-2.5 w-1/2 animate-pulse rounded bg-muted" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && hasAnySuggestions && (
                        <div className="p-2">
                            {categorySuggestions.length > 0 && (
                                <div className="mb-1">
                                    <SectionLabel label="Categories" />
                                    {categorySuggestions.map((s, i) => (
                                        <SuggestionRow
                                            key={s.id}
                                            suggestion={s}
                                            active={activeIndex === i}
                                            onSelect={() => onSelectSuggestion(s)}
                                        />
                                    ))}
                                </div>
                            )}
                            {productSuggestions.length > 0 && (
                                <div>
                                    <SectionLabel label="Products" />
                                    {productSuggestions.map((s, i) => (
                                        <SuggestionRow
                                            key={s.id}
                                            suggestion={s}
                                            active={activeIndex === categorySuggestions.length + i}
                                            onSelect={() => onSelectSuggestion(s)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {!loading && value.length >= 2 && !hasAnySuggestions && (
                        <div className="flex flex-col items-center gap-1 px-4 py-8 text-center">
                            <Package className="size-8 text-muted-foreground/40" />
                            <p className="text-sm text-muted-foreground">
                                No results for <span className="font-medium text-foreground">"{value}"</span>
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Press Enter to search anyway
                            </p>
                        </div>
                    )}

                    {showRecents && (
                        <>
                            {hasAnySuggestions && <div className="mx-3 my-1 border-t border-border/40" />}
                            <div className="p-2">
                                <SectionLabel label="Recent searches" />
                                {recentSearches.map((term) => (
                                    <div
                                        key={term}
                                        className="flex items-center gap-2 rounded-lg px-3 py-2"
                                    >
                                        <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                                        <button
                                            onMouseDown={(e) => { e.preventDefault(); onSelectRecent(term); }}
                                            className="flex-1 text-left text-sm text-muted-foreground hover:text-foreground transition-colors"
                                        >
                                            {term}
                                        </button>
                                        <button
                                            onMouseDown={(e) => onRemoveRecent(term, e)}
                                            className="ml-auto shrink-0 rounded-full p-0.5 text-muted-foreground/60 hover:bg-accent hover:text-foreground transition-colors"
                                        >
                                            <X className="size-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}

                    {(hasAnySuggestions || showRecents) && (
                        <div className="border-t border-border/40 px-4 py-2">
                            <p className="text-[10px] text-muted-foreground">
                                <kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 font-mono text-[9px]">↑↓</kbd>
                                {" "}navigate{" · "}
                                <kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 font-mono text-[9px]">↵</kbd>
                                {" "}search{" · "}
                                <kbd className="rounded border border-border/60 bg-muted px-1 py-0.5 font-mono text-[9px]">Esc</kbd>
                                {" "}close
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export interface SearchSuggestion {
    id: string;
    type: "product" | "category";
    label: string;
    sublabel?: string;
    slug?: string;
    image?: string;
    categoryId?: number;
}

const RECENTS_KEY = "nav_search_recents";
const MAX_RECENTS = 5;

function loadRecents(): string[] {
    try {
        return JSON.parse(localStorage.getItem(RECENTS_KEY) ?? "[]");
    } catch {
        return [];
    }
}

function saveRecents(terms: string[]) {
    localStorage.setItem(RECENTS_KEY, JSON.stringify(terms));
}

function addRecent(term: string, current: string[]): string[] {
    const cleaned = term.trim();
    if (!cleaned) return current;
    const deduped = [cleaned, ...current.filter((t) => t !== cleaned)];
    return deduped.slice(0, MAX_RECENTS);
}

export function NavSearch() {
    const { lang } = useParams<{ lang: string }>();

    const [value, setValue] = useState("");
    const [open, setOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [activeIndex, setActiveIndex] = useState(-1);
    const [recentSearches, setRecentSearches] = useState<string[]>(loadRecents);

    const containerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const fetchSuggestions = useCallback(async (query: string) => {
        if (query.length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoading(true);

        try {
            const [productsRes, categoriesRes] = await Promise.all([
                getProducts({ search: query }),
                getCategories(),
            ]);

            const results: SearchSuggestion[] = [];

            if (categoriesRes.data?.categories) {
                const lq = query.toLowerCase();
                categoriesRes.data.categories
                    .filter((c) => c.title.toLowerCase().includes(lq))
                    .slice(0, 3)
                    .forEach((c) => {
                        results.push({
                            id: `cat-${c.id}`,
                            type: "category",
                            label: c.title,
                            categoryId: c.id,
                        });
                    });
            }

            if (productsRes.data?.data) {
                productsRes.data.data.slice(0, 6).forEach((p) => {
                    const defaultVariant = p.variants?.[0];
                    results.push({
                        id: `prod-${p.id}`,
                        type: "product",
                        label: p.title,
                        sublabel: p.category?.title ?? undefined,
                        slug: p.slug,
                        image: p.images?.[0]?.url ?? undefined,
                    });
                });
            }

            setSuggestions(results);
        } catch {
            // ignore
        } finally {
            setLoading(false);
        }
    }, []);

    const handleChange = useCallback((v: string) => {
        setValue(v);
        setActiveIndex(-1);

        if (debounceRef.current) clearTimeout(debounceRef.current);

        if (v.length < 2) {
            setSuggestions([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        debounceRef.current = setTimeout(() => {
            fetchSuggestions(v);
        }, 500);
    }, [fetchSuggestions]);

    const goToSearch = useCallback((keyword: string) => {
        const trimmed = keyword.trim();
        if (!trimmed) return;

        const updated = addRecent(trimmed, recentSearches);
        setRecentSearches(updated);
        saveRecents(updated);

        setOpen(false);
        setValue("");
        setSuggestions([]);

        appNavigate(`/search/${encodeURIComponent(trimmed)}`);
    }, [lang, recentSearches]);

    const handleSubmit = useCallback(() => {
        const flatList = suggestions;
        if (activeIndex >= 0 && activeIndex < flatList.length) {
            handleSelectSuggestion(flatList[activeIndex]);
            return;
        }
        goToSearch(value);
    }, [value, activeIndex, suggestions, goToSearch]);

    const handleSelectSuggestion = useCallback((s: SearchSuggestion) => {
        if (s.type === "product" && s.slug) {
            setOpen(false);
            setValue("");
            setSuggestions([]);
            appNavigate(`/product/${s.slug}`);
        } else if (s.type === "category" && s.categoryId !== undefined) {
            setOpen(false);
            setValue("");
            setSuggestions([]);
            appNavigate(`/search/all?category=${s.categoryId}`);
        }
    }, [lang]);

    const handleSelectRecent = useCallback((term: string) => {
        goToSearch(term);
    }, [goToSearch]);

    const handleRemoveRecent = useCallback((term: string, e: React.MouseEvent) => {
        e.preventDefault();
        const updated = recentSearches.filter((t) => t !== term);
        setRecentSearches(updated);
        saveRecents(updated);
    }, [recentSearches]);

    const handleClear = useCallback(() => {
        setValue("");
        setSuggestions([]);
        setActiveIndex(-1);
        inputRef.current?.focus();
    }, []);

    const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        const total = suggestions.length;

        if (e.key === "ArrowDown") {
            e.preventDefault();
            setActiveIndex((i) => (i + 1) % Math.max(total, 1));
        } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActiveIndex((i) => (i <= 0 ? total - 1 : i - 1));
        } else if (e.key === "Enter") {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === "Escape") {
            setOpen(false);
            inputRef.current?.blur();
        }
    }, [suggestions.length, handleSubmit]);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    return (
        <NavSearchView
            value={value}
            open={open}
            loading={loading}
            suggestions={suggestions}
            recentSearches={recentSearches}
            activeIndex={activeIndex}
            containerRef={containerRef}
            inputRef={inputRef}
            onChange={handleChange}
            onFocus={() => setOpen(true)}
            onKeyDown={handleKeyDown}
            onSubmit={handleSubmit}
            onSelectSuggestion={handleSelectSuggestion}
            onSelectRecent={handleSelectRecent}
            onRemoveRecent={handleRemoveRecent}
            onClear={handleClear}
        />
    );
}