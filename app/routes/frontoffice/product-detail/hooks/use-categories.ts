import { useEffect } from "react";
import { getCategories } from "~/api/http-requests";
import { useCategoryStore } from "../stores/use-category-store";

export function useCategories() {
    const { categories, setCategories } = useCategoryStore();

    useEffect(() => {
        if (!categories) {
            getCategories()
                .then((response) => {
                    if (response.data?.categories)
                        setCategories(response.data.categories);
                })
                .catch(() => {
                    setCategories([]);
                })
        }
    }, [categories]);

    return {
        categories: categories,
    }
}