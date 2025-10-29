import React, { useState } from "react";
import { motion } from "framer-motion";
import { addVariantToCart, getProduct } from "~/api/httpRequests";
import { useLoaderData, useNavigation, useSubmit, type ActionFunctionArgs, type LoaderFunctionArgs } from "react-router";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import Button from "~/components/custom-components/button";

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
    const { slug } = params;

    const response = slug && await getProduct(slug);
    return response && response.data?.product;
}

export const HydrateFallback = () => (
    <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-900 grow-1 mb-5">
        <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 dark:text-blue-400" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                Loading ....
            </p>
        </div>
    </div>
)

export default function ProductPage() {
    const product = useLoaderData<Product>();
    const [selectedOptions, setSelectedOptions] = useState<Record<number, number>>({});
    const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null);
    const [count, setCount] = useState<number>(1);
    const submit = useSubmit();
    const navigation = useNavigation();

    const isLoading = React.useMemo(() => navigation.state === "submitting", [navigation]);

    const handleOptionSelect = (groupId: number, optionId: number) => {
        const updated = { ...selectedOptions, [groupId]: optionId };
        setSelectedOptions(updated);

        // Find the matching variant based on selected options
        const matchingVariant = product.variants?.find((variant) =>
            variant.variant_options?.every((opt) =>
                Object.values(updated).includes(opt.id)
            )
        );

        setSelectedVariant(matchingVariant || null);
        setCount(1);
    };

    const handleAddToCart = () => {
        if (!selectedVariant) return;
        const payload = {
            variant_id: selectedVariant.id,
            count,
        };

        submit(payload, { method: "POST" })
    };

    // 🧮 Subtotal computation (updates dynamically)
    const subtotal = React.useMemo(() => {
        if (!selectedVariant) return 0;
        const unitPrice = selectedVariant.special_price || selectedVariant.price;
        return unitPrice * count;
    }, [selectedVariant, count]);

    return (
        <div className="px-6 md:px-10 lg:px-24 py-16 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-3 gap-16">

                    {/* 🖼️ Product Image/Gallery (No change here, as images are product-specific) */}
                    <div className="lg:col-span-2">
                        <motion.img
                            src={
                                selectedVariant?.image ||
                                product.images?.[0]?.filename ||
                                "https://via.placeholder.com/800x600"
                            }
                            alt={product.title}
                            className="w-full object-cover rounded-3xl shadow-2xl border border-gray-100 aspect-4/3"
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                        />

                        {/* 📝 Detailed Description */}
                        <div className="mt-12 pt-6 border-t border-gray-200">
                            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Product Details</h2>
                            <p className="text-gray-700 leading-relaxed">{product.description}</p>
                        </div>
                    </div>

                    {/* 🛒 Product Info & Purchase Actions (The area we are focusing on) */}
                    <div className="lg:col-span-1 lg:sticky lg:top-8 lg:self-start p-6 bg-white rounded-xl shadow-lg border border-gray-100">

                        {/* Header Info */}
                        <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{product.title}</h1>
                        <p className="text-sm text-gray-500 font-medium mb-6">
                            {/* Changed color from blue to a neutral gray for less emphasis */}
                            Stock: {selectedVariant && selectedVariant.stock > 0 ? "In Stock" : "Out of stock"}
                        </p>

                        {/* Price Display */}
                        {selectedVariant && (
                            <div className="flex items-baseline gap-3 mb-8 pb-4 border-b border-gray-100">
                                <span className="text-4xl font-extrabold text-gray-900">
                                    {/* **Primary Color Reduction: Changed text-blue-600 to text-gray-900** */}
                                    ${(selectedVariant.special_price || selectedVariant.price)?.toFixed(2)}
                                </span>
                                {selectedVariant.special_price && (
                                    <span className="text-xl text-gray-400 line-through">
                                        ${selectedVariant.price?.toFixed(2)}
                                    </span>
                                )}
                            </div>
                        )}

                        {/* Variant Groups */}
                        {product.variant_groups?.map((group) => (
                            <div key={group.id} className="mb-8">
                                <h3 className="font-bold text-gray-800 mb-3 text-lg">{group.name}</h3>
                                <div className="flex flex-wrap gap-3">
                                    {group.variant_options?.map((option) => (
                                        <Button
                                            key={option.id}
                                            variant={
                                                selectedOptions[group.id] === option.id ? "default" : "outline"
                                            }
                                            className={
                                                selectedOptions[group.id] === option.id
                                                    ? "bg-indigo-600 text-white hover:bg-indigo-700 transition duration-150 border-indigo-600" // **Used a less aggressive indigo for the selected state**
                                                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 transition duration-150"
                                            }
                                            onClick={() => handleOptionSelect(group.id, option.id)}
                                        >
                                            {option.value}
                                        </Button>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Count Selector + Add to Cart Button */}
                        {selectedVariant && selectedVariant.stock > 0 && (
                            <div className="mt-8 pt-4 border-t border-gray-100 space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    {/* Quantity Selector (Kept neutral) */}
                                    <div className="flex items-center border border-gray-300 rounded-full px-1 py-1">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full h-8 w-8 text-gray-600 hover:bg-gray-100"
                                            onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                                            disabled={count <= 1}
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <span className="px-4 text-lg font-bold w-12 text-center text-gray-900">{count}</span>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="rounded-full h-8 w-8 text-gray-600 hover:bg-gray-100"
                                            onClick={() =>
                                                setCount((prev) => Math.min(selectedVariant.stock, prev + 1))
                                            }
                                            disabled={count >= selectedVariant.stock}
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>

                                    {/* Add to Cart Button (The main primary color action) */}
                                    <Button
                                        className="flex-1 h-12 rounded-full text-lg font-semibold bg-blue-600 text-white hover:bg-blue-700 transition duration-300 shadow-md hover:shadow-lg"
                                        onClick={handleAddToCart}
                                        isLoading={isLoading}
                                    >
                                        <ShoppingCart className="h-5 w-5 mr-2" />
                                        Add to Cart
                                    </Button>
                                </div>

                                {/* 💰 Subtotal display */}
                                <div className="flex justify-end items-center gap-2 text-gray-700 pt-3">
                                    <span className="font-semibold text-lg">Subtotal:</span>
                                    <span className="text-3xl font-extrabold text-indigo-700">
                                        {/* **Primary Color Reduction: Used text-indigo-700 (a deeper, quieter blue/purple)** */}
                                        ${subtotal.toFixed(2)}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}