import { useLandingUIStore } from "../stores/use-landing-ui-store";
import { useAddToCart } from "~/routes/frontoffice/product-detail/hooks/use-add-to-cart";
import { useFormatMoney } from "~/lib/format-money";
import { useTranslation } from "react-i18next";
import { StickyCTABarView } from "wle-ui-package";
import type { Product } from "wle-core";


interface StickyCTABarProps {
  product: Product;
}

export function StickyCTABar({
  product,
}: StickyCTABarProps) {
  const { t } = useTranslation("landing");
  const { isStickyCTAVisible, setStickyCTAVisible, selectedHeroVariantId } = useLandingUIStore();

  const addToCart = useAddToCart();
  const formatMoney = useFormatMoney();

  const selectedVariant = product.variants?.find(v => v.id === Number(selectedHeroVariantId)) ?? product.variants?.[0];

  if (!selectedVariant) return null;

  const handleDismiss = () => {
    setStickyCTAVisible(false);
  };

  const handleAddToCart = () => {
    addToCart({ count: 1, variant_id: selectedVariant.id });
  }

  const effectivePrice = selectedVariant.effective_price ?? selectedVariant.price;
  const formattedPrice = formatMoney(effectivePrice);
  const thumbnailUrl = selectedVariant.image?.url ?? product.images?.[0]?.url ?? null;
  const productName = product.title;

  return (
    <StickyCTABarView
      isVisible={isStickyCTAVisible}
      productName={productName}
      price={formattedPrice}
      thumbnailUrl={thumbnailUrl}
      onAddToCart={handleAddToCart}
      onDismiss={handleDismiss}
      quickAddAriaLabel={t("landing:stickyCta.quickAddToCart")}
      addToCartLabel={t("landing:common.addToCart")}
      dismissAriaLabel={t("landing:common.dismiss")}
    />
  );
}