// Updated ProductsPage.tsx
import { redirect, useLoaderData } from "react-router";
import { getProducts } from "~/api/http-requests";
import { HttpException } from "~/api/app-fetch";
import handleHttpExceptionError from "~/lib/handle-http-exception-error";
import { ProductsHeader } from "~/components/products/products-header";
import { ProductGrid } from "~/components/products/product-grid";

export const loader = async () => {
    try {
        const response = await getProducts();
        return response.data?.products;
    } catch (error) {
        if (error instanceof HttpException) {
            return handleHttpExceptionError({ status: error.status, navigate: redirect })
        }
    }
}

export default function ProductsPage() {
    const products = useLoaderData() as Product[];

    return (
        <div className="container mx-auto px-4 md:px-6 py-12 space-y-10">
            <ProductsHeader productCount={products.length} />
            <ProductGrid products={products} />
        </div>
    );
}