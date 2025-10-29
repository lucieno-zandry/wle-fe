import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { motion } from "framer-motion";
import { Link, useLoaderData } from "react-router";
import { getProducts } from "~/api/httpRequests";
import { Loader2 } from "lucide-react";

export const loader = async () => {
    const response = await getProducts();
    return response.data?.products;
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

export default function ProductsPage() {
    const products = useLoaderData() as Product[];

    const formatMoney = (n?: number) =>
        n === undefined ? "-" : `$${Number(n).toFixed(2)}`;

    return (
        <div className="px-6 md:px-20 py-16 bg-gradient-to-b from-white to-gray-100 min-h-screen">
            <div className="text-center mb-12">
                <h2 className="text-4xl font-bold text-gray-900 mb-3">Our Products</h2>
                <p className="text-gray-600 max-w-xl mx-auto">
                    Browse our curated selection of quality products tailored for your lifestyle.
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
                {products.map((product, i) => {
                    const variantCount = product.variants?.length || 0;

                    // compute minimum normal price & minimum special price (if any)
                    const prices = (product.variants || []).map((v) => v.price);
                    const specialPrices = (product.variants || [])
                        .map((v) => v.special_price)
                        .filter((p): p is number => p != null);

                    const minPrice = prices.length ? Math.min(...prices) : undefined;
                    const minSpecial = specialPrices.length ? Math.min(...specialPrices) : undefined;

                    // choose display price:
                    // prefer minSpecial if exists otherwise minPrice
                    const displayPrice = minSpecial ?? minPrice;
                    // show original price for strike-through (use minPrice)
                    const originalPrice = minPrice;

                    // image fallback
                    const variant = product.variants?.[0];
                    const imgSrc = (variant?.image as string) || product.images?.[0]?.filename;

                    return (
                        <motion.div
                            key={product.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05, duration: 0.35 }}
                        >
                            <Card className="overflow-hidden hover:shadow-xl transition-all">
                                <img
                                    src={imgSrc}
                                    alt={product.title}
                                    className="w-full h-56 object-cover"
                                />
                                <CardContent className="p-6 flex flex-col justify-between h-48">
                                    <div>
                                        <h3 className="text-xl font-semibold text-gray-800 mb-2">
                                            {product.title}
                                        </h3>

                                        <div className="flex items-center gap-3 mb-3">
                                            <p className="text-gray-600 text-sm line-clamp-2">
                                                {product.description}
                                            </p>

                                            {/* variant count pill */}
                                            <span className="ml-auto inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                                                {variantCount} {variantCount > 1 ? "variants" : "variant"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between mt-auto">
                                        <div className="text-lg font-bold text-blue-600">
                                            {variantCount > 1 ? <span className="text-sm mr-1 text-gray-500">From</span> : null}
                                            {displayPrice ? formatMoney(displayPrice) : "—"}
                                            {minSpecial != null && originalPrice != null && originalPrice > minSpecial && (
                                                <span className="text-gray-400 line-through text-sm ml-2">
                                                    {formatMoney(originalPrice)}
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