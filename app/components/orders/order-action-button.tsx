// components/orders/OrderActionButton.tsx
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { ArrowRight } from "lucide-react";

interface OrderActionButtonProps {
    orderUuid: string;
    requiresReview: boolean;
}

export function OrderActionButton({ orderUuid, requiresReview }: OrderActionButtonProps) {
    if (requiresReview) {
        return (
            <Button size="sm" className="w-full text-xs gap-2 group" asChild>
                <Link to={`/order/${orderUuid}`}>
                    Review & Pay
                    <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
            </Button>
        );
    }

    return (
        <Button variant="outline" size="sm" className="w-full text-xs text-muted-foreground" asChild>
            <Link to={`/order/${orderUuid}`}>View Order</Link>
        </Button>
    );
}