// routes/frontoffice/product-detail/index.tsx
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
import type { ShippingOption } from "./types/shipping";
import type { Product, Variant } from "wle-core";

export const loader = async (args: LoaderFunctionArgs) => {
    const { request, params } = args;

    try {
        const headers: HeadersInit = {};
        const cookie = request.headers.get("Cookie");

        if (cookie) headers["Cookie"] = cookie;
        headers["Accept"] = "application/json";

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
    const [quantity, setQuantity] = useState(1);
    const [selectedOption, setSelectedOption] = useState<ShippingOption | null>(null);

    if (!product) return <ProductNotFound />;

    return (
        <>
            <div
                className="min-h-screen bg-background text-foreground transition-colors duration-300"
                style={{ fontFamily: "'DM Sans', system-ui, sans-serif" }}
            >
                <div className="container mx-auto max-w-7xl px-4 py-6 sm:py-8 lg:py-10">
                    {/* ── Main product grid ── */}
                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1fr_420px] lg:items-start lg:gap-10">

                        {/* Left: Images */}
                        <ProductImagesGallery images={product.images ?? []} />

                        {/* Right: Info panel — sticky on desktop */}
                        <div className="space-y-5 lg:sticky lg:top-24">
                            <ProductHeader product={product} categories={categories} />

                            {/* Divider */}
                            <div className="h-px w-full bg-border" />

                            <ProductVariantPicker
                                product={product}
                                onVariantChange={setSelectedVariant}
                            />

                            {selectedVariant && <ProductStockBadge variant={selectedVariant} />}

                            <ProductPricing
                                variant={selectedVariant}
                                couponCode={couponCode}
                                setCouponCode={setCouponCode}
                                quantity={quantity}
                                selectedOption={selectedOption}
                            />

                            <ProductActions
                                variant={selectedVariant}
                                couponCode={couponCode}
                                quantity={quantity}
                                setQuantity={setQuantity}
                            />

                            {/* Divider */}
                            <div className="h-px w-full bg-border" />

                            <ProductShare product={product} />
                        </div>
                    </div>

                    {/* ── Below-fold sections ── */}
                    <div className="mt-12 space-y-10 sm:mt-16 lg:mt-20">

                        {/* Shipping estimator — full width */}
                        {selectedVariant && (
                            <div className="max-w-xl">
                                <ProductShippingEstimator
                                    variant={selectedVariant}
                                    quantity={quantity}
                                    selectedOption={selectedOption}
                                    setSelectedOption={setSelectedOption}
                                />
                            </div>
                        )}

                        {/* Cross-sell */}
                        <div className="border-t border-border pt-10">
                            <ProductCrossSell product={product} />
                        </div>

                        {/* Related landing blocks */}
                        <ProductRelatedLanding product={product} />
                    </div>
                </div>
            </div>
        </>
    );
}