import type { User } from 'wle-core'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

type AuthStatus = 'unknown' | 'authenticated' | 'unauthenticated'

// Define the Zustand store type
interface UserStore {
    authStatus: AuthStatus
    user: User | null
    setUser: (user: User | null) => void
    clearUser: () => void
}

// Create the store
export const useUserStore = create<UserStore>()(
    persist(
        (set) => ({
            authStatus: 'unknown',
            user: null,
            setUser: (user) => {
                const authStatus: AuthStatus = user ? 'authenticated' : 'unauthenticated'
                set({ user, authStatus });
            },
            clearUser: () => set({ user: null, authStatus: 'unauthenticated' }),
        }),
        {
            name: 'user-storage',
            storage: createJSONStorage(() => localStorage),
            partialize: (state) => ({
                user: state.user,
                authStatus: state.authStatus,
            }),
        }
    )
)
