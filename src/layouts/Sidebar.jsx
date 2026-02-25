'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, TrendingUp, Users, Package, FileText, DollarSign,
    UserCheck, Calendar, ClipboardList, MessageSquare, Folder, Mail,
    Bell, Kanban, ChevronDown, ChevronRight, Settings, Building2,
    BarChart3, ShoppingCart, Receipt, CreditCard, UserCog, Clock,
    Gift, PieChart, X
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/useThemeStore';

const navSections = [
    {
        label: 'DASHBOARDS',
        items: [
            { label: 'Overview', icon: LayoutDashboard, href: '/dashboard' },
            { label: 'Sales Analytics', icon: TrendingUp, href: '/dashboard/sales' },
            { label: 'HR Overview', icon: UserCheck, href: '/dashboard/hr' },
            { label: 'Finance', icon: DollarSign, href: '/dashboard/finance' },
            { label: 'Operations', icon: BarChart3, href: '/dashboard/operations' },
        ],
    },
    {
        label: 'CRM',
        items: [
            { label: 'Leads', icon: Users, href: '/crm/leads' },
            { label: 'Pipeline', icon: Kanban, href: '/crm/pipeline' },
            { label: 'Contacts', icon: UserCog, href: '/crm/contacts' },
            { label: 'Companies', icon: Building2, href: '/crm/companies' },
        ],
    },
    {
        label: 'ERP',
        items: [
            { label: 'Inventory', icon: Package, href: '/erp/inventory' },
            { label: 'Products', icon: Gift, href: '/erp/products' },
            { label: 'Orders', icon: ShoppingCart, href: '/erp/orders' },
            { label: 'Invoices', icon: Receipt, href: '/erp/invoices' },
            { label: 'Expenses', icon: CreditCard, href: '/erp/expenses' },
            { label: 'Finance Reports', icon: PieChart, href: '/erp/reports' },
        ],
    },
    {
        label: 'HRMS',
        items: [
            { label: 'Employees', icon: Users, href: '/hrms/employees' },
            { label: 'Attendance', icon: Clock, href: '/hrms/attendance' },
            { label: 'Leaves', icon: Calendar, href: '/hrms/leaves' },
            { label: 'Payroll', icon: DollarSign, href: '/hrms/payroll' },
            { label: 'HR Analytics', icon: BarChart3, href: '/hrms/analytics' },
        ],
    },
    {
        label: 'APPS',
        items: [
            { label: 'Calendar', icon: Calendar, href: '/apps/calendar' },
            { label: 'Kanban Board', icon: Kanban, href: '/apps/kanban' },
            { label: 'Chat', icon: MessageSquare, href: '/apps/chat' },
            { label: 'File Manager', icon: Folder, href: '/apps/files' },
            { label: 'Email', icon: Mail, href: '/apps/email' },
            { label: 'Notifications', icon: Bell, href: '/apps/notifications' },
        ],
    },
];

export default function Sidebar({ collapsed }) {
    const pathname = usePathname();
    const { setSidebarOpen } = useThemeStore();
    const [expandedSections, setExpandedSections] = useState(['DASHBOARDS', 'CRM', 'ERP', 'HRMS', 'APPS']);

    const toggleSection = (label) => {
        setExpandedSections(prev =>
            prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
        );
    };

    return (
        <aside className={cn(
            'sidebar flex flex-col h-full transition-all duration-300',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo */}
            <div className="flex items-center justify-between h-16 px-4 border-b border-white/10">
                {!collapsed && (
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm">O</div>
                        <span className="text-white font-bold text-xl tracking-tight">OPERON</span>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold text-sm mx-auto">O</div>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {navSections.map((section) => (
                    <div key={section.label} className="mb-2">
                        {!collapsed && (
                            <button
                                onClick={() => toggleSection(section.label)}
                                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider hover:text-slate-400 transition-colors"
                            >
                                <span>{section.label}</span>
                                {expandedSections.includes(section.label)
                                    ? <ChevronDown size={12} />
                                    : <ChevronRight size={12} />}
                            </button>
                        )}
                        {(collapsed || expandedSections.includes(section.label)) && (
                            <div className="space-y-0.5">
                                {section.items.map((item) => {
                                    const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            onClick={() => setSidebarOpen(false)}
                                            title={collapsed ? item.label : undefined}
                                            className={cn(
                                                'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 group',
                                                isActive
                                                    ? 'bg-primary-500/20 text-primary-400 border border-primary-500/20'
                                                    : 'text-slate-400 hover:text-white hover:bg-white/5',
                                                collapsed && 'justify-center'
                                            )}
                                        >
                                            <item.icon size={18} className={cn('flex-shrink-0', isActive ? 'text-primary-400' : 'text-slate-500 group-hover:text-white')} />
                                            {!collapsed && <span>{item.label}</span>}
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </nav>

            {/* Footer */}
            {!collapsed && (
                <div className="p-4 border-t border-white/10">
                    <Link href="/settings" className="flex items-center gap-2 text-slate-500 hover:text-white text-sm transition-colors">
                        <Settings size={16} />
                        <span>Settings</span>
                    </Link>
                </div>
            )}
        </aside>
    );
}
