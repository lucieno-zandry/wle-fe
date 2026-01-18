// lib/product-sort-map.ts
export const PRODUCT_SORT_MAP = {
  relevance: undefined,
  'price-low': { order_by: 'price', direction: 'ASC' },
  'price-high': { order_by: 'price', direction: 'DESC' },
  'name-asc': { order_by: 'title', direction: 'ASC' },
  'name-desc': { order_by: 'title', direction: 'DESC' },
} as const;

export type ProductSortKey = keyof typeof PRODUCT_SORT_MAP;
