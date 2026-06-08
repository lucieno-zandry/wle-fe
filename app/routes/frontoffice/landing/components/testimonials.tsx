import { useTranslation } from "react-i18next";
import type { LandingBlock, TestimonialsContent } from "wle-core";
import { TestimonialsView } from "wle-ui-package";

export function Testimonials({ block }: { block: LandingBlock<TestimonialsContent> }) {
  const { t } = useTranslation("landing");
  const content = block.content ?? {} as TestimonialsContent;
  const testimonials = content.testimonials ?? [];

  return (
    <TestimonialsView
      eyebrow={content.eyebrow}
      title={block.title ?? t("landing:testimonials.trustedAcrossFrance")}
      testimonials={testimonials}
      verifiedPurchaseLabel={t("landing:testimonials.verifiedPurchase")}
      securePaymentViaLabel={t("landing:testimonials.securePaymentVia")}
      ratingLabel={(rating) => t("landing:testimonials.ratingOutOfFive", { rating })}
    />
  );
}