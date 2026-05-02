import { ProductGrid } from "~/components/products/product-grid";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router";
import appPathname from "~/lib/app-pathname";

interface FeaturedProductsViewProps {
  eyebrow?: string;
  title: string;
  subtitle?: string | null;
  products: Product[];
}

export function FeaturedProductsView({ eyebrow, title, subtitle, products }: FeaturedProductsViewProps) {
  return (
    <section className="featured-products" id="featured">
      <div className="featured-products__header">
        {eyebrow && <p className="section-eyebrow">{eyebrow}</p>}
        <h2 className="section-title">{title}</h2>
        {subtitle && <p className="section-subtitle">{subtitle}</p>}
      </div>

      <ProductGrid products={products} />

      <div className="featured-products__footer">
        <Button asChild variant="outline" className="featured-products__view-all">
          <Link to={appPathname('/products')}>
            View all products
            <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}

export function FeaturedProducts({ block }: { block: LandingBlock<FeaturedProductsContent> }) {
  const content = block.content ?? {} as FeaturedProductsContent;
  const products = content.products ?? [];

  return (
    <FeaturedProductsView
      eyebrow={content.eyebrow}
      title={block.title ?? "Bestsellers"}
      subtitle={block.subtitle ?? "The products our customers reorder most."}
      products={products}
    />
  );
}