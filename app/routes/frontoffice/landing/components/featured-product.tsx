import { useTranslation } from "react-i18next";
import type { FeaturedProductsContent, LandingBlock } from "wle-core";
import { FeaturedProductsView } from "wle-ui-package";
import { ProductGrid } from "~/components/product-grid";
import { useAppPathname } from "~/lib/app-pathname";

export function FeaturedProducts({ block }: { block: LandingBlock<FeaturedProductsContent> }) {
  const { t } = useTranslation("landing");
  const content = block.content ?? {} as FeaturedProductsContent;
  const products = content.products ?? [];
  const appPathname = useAppPathname();

  return (
    <FeaturedProductsView
      eyebrow={content.eyebrow}
      title={block.title ?? t("landing:featured.bestsellers")}
      subtitle={block.subtitle ?? t("landing:featured.reorderedMost")}
      viewAllProductsLabel={t("landing:featured.viewAllProducts")}
      children={<ProductGrid products={products} />}
      viewAllProductsLink={appPathname('/products')}
    />
  );
}