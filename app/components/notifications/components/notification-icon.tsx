import {
    CheckCircle2,
    XCircle,
    Package,
    RotateCcw,
    ShieldAlert,
    Tag,
    Bell,
    type LucideProps,
} from "lucide-react";
import { cn } from "~/lib/utils";

const ICON_MAP: Record<string, React.FC<LucideProps>> = {
    CheckCircle2,
    XCircle,
    Package,
    RotateCcw,
    ShieldAlert,
    Tag,
    Bell,
};

type Props = {
    name: string;
    colorClass: string;
    size?: "sm" | "md";
};

export function NotificationIcon({ name, colorClass, size = "md" }: Props) {
    const Icon = ICON_MAP[name] ?? Bell;
    const containerSize = size === "sm" ? "h-8 w-8" : "h-10 w-10";
    const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

    return (
        <div
            className={cn(
                "flex shrink-0 items-center justify-center rounded-xl",
                containerSize,
                colorClass
            )}
        >
            <Icon className={iconSize} />
        </div>
    );
}