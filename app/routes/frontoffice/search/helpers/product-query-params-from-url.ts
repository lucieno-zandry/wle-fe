import type { ProductQueryParams } from "~/lib/serialize-product-params";
import { SORT_OPTIONS } from "../stores/use-search-store";

export function productQueryParamsFromUrl(url: string) {
    const searchParams = new URL(url).searchParams;
    const sortIndex = Number(searchParams.get('sort')) || 0;

    const category_id = Number(searchParams.get('category')) || undefined;
    const { direction, order_by } = SORT_OPTIONS[sortIndex];
    const limit = Number(searchParams.get('per_page')) || 12;
    const max_price = Number(searchParams.get('max_price')) || undefined;
    const min_price = Number(searchParams.get('min_price')) || undefined;
    const page = Number(searchParams.get('page')) || undefined;

    const queryParams: ProductQueryParams = {
        category_id,
        direction,
        order_by,
        limit,
        max_price,
        min_price,
        page,
    }

    return queryParams;
}