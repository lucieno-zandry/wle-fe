// routes/frontoffice/product-detail/components/product-images-gallery.tsx
import { useState, useRef, useCallback } from "react";
import { ImageIcon, ZoomIn } from "lucide-react";
import { useTranslation } from "react-i18next";

export interface AppImage {
    id: string | number;
    url: string;
    alt?: string;
}

// ── Zoomable Image Component ───────────────────────────────────────────────────
function ZoomableImage({ src, alt }: { src: string; alt?: string }) {
    const [isZoomed, setIsZoomed] = useState(false);
    const [position, setPosition] = useState({ x: 50, y: 50 });
    const containerRef = useRef<HTMLDivElement>(null);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!containerRef.current) return;
        const { left, top, width, height } = containerRef.current.getBoundingClientRect();
        const x = Math.max(0, Math.min(100, ((e.clientX - left) / width) * 100));
        const y = Math.max(0, Math.min(100, ((e.clientY - top) / height) * 100));
        setPosition({ x, y });
    }, []);

    return (
        <div
            ref={containerRef}
            className="relative flex-1 overflow-hidden rounded-2xl bg-muted/30 border border-border"
            style={{ cursor: isZoomed ? "zoom-out" : "zoom-in" }}
            onMouseEnter={() => setIsZoomed(true)}
            onMouseLeave={() => {
                setIsZoomed(false);
                setPosition({ x: 50, y: 50 });
            }}
            onMouseMove={handleMouseMove}
        >
            <img
                src={src}
                alt={alt || "Product image"}
                className="w-full object-contain transition-transform duration-200 ease-out"
                style={{
                    aspectRatio: "1 / 1",
                    maxHeight: "560px",
                    transformOrigin: `${position.x}% ${position.y}%`,
                    transform: isZoomed ? "scale(2.2)" : "scale(1)",
                    willChange: "transform",
                }}
            />
            {!isZoomed && (
                <div className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-background/80 backdrop-blur-sm px-2.5 py-1.5 text-xs text-muted-foreground shadow-sm border border-border pointer-events-none">
                    <ZoomIn className="h-3 w-3" />
                    <span>Hover to zoom</span>
                </div>
            )}
        </div>
    );
}

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductImagesGalleryViewProps {
    images: AppImage[];
    selectedIndex: number;
    onSelect: (index: number) => void;
    noImagesLabel: string;
    selectImageLabel: string;
    thumbnailAltPattern: string;
    productImageAlt: string;
}

export function ProductImagesGalleryView({
    images,
    selectedIndex,
    onSelect,
    noImagesLabel,
    selectImageLabel,
    thumbnailAltPattern,
    productImageAlt,
}: ProductImagesGalleryViewProps) {
    if (!images || images.length === 0) {
        return (
            <div className="flex aspect-square w-full items-center justify-center rounded-2xl border-2 border-dashed border-border bg-muted/30">
                <div className="flex flex-col items-center gap-3 text-muted-foreground">
                    <ImageIcon className="h-12 w-12 opacity-30" />
                    <p className="text-sm font-medium">{noImagesLabel}</p>
                </div>
            </div>
        );
    }

    const mainImage = images[selectedIndex];

    return (
        <div className="flex flex-col-reverse gap-3 sm:gap-4 md:flex-row md:items-start">
            {/* Thumbnails */}
            {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-1 md:max-h-[560px] md:flex-col md:overflow-y-auto md:overflow-x-hidden md:pb-0 md:w-[72px] shrink-0 scrollbar-thin">
                    {images.map((img, i) => {
                        const isSelected = i === selectedIndex;
                        return (
                            <button
                                key={img.id}
                                onClick={() => onSelect(i)}
                                aria-current={isSelected ? "true" : undefined}
                                aria-label={selectImageLabel.replace("{{index}}", String(i + 1))}
                                className={`relative h-[60px] w-[60px] shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 ${
                                    isSelected
                                        ? "border-primary ring-2 ring-primary/30 opacity-100"
                                        : "border-border opacity-50 hover:opacity-80 hover:border-muted-foreground/30"
                                }`}
                            >
                                <img
                                    src={img.url}
                                    alt={thumbnailAltPattern.replace("{{index}}", String(i + 1))}
                                    className="h-full w-full object-cover"
                                    loading="lazy"
                                />
                            </button>
                        );
                    })}
                </div>
            )}

            {/* Main image */}
            <div className="flex-1 min-w-0">
                <ZoomableImage src={mainImage.url} alt={mainImage.alt || productImageAlt} />
            </div>
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductImagesGalleryProps {
    images: AppImage[];
}

export function ProductImagesGallery({ images = [] }: ProductImagesGalleryProps) {
    const { t } = useTranslation("product-detail");
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <ProductImagesGalleryView
            images={images}
            selectedIndex={selectedIndex}
            onSelect={(index) => setSelectedIndex(Math.min(index, Math.max(0, images.length - 1)))}
            noImagesLabel={t("gallery.noImages")}
            selectImageLabel={t("gallery.selectImage")}
            thumbnailAltPattern={t("gallery.thumbnailAlt")}
            productImageAlt={t("gallery.productImageAlt")}
        />
    );
}