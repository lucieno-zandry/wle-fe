import { cn } from "~/lib/utils";

type Props = {
    groups: VariantGroup[];
    selectedOptions: Record<number, number>;
    onOptionSelect: (groupId: number, optionId: number) => void;
};

export function VariantSelector({ groups, selectedOptions, onOptionSelect }: Props) {
    if (!groups?.length) return null;

    return (
        <div className="space-y-6">
            {groups.map((group) => (
                <div key={group.id} className="space-y-3">
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                        {group.name}
                    </label>
                    <div className="flex flex-wrap gap-2">
                        {group.variant_options?.map((option) => (
                            <button
                                key={option.id}
                                onClick={() => onOptionSelect(group.id, option.id)}
                                type="button"
                                className={cn(
                                    "px-6 py-3 rounded-xl border-2 text-sm font-semibold transition-all duration-200",
                                    selectedOptions[group.id] === option.id
                                        ? "border-foreground bg-foreground text-background shadow-md"
                                        : "border-border bg-background text-foreground hover:border-foreground/60"
                                )}
                            >
                                {option.value}
                            </button>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}