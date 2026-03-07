import './globals.css';
import { Inter } from 'next/font/google';
import ThemeProvider from '@/components/ThemeProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Operon - Enterprise Grade Unified Dashboard',
  description: 'The enterprise-grade OS that unifies CRM, ERP, and HRMS into a singular visual experience.',
  keywords: 'dashboard, erp, crm, hrms, nextjs, react, enterprise',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
