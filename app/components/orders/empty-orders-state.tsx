// components/orders/EmptyOrdersState.tsx
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Package } from "lucide-react";

export function EmptyOrdersState() {
    return (
        <div className="container mx-auto p-10 text-center space-y-4">
            <Package className="w-16 h-16 mx-auto text-muted-foreground opacity-20" />
            <h2 className="text-2xl font-bold">No orders yet</h2>
            <p className="text-muted-foreground">When you buy items, they will appear here.</p>
            <Button asChild>
                <Link to="/products">Start Shopping</Link>
            </Button>
        </div>
    );
}