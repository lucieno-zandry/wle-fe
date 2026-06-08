import type { LandingBlock } from "wle-core";
import { TrustBarView, type TrustPillar } from "wle-ui-package";

// Smart component – reads from block.content
export function TrustBar({ block }: { block: LandingBlock }) {
  const pillars: TrustPillar[] = block.content?.pillars ?? [];

  return <TrustBarView pillars={pillars} />;
}