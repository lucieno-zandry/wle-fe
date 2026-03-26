// stores/userPreferencesStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { fetchUserPreferences, updateUserPreferences } from '~/api/http-requests';
import { useUserStore } from './use-user';


// Partial type for updates (all fields optional)
export type StoreAppPreference = Omit<UserPreference, 'id' | 'user_id' | 'created_at' | 'updated_at'>;
export type UserPreferenceUpdates = Partial<StoreAppPreference>;

const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;

const defaultPreference: StoreAppPreference = {
    currency: 'USD',
    language: 'en',
    theme: 'system',
    timezone
};

interface PreferencesState {
    preferences: StoreAppPreference;
    isLoading: boolean;
    error: string | null;
    // Actions
    fetchPreferences: () => Promise<void>;
    updatePreferences: (updates: UserPreferenceUpdates) => Promise<unknown>;
    clearPreferences: () => void;
    setLanguage: (language: string) => void;
}

export const usePreferencesStore = create<PreferencesState>()(
    persist(
        (set, get) => ({
            preferences: defaultPreference,
            isLoading: false,
            error: null,

            fetchPreferences: async () => {
                set({ isLoading: true, error: null });
                try {
                    const response = await fetchUserPreferences();

                    set({ preferences: response.data?.preferences || defaultPreference, isLoading: false });
                } catch (err: any) {
                    set({ error: err.response?.data?.message || 'Failed to load preferences', isLoading: false });
                }
            },

            updatePreferences: async (updates: UserPreferenceUpdates) => {
                const { user } = useUserStore.getState();

                if (!user) {
                    const current = get().preferences;
                    const preferences: StoreAppPreference = { ...current, ...updates };

                    return set({ preferences });
                }

                set({ isLoading: true, error: null });

                try {
                    const response = await updateUserPreferences(updates);
                    set({ preferences: response.data!.preferences, isLoading: false });
                } catch (err: any) {
                    set({ error: err.response?.data?.message || 'Failed to update preferences', isLoading: false });
                    throw err;
                }
            },

            clearPreferences: () => {
                set({ preferences: defaultPreference, isLoading: false, error: null });
            },
            setLanguage: (language) => {
                get().updatePreferences({ language });
            }
        }),
        {
            name: 'user-preferences-storage', // unique name for localStorage key
            partialize: (state) => ({ preferences: state.preferences }), // only persist preferences, not loading/error
        }
    )
);