import { useTranslation } from "react-i18next";
import { SearchPage } from "./components/search-page";
import { type LoaderFunctionArgs } from "react-router";
import { getProducts } from "~/api/http-requests";
import { productQueryParamsFromUrl } from "./helpers/product-query-params-from-url";
import type { PaginatedResponse } from "~/api/app-fetch";
import type { Product } from "wle-core";

const searchPlaceholders = ['all', '*'];

export async function loader({ request, params }: LoaderFunctionArgs) {

    const headers: HeadersInit = {};
    const cookie = request.headers.get('Cookie');
    if (cookie) headers['Cookie'] = cookie;

    const data = {
        products: null as PaginatedResponse<Product> | null,
    }

    const queryParams = productQueryParamsFromUrl(request.url);
    const search = params.search && !searchPlaceholders.includes(params.search) ? params.search : undefined;

    try {
        const response = await getProducts({
            ...queryParams,
            search,
            with: ['images', 'variants', 'category']
        }, { headers });

        if (response.data)
            data.products = response.data;

    } catch (e) { }

    return data;
}

export default function SearchRoute() {
    return <SearchPage />;
}

export function meta() {
    const { t } = useTranslation("search");

    return [
        { title: t("search.meta.title") },
        { name: "description", content: t("search.meta.description") },
    ];
}