
"use client";

import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  const isDark = useThemeStore((s) => s.isDark);
  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  }, [isDark]);
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
        {children}
      </body>
    </html>
  );
}
