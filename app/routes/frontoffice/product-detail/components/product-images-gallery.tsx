import { useState } from "react";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductImagesGalleryViewProps {
    images: AppImage[];
    selectedIndex: number;
    onSelect: (index: number) => void;
}

export function ProductImagesGalleryView({
    images,
    selectedIndex,
    onSelect,
}: ProductImagesGalleryViewProps) {
    if (!images.length) return null;

    return (
        <div className="flex flex-col-reverse md:flex-row gap-4">
            {/* Thumbnails (vertical on desktop) */}
            <div className="flex md:flex-col gap-2 overflow-x-auto md:overflow-y-auto">
                {images.map((img, i) => (
                    <button
                        key={img.id}
                        onClick={() => onSelect(i)}
                        className={`w-16 h-16 rounded-md border-2 overflow-hidden transition ${i === selectedIndex ? "border-primary" : "border-transparent"
                            }`}
                    >
                        <img
                            src={img.url}
                            alt=""
                            className="w-full h-full object-cover"
                            loading="lazy"
                        />
                    </button>
                ))}
            </div>

            {/* Main image */}
            <div className="flex-1 relative overflow-hidden rounded-lg border bg-muted">
                <img
                    src={images[selectedIndex]?.url}
                    alt="Product"
                    className="w-full h-auto max-h-[500px] object-contain"
                />
                {/* Zoom placeholder – later we can add hover zoom */}
            </div>
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductImagesGalleryProps {
    images: AppImage[];
}

export function ProductImagesGallery({ images }: ProductImagesGalleryProps) {
    const [selectedIndex, setSelectedIndex] = useState(0);

    return (
        <ProductImagesGalleryView
            images={images}
            selectedIndex={selectedIndex}
            onSelect={setSelectedIndex}
        />
    );
}