// routes/frontoffice/product-detail/components/product-share.tsx
import { Button } from "~/components/ui/button";
import { Copy, Share2, Check } from "lucide-react";
import { toast } from "sonner";
import { useAppPathname } from "~/lib/app-pathname";
import isCsr from "~/lib/is-csr";
import { useTranslation } from "react-i18next";
import { useState } from "react";
import type { Product } from "wle-core";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductShareViewProps {
    onShare: () => void;
    onCopyLink: () => void;
    shareLabel: string;
    copyLinkLabel: string;
    copied: boolean;
}

export function ProductShareView({ onShare, onCopyLink, shareLabel, copyLinkLabel, copied }: ProductShareViewProps) {
    return (
        <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground mr-1 uppercase tracking-wide font-medium">Share</span>
            <Button
                variant="outline"
                size="sm"
                onClick={onShare}
                className="h-8 rounded-full border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground text-xs gap-1.5 px-3"
            >
                <Share2 className="h-3.5 w-3.5" />
                {shareLabel}
            </Button>
            <Button
                variant="outline"
                size="sm"
                onClick={onCopyLink}
                className={`h-8 rounded-full text-xs gap-1.5 px-3 transition-all duration-200 ${copied
                        ? "border-green-500/20 bg-green-500/10 text-green-600 dark:text-green-400"
                        : "border-border text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                    }`}
            >
                {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                {copied ? "Copied!" : copyLinkLabel}
            </Button>
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductShareProps {
    product: Product;
}

export function ProductShare({ product }: ProductShareProps) {
    const { t } = useTranslation("product-detail");
    const appPath = useAppPathname();
    const [copied, setCopied] = useState(false);

    if (!isCsr()) return null;

    const fullUrl = location.origin + appPath(`/product/${product.slug}`);

    const handleCopyLink = () => {
        navigator.clipboard.writeText(fullUrl).then(() => {
            setCopied(true);
            toast.success(t("share.copySuccess"));
            setTimeout(() => setCopied(false), 2500);
        }).catch(() => {
            toast.error(t("share.copyFailed"));
        });
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({ title: product.title, url: fullUrl }).catch(() => { });
        } else {
            handleCopyLink();
        }
    };

    return (
        <ProductShareView
            onShare={handleShare}
            onCopyLink={handleCopyLink}
            shareLabel={t("share.share")}
            copyLinkLabel={t("share.copyLink")}
            copied={copied}
        />
    );
}