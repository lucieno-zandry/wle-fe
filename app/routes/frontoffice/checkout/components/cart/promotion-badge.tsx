// routes/checkout/components/promotion-badge.tsx
import { Tag } from "lucide-react";
import type { AppliedPromotion } from "wle-core";
import { Badge } from "~/components/ui/badge";

export default function PromotionBadge({ promotion }: { promotion: AppliedPromotion }) {
    const discountText =
        promotion.type === "PERCENTAGE"
            ? `${promotion.discount}%`
            : `${promotion.discount} €`;

    return (
        <Badge
            variant="secondary"
            className="inline-flex items-center gap-1 bg-primary/10 text-primary hover:bg-primary/15 border-transparent px-2 py-0.5 text-xs font-medium transition-colors"
        >
            <Tag className="h-3 w-3" />
            <span>{promotion.badge ?? promotion.name}</span>
            <span className="ml-1 opacity-70">(-{discountText})</span>
        </Badge>
    );
}