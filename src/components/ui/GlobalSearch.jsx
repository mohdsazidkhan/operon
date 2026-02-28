'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, TrendingUp, FileText, Users, Building2, Briefcase, ChevronRight, Clock, FolderKanban } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { cn, getInitials } from '@/lib/utils';

const STATIC_SHORTCUTS = [
    { label: 'Deals Pipeline', href: '/crm/deals', icon: TrendingUp, category: 'CRM' },
    { label: 'All Leads', href: '/crm/leads', icon: FileText, category: 'CRM' },
    { label: 'All Contacts', href: '/crm/contacts', icon: Users, category: 'CRM' },
    { label: 'Employees', href: '/hrms/employees', icon: Users, category: 'HRMS' },
    { label: 'Departments', href: '/hrms/departments', icon: Building2, category: 'HRMS' },
    { label: 'Invoices', href: '/erp/invoices', icon: FileText, category: 'ERP' },
    { label: 'Purchase Orders', href: '/erp/purchase-orders', icon: Briefcase, category: 'ERP' },
    { label: 'Projects', href: '/apps/projects', icon: FolderKanban, category: 'Apps' },
    { label: 'Tasks', href: '/apps/tasks', icon: Briefcase, category: 'Apps' },
    { label: 'Users', href: '/settings/users', icon: Users, category: 'Settings' },
    { label: 'Audit Log', href: '/settings/audit-logs', icon: Clock, category: 'Settings' },
    { label: 'Roles & Permissions', href: '/settings/roles', icon: FileText, category: 'Settings' },
    { label: 'Organization', href: '/settings/organization', icon: Building2, category: 'Settings' },
];

