import { Zap } from "lucide-react";
import type { AppliedPromotion } from "wle-core";

export function PromotionPill({ promotion }: { promotion: AppliedPromotion }) {
    const label =
        promotion.badge ||
        (promotion.type === "PERCENTAGE"
            ? `-${promotion.discount}%`
            : `-$${promotion.discount}`);

    if (label === "-$undefined") return null;

    return (
        <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/90 px-2 py-0.5 text-[10px] font-semibold text-white backdrop-blur-sm">
            <Zap className="size-2.5" />
            {label}
        </span>
    );
}