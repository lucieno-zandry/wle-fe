// routes/frontoffice/product-detail/components/product-variant-picker.tsx
import type { Product, Variant, VariantGroup } from "wle-core";
import { useSyncVariantToUrl } from "../hooks/use-sync-variant-to-url";
import { useState, useEffect } from "react";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductVariantPickerViewProps {
    variantGroups: VariantGroup[];
    selectedOptions: Record<number, number>;
    onOptionSelect: (groupId: number, optionId: number) => void;
}

export function ProductVariantPickerView({
    variantGroups,
    selectedOptions,
    onOptionSelect,
}: ProductVariantPickerViewProps) {
    if (!variantGroups.length) return null;

    return (
        <div className="space-y-5">
            {variantGroups.map((group) => (
                <div key={group.id}>
                    <div className="flex items-center justify-between mb-2.5">
                        <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                            {group.name}
                        </h3>
                        {selectedOptions[group.id] !== undefined && (
                            <span className="text-xs text-muted-foreground">
                                {group.variant_options?.find((o) => o.id === selectedOptions[group.id])?.value}
                            </span>
                        )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {group.variant_options?.map((option) => {
                            const isSelected = selectedOptions[group.id] === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => onOptionSelect(group.id, option.id)}
                                    className={`relative min-h-10 rounded-xl border-2 px-4 py-2 text-sm font-medium transition-all duration-150 ${isSelected
                                            ? "border-primary bg-primary text-primary-foreground shadow-sm shadow-primary/30"
                                            : "border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    {option.value}
                                    {isSelected && (
                                        <span className="absolute -top-1 -right-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductVariantPickerProps {
    product: Product;
    onVariantChange?: (variant: Variant | null) => void;
}

export function ProductVariantPicker({ product, onVariantChange }: ProductVariantPickerProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

    useSyncVariantToUrl({
        product,
        selectedVariant,
        setSelectedVariant,
        setSelectedOptions,
    });

    useEffect(() => {
        onVariantChange?.(selectedVariant);
    }, [selectedVariant, onVariantChange]);

    const handleOptionSelect = (groupId: number, optionId: number) => {
        setSelectedOptions((prev) => {
            const updated = { ...prev, [groupId]: optionId };
            const matchingVariant =
                product.variants?.find((variant) =>
                    Object.entries(updated).every(([gId, oId]) =>
                        variant.variant_options?.some((opt) => opt.id === oId)
                    )
                ) || null;
            setSelectedVariant(matchingVariant);
            return updated;
        });
    };

    return (
        <ProductVariantPickerView
            variantGroups={product.variant_groups || []}
            selectedOptions={selectedOptions}
            onOptionSelect={handleOptionSelect}
        />
    );
}