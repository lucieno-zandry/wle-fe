import { useLandingUIStore } from "../../stores/use-landing-ui-store";
import { useStickyCtaTrigger } from "../../hooks/use-sticky-cta-trigger";
import { isProduct } from "../../helpers/landing-able-guards";
import { useFormatMoney } from "~/lib/format-money";
import { toast } from "sonner";
import { useAddToCart } from "~/routes/frontoffice/product-detail/hooks/use-add-to-cart";
import { useTranslation } from "react-i18next";
import { HeroView } from "wle-ui-package";
import type { LandingBlock, Product } from "wle-core";

// ----------------------------------------------------------------------------
// Hero Smart Component
// ----------------------------------------------------------------------------
export function Hero({ block }: { block: LandingBlock }) {
    const { t } = useTranslation("landing");
    const { selectedHeroVariantId, setSelectedHeroVariantId } = useLandingUIStore();
    const sentinelRef = useStickyCtaTrigger();
    const formatMoney = useFormatMoney();

    const handleScrollDown = () => {
        const trustBar = document.getElementById("trust-bar");
        trustBar?.scrollIntoView({ behavior: "smooth" });
    };

    const backgroundImageUrl = block.image?.url ?? null;
    const headline = block.title ?? t("landing:hero.defaultHeadline");
    const subline = block.subtitle ?? t("landing:hero.defaultSubline");

    if (!block.landing_able || !isProduct(block.landing_able)) return null;

    const product = block.landing_able as Product;
    const variants = product.variants ?? [];
    const addToCart = useAddToCart();

    const handleAddToCart = () => {
        const variant = variants.at(0);
        if (!variant) return toast.error(t("landing:hero.nothingToAdd"));
        addToCart({ count: 1, variant_id: variant.id });
    };

    const content = block.content ?? {};
    const eyebrow = content.eyebrow ?? t("landing:hero.defaultEyebrow");
    const headlineSuffix = content.headlineSuffix ?? t("landing:hero.defaultHeadlineSuffix");
    const trustLine = content.trustLine ?? t("landing:hero.defaultTrustLine");

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
            addToCartLabel={t("landing:common.addToCart")}
            scrollDownAriaLabel={t("landing:hero.scrollDown")}
        />
    );
}