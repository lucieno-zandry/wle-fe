import { useTranslation } from "react-i18next";
import type { ComparisonContent, LandingBlock } from "wle-core";
import { ComparisonView } from "wle-ui-package";

export function Comparison({ block }: { block: LandingBlock<ComparisonContent> }) {
  const { t } = useTranslation("landing");
  const content = block.content ?? {} as ComparisonContent;
  return (
    <ComparisonView
      eyebrow={content.eyebrow ?? t("landing:comparison.whyItMatters")}
      title={block.title ?? t("landing:comparison.defaultTitle")}
      subtitle={block.subtitle ?? t("landing:comparison.defaultSubtitle")}
      ourLabel={content.ourLabel ?? t("landing:comparison.ourLabel")}
      theirLabel={content.theirLabel ?? t("landing:comparison.theirLabel")}
      rows={content.rows ?? []}
      criteriaLabel={t("landing:comparison.criteria")}
    />
  );
}