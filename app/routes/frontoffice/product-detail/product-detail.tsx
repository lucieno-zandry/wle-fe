import { redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getProduct } from "~/api/http-requests";
import { useUserStore } from "~/hooks/use-user"; // for user-specific features
import { ProductHeader } from "./components/product-header";
import { ProductImagesGallery } from "./components/product-images-gallery";
import { useCategories } from "./hooks/use-categories";
import { HttpException } from "~/api/app-fetch";
import handleHttpExceptionError from "~/lib/handle-http-exception-error";
import { ProductNotFound } from "./components/product-not-found";
import { ProductVariantPicker } from "./components/product-variant-picker";
import { useState } from "react";
import { ProductStockBadge } from "./components/product-stock-badge";
import { ProductPricing } from "./components/product-pricing";
import { ProductActions } from "./components/product-actions";
import { ProductShippingEstimator } from "./components/product-shipping-estimator";
import { ProductShare } from "./components/product-share";
import { ProductCrossSell } from "./components/product-cross-sell";
import { ProductRelatedLanding } from "./components/product-related-landing";

export const loader = async (args: LoaderFunctionArgs) => {
    const { request, params } = args;

    try {
        const headers: HeadersInit = {};
        const cookie = request.headers.get('Cookie');

        if (cookie) {
            headers['Cookie'] = cookie;
        }

        headers['Accept'] = 'application/json';

        const { slug } = params;
        const response = slug ? await getProduct(slug, { headers }) : null;

        return response?.data?.product || null;
    } catch (error) {
        if (error instanceof HttpException) {
            return handleHttpExceptionError({ status: error.status, navigate: redirect });
        }
    }
};


export default function ProductDetailPage() {
    const product = useLoaderData<Product | null>();
    const { user } = useUserStore();
    const { categories } = useCategories();
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);


    if (!product) return <ProductNotFound />;

    return (
        <div className="container mx-auto py-8 px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <ProductImagesGallery images={product.images ?? []} />
                <div className="space-y-6">
                    <ProductHeader product={product} categories={categories} />
                    <ProductVariantPicker product={product} onVariantChange={setSelectedVariant} />
                    <ProductStockBadge variant={selectedVariant} />
                    <ProductPricing variant={selectedVariant} />
                    <ProductActions variant={selectedVariant} />
                </div>
            </div>

            <div className="mt-12 space-y-12">
                <ProductShare product={product} />
                {selectedVariant && <ProductShippingEstimator variant={selectedVariant} />}
                <ProductCrossSell product={product} />
                <ProductRelatedLanding product={product} />
            </div>
        </div>
    );
}