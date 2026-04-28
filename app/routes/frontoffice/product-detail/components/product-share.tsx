// routes/frontoffice/product-detail/components/product-share.tsx

import { Button } from "~/components/ui/button";
import { Copy, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useAppPathname } from "~/lib/app-pathname";
import isCsr from "~/lib/is-csr";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductShareViewProps {
    onShare: () => void;
    onCopyLink: () => void;
}

export function ProductShareView({ onShare, onCopyLink }: ProductShareViewProps) {
    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onShare}>
                <Share2 className="h-4 w-4 mr-1" />
                Share
            </Button>
            <Button variant="outline" size="sm" onClick={onCopyLink}>
                <Copy className="h-4 w-4 mr-1" />
                Copy Link
            </Button>
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductShareProps {
    product: Product;
}

export function ProductShare({ product }: ProductShareProps) {
    const appPath = useAppPathname();

    if (!isCsr()) return;
    
    const fullUrl = location.origin + appPath(`/product/${product.slug}`);

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: product.title,
                url: fullUrl,
            }).catch(() => { });
        } else {
            handleCopyLink();
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(fullUrl).then(() => {
            toast.success("Link copied to clipboard");
        }).catch(() => {
            toast.error("Failed to copy link");
        });
    };

    return <ProductShareView onShare={handleShare} onCopyLink={handleCopyLink} />;
}