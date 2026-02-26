'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Send, Eye, Download, Printer, Filter, MoreHorizontal } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';

const STATUS_OPTIONS = ['all', 'paid', 'sent', 'draft', 'overdue'];

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchInvoices = async () => {
            try {
                const res = await fetch(`/api/invoices?status=${filter === 'all' ? '' : filter}&search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setInvoices(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch invoices:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchInvoices();
    }, [filter, search]);

    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const totalPending = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const totalInvoiced = totalPaid + totalPending;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Invoices</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{invoices.length} billing records found</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface-overlay)] hover:bg-[var(--surface-overlay)] text-[var(--text-primary)] rounded-xl font-medium text-sm transition-all border border-[var(--border)]">
                        <Printer size={16} /> Print Reports
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20 font-bold uppercase tracking-wider">
                        <Plus size={16} /> Create Invoice
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Paid', value: totalPaid, color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                    { label: 'Outstanding', value: totalPending, color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
                    { label: 'Total Volume', value: totalInvoiced, color: 'text-[var(--primary-500)]', border: 'border-[var(--primary-500)]/20', bg: 'bg-[var(--primary-500)]/5' },
                ].map((stat, i) => (
                    <div key={i} className={cn('rounded-3xl p-6 border backdrop-blur-sm shadow-xl relative overflow-hidden group', stat.border, stat.bg)}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] mb-2">{stat.label}</p>
                        <p className={cn('text-3xl font-black tracking-tight', stat.color)}>{formatCurrency(stat.value)}</p>
                        <div className="mt-4 flex items-center gap-2">
                            <span className="w-8 h-1 bg-[var(--border)] rounded-full overflow-hidden">
                                <div className={cn('h-full bg-current rounded-full', stat.color)} style={{ width: '65%' }}></div>
                            </span>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] italic">Target alignment: 92%</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Table */}
            <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-2xl border border-[var(--card-border)] shadow-xl overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                    <div className="flex bg-[var(--surface-overlay)]/50 p-1 rounded-xl border border-[var(--border)]">
                        {STATUS_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    'px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all whitespace-nowrap',
                                    filter === s
                                        ? 'bg-[var(--primary-500)] text-white shadow-lg shadow-[var(--primary-500)]/20'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-80">
                        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Find invoice or client..."
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)] transition-all font-medium placeholder:text-[var(--text-muted)]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] bg-[var(--surface-overlay)]/30">
                            <tr>
                                <th className="py-5 px-6">Billed To</th>
                                <th className="py-5 px-6">Reference ID</th>
                                <th className="py-5 px-6 text-right">Total Amount</th>
                                <th className="py-5 px-6">Status</th>
                                <th className="py-5 px-6">Issue Date</th>
                                <th className="py-5 px-6">Due Date</th>
                                <th className="py-5 px-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-16 bg-[var(--surface-overlay)]/20">
                                        <td colSpan="7"></td>
                                    </tr>
                                ))
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="7" className="py-16 text-center text-[var(--text-muted)] font-bold uppercase tracking-widest text-xs">No billing records identified</td></tr>
                            ) : invoices.map(inv => (
                                <tr key={inv._id} className="hover:bg-[var(--surface-overlay)]/50 transition-colors group">
                                    <td className="py-4 px-6">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-lg bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-sm">
                                                {inv.clientName?.[0] || 'C'}
                                            </div>
                                            <span className="text-sm font-bold text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight">
                                                {inv.clientName}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-6 text-xs font-mono font-bold text-[var(--text-muted)] tracking-wider">
                                        {inv.invoiceNumber}
                                    </td>
                                    <td className="py-4 px-6 text-sm font-black text-[var(--text-primary)] text-right">
                                        {formatCurrency(inv.total)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={cn('text-[10px] px-3 py-1 rounded-full font-black uppercase border tracking-[0.1em]', getStatusColor(inv.status))}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-xs font-bold text-[var(--text-muted)]">
                                        {formatDate(inv.issueDate)}
                                    </td>
                                    <td className="py-4 px-6">
                                        <span className={cn('text-xs font-bold', inv.status === 'overdue' ? 'text-rose-500 animate-pulse' : 'text-[var(--text-muted)]')}>
                                            {formatDate(inv.dueDate)}
                                        </span>
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all translate-x-2 group-hover:translate-x-0">
                                            <button className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-blue-500 transition-all" title="View"><Eye size={16} /></button>
                                            <button className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-emerald-500 transition-all" title="Send"><Send size={16} /></button>
                                            <button className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all" title="Download"><Download size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
