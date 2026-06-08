/**
 * Landing Page — index.tsx
 *
 * Route: /  (or /home)
 * Framework: React Router v7
 *
 * Loader: pre-fetches featured products server-side so the ProductGrid
 * is populated on first paint (no client waterfall for the bestsellers).
 * All other sections use static data from landing-data.ts.
 */

import type { LoaderFunctionArgs } from "react-router";
import { useLoaderData } from "react-router";
import { getLandingBlocksPublic, getProducts } from "~/api/http-requests";
import { HttpException, type PaginatedResponse } from "~/api/app-fetch";
import { getPreferencesFromLoaderFunctionArgs } from "~/lib/app-pathname";

// ─── Section components ────────────────────────────────────────────────────────
import { Hero } from "./components/hero/hero";
import { StickyCTABar } from "./components/sticky-cta-bar";
import { TrustBar } from "./components/trust-bar/trust-bar";
import { Collections } from "./components/collections/collections";
import { FeaturedProducts } from "./components/featured-product";
import { Story } from "./components/story";
import { Comparison } from "./components/comparison";
import { Testimonials } from "./components/testimonials";
import { Faq } from "./components/faq";
import { CtaBanner } from "./components/cta-banner/cta-banner";

// ─── CSS ──────────────────────────────────────────────────────────────────────
import "./landing.css";
import "wle-ui-package/style.css";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";
import { isProduct } from "./helpers/landing-able-guards";
import { useTranslation } from "react-i18next";
import type { CollectionContent, ComparisonContent, CtaBannerContent, FaqContent, FeaturedProductsContent, LandingBlock, Product, StoryContent, TestimonialsContent } from "wle-core";

// ─── Loader ───────────────────────────────────────────────────────────────────
export const loader = async (args: LoaderFunctionArgs) => {
    const { request } = args;
    const { currency } = getPreferencesFromLoaderFunctionArgs(args);
    let landingBlocks: LandingBlock[] = [];

    try {
        const headers: HeadersInit = {};
        const cookie = request.headers.get("Cookie");
        if (cookie) headers["Cookie"] = cookie;
        headers["X-Currency"] = currency;
        headers["Accept"] = "application/json";

        // Fetch the top 4 featured/bestseller products for the server render.
        // Add `featured=true` or `sort=best_selling` to your getProducts call
        // once that query param is supported by the Laravel API.
        const [landingBlocksResponse] = await Promise.all([
            getLandingBlocksPublic({ headers })
        ]);

        if (landingBlocksResponse.data)
            landingBlocks = landingBlocksResponse.data;

    } catch (error) {
        return { error };
    }

    return {
        landingBlocks
    }
};

// landing-page-view.tsx

type Props = {
    landingBlocks?: LandingBlock[];
    stickyBarProduct: Product | null;
};

export function LandingPageView({
    landingBlocks,
    stickyBarProduct,
}: Props) {
    return (
        <>
            <main className="landing">
                {landingBlocks?.map((block, key) => {
                    switch (block.block_type) {
                        case "hero":
                            return <Hero block={block} key={key} />;

                        case "collection_grid":
                            return (
                                <Collections
                                    block={block as LandingBlock<CollectionContent>}
                                    key={key}
                                />
                            );

                        case "trust_bar":
                            return <TrustBar block={block} key={key} />;

                        case "comparison":
                            return (
                                <Comparison
                                    block={block as LandingBlock<ComparisonContent>}
                                    key={key}
                                />
                            );

                        case "faq":
                            return (
                                <Faq
                                    block={block as LandingBlock<FaqContent>}
                                    key={key}
                                />
                            );

                        case "featured_products":
                            return (
                                <FeaturedProducts
                                    block={block as LandingBlock<FeaturedProductsContent>}
                                    key={key}
                                />
                            );

                        case "story":
                            return (
                                <Story
                                    block={block as LandingBlock<StoryContent>}
                                    key={key}
                                />
                            );

                        case "testimonials":
                            return (
                                <Testimonials
                                    block={block as LandingBlock<TestimonialsContent>}
                                    key={key}
                                />
                            );

                        case "cta_banner":
                            return (
                                <CtaBanner
                                    block={block as LandingBlock<CtaBannerContent>}
                                    key={key}
                                />
                            );

                        default:
                            return null;
                    }
                })}
            </main>

            {stickyBarProduct && (
                <StickyCTABar product={stickyBarProduct} />
            )}
        </>
    );
}

export default function LandingPage() {
    const { t } = useTranslation("landing");
    const { error, landingBlocks } = useLoaderData<typeof loader>();

    // -------------------------
    // Side effects
    // -------------------------

    useEffect(() => {
        if (error && error instanceof HttpException) {
            toast.error(error.data?.message || t("landing:common.somethingWentWrong"));
        }
    }, [error, t]);

    // -------------------------
    // Derived state (FIXED)
    // -------------------------

    const stickyBarProduct = useMemo(() => {
        if (!landingBlocks) return null;

        for (const block of landingBlocks) {
            if (
                (block.block_type === "hero" || block.block_type === "cta_banner") &&
                block.landing_able &&
                isProduct(block.landing_able)
            ) {
                return block.landing_able;
            }
        }

        return null;
    }, [landingBlocks]);

    return (
        <LandingPageView
            landingBlocks={landingBlocks}
            stickyBarProduct={stickyBarProduct}
        />
    );
}