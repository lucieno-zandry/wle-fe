// routes/frontoffice/product-detail/components/product-variant-picker.tsx

import { useSyncVariantToUrl } from "../hooks/use-sync-variant-to-url"; // adjust import path

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductVariantPickerViewProps {
    variantGroups: VariantGroup[];
    selectedOptions: Record<number, number>; // groupId -> selected optionId
    onOptionSelect: (groupId: number, optionId: number) => void;
}

export function ProductVariantPickerView({
    variantGroups,
    selectedOptions,
    onOptionSelect,
}: ProductVariantPickerViewProps) {
    if (!variantGroups.length) return null;

    return (
        <div className="space-y-6">
            {variantGroups.map((group) => (
                <div key={group.id}>
                    <h3 className="text-sm font-medium mb-2">{group.name}</h3>
                    <div className="flex flex-wrap gap-2">
                        {group.variant_options?.map((option) => {
                            const isSelected = selectedOptions[group.id] === option.id;
                            return (
                                <button
                                    key={option.id}
                                    type="button"
                                    onClick={() => onOptionSelect(group.id, option.id)}
                                    className={`px-4 py-2 border rounded-md text-sm font-medium transition ${isSelected
                                        ? "border-primary bg-primary text-primary-foreground"
                                        : "border-input bg-background hover:bg-accent hover:text-accent-foreground"
                                        }`}
                                >
                                    {option.value}
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
import { useState, useEffect } from "react";

interface ProductVariantPickerProps {
    product: Product;
    onVariantChange?: (variant: Variant | null) => void;
}

export function ProductVariantPicker({ product, onVariantChange }: ProductVariantPickerProps) {
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});

    // Sync variant with URL (initial load + updates)
    useSyncVariantToUrl({
        product,
        selectedVariant,
        setSelectedVariant,
        setSelectedOptions,
    });

    // Notify parent whenever the selected variant changes
    useEffect(() => {
        onVariantChange?.(selectedVariant);
    }, [selectedVariant, onVariantChange]);

    const handleOptionSelect = (groupId: number, optionId: number) => {
        setSelectedOptions((prev) => {
            const updated = { ...prev, [groupId]: optionId };

            // Find the variant that matches the new combination of selected options
            const matchingVariant = product.variants?.find((variant) =>
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