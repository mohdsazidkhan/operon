'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';

// Maps path segments to readable labels
const LABEL_MAP = {
    crm: 'CRM',
    hrms: 'HRMS',
    erp: 'ERP',
    apps: 'Apps',
    settings: 'Settings',
    dashboard: 'Dashboard',
    leads: 'Leads',
    contacts: 'Contacts',
    deals: 'Deals',
    pipeline: 'Pipeline',
    companies: 'Companies',
    employees: 'Employees',
    departments: 'Departments',
    recruitment: 'Recruitment',
    performance: 'Performance',
    invoices: 'Invoices',
    'purchase-orders': 'Purchase Orders',
    vendors: 'Vendors',
    'credit-notes': 'Credit Notes',
    budget: 'Budget',
    projects: 'Projects',
    tasks: 'Tasks',
    notes: 'Notes',
    announcements: 'Announcements',
    users: 'Users',
    'audit-logs': 'Audit Log',
    organization: 'Organization',
    roles: 'Roles',
    sales: 'Sales',
    finance: 'Finance',
    hr: 'HR',
    operations: 'Operations',
    notifications: 'Notifications',
    profile: 'Profile',
};

function toLabel(segment) {
    // If ObjectId-like or UUID, return "Detail"
    if (/^[a-f0-9]{24}$/.test(segment) || /^[0-9a-f-]{36}$/.test(segment)) return 'Detail';
    return LABEL_MAP[segment] || segment.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

export default function Breadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter(Boolean);

    if (segments.length === 0) return null;

    const crumbs = [
        { label: <Home size={13} />, href: '/' },
        ...segments.map((seg, i) => ({
            label: toLabel(seg),
            href: '/' + segments.slice(0, i + 1).join('/'),
        })),
    ];

    return (
        <nav className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] flex-wrap">
            {crumbs.map((crumb, i) => (
                <span key={i} className="flex items-center gap-1.5">
                    {i > 0 && <ChevronRight size={11} className="text-[var(--border)]" />}
                    {i === crumbs.length - 1 ? (
                        <span className="font-semibold text-[var(--text-primary)]">{crumb.label}</span>
                    ) : (
                        <Link href={crumb.href} className="hover:text-[var(--primary-500)] transition-colors">
                            {crumb.label}
                        </Link>
                    )}
                </span>
            ))}
        </nav>
    );
}
