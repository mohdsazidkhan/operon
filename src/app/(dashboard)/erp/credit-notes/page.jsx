'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, FileX, DollarSign, CheckCircle, Clock, Trash2, Eye } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Link from 'next/link';

const STATUS_COLORS = {
    draft: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200',
    issued: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-200',
    applied: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200',
    void: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30 border-rose-200',
};

const EMPTY_CN = { items: [{ description: '', quantity: 1, price: 0, total: 0 }], tax: 0, reason: '', status: 'draft' };

export default function CreditNotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_CN);
    const statuses = ['all', 'draft', 'issued', 'applied', 'void'];

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/credit-notes?status=${filter === 'all' ? '' : filter}&search=${search}`);
            const data = await res.json();
            if (data.success) setNotes(data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotes(); }, [filter, search]);

    const updateItem = (idx, field, val) => {
        const items = [...form.items];
        items[idx] = { ...items[idx], [field]: field === 'description' ? val : +val };
        items[idx].total = items[idx].quantity * items[idx].price;
        setForm(p => ({ ...p, items }));
    };

    const addItem = () => setForm(p => ({ ...p, items: [...p.items, { description: '', quantity: 1, price: 0, total: 0 }] }));
    const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

    const subtotal = form.items.reduce((s, i) => s + i.total, 0);
    const total = subtotal + (form.tax || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/credit-notes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...form, subtotal, total }) });
            const data = await res.json();
            if (data.success) { toast.success('Credit note created!'); setShowAdd(false); setForm(EMPTY_CN); fetchNotes(); }
            else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this credit note?')) return;
        await fetch(`/api/credit-notes/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchNotes();
    };

    const totalValue = notes.reduce((s, n) => s + (n.total || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setForm(EMPTY_CN); }} title="New Credit Note" size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Reason">
                        <input className={inputCls} placeholder="Reason for credit note..." value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} />
                    </FormField>
                    <FormField label="Status">
                        <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                            {statuses.slice(1).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                        </select>
                    </FormField>
                    {/* Line items */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Line Items</p>
                        {form.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 flex-wrap sm:flex-nowrap">
                                <input placeholder="Description" className={cn(inputCls, 'flex-1 min-w-[120px]')} value={item.description} onChange={e => updateItem(idx, 'description', e.target.value)} />
                                <input type="number" placeholder="Qty" min="1" className={cn(inputCls, 'w-20')} value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                <input type="number" placeholder="Price" min="0" className={cn(inputCls, 'w-28')} value={item.price} onChange={e => updateItem(idx, 'price', e.target.value)} />
                                <span className="flex items-center text-sm font-semibold text-[var(--text-primary)] min-w-[70px]">{formatCurrency(item.total)}</span>
                                {form.items.length > 1 && <button type="button" onClick={() => removeItem(idx)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0">✕</button>}
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="text-sm text-[var(--primary-500)] hover:underline flex items-center gap-1"><Plus size={14} /> Add item</button>
                    </div>
                    <div className="grid grid-cols-2 gap-3 bg-[var(--surface-overlay)] rounded-xl p-4">
                        <FormField label="Tax ($)">
                            <input type="number" min="0" className={inputCls} value={form.tax} onChange={e => setForm(p => ({ ...p, tax: +e.target.value }))} />
                        </FormField>
                        <div className="flex items-end pb-0.5">
                            <div><p className="text-xs font-bold text-[var(--text-muted)] uppercase mb-1">Total</p><p className="text-lg font-black text-[var(--text-primary)]">{formatCurrency(total)}</p></div>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setForm(EMPTY_CN); }} loading={saving} submitLabel="Create Credit Note" />
                </form>
            </Modal>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Credit Notes</h1>
                    <p className="text-[var(--text-muted)] text-sm">{notes.length} credit notes</p>
                </div>
                <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> New Credit Note
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Notes', value: notes.length, icon: FileX, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Total Value', value: formatCurrency(totalValue), icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Issued', value: notes.filter(n => n.status === 'issued').length, icon: CheckCircle, color: 'text-blue-500 bg-blue-500/10' },
                    { label: 'Draft', value: notes.filter(n => n.status === 'draft').length, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className={cn('p-2 rounded-xl w-fit mb-3', s.color)}><s.icon size={18} /></div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search credit notes..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {statuses.map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                                filter === s ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-3.5 px-5">Credit Note #</th>
                                <th className="py-3.5 px-5">Customer</th>
                                <th className="py-3.5 px-5">Status</th>
                                <th className="py-3.5 px-5 text-right">Total</th>
                                <th className="py-3.5 px-5">Issued</th>
                                <th className="py-3.5 px-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">Loading...</td></tr>
                                : notes.length === 0 ? <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">No credit notes found</td></tr>
                                    : notes.map(cn => (
                                        <tr key={cn._id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors group">
                                            <td className="py-4 px-5"><p className="text-sm font-semibold text-[var(--primary-500)]">{cn.creditNoteNumber}</p></td>
                                            <td className="py-4 px-5 text-sm text-[var(--text-secondary)]">{cn.customer?.name || '—'}</td>
                                            <td className="py-4 px-5"><span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', STATUS_COLORS[cn.status] || '')}>{cn.status}</span></td>
                                            <td className="py-4 px-5 text-sm font-bold text-right text-[var(--text-primary)]">{formatCurrency(cn.total)}</td>
                                            <td className="py-4 px-5 text-sm text-[var(--text-muted)]">{formatDate(cn.issuedDate)}</td>
                                            <td className="py-4 px-5">
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all justify-end">
                                                    <button onClick={() => handleDelete(cn._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={15} /></button>
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
