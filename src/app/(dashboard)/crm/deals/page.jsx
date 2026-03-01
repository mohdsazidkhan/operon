'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye, TrendingUp, DollarSign, Target, CheckCircle, XCircle, MoreHorizontal } from 'lucide-react';
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';

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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const [deleteId, setDeleteId] = useState(null);

    const canCreate = usePermission('crm.deals.create');
    const canEdit = usePermission('crm.deals.edit');
    const canDelete = usePermission('crm.deals.delete');

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

    const handleAction = async (id, action) => {
        try {
            const res = await fetch(`/api/deals/${id}/${action}`, { method: 'POST' });
            const data = await res.json();
            if (data.success) {
                toast.success(`Deal ${action === 'approve' ? 'Approved' : 'Rejected'}`);
                fetchDeals();
            } else toast.error(data.message);
        } catch { toast.error('Action failed'); }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/deals/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Deal deleted');
                setDeleteId(null);
                fetchDeals();
            } else toast.error(data.message);
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
                {isMounted && (
                    <Can permission="crm.deals.create">
                        <button onClick={() => { setForm(EMPTY_DEAL); setEditDeal(null); setShowAdd(true); }}
                            className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                            <Plus size={18} /> New Opportunity
                        </button>
                    </Can>
                )}
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Pipeline Value', value: formatCurrency(totalPipeline), icon: TrendingUp, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Closed Won', value: formatCurrency(wonValue), icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Win Rate', value: `${winRate}%`, icon: Target, color: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' },
                    { label: 'Total Deals', value: deals.length, icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' },
                ].map((kpi, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <div className={cn('p-2 rounded-xl', kpi.color)}><kpi.icon size={18} /></div>
                            <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{kpi.label}</span>
                        </div>
                        <p className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{kpi.value}</p>
                    </div>
                ))}
            </div>

            {/* Stage Filter Tabs */}
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                {[{ label: 'All', value: 'all', count: deals.length }, ...STAGES.slice(1).map(s => ({
                    label: STAGE_CONFIG[s]?.label || s, value: s, count: stageCounts[s] || 0
                }))].map(tab => (
                    <button key={tab.value} onClick={() => setFilter(tab.value)}
                        className={cn('px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider whitespace-nowrap border transition-all min-w-[120px]',
                            filter === tab.value
                                ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/20'
                                : 'bg-[var(--surface)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                        {tab.label} <span className={cn('ml-2 opacity-60', filter === tab.value ? 'text-white' : 'text-[var(--primary-500)]')}>{tab.count}</span>
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden">
                <div className="flex items-center gap-3 p-4 border-b border-[var(--border)] bg-[var(--surface)]/50">
                    <div className="relative flex-1 max-w-md">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search deal title..."
                            className="w-full pl-11 pr-4 py-3 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all" />
                    </div>
                </div>

                {/* Mobile card view */}
                <div className="block sm:hidden divide-y divide-[var(--border)]">
                    {loading ? (
                        <div className="py-16 text-center text-[var(--text-muted)] text-sm font-black uppercase tracking-widest">Syncing Deals...</div>
                    ) : filtered.length === 0 ? (
                        <div className="py-16 text-center text-[var(--text-muted)] text-sm font-black uppercase tracking-widest">No matching deals</div>
                    ) : filtered.map(deal => (
                        <div key={deal._id} className="p-4 space-y-4 bg-[var(--surface)]/20">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-black text-base shadow-inner">
                                        {deal.title?.[0] || 'D'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-[var(--text-primary)] leading-tight line-clamp-1">{deal.title}</p>
                                        <p className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-wider mt-1">{formatDate(deal.expectedCloseDate)}</p>
                                    </div>
                                </div>
                                <span className={cn('text-[9px] font-black uppercase px-2 py-1 rounded-lg border whitespace-nowrap', STAGE_CONFIG[deal.stage]?.color || '')}>
                                    {STAGE_CONFIG[deal.stage]?.label || deal.stage}
                                </span>
                            </div>
                            <div className="flex items-center justify-between pt-2">
                                <span className="text-base font-black text-[var(--text-primary)] tracking-tighter">{formatCurrency(deal.value)}</span>
                                <div className="flex gap-2">
                                    <Can permission="crm.deals.edit">
                                        <button onClick={() => openEdit(deal)} className="p-3 rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] transition-all active:scale-90 border border-[var(--border)]"><Edit size={16} /></button>
                                    </Can>
                                    <Can permission="crm.deals.delete">
                                        <button onClick={() => setDeleteId(deal._id)} className="p-3 rounded-xl bg-rose-500/10 text-rose-500 transition-all active:scale-90 border border-rose-500/20"><Trash2 size={16} /></button>
                                    </Can>
                                </div>
                            </div>
                            <div className="w-full bg-[var(--surface-overlay)] rounded-full h-1.5 overflow-hidden">
                                <div className="h-full bg-[var(--primary-500)] rounded-full shadow-[0_0_8px_var(--primary-500)]" style={{ width: `${deal.probability || 0}%` }} />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Desktop table view */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-5 px-6">Deal Title</th>
                                <th className="py-5 px-6">Stage</th>
                                <th className="py-5 px-6 text-right">Value</th>
                                <th className="py-5 px-6">Probability</th>
                                <th className="py-5 px-6">Close Date</th>
                                <th className="py-5 px-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan="6" className="py-16 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs">Syncing Deals...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="py-16 text-center text-[var(--text-muted)] font-black uppercase tracking-widest text-xs">No matching deals found</td></tr>
                            ) : filtered.map(deal => (
                                <tr key={deal._id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors group">
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-black text-base shadow-sm">
                                                {deal.title?.[0] || 'D'}
                                            </div>
                                            <p className="text-sm font-bold text-[var(--text-primary)] line-clamp-1">{deal.title}</p>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <span className={cn('text-[9px] font-black uppercase px-2.5 py-1 rounded-lg border', STAGE_CONFIG[deal.stage]?.color || '')}>
                                            {STAGE_CONFIG[deal.stage]?.label || deal.stage}
                                        </span>
                                    </td>
                                    <td className="py-5 px-6 text-sm font-black text-right text-[var(--text-primary)] tracking-tighter">{formatCurrency(deal.value)}</td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-3 min-w-[100px]">
                                            <div className="flex-1 h-1.5 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
                                                <div className="h-full bg-[var(--primary-500)] rounded-full shadow-[0_0_8px_var(--primary-500)]" style={{ width: `${deal.probability || 0}%` }} />
                                            </div>
                                            <span className="text-[10px] font-bold text-[var(--text-muted)]">{deal.probability || 0}%</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center gap-2">
                                            {deal.requiresApproval && (
                                                <span className={cn(
                                                    'text-[9px] font-black uppercase px-2 py-1 rounded-lg border flex items-center gap-1',
                                                    deal.approvalStatus === 'approved' ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' :
                                                        deal.approvalStatus === 'rejected' ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' :
                                                            'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                                )}>
                                                    {deal.approvalStatus === 'approved' ? <Check size={10} /> : deal.approvalStatus === 'rejected' ? <X size={10} /> : <Clock size={10} />}
                                                    {deal.approvalStatus}
                                                </span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="py-5 px-6">
                                        <div className="flex items-center justify-end gap-1 sm:opacity-0 group-hover:opacity-100 transition-all translate-x-1 group-hover:translate-x-0">
                                            {deal.requiresApproval && deal.approvalStatus === 'pending' && (
                                                <Can permission="crm.deals.approve">
                                                    <button onClick={() => handleAction(deal._id, 'approve')} className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white transition-all border border-emerald-500/20" title="Approve Deal"><Check size={16} /></button>
                                                    <button onClick={() => handleAction(deal._id, 'reject')} className="p-2.5 rounded-xl bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white transition-all border border-rose-500/20" title="Reject Deal"><X size={16} /></button>
                                                </Can>
                                            )}
                                            {isMounted && (
                                                <>
                                                    <Can permission="crm.deals.edit">
                                                        <button onClick={() => openEdit(deal)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl"><Edit size={16} /></button>
                                                    </Can>
                                                    <Can permission="crm.deals.delete">
                                                        <button onClick={() => handleDelete(deal._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl"><Trash2 size={16} /></button>
                                                    </Can>
                                                </>
                                            )}
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

