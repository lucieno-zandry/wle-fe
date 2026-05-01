// routes/frontoffice/product-detail/components/product-related-landing.tsx
import { useEffect, useState } from "react";
import { getLandingBlocksPublic } from "~/api/http-requests";
import { LandingPageView } from "../../landing";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductRelatedLandingViewProps {
    blocks: LandingBlock[];
    loading: boolean;
}

export function ProductRelatedLandingView({ blocks, loading }: ProductRelatedLandingViewProps) {
    if (loading) {
        return (
            <div className="mt-8 space-y-8">
                {[1, 2].map((i) => (
                    <div key={i} className="animate-pulse space-y-3">
                        <div className="h-8 w-1/3 rounded bg-muted" />
                        <div className="h-60 w-full rounded bg-muted" />
                    </div>
                ))}
            </div>
        );
    }

    if (!blocks.length) return null;

    return <LandingPageView stickyBarProduct={null} landingBlocks={blocks} />
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductRelatedLandingProps {
    product: Product;
}

export function ProductRelatedLanding({ product }: ProductRelatedLandingProps) {
    const [blocks, setBlocks] = useState<LandingBlock[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        getLandingBlocksPublic({
            params: {
                landing_able_type: "App\\Models\\Product",
                landing_able_id: product.id,
            },
        })
            .then((res) => {
                if (res.data) {
                    setBlocks(Array.isArray(res.data) ? res.data : []);
                }
            })
            .catch(() => setBlocks([]))
            .finally(() => setLoading(false));
    }, [product.id]);

    return <ProductRelatedLandingView blocks={blocks} loading={loading} />;
}