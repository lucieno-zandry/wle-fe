import { Button } from "~/components/ui/button";
import { Minus, Plus } from "lucide-react";

type Props = {
    quantity: number;
    onIncrease: () => void;
    onDecrease: () => void;
    max?: number;
    disabled?: boolean;
    t: (key: string) => string;
};

export function QuantitySelector({
    quantity,
    onIncrease,
    onDecrease,
    max,
    disabled,
    t,
}: Props) {
    return (
        <div className="flex items-center justify-between flex-wrap gap-2">
            <label className="text-sm font-bold text-foreground">{t("quantity")}</label>
            <div className="flex items-center bg-background border border-border rounded-full p-1.5 shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-muted-foreground"
                    onClick={onDecrease}
                    disabled={disabled || quantity <= 1}
                >
                    <Minus className="w-3 h-3" />
                </Button>
                <span className="w-10 text-center font-bold text-foreground">{quantity}</span>
                <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full h-8 w-8 text-muted-foreground"
                    onClick={onIncrease}
                    disabled={disabled || (max !== undefined && quantity >= max)}
                >
                    <Plus className="w-3 h-3" />
                </Button>
            </div>
        </div>
    );
}