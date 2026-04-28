import { useEffect } from "react";

type Props = {
    product: Product | null,
    selectedVariant: Variant | null,
    setSelectedVariant: (variant: Variant | null) => void,
    setSelectedOptions: (options: Record<number, number>) => void,
}

export function useSyncVariantToUrl(props: Props) {
    const {
        product,
        setSelectedVariant,
        setSelectedOptions,
        selectedVariant
    } = props;

    useEffect(() => {
        if (!product) return;

        const { searchParams } = new URL(location.href);
        const variantIdParam = searchParams.get("variant");

        let initialVariant: Variant | null = null;

        if (variantIdParam) {
            const parsedId = parseInt(variantIdParam, 10);
            initialVariant = product.variants?.find(v => v.id === parsedId) || null;
        }

        if (!initialVariant && product.variants?.length) {
            initialVariant = product.variants[0];
        }

        if (initialVariant) {
            setSelectedVariant(initialVariant);

            const options: Record<number, number> = {};

            initialVariant.variant_options?.forEach(opt => {
                const group = product.variant_groups?.find(g =>
                    g.variant_options?.some(o => o.id === opt.id)
                );
                if (group) {
                    options[group.id] = opt.id;
                }
            });

            setSelectedOptions(options);
        } else {
            setSelectedVariant(null);
            setSelectedOptions({});
        }
    }, [product]);

    useEffect(() => {
        if (!selectedVariant) return;

        const url = new URL(location.href);
        url.searchParams.set("variant", String(selectedVariant.id));
        history.replaceState({}, "", url);
    }, [selectedVariant]);

}