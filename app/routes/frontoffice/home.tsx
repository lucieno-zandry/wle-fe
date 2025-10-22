import Button from "~/components/custom-components/button";
import type { Route } from "../auth/+types";
import { motion } from "framer-motion";
import { ShoppingBag, Star, Truck } from "lucide-react";
import { Card, CardContent } from "~/components/ui/card";

export function meta({ }: Route.MetaArgs) {
  return [
    { title: "Alofo" },
    { name: "description", content: "Welcome to Alofo!" },
  ];
}

export default function Home() {
  return (<>
    {/* Hero Section */}
    <section className="flex flex-col md:flex-row items-center justify-between px-8 md:px-20 py-16 gap-10">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="max-w-xl"
      >
        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
          Your favorite products, delivered to your doorstep
        </h2>
        <p className="mt-4 text-gray-600 text-lg">
          Discover a world of premium quality items with fast delivery and secure payment options.
        </p>
        <div className="mt-6 flex gap-4">
          <Button className="bg-blue-600 text-white hover:bg-blue-700">Start Shopping</Button>
          <Button variant="outline">Learn More</Button>
        </div>
      </motion.div>
      <motion.img
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
        src="https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80"
        alt="E-commerce Hero"
        className="w-full md:w-1/2 rounded-2xl shadow-lg"
      />
    </section>

    {/* Features Section */}
    <section id="features" className="py-20 bg-white text-center">
      <h3 className="text-3xl font-bold mb-10 text-gray-800">Why Shop with Us?</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-8 md:px-20">
        {[{
          icon: <Truck className="w-10 h-10 text-blue-600" />, title: 'Fast Delivery', desc: 'Get your orders delivered within days, not weeks.'
        }, {
          icon: <Star className="w-10 h-10 text-blue-600" />, title: 'Top Quality', desc: 'We only offer the best products from trusted brands.'
        }, {
          icon: <ShoppingBag className="w-10 h-10 text-blue-600" />, title: 'Secure Payments', desc: 'Your payment info is encrypted and 100% safe.'
        }].map((f, i) => (
          <Card key={i} className="p-6 hover:shadow-lg transition-shadow">
            <CardContent className="flex flex-col items-center text-center space-y-4">
              {f.icon}
              <h4 className="text-xl font-semibold">{f.title}</h4>
              <p className="text-gray-600">{f.desc}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>

    {/* CTA Section */}
    <section className="bg-blue-600 text-white py-20 text-center">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="px-8"
      >
        <h3 className="text-3xl md:text-4xl font-bold mb-4">
          Join thousands of happy customers today!
        </h3>
        <p className="text-lg mb-8 max-w-2xl mx-auto">
          Enjoy an effortless shopping experience and get exclusive discounts by signing up.
        </p>
        <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
          Get Started
        </Button>
      </motion.div>
    </section>
  </>
  );
}
