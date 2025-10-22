import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { motion } from "framer-motion";
import { Link } from "react-router";

export default function ProductsPage() {
    const mockProducts = [
        {
            id: 1,
            created_at: "2025-10-01",
            updated_at: "2025-10-05",
            slug: "wireless-headphones",
            title: "Wireless Noise-Cancelling Headphones",
            description: "Experience immersive sound with cutting-edge noise cancellation and 40 hours of battery life.",
            category_id: 1,
            category: { id: 1, created_at: "2025-09-10", updated_at: "2025-09-10", title: "Electronics", parent_id: null },
            variants: [
                {
                    id: 1,
                    created_at: "2025-10-01",
                    updated_at: "2025-10-01",
                    product_id: 1,
                    sku: "HD-001",
                    price: 120,
                    special_price: 99,
                    stock: 25,
                    image: "https://images.unsplash.com/photo-1580894894513-541e068a6b1d?auto=format&fit=crop&w=600&q=80"
                }
            ],
            images: [
                {
                    id: 1,
                    created_at: "2025-10-01",
                    updated_at: "2025-10-01",
                    product_id: 1,
                    url: "https://images.unsplash.com/photo-1580894894513-541e068a6b1d?auto=format&fit=crop&w=600&q=80",
                    alt: "Wireless Headphones"
                }
            ]
        },
        {
            id: 2,
            created_at: "2025-09-20",
            updated_at: "2025-09-21",
            slug: "smartwatch-series-7",
            title: "Smartwatch Series 7",
            description: "Track your fitness and stay connected with a sleek, durable smartwatch design.",
            category_id: 1,
            category: { id: 1, created_at: "2025-09-10", updated_at: "2025-09-10", title: "Electronics", parent_id: null },
            variants: [
                {
                    id: 2,
                    created_at: "2025-09-20",
                    updated_at: "2025-09-20",
                    product_id: 2,
                    sku: "SW-007",
                    price: 299,
                    special_price: null,
                    stock: 15,
                    image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80"
                }
            ],
            images: [
                {
                    id: 2,
                    created_at: "2025-09-20",
                    updated_at: "2025-09-20",
                    product_id: 2,
                    url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80",
                    alt: "Smartwatch Series 7"
                }
            ]
        },
        {
            id: 3,
            created_at: "2025-10-02",
            updated_at: "2025-10-02",
            slug: "running-shoes",
            title: "Lightweight Running Shoes",
            description: "Run faster and longer with these ultra-light, breathable running shoes.",
            category_id: 2,
            category: { id: 2, created_at: "2025-09-12", updated_at: "2025-09-12", title: "Sportswear", parent_id: null },
            variants: [
                {
                    id: 3,
                    created_at: "2025-10-02",
                    updated_at: "2025-10-02",
                    product_id: 3,
                    sku: "RS-301",
                    price: 89,
                    special_price: 69,
                    stock: 40,
                    image: "https://images.unsplash.com/photo-1528701800489-20be0f2e1e03?auto=format&fit=crop&w=600&q=80"
                }
            ],
            images: [
                {
                    id: 3,
                    created_at: "2025-10-02",
                    updated_at: "2025-10-02",
                    product_id: 3,
                    url: "https://images.unsplash.com/photo-1528701800489-20be0f2e1e03?auto=format&fit=crop&w=600&q=80",
                    alt: "Running Shoes"
                }
            ]
        }
    ];

    return (
        <div className="px-6 md:px-20 py-16 bg-gradient-to-b from-white to-gray-100 min-h-screen">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Our Products</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Browse our curated selection of quality products tailored for your lifestyle.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {mockProducts.map((product, i) => {
                    const variant = product.variants?.[0];
                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.1, duration: 0.4 }}
                        >
                            <Card className="overflow-hidden hover:shadow-xl transition-all">
                                <img
                                    src={variant?.image || product.images?.[0]?.url}
                                    alt={product.images?.[0]?.alt || product.title}
                                    className="w-full h-56 object-cover"
                                />
                                <CardContent className="p-6 flex flex-col justify-between h-48">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {product.title}
                                        </h3>
                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {product.description}
                                        </p>
                                    </div>
                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-lg font-bold text-blue-600">
                                            ${variant?.special_price || variant?.price}
                                            {variant?.special_price && (
                                                <span className="text-gray-400 line-through text-sm ml-2">
                                                    ${variant.price}
                                                </span>
                                            )}
                                        </div>
                                        <Button className="bg-blue-600 text-white hover:bg-blue-700" asChild>
                                            <Link to={`/product/${product.slug}`}>View</Link>
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
