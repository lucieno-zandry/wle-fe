import type { CollectionContent, LandingBlock } from "wle-core";
import { CollectionItem } from "./collection-item";
import { useTranslation } from "react-i18next";

interface CollectionsProps {
  block: LandingBlock<CollectionContent>;
}


export function Collections({ block }: CollectionsProps) {
  const { t } = useTranslation("landing");
  const items = block.content?.items ?? [];
  const eyebrow = block.content?.eyebrow ?? t("landing:collections.exploreRange");

  return (
    <section className="collections">
      <div className="collections__header">
        <p className="section-eyebrow">{eyebrow}</p>
        <h2 className="section-title">{block.title}</h2>
        <p className="section-subtitle">{block.subtitle}</p>
      </div>
      <div className="collections__grid">
        {items.map((item, idx) => (
          <CollectionItem key={item.id} item={item} index={idx} />
        ))}
      </div>
    </section>
  );
}