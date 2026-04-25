import { useMemo, useRef } from "react";

import { Button } from "~/components/ui/button";
import { ShoppingCart, ChevronDown } from "lucide-react";
import type { RefObject } from "react";
import { useLandingUIStore } from "../../stores/use-landing-ui-store";
import { useStickyCtaTrigger } from "../../hooks/use-sticky-cta-trigger";
import { isProduct } from "../../helpers/landing-able-guards";
import formatMoney, { useFormatMoney } from "~/lib/format-money";
import { getEffectivePrice, getOriginalPrice, getPromotionBadge, getVariantLabel } from "./helpers";


// ----------------------------------------------------------------------------
// Hero View (dumb)
// ----------------------------------------------------------------------------
interface HeroViewProps {
    backgroundImageUrl: string | null;
    headline: string;
    subline: string;
    variants: Variant[];
    selectedVariantId: string | null;
    onSelectVariant: (id: string) => void;
    onAddToCart: () => void;
    onScrollDown: () => void;
    sentinelRef: RefObject<HTMLDivElement | null>;
    formatMoney: typeof formatMoney;
    eyebrow: string;
    headlineSuffix: string;
    trustLine: string;
}

export function HeroView({
    backgroundImageUrl,
    headline,
    subline,
    variants,
    selectedVariantId,
    onSelectVariant,
    onAddToCart,
    onScrollDown,
    sentinelRef,
    eyebrow,
    formatMoney,
    headlineSuffix,
    trustLine
}: HeroViewProps) {
    const selected = variants.find((v) => v.id === Number(selectedVariantId)) ?? variants[0];

    return (
        <section className="hero pt-10 sm:pt-0">
            {/* Background image */}
            <div className="hero__bg" aria-hidden>
                <img
                    src={backgroundImageUrl ?? "https://images.unsplash.com/photo-1605000797499-95a51c5269ae"}
                    alt=""
                    className="hero__bg-img"
                />
                <div className="hero__bg-overlay" />
            </div>

            {/* Content */}
            <div className="hero__content">
                <p className="hero__eyebrow">
                    <span className="hero__eyebrow-dot" />{eyebrow}
                </p>

                <h1 className="hero__headline">{headline} <em>{headlineSuffix}</em></h1>

                <p className="hero__subline">{subline}</p>

                {/* Variant selector */}
                {variants.length > 1 && (
                    <div className="hero__variants">
                        {variants.map((v) => {
                            const isActive = (selectedVariantId ?? String(variants[0]?.id)) === String(v.id);
                            const badge = getPromotionBadge(v);
                            return (
                                <button
                                    key={v.id}
                                    onClick={() => onSelectVariant(String(v.id))}
                                    className={`hero__variant-btn ${isActive ? "hero__variant-btn--active" : ""}`}
                                >
                                    {getVariantLabel(v)}
                                    {badge && <span className="hero__variant-badge">{badge}</span>}
                                </button>
                            );
                        })}
                    </div>
                )}

                {/* Price + CTA */}
                <div className="hero__cta-row">
                    <div className="hero__price-block">
                        {selected && (() => {
                            const original = getOriginalPrice(selected);
                            const current = getEffectivePrice(selected);
                            console.log(selected);
                            return (
                                <>
                                    {original && (
                                        <span className="hero__price-original">
                                            {formatMoney(original)}
                                        </span>
                                    )}
                                    <span className="hero__price-current">
                                        {formatMoney(current)}
                                    </span>
                                </>
                            );
                        })()}
                    </div>

                    <Button onClick={onAddToCart} className="hero__add-btn" size="lg">
                        <ShoppingCart className="w-4 h-4 mr-2" />
                        Add to Cart
                    </Button>
                </div>

                <p className="hero__trust-line">{trustLine}</p>
            </div>

            <div ref={sentinelRef} className="hero__sentinel" aria-hidden />
            <button onClick={onScrollDown} className="hero__scroll-cue" aria-label="Scroll down">
                <ChevronDown className="w-5 h-5" />
            </button>
        </section>
    );
}

// ----------------------------------------------------------------------------
// Hero Smart Component
// ----------------------------------------------------------------------------
export function Hero({ block }: { block: LandingBlock }) {
    const { selectedHeroVariantId, setSelectedHeroVariantId } = useLandingUIStore();
    const sentinelRef = useStickyCtaTrigger();
    const formatMoney = useFormatMoney();

    const handleScrollDown = () => {
        const trustBar = document.getElementById("trust-bar");
        trustBar?.scrollIntoView({ behavior: "smooth" });
    };

    const handleAddToCart = () => {
        console.info("[Hero] Add to cart variant:", selectedHeroVariantId);
        // TODO: dispatch to cart store
    };

    const backgroundImageUrl = block.image?.url ?? null;
    const headline = block.title ?? "Default Headline";
    const subline = block.subtitle ?? "Default subline";

    if (!block.landing_able || !isProduct(block.landing_able)) return null;

    const product = block.landing_able;
    const variants = product.variants ?? [];

    const content = block.content ?? {};
    const eyebrow = content.eyebrow ?? "Directly from SAVA, Madagascar";
    const headlineSuffix = content.headlineSuffix ?? "Uncompromised.";
    const trustLine = content.trustLine ?? "🔒 Secure payment · Free returns · Colissimo tracked";

    // Variants already include `applied_promotions` and `effective_price` from backend
    return (
        <HeroView
            backgroundImageUrl={backgroundImageUrl}
            headline={headline}
            subline={subline}
            variants={variants}
            selectedVariantId={selectedHeroVariantId}
            onSelectVariant={setSelectedHeroVariantId}
            onAddToCart={handleAddToCart}
            onScrollDown={handleScrollDown}
            sentinelRef={sentinelRef}
            formatMoney={formatMoney}
            eyebrow={eyebrow}
            headlineSuffix={headlineSuffix}
            trustLine={trustLine}
        />
    );
}