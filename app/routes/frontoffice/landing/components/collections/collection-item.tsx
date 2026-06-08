import { useFormatMoney } from "~/lib/format-money";
import { useAppPathname } from "~/lib/app-pathname";
import { useTranslation } from "react-i18next";
import { CollectionItemView } from "wle-ui-package";
import type { CollectionContentItem } from "wle-core";


// ----------------------------------------------------------------------------
// Smart Component – connects to the actual LandingBlock
// ----------------------------------------------------------------------------
type CollectionItemProps = {
    item: CollectionContentItem  // must be item_type = 'collection_grid'
    index: number;
};

export function CollectionItem({ item, index }: CollectionItemProps) {
    const { t } = useTranslation("landing");
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
    const subtitle = item.subtitle ?? t("landing:collections.discoverCollection", { title: category?.title });

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
            fromLabel={t("landing:collections.from")}
            shopLabel={t("landing:collections.shop")}
            linkTo={appPathname('/search/' + category.title.toLocaleLowerCase())}
        />
    );
}