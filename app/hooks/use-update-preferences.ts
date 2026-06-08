import { useNavigation, useRevalidator } from "react-router";
import { useUserStore } from "./use-user";
import { usePreferencesStore } from "../stores/use-user-preference-store";
import { updateUserPreferences } from "~/api/http-requests";
import { HttpException } from "~/api/app-fetch";
import { toast } from "sonner";
import { useEffect } from "react";
import type { UserPreference } from "wle-core";

const useUpdatePreferences = () => {
    const { setPreferences, preferences } = usePreferencesStore();
    const revalidator = useRevalidator();
    const navigation = useNavigation();

    return async (updates: Partial<UserPreference>) => {
        const updated = { ...preferences, ...updates };
        setPreferences(updated);

        const loadingToast = toast.loading('Saving preferences');

        try {
            await updateUserPreferences(updates);
            revalidator.revalidate();
        } catch (e) {
            if (e instanceof HttpException)
                toast.error(e.data?.message || "Failed to sync preferences to the server");
        }

        toast.dismiss(loadingToast);
        toast.success('Preferences applied');
    }
}

export { useUpdatePreferences };