import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { cn } from "~/lib/utils";

export function FilterSection({
    title,
    children,
    defaultOpen = true,
}: {
    title: string;
    children: React.ReactNode;
    defaultOpen?: boolean;
}) {
    const [open, setOpen] = useState(defaultOpen);
    return (
        <div className="py-1">
            <button
                onClick={() => setOpen((o) => !o)}
                className="flex w-full items-center justify-between py-2 text-sm font-semibold text-foreground hover:text-primary transition-colors"
            >
                {title}
                <ChevronDown
                    className={cn(
                        "size-4 text-muted-foreground transition-transform duration-200",
                        open && "rotate-180"
                    )}
                />
            </button>
            {open && <div className="pb-3 pt-1">{children}</div>}
        </div>
    );
}