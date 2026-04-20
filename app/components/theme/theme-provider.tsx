'use client';

import { useEffect } from 'react';
import { usePreferencesStore } from '~/hooks/use-user-preference-store';

export const ThemeProvider = () => {
    const { theme} = usePreferencesStore().preferences;

    useEffect(() => {
        const root = document.documentElement;

        const applyTheme = (newTheme: string) => {
            if (newTheme === 'dark') {
                root.classList.add('dark');
            } else if (newTheme === 'light') {
                root.classList.remove('dark');
            } else {
                // system: check system preference
                const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                if (systemDark) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            }
        };

        applyTheme(theme);

        // Listen for system theme changes if theme is 'system'
        let mediaQuery: MediaQueryList | null = null;
        let handler: ((e: MediaQueryListEvent) => void) | null = null;

        if (theme === 'system') {
            mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
            handler = (e: MediaQueryListEvent) => {
                if (e.matches) {
                    root.classList.add('dark');
                } else {
                    root.classList.remove('dark');
                }
            };
            mediaQuery.addEventListener('change', handler);
        }

        return () => {
            if (mediaQuery && handler) {
                mediaQuery.removeEventListener('change', handler);
            }
        };
    }, [theme]);

    return null;
};