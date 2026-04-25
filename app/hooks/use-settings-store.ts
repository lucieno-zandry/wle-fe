import { create } from "zustand";

type SettingsStore = {
    settings: Record<string, any>,
    setSettings: (settings: SettingsStore['settings']) => void;
}

export default create<SettingsStore>(set => ({
    settings: {},
    setSettings: (settings) => set({ settings }),
}));