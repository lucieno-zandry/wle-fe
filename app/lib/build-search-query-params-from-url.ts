import { SORT_OPTIONS, type SearchFilters } from "~/hooks/use-search-store";
import type { ProductQueryParams } from "./serialize-product-params";
import { QUERY_PLACEHOLDER } from "~/hooks/use-search-url-sync";

const getFiltersFromUrl = ({ searchParams, query }: { query: string, searchParams: URLSearchParams }) => {
    const urlCategoryId = searchParams.get('category_id');
    const urlMaxPrice = searchParams.get('max_price');
    const urlMinPrice = searchParams.get('min_price');
    const sort = searchParams.get('sort');

    const filters: SearchFilters = {
        search: query === QUERY_PLACEHOLDER ? '' : query,
        category_id: urlCategoryId ? Number(urlCategoryId) : undefined,
        min_price: urlMinPrice ? Number(urlMinPrice) : undefined,
        max_price: urlMaxPrice ? Number(urlMaxPrice) : undefined,
        sortIndex: sort ? Number(sort) : 0,
        variant_option_ids: [],
    }

    return filters;
}

export default ({ searchParams, query }: { query: string, searchParams: URLSearchParams }): ProductQueryParams => {
    const filters = getFiltersFromUrl({ query, searchParams });
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
    }
};