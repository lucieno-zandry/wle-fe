import { useCallback } from "react";
import useSettingsStore from "./use-settings-store";

export function useSettings() {
    const { settings, setSettings: set } = useSettingsStore();

    const get = useCallback(<T = unknown>(key: string, fallback?: T) => {
        const value = settings[key];
        return (value || fallback) as T
    }, [settings]);

    return {
        get,
        set
    }
}