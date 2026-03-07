"use client";

import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';
import { Toaster } from 'react-hot-toast';

export default function ThemeProvider({ children }) {
    const isDark = useThemeStore((s) => s.isDark);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            document.documentElement.classList.toggle('dark', isDark);
        }
    }, [isDark]);

    return (
        <>
            <Toaster
                position="top-right"
                toastOptions={{
                    duration: 4000,
                    style: {
                        borderRadius: '12px',
                        background: 'var(--surface)',
                        color: 'var(--text-primary)',
                        border: '1px solid var(--border)'
                    }
                }}
            />
            {children}
        </>
    );
}
