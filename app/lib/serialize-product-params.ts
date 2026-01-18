export type ProductQueryParams = {
    // 🔍 Search
    search?: string;

    // 📦 Category
    category_id?: number;

    // 💰 Price filters
    min_price?: number;
    max_price?: number;

    // 🎛 Variant options
    variant_option_ids?: number[];

    // 📊 Sorting
    order_by?: 'created_at' | 'title';
    direction?: 'ASC' | 'DESC';

    // 📄 Pagination
    limit?: number;
    offset?: number;

    // 🔗 Relations
    with?: (
        | 'category'
        | 'variants'
        | 'variants.variant_options'
        | 'images'
        | 'variant_groups'
        | 'variant_groups.variant_options'
    )[];
};


export function serializeProductParams(params?: ProductQueryParams) {
    if (!params) return undefined;

    const query: Record<string, string> = {};

    Object.entries(params).forEach(([key, value]) => {
        if (value === undefined || value === null) return;

        if (Array.isArray(value)) {
            query[key] = value.join(',');
        } else {
            query[key] = String(value);
        }
    });

    return query;
}
