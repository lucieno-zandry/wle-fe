// stores/userPreferencesStore.ts
import type { UserPreference } from 'wle-core';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type StorePreference = Omit<UserPreference, 'user_id' | 'created_at' | 'updated_at' | 'id' | 'user'>;
export type UserPreferenceUpdates = Partial<StorePreference>;

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

export const defaultPreference: StorePreference = {
    currency: 'EUR',
    language: 'fr',
    theme: 'system',
    timezone
};

interface PreferencesState {
    preferences: StorePreference;
    rehydrated: boolean;        // localStorage -> memory done
    pendingSync: boolean;       // local changes waiting server
    syncedAt?: number;
    set: (state: Partial<Pick<PreferencesState, 'preferences' | 'rehydrated' | 'pendingSync' | 'syncedAt'>>) => void;          // timestamp when server confirmed
    clearPreferences: () => void;
    setPreferences: (preference: UserPreferenceUpdates) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set, get) => ({
            preferences: defaultPreference,
            rehydrated: false,
            pendingSync: false,
            syncedAt: undefined,
            set,
            setPreferences: (updates) => {
                const current = get().preferences;
                const preferences: StorePreference = { ...current, ...updates };
                // mark local change pending server sync
                set({ preferences, pendingSync: true });
            },
            clearPreferences: () => {
                set({ preferences: defaultPreference, pendingSync: false, syncedAt: undefined });
            },
        }),
        {
            name: 'user-preferences-storage',
            partialize: (state) => ({
                preferences: state.preferences,
                // persist sync metadata too so re-opened tabs know status
                pendingSync: state.pendingSync,
                syncedAt: state.syncedAt
            }),
            // set rehydration hook to flip the flag when localStorage is applied
            onRehydrateStorage: () => (state) => {
                // called after rehydration; set rehydrated true
                state?.set({ rehydrated: true });
            }
        }
    )
);
