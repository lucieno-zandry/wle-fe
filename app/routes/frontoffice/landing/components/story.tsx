import { useTranslation } from "react-i18next";
import type { LandingBlock, StoryContent } from "wle-core";
import { StoryView } from "wle-ui-package";

export function Story({ block }: { block: LandingBlock<StoryContent> }) {
  const { t } = useTranslation("landing");
  const content = block.content ?? {} as StoryContent;
  const stats = content.stats ?? [];

  return (
    <StoryView
      eyebrow={content.eyebrow}
      title={block.title ?? t("landing:story.ourStory")}
      body={content.body ?? ""}
      imageUrl={block.image?.url ?? null}
      imageCaption={content.imageCaption}
      stats={stats}
      defaultImageAlt={t("landing:story.brandStoryImage")}
    />
  );
}