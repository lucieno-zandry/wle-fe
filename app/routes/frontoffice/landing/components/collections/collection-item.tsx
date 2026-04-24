import { Link } from "react-router";
import { ArrowRight } from "lucide-react";
import { useFormatMoney } from "~/lib/format-money";
import { isCategory } from "../../helpers/landing-able-guards";
import appPathname, { useAppPathname } from "~/lib/app-pathname";

// ----------------------------------------------------------------------------
// View Component (dumb)
// ----------------------------------------------------------------------------
type CollectionItemViewProps = {
    id: number;                 // category id
    slug: string;              // category slug for the link
    title: string;             // category title
    subtitle: string | null;   // from item.subtitle
    imageUrl: string | null;   // from item.image.url
    startingPrice: number;     // cheapest variant's effective price (or price)
    index: number;             // animation delay index
    formatMoney: (value: number) => string;
    appPathname: typeof appPathname;
};

export function CollectionItemView({
    slug,
    title,
    subtitle,
    imageUrl,
    startingPrice,
    index,
    formatMoney,
    appPathname
}: CollectionItemViewProps) {
    return (
        <Link
            to={appPathname(`/search/${title}`)}
            className="collection-card"
            style={{ animationDelay: `${index * 120}ms` }}
        >
            {/* Image */}
            <div className="collection-card__img-wrap">
                {imageUrl ? (
                    <img
                        src={imageUrl}
                        alt={title}
                        className="collection-card__img"
                        loading="lazy"
                    />
                ) : (
                    <div className="collection-card__img collection-card__img--placeholder" />
                )}
                <div className="collection-card__img-overlay" />
            </div>

            {/* Body */}
            <div className="collection-card__body">
                <div>
                    {subtitle && (
                        <p className="collection-card__subtitle">
                            {subtitle}
                        </p>
                    )}
                    <h3 className="collection-card__title">
                        {title}
                    </h3>
                </div>

                <div className="collection-card__footer">
                    <span className="collection-card__price">
                        From {formatMoney(startingPrice)}
                    </span>

                    <span className="collection-card__cta">
                        Shop{" "}
                        <ArrowRight className="w-3.5 h-3.5 ml-1 inline-item" />
                    </span>
                </div>
            </div>
        </Link>
    );
}

// ----------------------------------------------------------------------------
// Smart Component – connects to the actual LandingBlock
// ----------------------------------------------------------------------------
type CollectionItemProps = {
    item: CollectionContentItem  // must be item_type = 'collection_grid'
    index: number;
};

export function CollectionItem({ item, index }: CollectionItemProps) {
    const formatMoney = useFormatMoney();
    const appPathname = useAppPathname();

    const category = item.category;

    if (!category) return null;

    const cheapestVariant = category.cheapest_variant;

    let startingPrice = 0;

    if (cheapestVariant) {
        startingPrice = cheapestVariant.effective_price ?? cheapestVariant.price;
    }

    // Subtitle: use item.subtitle, otherwise fallback to a generic text
    const subtitle = item.subtitle ?? `Discover our ${category?.title} collection`;

    return (
        <CollectionItemView
            id={category.id}
            slug={String(category.id)} // if no slug, use id as fallback
            title={category.title}
            subtitle={subtitle}
            imageUrl={item.image?.url ?? null}
            startingPrice={startingPrice}
            index={index}
            formatMoney={formatMoney}
            appPathname={appPathname}
        />
    );
}