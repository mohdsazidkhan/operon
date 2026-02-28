'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, TrendingUp, Users, Package, FileText, DollarSign,
    UserCheck, Calendar, ClipboardList, MessageSquare, Folder, Mail,
    Bell, Kanban, ChevronDown, ChevronRight, Settings, Building2,
    BarChart3, ShoppingCart, Receipt, CreditCard, UserCog, Clock,
    Gift, PieChart, X, Handshake, Truck, UserPlus, Star,
    FolderKanban, StickyNote, Megaphone as MegaphoneIcon, ShieldCheck
} from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';

// Each item can have an optional `permission` key.
// Items without a permission key are always shown (e.g. notifications, chat).
const navSections = [
    {
        label: 'DASHBOARDS',
        items: [
            { label: 'Overview', icon: LayoutDashboard, href: '/dashboard', permission: 'dashboard.view' },
            { label: 'Sales Analytics', icon: TrendingUp, href: '/dashboard/sales', permission: 'crm.reports.view' },
            { label: 'HR Overview', icon: UserCheck, href: '/dashboard/hr', permission: 'hrms.employees.view' },
            { label: 'Finance', icon: DollarSign, href: '/dashboard/finance', permission: 'erp.finance.view' },
            { label: 'Operations', icon: BarChart3, href: '/dashboard/operations', permission: 'erp.orders.view' },
        ],
    },
    {
        label: 'CRM',
        items: [
            { label: 'Leads', icon: Users, href: '/crm/leads', permission: 'crm.leads.view' },
            { label: 'Deals', icon: Handshake, href: '/crm/deals', permission: 'crm.deals.view' },
            { label: 'Pipeline', icon: Kanban, href: '/crm/pipeline', permission: 'crm.pipeline.view' },
            { label: 'Contacts', icon: UserCog, href: '/crm/contacts', permission: 'crm.contacts.view' },
            { label: 'Companies', icon: Building2, href: '/crm/companies', permission: 'crm.companies.view' },
        ],
    },
    {
        label: 'ERP',
        items: [
            { label: 'Inventory', icon: Package, href: '/erp/inventory', permission: 'erp.inventory.view' },
            { label: 'Products', icon: Gift, href: '/erp/products', permission: 'erp.products.view' },
            { label: 'Orders', icon: ShoppingCart, href: '/erp/orders', permission: 'erp.orders.view' },
            { label: 'Invoices', icon: Receipt, href: '/erp/invoices', permission: 'erp.invoices.view' },
            { label: 'Purchase Orders', icon: ClipboardList, href: '/erp/purchase-orders', permission: 'erp.purchase-orders.view' },
            { label: 'Vendors', icon: Truck, href: '/erp/vendors', permission: 'erp.vendors.view' },
            { label: 'Credit Notes', icon: FileText, href: '/erp/credit-notes', permission: 'erp.credit-notes.view' },
            { label: 'Budget', icon: PieChart, href: '/erp/budget', permission: 'erp.budget.view' },
            { label: 'Expenses', icon: CreditCard, href: '/erp/expenses', permission: 'erp.expenses.view' },
        ],
    },
    {
        label: 'HRMS',
        items: [
            { label: 'Employees', icon: Users, href: '/hrms/employees', permission: 'hrms.employees.view' },
            { label: 'Departments', icon: Building2, href: '/hrms/departments', permission: 'hrms.departments.view' },
            { label: 'Recruitment', icon: UserPlus, href: '/hrms/recruitment', permission: 'hrms.recruitment.view' },
            { label: 'Performance', icon: Star, href: '/hrms/performance', permission: 'hrms.performance.view' },
            { label: 'Attendance', icon: Clock, href: '/hrms/attendance', permission: 'hrms.attendance.view' },
            { label: 'Leaves', icon: Calendar, href: '/hrms/leaves', permission: 'hrms.leaves.view' },
            { label: 'Payroll', icon: DollarSign, href: '/hrms/payroll', permission: 'hrms.payroll.view' },
            { label: 'HR Analytics', icon: BarChart3, href: '/hrms/analytics', permission: 'hrms.employees.view' },
        ],
    },
    {
        label: 'APPS',
        items: [
            { label: 'Projects', icon: FolderKanban, href: '/apps/projects', permission: 'apps.projects.view' },
            { label: 'Tasks', icon: ClipboardList, href: '/apps/tasks', permission: 'apps.tasks.view' },
            { label: 'Calendar', icon: Calendar, href: '/apps/calendar' },
            { label: 'Kanban Board', icon: Kanban, href: '/apps/kanban' },
            { label: 'Notes', icon: StickyNote, href: '/apps/notes', permission: 'apps.notes.view' },
            { label: 'Chat', icon: MessageSquare, href: '/apps/chat' },
            { label: 'File Manager', icon: Folder, href: '/apps/files' },
            { label: 'Email', icon: Mail, href: '/apps/email' },
            { label: 'Announcements', icon: MegaphoneIcon, href: '/apps/announcements', permission: 'apps.announcements.view' },
            { label: 'Notifications', icon: Bell, href: '/apps/notifications' },
        ],
    },
    {
        label: 'SETTINGS',
        items: [
            { label: 'Users', icon: UserCog, href: '/settings/users', permission: 'settings.users.view' },
            { label: 'Roles & Permissions', icon: ShieldCheck, href: '/settings/roles', permission: 'settings.roles.view' },
            { label: 'Organization', icon: Building2, href: '/settings/organization', permission: 'settings.organization.view' },
            { label: 'Audit Log', icon: Clock, href: '/settings/audit-logs', permission: 'settings.audit-logs.view' },
        ],
    },
];

