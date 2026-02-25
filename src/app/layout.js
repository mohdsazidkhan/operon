import './globals.css';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'OPERON - SaaS Dashboard',
  description: 'AI-Powered SaaS ERP/CRM/HRMS',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Toaster position="top-right" toastOptions={{ duration: 4000, style: { borderRadius: '12px', background: 'var(--surface)', color: 'var(--text-primary)', border: '1px solid var(--border)' } }} />
        {children}
      </body>
    </html>
  );
}
