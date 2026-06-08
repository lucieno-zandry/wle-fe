import { FaqView } from "wle-ui-package";
import { useLandingUIStore } from "../stores/use-landing-ui-store";
import { useTranslation } from "react-i18next";
import type { FaqContent, LandingBlock } from "wle-core";

export function Faq({ block }: { block: LandingBlock<FaqContent> }) {
  const { t } = useTranslation("landing");
  const { openFaqId, toggleFaq } = useLandingUIStore();

  const content = block.content ?? {} as FaqContent;
  const eyebrow = content.eyebrow;
  const items = content.items ?? [];

  return (
    <FaqView
      eyebrow={eyebrow}
      title={block.title ?? t("landing:faq.everythingYouNeedToKnow")}
      items={items}
      openId={openFaqId}
      onToggle={toggleFaq}
    />
  );
}