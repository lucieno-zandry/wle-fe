import { useState } from "react";
import { Button } from "~/components/ui/button";
import { motion } from "framer-motion";

export default function ProductPage() {
    const product = {
        id: 1,
        created_at: "2025-10-01",
        updated_at: "2025-10-05",
        slug: "smartwatch-series-7",
        title: "Smartwatch Series 7",
        description:
            "Track your fitness, monitor your heart rate, and stay connected in style. Choose your preferred color and strap type.",
        category_id: 1,
        category: {
            id: 1,
            created_at: "2025-09-10",
            updated_at: "2025-09-10",
            title: "Electronics",
            parent_id: null,
        },
        images: [
            {
                id: 1,
                created_at: "2025-10-01",
                updated_at: "2025-10-01",
                filename:
                    "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80",
            },
        ],
        variant_groups: [
            {
                id: 1,
                created_at: "2025-10-01",
                updated_at: "2025-10-01",
                product_id: 1,
                name: "Color",
                variant_options: [
                    { id: 1, created_at: "2025-10-01", updated_at: "2025-10-01", value: "Black", variant_group_id: 1 },
                    { id: 2, created_at: "2025-10-01", updated_at: "2025-10-01", value: "Silver", variant_group_id: 1 },
                    { id: 3, created_at: "2025-10-01", updated_at: "2025-10-01", value: "Gold", variant_group_id: 1 },
                ],
            },
            {
                id: 2,
                created_at: "2025-10-01",
                updated_at: "2025-10-01",
                product_id: 1,
                name: "Strap Type",
                variant_options: [
                    { id: 4, created_at: "2025-10-01", updated_at: "2025-10-01", value: "Silicone", variant_group_id: 2 },
                    { id: 5, created_at: "2025-10-01", updated_at: "2025-10-01", value: "Leather", variant_group_id: 2 },
                ],
            },
        ],
        variants: [
            {
                id: 1,
                created_at: "2025-10-01",
                updated_at: "2025-10-01",
                product_id: 1,
                sku: "SW7-BLK-SIL",
                price: 299,
                special_price: 279,
                stock: 10,
                image: null,
                variant_options: [
                    { id: 1, value: "Black", variant_group_id: 1 },
                    { id: 4, value: "Silicone", variant_group_id: 2 },
                ],
            },
            {
                id: 2,
                created_at: "2025-10-01",
                updated_at: "2025-10-01",
                product_id: 1,
                sku: "SW7-SLV-LEA",
                price: 319,
                special_price: null,
                stock: 5,
                image: null,
                variant_options: [
                    { id: 2, value: "Silver", variant_group_id: 1 },
                    { id: 5, value: "Leather", variant_group_id: 2 },
                ],
            },
            {
                id: 3,
                created_at: "2025-10-01",
                updated_at: "2025-10-01",
                product_id: 1,
                sku: "SW7-GLD-SIL",
                price: 309,
                special_price: 289,
                stock: 0,
                image: null,
                variant_options: [
                    { id: 3, value: "Gold", variant_group_id: 1 },
                    { id: 4, value: "Silicone", variant_group_id: 2 },
                ],
            },
        ],
    };

    const [selectedOptions, setSelectedOptions] = useState<Record<number, string>>({});

    const handleOptionSelect = (groupId: number, value: string) => {
        setSelectedOptions((prev) => ({ ...prev, [groupId]: value }));
    };

    const matchedVariant = product.variants?.find((variant) => {
        return variant.variant_options?.every((opt) => selectedOptions[opt.variant_group_id] === opt.value);
    });

    return (
        <div className="px-6 md:px-20 py-16 bg-gradient-to-b from-white to-gray-100 min-h-screen">
            <div className="grid md:grid-cols-2 gap-12">
                {/* Product Image */}
                <motion.img
                    src={product.images?.[0]?.filename}
                    alt={product.title}
                    className="rounded-2xl shadow-lg w-full object-cover"
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                />

                {/* Product Info */}
                <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="flex flex-col justify-center"
                >
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">{product.title}</h1>
                    <p className="text-gray-600 mb-6">{product.description}</p>

                    {product.variant_groups?.map((group) => (
                        <div key={group.id} className="mb-6">
                            <h4 className="font-semibold text-gray-800 mb-2">{group.name}</h4>
                            <div className="flex gap-3 flex-wrap">
                                {group.variant_options?.map((opt) => {
                                    const isSelected = selectedOptions[group.id] === opt.value;
                                    return (
                                        <Button
                                            key={opt.id}
                                            variant={isSelected ? "default" : "outline"}
                                            className={isSelected ? "bg-blue-600 text-white" : ""}
                                            onClick={() => handleOptionSelect(group.id, opt.value)}
                                        >
                                            {opt.value}
                                        </Button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    <div className="mt-6 flex items-center gap-6">
                        {matchedVariant ? (
                            <>
                                <div>
                                    <span className="text-3xl font-bold text-blue-600">
                                        ${matchedVariant.special_price || matchedVariant.price}
                                    </span>
                                    {matchedVariant.special_price && (
                                        <span className="text-gray-400 line-through text-sm ml-2">
                                            ${matchedVariant.price}
                                        </span>
                                    )}
                                </div>
                                <Button
                                    disabled={matchedVariant.stock === 0}
                                    className="bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    {matchedVariant.stock > 0 ? "Add to Cart" : "Out of Stock"}
                                </Button>
                            </>
                        ) : (
                            <p className="text-gray-500 italic">Select options to see price and availability</p>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
