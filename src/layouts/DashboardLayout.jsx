'use client';

import { useState } from 'react';
import Sidebar from './Sidebar';
import Navbar from './Navbar';
import ThemeCustomizer from './ThemeCustomizer';
import { useThemeStore } from '@/store/useThemeStore';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils'; // Assuming cn helper is in lib/utils or similar

function Breadcrumb() {
    const pathname = usePathname();
    const parts = pathname.split('/').filter(Boolean);
    const labels = { dashboard: 'Dashboard', crm: 'CRM', erp: 'ERP', hrms: 'HRMS', apps: 'Apps', leads: 'Leads', pipeline: 'Pipeline', contacts: 'Contacts', companies: 'Companies', inventory: 'Inventory', products: 'Products', orders: 'Orders', invoices: 'Invoices', expenses: 'Expenses', reports: 'Finance Reports', employees: 'Employees', attendance: 'Attendance', leaves: 'Leave Management', payroll: 'Payroll', analytics: 'HR Analytics', calendar: 'Calendar', kanban: 'Kanban', chat: 'Chat', files: 'Files', email: 'Email', notifications: 'Notifications', sales: 'Sales Analytics', hr: 'HR Overview', finance: 'Finance', operations: 'Operations' };

    return (
        <nav className="flex items-center gap-1.5 text-sm mb-6" aria-label="Breadcrumb">
            <span className="text-[var(--muted)]">Home</span>
            {parts.map((part, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    <span className="text-[var(--muted)]">/</span>
                    <span className={i === parts.length - 1 ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--muted)]'}>
                        {labels[part] || part.charAt(0).toUpperCase() + part.slice(1)}
                    </span>
                </span>
            ))}
        </nav>
    );
}

export default function DashboardLayout({ children }) {
    const { sidebarCollapsed, sidebarOpen, setSidebarOpen, toggleSidebar } = useThemeStore();
    const [customizerOpen, setCustomizerOpen] = useState(false);

    return (
        <div className="flex h-screen overflow-hidden bg-[var(--surface-raised)]">
            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={() => setSidebarOpen(false)} />
            )}

            {/* Sidebar - Desktop */}
            <div className={cn('hidden lg:flex flex-col flex-shrink-0 transition-all duration-300', sidebarCollapsed ? 'w-16' : 'w-64')}>
                <Sidebar collapsed={sidebarCollapsed} />
            </div>

            {/* Sidebar - Mobile */}
            <div className={cn('fixed inset-y-0 left-0 z-50 flex flex-col lg:hidden transition-transform duration-300', sidebarOpen ? 'translate-x-0' : '-translate-x-full', 'w-64')}>
                <Sidebar collapsed={false} />
            </div>

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <Navbar onToggleSidebar={() => { if (window.innerWidth < 1024) { setSidebarOpen(!sidebarOpen); } else { toggleSidebar(); } }} />
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-6 max-w-[1600px] mx-auto">
                        <Breadcrumb />
                        {children}
                    </div>
                </main>
            </div>

            {/* Theme Customizer Toggle */}
            <button
                onClick={() => setCustomizerOpen(!customizerOpen)}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-primary-500 text-white p-3 rounded-l-xl shadow-lg hover:bg-primary-600 transition-colors"
                title="Theme Customizer"
            >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="3" /><path d="M19.07 4.93a10 10 0 0 1 0 14.14M4.93 4.93a10 10 0 0 0 0 14.14" />
                </svg>
            </button>

            <ThemeCustomizer open={customizerOpen} onClose={() => setCustomizerOpen(false)} />
        </div>
    );
}