export default function GlobalSearch({ isOpen, onClose }) {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState({ leads: [], contacts: [], employees: [], deals: [] });
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState(0);
    const router = useRouter();
    const inputRef = useRef(null);

    useEffect(() => {
        if (isOpen) { setQuery(''); setResults({ leads: [], contacts: [], employees: [], deals: [] }); setSelected(0); setTimeout(() => inputRef.current?.focus(), 100); }
    }, [isOpen]);

    const searchAll = useCallback(async (q) => {
        if (!q.trim()) { setResults({ leads: [], contacts: [], employees: [], deals: [] }); return; }
        setLoading(true);
        try {
            const [leadsRes, contactsRes, empRes, dealsRes] = await Promise.all([
                fetch(`/api/leads?search=${q}&limit=5`),
                fetch(`/api/contacts?search=${q}&limit=5`),
                fetch(`/api/employees?search=${q}&limit=5`),
                fetch(`/api/deals?search=${q}&limit=5`),
            ]);
            const [leads, contacts, emps, deals] = await Promise.all([leadsRes.json(), contactsRes.json(), empRes.json(), dealsRes.json()]);
            setResults({ leads: leads.data || [], contacts: contacts.data || [], employees: emps.data || [], deals: deals.data || [] });
        } catch { }
        finally { setLoading(false); }
    }, []);

    useEffect(() => {
        const t = setTimeout(() => searchAll(query), 300);
        return () => clearTimeout(t);
    }, [query, searchAll]);

    const filteredShortcuts = STATIC_SHORTCUTS.filter(s => !query || s.label.toLowerCase().includes(query.toLowerCase()) || s.category.toLowerCase().includes(query.toLowerCase()));

    const allItems = [
        ...filteredShortcuts.map(s => ({ type: 'shortcut', ...s })),
        ...results.leads.map(l => ({ type: 'lead', label: l.name, sub: l.company, href: `/crm/leads/${l._id}`, icon: FileText, category: 'Lead' })),
        ...results.contacts.map(c => ({ type: 'contact', label: c.name, sub: c.company?.name, href: `/crm/contacts/${c._id}`, icon: Users, category: 'Contact' })),
        ...results.employees.map(e => ({ type: 'employee', label: e.name, sub: e.department, href: `/hrms/employees/${e._id}`, icon: Users, category: 'Employee' })),
        ...results.deals.map(d => ({ type: 'deal', label: d.title, sub: d.stage, href: `/crm/deals`, icon: TrendingUp, category: 'Deal' })),
    ].slice(0, 12);

    const navigate = (item) => {
        router.push(item.href);
        onClose();
    };

    useEffect(() => {
        const handler = (e) => {
            if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(p => Math.min(p + 1, allItems.length - 1)); }
            if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(p => Math.max(p - 1, 0)); }
            if (e.key === 'Enter' && allItems[selected]) navigate(allItems[selected]);
            if (e.key === 'Escape') onClose();
        };
        if (isOpen) document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [isOpen, allItems, selected]);

    if (!isOpen) return null;

    const CATEGORY_COLORS = { CRM: 'text-blue-500 bg-blue-500/10', HRMS: 'text-indigo-500 bg-indigo-500/10', ERP: 'text-emerald-500 bg-emerald-500/10', Apps: 'text-amber-500 bg-amber-500/10', Settings: 'text-rose-500 bg-rose-500/10', Lead: 'text-purple-500 bg-purple-500/10', Contact: 'text-cyan-500 bg-cyan-500/10', Employee: 'text-indigo-500 bg-indigo-500/10', Deal: 'text-blue-500 bg-blue-500/10' };

    return (
        <div className="fixed inset-0 z-[1000] flex items-start justify-center pt-[15vh] px-4" onClick={onClose}>
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
            <div className="relative w-full max-w-2xl animate-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
                {/* Search input */}
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-2xl overflow-hidden">
                    <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[var(--border)]">
                        <Search size={18} className="text-[var(--text-muted)] flex-shrink-0" />
                        <input ref={inputRef} value={query} onChange={e => setQuery(e.target.value)}
                            placeholder="Search anything — leads, contacts, employees, pages..."
                            className="flex-1 bg-transparent text-[var(--text-primary)] placeholder:text-[var(--text-muted)] text-sm focus:outline-none" />
                        {query && <button onClick={() => setQuery('')} className="p-1 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] transition-all"><X size={14} /></button>}
                        <kbd className="hidden sm:flex items-center gap-1 px-1.5 py-0.5 rounded-md border border-[var(--border)] text-[var(--text-muted)] text-xs">Esc</kbd>
                    </div>

                    {/* Results */}
                    {allItems.length > 0 ? (
                        <div className="py-2 max-h-80 overflow-y-auto">
                            {allItems.map((item, i) => (
                                <button key={i} onClick={() => navigate(item)} onMouseEnter={() => setSelected(i)}
                                    className={cn('w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all', selected === i ? 'bg-[var(--primary-500)]/10' : 'hover:bg-[var(--surface-overlay)]')}>
                                    <div className={cn('p-1.5 rounded-lg flex-shrink-0', CATEGORY_COLORS[item.category] || 'text-[var(--text-muted)] bg-[var(--surface-overlay)]')}><item.icon size={13} /></div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-[var(--text-primary)] truncate">{item.label}</p>
                                        {item.sub && <p className="text-xs text-[var(--text-muted)] truncate">{item.sub}</p>}
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md', CATEGORY_COLORS[item.category] || '')}>{item.category}</span>
                                        {selected === i && <ChevronRight size={12} className="text-[var(--primary-500)]" />}
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : query ? (
                        <div className="py-10 text-center text-sm text-[var(--text-muted)]">
                            {loading ? 'Searching...' : `No results for "${query}"`}
                        </div>
                    ) : (
                        <div className="py-3 px-4">
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Quick Links</p>
                            {STATIC_SHORTCUTS.slice(0, 6).map((s, i) => (
                                <button key={i} onClick={() => navigate(s)} className="w-full flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-[var(--surface-overlay)] transition-all text-left">
                                    <div className={cn('p-1.5 rounded-lg', CATEGORY_COLORS[s.category] || '')}><s.icon size={13} /></div>
                                    <span className="text-sm text-[var(--text-primary)]">{s.label}</span>
                                    <span className={cn('ml-auto text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-md', CATEGORY_COLORS[s.category] || '')}>{s.category}</span>
                                </button>
                            ))}
                        </div>
                    )}

                    <div className="px-4 py-2.5 border-t border-[var(--border)] flex items-center gap-3 text-xs text-[var(--text-muted)]">
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] font-mono">↑↓</kbd> navigate</span>
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] font-mono">↵</kbd> open</span>
                        <span className="flex items-center gap-1"><kbd className="px-1.5 py-0.5 rounded border border-[var(--border)] font-mono">Esc</kbd> close</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
