'use client';

import { useState, useEffect } from 'react';
import { Search, Shield, Clock, User, FileText, Filter, RefreshCw } from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const ACTION_COLORS = {
    create: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    update: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    delete: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    login: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    logout: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200',
    export: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
};

const renderDetails = (details) => {
    if (!details) return '—';
    if (typeof details === 'string') return details;
    if (typeof details === 'object') {
        try {
            return JSON.stringify(details).replace(/[{}"]/g, '').replace(/:/g, ': ');
        } catch {
            return '[Object]';
        }
    }
    return String(details);
};

export default function AuditLogPage() {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterAction, setFilterAction] = useState('all');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const PER_PAGE = 25;

    const fetchLogs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/audit-logs?page=${page}&limit=${PER_PAGE}&action=${filterAction === 'all' ? '' : filterAction}&search=${search}`);
            const data = await res.json();
            if (data.success) { setLogs(data.data || []); setTotal(data.total || 0); }
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchLogs(); }, [page, filterAction, search]);

    const actions = ['all', 'create', 'update', 'delete', 'login', 'logout', 'export'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Audit Log</h1>
                    <p className="text-[var(--text-muted)] text-sm">{total} events recorded</p>
                </div>
                <button onClick={fetchLogs} className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all">
                    <RefreshCw size={14} /> Refresh
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search logs..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {actions.map(a => (
                        <button key={a} onClick={() => { setFilterAction(a); setPage(1); }}
                            className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                                filterAction === a ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {a.charAt(0).toUpperCase() + a.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Log Table */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
                {/* Mobile */}
                <div className="block sm:hidden divide-y divide-[var(--border)]">
                    {loading ? <div className="py-12 text-center text-sm text-[var(--text-muted)]">Loading...</div>
                        : logs.length === 0 ? <div className="py-12 text-center text-sm text-[var(--text-muted)]">No audit logs found</div>
                            : logs.map((log, i) => (
                                <div key={i} className="p-4 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', ACTION_COLORS[log.action] || '')}>{log.action}</span>
                                        <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(log.createdAt)}</span>
                                    </div>
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{log.resource}</p>
                                    <p className="text-xs text-[var(--text-muted)] truncate">{renderDetails(log.details || log.description)}</p>
                                    <p className="text-xs text-[var(--text-muted)]">{log.user?.name || log.userName || 'System'}</p>
                                </div>
                            ))}
                </div>
                {/* Desktop */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-3.5 px-5">Time</th>
                                <th className="py-3.5 px-5">User</th>
                                <th className="py-3.5 px-5">Action</th>
                                <th className="py-3.5 px-5">Resource</th>
                                <th className="py-3.5 px-5">Details</th>
                                <th className="py-3.5 px-5">IP</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">Loading audit logs...</td></tr>
                                : logs.length === 0 ? <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">No audit logs found</td></tr>
                                    : logs.map((log, i) => (
                                        <tr key={i} className="hover:bg-[var(--surface-overlay)]/40 transition-colors">
                                            <td className="py-3.5 px-5">
                                                <p className="text-xs font-mono text-[var(--text-primary)]">{formatDate(log.createdAt)}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{formatRelativeTime(log.createdAt)}</p>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">{log.user?.name || log.userName || 'System'}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{log.user?.email || log.userEmail}</p>
                                            </td>
                                            <td className="py-3.5 px-5">
                                                <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', ACTION_COLORS[log.action] || '')}>{log.action}</span>
                                            </td>
                                            <td className="py-3.5 px-5 text-sm text-[var(--text-secondary)]">{log.resource}</td>
                                            <td className="py-3.5 px-5 text-xs text-[var(--text-muted)] max-w-[200px] truncate" title={typeof log.details === 'object' ? JSON.stringify(log.details) : (log.details || log.description)}>
                                                {renderDetails(log.details || log.description)}
                                            </td>
                                            <td className="py-3.5 px-5 text-xs font-mono text-[var(--text-muted)]">{log.ipAddress || '—'}</td>
                                        </tr>
                                    ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {total > PER_PAGE && (
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-[var(--border)]">
                        <p className="text-xs text-[var(--text-muted)]">Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, total)} of {total}</p>
                        <div className="flex gap-2">
                            <button disabled={page <= 1} onClick={() => setPage(p => p - 1)}
                                className="px-3 py-1.5 rounded-xl text-xs border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-40 hover:bg-[var(--surface-overlay)] transition-all">Prev</button>
                            <button disabled={page * PER_PAGE >= total} onClick={() => setPage(p => p + 1)}
                                className="px-3 py-1.5 rounded-xl text-xs border border-[var(--border)] text-[var(--text-muted)] disabled:opacity-40 hover:bg-[var(--surface-overlay)] transition-all">Next</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
