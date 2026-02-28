import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';
import { WILDCARD_PERMISSION } from '@/lib/permissions';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            permissions: [], // Array of permission key strings
            isAuthenticated: false,
            loading: false,

            login: async (email, password) => {
                set({ loading: true });
                try {
                    const res = await api.post('/auth/login', { email, password });
                    const { token, user } = res.data;
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    set({
                        user,
                        token,
                        permissions: user.permissions || [],
                        isAuthenticated: true,
                        loading: false,
                    });
                    return { success: true };
                } catch (err) {
                    set({ loading: false });
                    return { success: false, message: err.response?.data?.message || 'Login failed' };
                }
            },

            logout: () => {
                delete api.defaults.headers.common['Authorization'];
                set({ user: null, token: null, permissions: [], isAuthenticated: false });
            },

            setToken: (token) => {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                set({ token });
            },

            // Refresh permissions from server (call after role changes)
            refreshPermissions: async () => {
                try {
                    const res = await api.get('/users/me');
                    if (res.data?.user?.permissions) {
                        set({ permissions: res.data.user.permissions });
                    }
                } catch { /* non-fatal */ }
            },

            // ── Permission checks (client-side, fast) ──────────────────────

            /**
             * Check if user has a single permission key.
             * Wildcard '*' grants all permissions (super_admin).
             */
            hasPermission: (key) => {
                const { permissions, user } = get();
                if (user?.role === 'super_admin') return true;
                if (permissions.includes(WILDCARD_PERMISSION)) return true;
                return permissions.includes(key);
            },

            /**
             * Check if user has at least one of the given permission keys.
             */
            hasAnyPermission: (keys) => {
                const { hasPermission } = get();
                return keys.some(k => hasPermission(k));
            },

            /**
             * Check if user has all of the given permission keys.
             */
            hasAllPermissions: (keys) => {
                const { hasPermission } = get();
                return keys.every(k => hasPermission(k));
            },
        }),
        {
            name: 'operon-auth',
            partialize: (state) => ({
                user: state.user,
                token: state.token,
                permissions: state.permissions,
                isAuthenticated: state.isAuthenticated,
            }),
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
                }
            },
        }
    )
);
