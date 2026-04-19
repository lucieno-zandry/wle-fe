import React, { useState, useMemo, useEffect } from "react";
import {
    useLoaderData,
    useNavigation,
    useFetcher,
    type LoaderFunctionArgs,
    redirect,
    type ActionFunctionArgs,
} from "react-router";
import { toast } from "sonner";
import { useRefreshCart } from "~/hooks/use-cart";
import { useUserStore } from "~/hooks/use-user";
import { useTranslation } from "react-i18next";
import { addVariantToCart, getProduct } from "~/api/http-requests";
import NotFound from "~/components/common/not-found";
import navigateToCheckout from "~/lib/navigate-to-checkout";
import { ProductImageGallery } from "~/components/product/product-image-gallery";
import { ProductInfo } from "~/components/product/product-info";
import { VariantSelector } from "~/components/product/variant-selector";
import { QuantitySelector } from "~/components/product/quantity-selector";
import { CartActions } from "~/components/product/cart-actions";
import { TrustBadges } from "~/components/product/trust-badges";
import placeholderImage from "~/assets/images/placeholder.svg";

export const clientLoader = async ({ params }: LoaderFunctionArgs) => {
    const { slug } = params;
    const response = slug ? await getProduct(slug) : null;
    return response?.data?.product || null;
};

export const clientAction = async ({ request }: ActionFunctionArgs) => {
    const formData = await request.formData();
    const variantId = formData.get("variant_id")?.toString();
    const count = formData.get("count")?.toString();
    const isBuyNow = formData.get("buy_now")?.toString() === "true";

    if (variantId && count) {
        const response = await addVariantToCart({
            variant_id: parseInt(variantId),
            count: parseInt(count),
        });

        if (response.data?.cart_item) {
            if (isBuyNow) {
                return navigateToCheckout([response.data.cart_item.id], redirect);
            }
            return { success: true };
        }
    }
    return { success: false, status: 422 };
};

export default function ProductPage() {
    const { t } = useTranslation("product");
    const { user } = useUserStore();
    const product = useLoaderData<Product | null>();

    const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [count, setCount] = useState<number>(1);

    const fetcher = useFetcher();
    const navigation = useNavigation();
    const refreshCart = useRefreshCart();

    const isSubmitting = fetcher.state !== "idle" || navigation.state !== "idle";
    const canSeeSpecial = user?.permissions?.can_use_special_prices ?? false;

    // Toast notifications for add-to-cart
    useEffect(() => {
        if (fetcher.data && fetcher.state === "idle") {
            if (fetcher.data.success) {
                toast.success(t("addedToCart"));
                refreshCart();
            } else {
                toast.error(t("addToCartError"));
            }
        }
    }, [fetcher.data, fetcher.state, t, refreshCart]);

    // Initialize from URL or default to first variant
    useEffect(() => {
        if (!product) return;

        const { searchParams } = new URL(location.href);

        const variantIdParam = searchParams.get("variant");
        let initialVariant: Variant | null = null;

        if (variantIdParam) {
            const parsedId = parseInt(variantIdParam, 10);
            initialVariant = product.variants?.find((v) => v.id === parsedId) || null;
        }

        if (!initialVariant && product.variants?.length) {
            initialVariant = product.variants[0];
        }

        if (initialVariant) {
            setSelectedVariant(initialVariant);

            // Build selectedOptions from the variant's options
            const options: Record<number, number> = {};
            initialVariant.variant_options?.forEach((opt) => {
                const group = product.variant_groups?.find((g) =>
                    g.variant_options?.some((o) => o.id === opt.id)
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

    // Update URL when selectedVariant changes (user selects a different variant)
    useEffect(() => {
        if (!selectedVariant) return;

        const url = new URL(location.href);
        url.searchParams.set("variant", String(selectedVariant.id));
        history.replaceState({}, "", url);

    }, [selectedVariant]);

    // Use effective_price from variant if available, otherwise fallback to price
    const unitPrice = selectedVariant?.effective_price ?? selectedVariant?.price ?? 0;
    const subtotal = useMemo(() => unitPrice * count, [unitPrice, count]);

    const handleOptionSelect = (groupId: number, optionId: number) => {
        const updated = { ...selectedOptions, [groupId]: optionId };
        setSelectedOptions(updated);

        const matchingVariant = product?.variants?.find((variant) =>
            variant.variant_options?.every((opt) => Object.values(updated).includes(opt.id))
        );
        setSelectedVariant(matchingVariant || null);
        setCount(1);
    };

    const onBuyNow = () => {
        if (!selectedVariant) return;
        fetcher.submit(
            {
                variant_id: selectedVariant.id.toString(),
                count: count.toString(),
                buy_now: "true",
            },
            { method: "POST" }
        );
    };

    if (!product) return <NotFound />;

    return (
        <div className="min-h-screen bg-white pb-20">
            <div className="container mx-auto px-4 md:px-6 lg:px-8 pt-10">
                <div className="grid lg:grid-cols-2 gap-12 xl:gap-20">
                    {/* Left Column: Image Gallery */}
                    <div className="space-y-6">
                        <ProductImageGallery
                            product={product}
                            selectedVariant={selectedVariant}
                            canSeeSpecial={canSeeSpecial}
                            placeholderImage={placeholderImage}
                            t={t}
                        />
                        <div className="hidden lg:block space-y-4 pt-8 border-t">
                            <h2 className="text-xl font-bold tracking-tight text-gray-900">
                                {t("aboutProduct")}
                            </h2>
                            <p className="text-muted-foreground leading-relaxed text-lg whitespace-pre-line">
                                {product.description}
                            </p>
                        </div>
                    </div>

                    {/* Right Column: Purchase Info */}
                    <div className="flex flex-col">
                        <div className="lg:sticky lg:top-24 space-y-8">
                            <ProductInfo
                                title={product.title}
                                categoryTitle={product.category?.title}
                                unitPrice={unitPrice}
                                originalPrice={selectedVariant?.price}
                                stock={selectedVariant?.stock ?? 0}
                                appliedPromotions={selectedVariant?.applied_promotions}  // <-- add this
                                t={t}
                            />

                            <VariantSelector
                                groups={product.variant_groups || []}
                                selectedOptions={selectedOptions}
                                onOptionSelect={handleOptionSelect}
                            />

                            <QuantitySelector
                                quantity={count}
                                onIncrease={() => setCount((c) => c + 1)}
                                onDecrease={() => setCount((c) => Math.max(1, c - 1))}
                                max={selectedVariant?.stock}
                                disabled={!selectedVariant}
                                t={t}
                            />
                            <CartActions
                                selectedVariant={selectedVariant}
                                quantity={count}
                                subtotal={subtotal}
                                isSubmitting={isSubmitting}
                                onBuyNow={onBuyNow}
                                t={t}
                                fetcher={fetcher}   // <-- add this line
                            />

                            <TrustBadges t={t} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}