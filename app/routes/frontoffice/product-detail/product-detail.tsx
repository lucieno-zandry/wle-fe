import { redirect, useLoaderData } from "react-router";
import type { LoaderFunctionArgs } from "react-router";
import { getProduct } from "~/api/http-requests";
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
    const { categories } = useCategories();
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [couponCode, setCouponCode] = useState("");

    if (!product) return <ProductNotFound />;

    return (
        <div className="container mx-auto px-4 py-4 sm:py-6 lg:py-8">
            <div className="grid grid-cols-1 gap-6 md:gap-8 lg:grid-cols-2 lg:items-start">
                <ProductImagesGallery images={product.images ?? []} />
                <div className="space-y-5 sm:space-y-6 lg:sticky lg:top-24">
                    <ProductHeader product={product} categories={categories} />
                    <ProductVariantPicker product={product} onVariantChange={setSelectedVariant} />
                    <ProductStockBadge variant={selectedVariant} />
                    <ProductPricing
                        variant={selectedVariant}
                        couponCode={couponCode}
                        setCouponCode={setCouponCode} />
                    <ProductActions variant={selectedVariant} couponCode={couponCode} />
                </div>
            </div>

            <div className="mt-8 space-y-8 sm:mt-10 sm:space-y-10 lg:mt-12 lg:space-y-12">
                <ProductShare product={product} />
                {selectedVariant && <ProductShippingEstimator variant={selectedVariant} />}
                <ProductCrossSell product={product} />
                <ProductRelatedLanding product={product} />
            </div>
        </div>
    );
}