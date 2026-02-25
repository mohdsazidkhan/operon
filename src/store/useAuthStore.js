import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import api from '@/services/api';

export const useAuthStore = create(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            loading: false,

            login: async (email, password) => {
                set({ loading: true });
                try {
                    const res = await api.post('/auth/login', { email, password });
                    const { token, user } = res.data;
                    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                    set({ user, token, isAuthenticated: true, loading: false });
                    return { success: true };
                } catch (err) {
                    set({ loading: false });
                    return { success: false, message: err.response?.data?.message || 'Login failed' };
                }
            },

            logout: () => {
                delete api.defaults.headers.common['Authorization'];
                set({ user: null, token: null, isAuthenticated: false });
            },

            setToken: (token) => {
                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
                set({ token });
            },
        }),
        {
            name: 'operon-auth',
            onRehydrateStorage: () => (state) => {
                if (state?.token) {
                    api.defaults.headers.common['Authorization'] = `Bearer ${state.token}`;
                }
            },
        }
    )
);
