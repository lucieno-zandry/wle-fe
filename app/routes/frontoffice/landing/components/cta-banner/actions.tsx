import { ShoppingCart } from "lucide-react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { isCategory, isProduct } from "../../helpers/landing-able-guards";
import { useAddToCart } from "~/routes/frontoffice/product-detail/hooks/use-add-to-cart";
import { useAppPathname } from "~/lib/app-pathname";
import type { JSX } from "react";

type ActionsViewProps = {
    appPathname: (pathname: string) => string
    related?: LandingAble
    isProduct: (able: LandingAble) => able is Product
    isCategory: (able: LandingAble) => able is Category
    addToCart: (data: {
        variant_id: number;
        count: number;
    }) => void;
}

export const ActionsView = ({ appPathname, related, addToCart, isCategory, isProduct }: ActionsViewProps) => {
    let primary: JSX.Element | null = <Button asChild size="lg" className="cta-banner__btn-primary">
        <Link to={appPathname('/search/*')}>
            <ShoppingCart className="w-4 h-4 mr-2" />
            Shop Now
        </Link>
    </Button>

    let secondary = <Button asChild variant="ghost" size="lg" className="cta-banner__btn-ghost">
        <Link to={appPathname("/products")}>
            Browse all products
        </Link>
    </Button>

    if (related) {
        if (isProduct(related)) {
            const variantId = related.variants?.at(0)?.id;
            if (variantId) {
                const handleAddToCart = () => { addToCart({ variant_id: variantId, count: 1 }); }

                primary = <Button
                    className="cta-banner__btn-primary"
                    onClick={handleAddToCart}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Add to cart
                </Button>
            }
        } else if (isCategory(related)) {
            primary = <Button asChild size="lg" className="cta-banner__btn-primary">
                <Link to={appPathname(`/search/${related.title.toLocaleLowerCase()}`)}>
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Shop Category
                </Link>
            </Button>
        }
    }

    return <div className="cta-banner__actions">
        {primary}
        {secondary}
    </div>

}

export const Actions = ({ related }: Pick<ActionsViewProps, 'related'>) => {

    const addToCart = useAddToCart();
    const appPathname = useAppPathname();

    return <ActionsView
        addToCart={addToCart}
        appPathname={appPathname}
        isCategory={isCategory}
        isProduct={isProduct}
        related={related} />
}