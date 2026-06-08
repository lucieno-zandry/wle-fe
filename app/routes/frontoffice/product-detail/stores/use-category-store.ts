import type { Category } from "wle-core";
import { create } from "zustand"

export type CategoryStore = {
    categories: Category[] | null,
    setCategories: (categories: CategoryStore['categories']) => void
}

export const useCategoryStore = create<CategoryStore>(set => ({
    categories: null,
    setCategories: (categories) => set({ categories }),
}));