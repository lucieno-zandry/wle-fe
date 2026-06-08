// lib/organize-categories.ts

import type { Category } from "wle-core";

export type CategoryWithChildren = Category & { children?: CategoryWithChildren[] };

export function organizeCategories(categories: Category[]): CategoryWithChildren[] {
    const map = new Map<number, CategoryWithChildren>();
    const roots: CategoryWithChildren[] = [];

    categories.forEach((c) => map.set(c.id, { ...c, children: [] }));

    categories.forEach((c) => {
        const node = map.get(c.id)!;
        if (!c.parent_id) {
            roots.push(node);
        } else {
            const parent = map.get(c.parent_id);
            if (parent) {
                parent.children = parent.children ?? [];
                parent.children.push(node);
            }
        }
    });

    return roots;
}