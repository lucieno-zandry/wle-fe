import { Badge } from "~/components/ui/badge";

interface ProductsHeaderProps {
    productCount: number;
}

export function ProductsHeader({ productCount }: ProductsHeaderProps) {
    return (
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b pb-8">
            <div className="space-y-2">
                <h1 className="text-4xl font-extrabold tracking-tight">Our Collection</h1>
                <p className="text-muted-foreground text-lg max-w-2xl">
                    Discover quality variants tailored for your professional and lifestyle needs.
                </p>
            </div>
            <div className="flex gap-2">
                <Badge variant="secondary" className="px-4 py-1.5 h-fit text-sm">
                    {productCount} Products Found
                </Badge>
            </div>
        </header>
    );
}