export default function Sidebar({ collapsed }) {
    const pathname = usePathname();
    const { isDark, logoSize, setSidebarOpen } = useThemeStore();
    const { hasPermission } = useAuthStore();
    const [expandedSections, setExpandedSections] = useState(['DASHBOARDS', 'CRM', 'ERP', 'HRMS', 'APPS']);

    const toggleSection = (label) => {
        setExpandedSections(prev =>
            prev.includes(label) ? prev.filter(s => s !== label) : [...prev, label]
        );
    };

    // Filter items by permission — no permission key means always visible
    const filterItems = (items) => items.filter(item => !item.permission || hasPermission(item.permission));



    return (
        <aside className={cn(
            'sidebar flex flex-col h-full transition-all duration-300 bg-[var(--sidebar-bg)]',
            collapsed ? 'w-16' : 'w-64'
        )}>
            {/* Logo & Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--sidebar-border)]">
                {!collapsed && (
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <img
                            src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                            alt="OPERON Logo"
                            style={{ height: `${logoSize}px` }}
                            className="w-auto object-contain"
                        />
                    </Link>
                )}
                {collapsed && (
                    <Link href="/dashboard" className="flex items-center justify-center w-full">
                        <img
                            src={isDark ? "/logo-dark-sm.png" : "/logo-light-sm.png"}
                            alt="O"
                            style={{ height: `${Math.min(logoSize, 50)}px`, width: `${Math.min(logoSize, 50)}px` }}
                            className="object-contain"
                        />
                    </Link>
                )}

                {/* Mobile Close Button */}
                {!collapsed && (
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-2 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--sidebar-text)]"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            {/* Nav */}
            <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
                {navSections.map((section) => {
                    const visibleItems = filterItems(section.items);
                    if (visibleItems.length === 0) return null;
                    return (
                        <div key={section.label} className="mb-2">
                            {!collapsed && (
                                <button
                                    onClick={() => toggleSection(section.label)}
                                    className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-semibold text-[var(--sidebar-text)] uppercase tracking-wider hover:text-[var(--sidebar-text-hover)] transition-colors"
                                >
                                    <span>{section.label}</span>
                                    {expandedSections.includes(section.label)
                                        ? <ChevronDown size={12} />
                                        : <ChevronRight size={12} />}
                                </button>
                            )}
                            {(collapsed || expandedSections.includes(section.label)) && (
                                <div className="space-y-0.5">
                                    {visibleItems.map((item) => {
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
                                                        ? 'bg-[var(--sidebar-item-active-bg)] text-[var(--sidebar-item-active-text)] border border-[var(--primary-300)]/20'
                                                        : 'text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--surface-overlay)]',
                                                    collapsed && 'justify-center'
                                                )}
                                            >
                                                <item.icon size={18} className={cn('flex-shrink-0', isActive ? 'text-[var(--sidebar-item-active-text)]' : 'text-[var(--sidebar-text)] group-hover:text-[var(--sidebar-text-hover)]')} />
                                                {!collapsed && <span>{item.label}</span>}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="p-2 border-t border-[var(--sidebar-border)]">
                <Link
                    href="/settings"
                    className={cn(
                        "flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-[var(--sidebar-text)] hover:text-[var(--sidebar-text-hover)] hover:bg-[var(--surface-overlay)] transition-colors",
                        collapsed && "justify-center"
                    )}
                    title={collapsed ? "Settings" : undefined}
                >
                    <Settings size={18} />
                    {!collapsed && <span>Settings</span>}
                </Link>
            </div>
        </aside>
    );
}
