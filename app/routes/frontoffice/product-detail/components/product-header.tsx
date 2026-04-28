import { Link } from "react-router";
import { useAppPathname } from "~/lib/app-pathname";

// ── Dumb (View) ──────────────────────────────────────────────────────────────
interface ProductHeaderViewProps {
    title: string;
    description: string;
    breadcrumbs: { label: string; href?: string }[];
    category?: Category | null;
}

export function ProductHeaderView({
    title,
    description,
    breadcrumbs,
    category,
}: ProductHeaderViewProps) {
    return (
        <div className="space-y-4">
            {/* Breadcrumb */}
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
                {breadcrumbs.map((crumb, idx) => (
                    <span key={idx}>
                        {crumb.href ? (
                            <Link to={crumb.href} className="hover:underline">
                                {crumb.label}
                            </Link>
                        ) : (
                            <span>{crumb.label}</span>
                        )}
                        {idx < breadcrumbs.length - 1 && " / "}
                    </span>
                ))}
            </nav>

            {/* Title */}
            <h1 className="text-3xl font-bold tracking-tight">{title}</h1>

            {/* Description (rich text) */}
            {description && (
                <div
                    className="prose prose-sm max-w-none text-muted-foreground"
                    dangerouslySetInnerHTML={{ __html: description }}
                />
            )}

            {/* Category link (if any) */}
            {category && (
                <Link
                    to={useAppPathname()(`/products?category_id=${category.id}`)}
                    className="text-sm text-primary underline underline-offset-2"
                >
                    See more {category.title}
                </Link>
            )}
        </div>
    );
}

// ── Smart (Container) ────────────────────────────────────────────────────────
interface ProductHeaderProps {
    product: Product;
    categories: Category[] | null; // all categories from store or fetched
}

export function ProductHeader({ product, categories }: ProductHeaderProps) {
    const appPath = useAppPathname();

    // Build breadcrumb from category hierarchy
    const breadcrumbs = buildBreadcrumbs(product.category, categories || []);

    return (
        <ProductHeaderView
            title={product.title}
            description={product.description}
            breadcrumbs={breadcrumbs}
            category={product.category}
        />
    );
}

// Helper: traverse parent chain
function buildBreadcrumbs(category?: Category, allCategories: Category[] = []) {
    const crumbs: { label: string; href?: string }[] = [
        { label: "Home", href: "/" },
    ];

    if (!category) {
        crumbs.push({ label: "Products" });
        return crumbs;
    }

    // Build path from current category up to root
    const path: Category[] = [];
    let current: Category | undefined = category;
    while (current) {
        path.unshift(current);
        current = allCategories.find((c) => c.id === current!.parent_id);
    }

    path.forEach((cat) => {
        crumbs.push({
            label: cat.title,
            href: `/products?category_id=${cat.id}`,
        });
    });

    return crumbs;
}