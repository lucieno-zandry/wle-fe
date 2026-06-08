import { CtaBannerView } from "wle-ui-package";
import { Actions } from "./actions";
import { useTranslation } from "react-i18next";
import type { CtaBannerContent, LandingBlock } from "wle-core";

export function CtaBanner({ block }: { block: LandingBlock<CtaBannerContent> }) {
  const { t } = useTranslation("landing");
  const content = block.content ?? {};
  const eyebrow = content.eyebrow;
  const headline = block.title ?? t("landing:ctaBanner.defaultHeadline");
  const subline = block.subtitle ?? t("landing:ctaBanner.defaultSubline");
  const backgroundImageUrl = block.image?.url ?? null;

  const related = block.landing_able;

  return (
    <CtaBannerView
      eyebrow={eyebrow}
      headline={headline}
      subline={subline}
      backgroundImageUrl={backgroundImageUrl}
      actions={<Actions />}
    />
  );
}