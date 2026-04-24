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
import { CtaBanner } from "./components/cta-banner";

// ─── CSS ──────────────────────────────────────────────────────────────────────
import "./landing.css";
import { useEffect, useMemo } from "react";
import { toast } from "sonner";

// ─── Loader ───────────────────────────────────────────────────────────────────
export const loader = async (args: LoaderFunctionArgs) => {
    const { request } = args;
    const { currency } = getPreferencesFromLoaderFunctionArgs(args);
    let featuredProducts: Product[] = [];
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
        const [featuredProductsResponse, landingBlocksResponse] = await Promise.all([
            getProducts(
                { page: 1, limit: 4 },
                { headers }
            ),
            getLandingBlocksPublic({ headers })
        ]);

        if (featuredProductsResponse.data?.data)
            featuredProducts = featuredProductsResponse.data.data;

        if (landingBlocksResponse.data)
            landingBlocks = landingBlocksResponse.data;

    } catch (error) {
        return { error };
    }

    return {
        featuredProducts,
        landingBlocks
    }
};

// ─── Page component ───────────────────────────────────────────────────────────
export default function LandingPage() {
    const { featuredProducts, error, landingBlocks } = useLoaderData<typeof loader>()

    useEffect(() => {
        if (error && error instanceof HttpException)
            toast.error(error.data?.message || 'Something went wrong!')
    }, []);

    return (
        <>
            {/*
        Sticky CTA bar — portal-level, floats above everything.
        Visibility is controlled by the Zustand store,
        triggered by IntersectionObserver inside <Hero />.
      */}
            <StickyCTABar />

            <main className="landing">
                {
                    landingBlocks?.map((block, key) => {
                        switch (block.block_type) {
                            case 'hero':
                                return <Hero block={block} key={key} />

                            case 'collection_grid':
                                return <Collections block={block as LandingBlock<CollectionContent>} key={key} />

                            case 'trust_bar':
                                return <TrustBar block={block} key={key} />

                            case 'comparison':
                                return <Comparison block={block as LandingBlock<ComparisonContent>} key={key} />

                            default:
                                return null;
                        }
                    })
                }

                {/* 4. Bestseller product grid — SSR data from loader, reuses ProductGrid */}
                <FeaturedProducts initialProducts={featuredProducts} />

                {/* 5. Brand origin story with SAVA region image */}
                <Story />

                {/* 7. Verified customer testimonials */}
                <Testimonials />

                {/* 8. FAQ accordion */}
                <Faq />

                {/* 9. Bottom conversion CTA */}
                <CtaBanner />
            </main>
        </>
    );
}