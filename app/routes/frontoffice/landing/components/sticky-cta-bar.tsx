import { ShoppingCart, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import { useLandingUIStore } from "../stores/use-landing-ui-store";
import { useAddToCart } from "~/routes/frontoffice/product-detail/hooks/use-add-to-cart";
import { useFormatMoney } from "~/lib/format-money";

interface StickyCTABarViewProps {
  isVisible: boolean;
  productName: string;
  price: string;        // formatted price
  thumbnailUrl: string | null;
  onAddToCart: () => void;
  onDismiss: () => void;
}

export function StickyCTABarView({
  isVisible,
  productName,
  price,
  thumbnailUrl,
  onAddToCart,
  onDismiss,
}: StickyCTABarViewProps) {
  return (
    <div
      className={`sticky-cta ${isVisible ? "sticky-cta--visible" : ""}`}
      aria-hidden={!isVisible}
      role="complementary"
      aria-label="Quick add to cart"
    >
      <div className="sticky-cta__inner">
        <div className="sticky-cta__product">
          {thumbnailUrl ? (
            <img
              src={thumbnailUrl}
              alt={productName}
              className="sticky-cta__thumb"
            />
          ) : (
            <div className="sticky-cta__thumb sticky-cta__thumb--placeholder" />
          )}
          <div>
            <p className="sticky-cta__name">{productName}</p>
            <p className="sticky-cta__price">{price}</p>
          </div>
        </div>

        <Button onClick={onAddToCart} size="sm" className="sticky-cta__btn">
          <ShoppingCart className="w-4 h-4 mr-1.5" />
          Add to Cart
        </Button>

        <button onClick={onDismiss} className="sticky-cta__dismiss" aria-label="Dismiss">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

interface StickyCTABarProps {
  product: Product;
}

export function StickyCTABar({
  product,
}: StickyCTABarProps) {
  const { isStickyCTAVisible, setStickyCTAVisible, selectedHeroVariantId } = useLandingUIStore();

  const addToCart = useAddToCart();
  const formatMoney = useFormatMoney();

  const selectedVariant = product.variants?.find(v => v.id === Number(selectedHeroVariantId)) ?? product.variants?.[0];

  if (!selectedVariant) return null;

  const handleDismiss = () => {
    setStickyCTAVisible(false);
  };

  const handleAddToCart = () => {
    addToCart(selectedVariant.id);
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
    />
  );
}