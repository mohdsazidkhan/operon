'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, TrendingUp, DollarSign, Target, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const STAGES = ['all', 'prospecting', 'qualification', 'proposal', 'negotiation', 'closed_won', 'closed_lost'];

const STAGE_CONFIG = {
    prospecting: { label: 'Prospecting', color: 'text-blue-500 bg-blue-500/10 border-blue-500/20' },
    qualification: { label: 'Qualification', color: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20' },
    proposal: { label: 'Proposal', color: 'text-purple-500 bg-purple-500/10 border-purple-500/20' },
    negotiation: { label: 'Negotiation', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20' },
    closed_won: { label: 'Won', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' },
    closed_lost: { label: 'Lost', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20' },
};

const EMPTY_DEAL = {
    title: '', value: 0, currency: 'USD', stage: 'prospecting',
    probability: 25, expectedCloseDate: '', notes: []
};

export default function DealsPage() {
    const [deals, setDeals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editDeal, setEditDeal] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_DEAL);
    const [deleteId, setDeleteId] = useState(null);

    const fetchDeals = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({ stage: filter === 'all' ? '' : filter, search });
            const res = await fetch(`/api/deals?${params}`);
            const data = await res.json();
            if (data.success) setDeals(data.data || []);
        } catch { toast.error('Failed to fetch deals'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDeals(); }, [filter, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editDeal ? 'PUT' : 'POST';
            const url = editDeal ? `/api/deals/${editDeal._id}` : '/api/deals';
            const res = await fetch(url, {
                method, headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editDeal ? 'Deal updated!' : 'Deal created!');
                setShowAdd(false);
                setEditDeal(null);
                setForm(EMPTY_DEAL);
                fetchDeals();
            } else toast.error(data.message || 'Failed');
        } catch { toast.error('Failed to save deal'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        try {
            await fetch(`/api/deals/${id}`, { method: 'DELETE' });
            toast.success('Deal deleted');
            setDeleteId(null);
            fetchDeals();
        } catch { toast.error('Failed to delete'); }
    };

    const openEdit = (deal) => {
        setForm({
            title: deal.title, value: deal.value, currency: deal.currency || 'USD',
            stage: deal.stage, probability: deal.probability,
            expectedCloseDate: deal.expectedCloseDate ? deal.expectedCloseDate.slice(0, 10) : '',
        });
        setEditDeal(deal);
        setShowAdd(true);
    };

    const totalPipeline = deals.filter(d => !['closed_won', 'closed_lost'].includes(d.stage)).reduce((s, d) => s + (d.value || 0), 0);
    const wonValue = deals.filter(d => d.stage === 'closed_won').reduce((s, d) => s + (d.value || 0), 0);
    const winRate = deals.length > 0 ? Math.round((deals.filter(d => d.stage === 'closed_won').length / deals.length) * 100) : 0;

    const stageCounts = STAGES.slice(1).reduce((acc, s) => {
        acc[s] = deals.filter(d => d.stage === s).length;
        return acc;
    }, {});

    const filtered = filter === 'all' ? deals : deals.filter(d => d.stage === filter);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Add/Edit Deal Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditDeal(null); setForm(EMPTY_DEAL); }}
                title={editDeal ? 'Edit Deal' : 'New Deal'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <FormField label="Deal Title" required>
                                <input required className={inputCls} placeholder="e.g. Enterprise License - Acme Corp"
                                    value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                            </FormField>
                        </div>
                        <FormField label="Deal Value ($)">
                            <input type="number" min="0" className={inputCls} placeholder="0"
                                value={form.value} onChange={e => setForm(p => ({ ...p, value: +e.target.value }))} />
                        </FormField>
                        <FormField label="Stage">
                            <select className={inputCls} value={form.stage} onChange={e => setForm(p => ({ ...p, stage: e.target.value }))}>
                                {STAGES.slice(1).map(s => <option key={s} value={s}>{STAGE_CONFIG[s]?.label || s}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Probability (%)">
                            <input type="number" min="0" max="100" className={inputCls} placeholder="25"
                                value={form.probability} onChange={e => setForm(p => ({ ...p, probability: +e.target.value }))} />
                        </FormField>
                        <FormField label="Expected Close Date">
                            <input type="date" className={inputCls} value={form.expectedCloseDate}
                                onChange={e => setForm(p => ({ ...p, expectedCloseDate: e.target.value }))} />
                        </FormField>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditDeal(null); setForm(EMPTY_DEAL); }}
                        loading={saving} submitLabel={editDeal ? 'Update Deal' : 'Create Deal'} />
                </form>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Deal" size="sm">
                <p className="text-sm text-[var(--text-secondary)] mb-6">Are you sure you want to delete this deal? This action cannot be undone.</p>
                <div className="flex gap-3 justify-end">
                    <button onClick={() => setDeleteId(null)} className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all">Cancel</button>
                    <button onClick={() => handleDelete(deleteId)} className="px-4 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-sm font-semibold transition-all">Delete</button>
                </div>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Deals</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{deals.length} total deals in pipeline</p>
                </div>
                <button onClick={() => { setForm(EMPTY_DEAL); setEditDeal(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> New Deal
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Pipeline Value', value: formatCurrency(totalPipeline), icon: TrendingUp, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Closed Won', value: formatCurrency(wonValue), icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' },
                    { label: 'Total Deals', value: deals.length, icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn('p-2 rounded-xl', kpi.color)}><kpi.icon size={18} /></div>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{kpi.label}</span>
                        </div>
                        <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Stage Filter Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
                {[{ label: 'All', value: 'all', count: deals.length }, ...STAGES.slice(1).map(s => ({
                    label: STAGE_CONFIG[s]?.label || s, value: s, count: stageCounts[s] || 0
                }))].map(tab => (
                    <button key={tab.value} onClick={() => setFilter(tab.value)}
                        className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                            filter === tab.value
                                ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]'
                                : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                        {tab.label} <span className="ml-1 opacity-70">{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deals..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                    </div>
                </div>

                {/* Mobile card view */}
                <div className="block sm:hidden divide-y divide-[var(--border)]">
                    {loading ? (
                        <div className="py-12 text-center text-[var(--text-muted)] text-sm">Loading deals...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-12 text-center text-[var(--text-muted)] text-sm">No deals found</div>
                    ) : filtered.map(deal => (
                        <div key={deal._id} className="p-4 space-y-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <p className="font-semibold text-[var(--text-primary)] text-sm">{deal.title}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-0.5">{formatDate(deal.expectedCloseDate)}</p>
                                </div>
                                <span className={cn('text-[10px] font-bold uppercase px-2 py-1 rounded-full border whitespace-nowrap', STAGE_CONFIG[deal.stage]?.color || '')}>
                                    {STAGE_CONFIG[deal.stage]?.label || deal.stage}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-base font-black text-[var(--text-primary)]">{formatCurrency(deal.value)}</span>
                                <div className="flex gap-1">
                                    <button onClick={() => openEdit(deal)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={14} /></button>
                                    <button onClick={() => setDeleteId(deal._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <div className="w-full bg-[var(--surface-overlay)] rounded-full h-1.5">
                                <div className="h-full bg-[var(--primary-500)] rounded-full" style={{ width: `${deal.probability || 0}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table view */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-3.5 px-5">Deal</th>
                                <th className="py-3.5 px-5">Stage</th>
                                <th className="py-3.5 px-5 text-right">Value</th>
                                <th className="py-3.5 px-5">Probability</th>
                                <th className="py-3.5 px-5">Close Date</th>
                                <th className="py-3.5 px-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">Loading deals...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">No deals found</td></tr>
                            ) : filtered.map(deal => (
                                <tr key={deal._id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors group">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-sm flex-shrink-0">
                                                {deal.title?.[0] || 'D'}
                                            </div>
                                            <p className="text-sm font-semibold text-[var(--text-primary)] line-clamp-1">{deal.title}</p>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5">
                                        <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', STAGE_CONFIG[deal.stage]?.color || '')}>
                                            {STAGE_CONFIG[deal.stage]?.label || deal.stage}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 text-sm font-bold text-right text-[var(--text-primary)]">{formatCurrency(deal.value)}</td>
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-2 min-w-[80px]">
                                            <div className="flex-1 h-1.5 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
                                                <div className="h-full bg-[var(--primary-500)] rounded-full" style={{ width: `${deal.probability || 0}%` }} />
                                            </div>
                                            <span className="text-xs text-[var(--text-muted)]">{deal.probability || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[var(--text-muted)]">{formatDate(deal.expectedCloseDate)}</td>
                                    <td className="py-4 px-5">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEdit(deal)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={15} /></button>
                                            <button onClick={() => setDeleteId(deal._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={15} /></button>
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
