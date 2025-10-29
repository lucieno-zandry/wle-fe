import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

// Define the Zustand store type
interface UserStore {
    user: User | null
    setUser: (user: User | null) => void
    clearUser: () => void
}

// Create the store
export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            user: null,
            setUser: (user) => set({ user }),
            clearUser: () => set({ user: null }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
        }
    )
)
