import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useThemeStore = create(
    persist(
        (set) => ({
            isDark: false,
            colorTheme: 'violet', // violet | blue | rose | orange | green | slate
            sidebarCollapsed: false,
            sidebarOpen: true, // mobile drawer

            toggleDark: () => set((s) => {
                const dark = !s.isDark;
                if (typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', dark);
                }
                return { isDark: dark };
            }),
            setColorTheme: (theme) => set(() => {
                if (typeof window !== 'undefined') {
                    document.documentElement.setAttribute('data-theme', theme);
                }
                return { colorTheme: theme };
            }),
            toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
            setSidebarOpen: (open) => set({ sidebarOpen: open }),
        }),
        {
            name: 'operon-theme',
            onRehydrateStorage: () => (state) => {
                if (state && typeof window !== 'undefined') {
                    document.documentElement.classList.toggle('dark', state.isDark);
                    document.documentElement.setAttribute('data-theme', state.colorTheme);
                }
            },
        }
    )
);
