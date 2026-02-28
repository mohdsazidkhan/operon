'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, TrendingUp, DollarSign, BarChart3, CheckCircle, Edit, Trash2, AlertTriangle } from 'lucide-react';
import { cn, formatCurrency, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const STATUS_COLORS = {
    draft: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200',
    approved: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200',
    active: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200',
    closed: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30 border-rose-200',
};

const EMPTY_BUDGET = { name: '', department: '', fiscalYear: new Date().getFullYear().toString(), period: 'annual', status: 'draft', notes: '', categories: [{ name: '', allocated: 0, spent: 0 }] };

export default function BudgetPage() {
    const [budgets, setBudgets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [editBudget, setEditBudget] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_BUDGET);
    const [search, setSearch] = useState('');

    const fetchBudgets = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/budget');
            const data = await res.json();
            if (data.success) setBudgets(data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchBudgets(); }, []);

    const updateCategory = (idx, field, val) => {
        const cats = [...form.categories];
        cats[idx] = { ...cats[idx], [field]: field === 'name' ? val : +val };
        setForm(p => ({ ...p, categories: cats }));
    };

    const addCategory = () => setForm(p => ({ ...p, categories: [...p.categories, { name: '', allocated: 0, spent: 0 }] }));
    const removeCategory = (idx) => setForm(p => ({ ...p, categories: p.categories.filter((_, i) => i !== idx) }));

    const totalAllocated = form.categories.reduce((s, c) => s + (c.allocated || 0), 0);
    const totalSpent = form.categories.reduce((s, c) => s + (c.spent || 0), 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editBudget ? 'PUT' : 'POST';
            const url = editBudget ? `/api/budget/${editBudget._id}` : '/api/budget';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) {
                toast.success(editBudget ? 'Budget updated!' : 'Budget created!');
                setShowAdd(false); setEditBudget(null); setForm(EMPTY_BUDGET); fetchBudgets();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this budget?')) return;
        await fetch(`/api/budget/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchBudgets();
    };

    const openEdit = (b) => {
        setForm({ name: b.name, department: b.department, fiscalYear: b.fiscalYear, period: b.period, status: b.status, notes: b.notes || '', categories: b.categories?.length ? b.categories : [{ name: '', allocated: 0, spent: 0 }] });
        setEditBudget(b); setShowAdd(true);
    };

    const filtered = budgets.filter(b => b.name.toLowerCase().includes(search.toLowerCase()) || b.department.toLowerCase().includes(search.toLowerCase()));
    const grandTotal = budgets.reduce((s, b) => s + (b.totalAllocated || 0), 0);
    const grandSpent = budgets.reduce((s, b) => s + (b.totalSpent || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditBudget(null); setForm(EMPTY_BUDGET); }}
                title={editBudget ? 'Edit Budget' : 'New Budget Plan'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Budget Name" required>
                            <input required className={inputCls} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Department" required>
                            <input required className={inputCls} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                        </FormField>
                        <FormField label="Fiscal Year">
                            <input className={inputCls} value={form.fiscalYear} onChange={e => setForm(p => ({ ...p, fiscalYear: e.target.value }))} />
                        </FormField>
                        <FormField label="Period">
                            <select className={inputCls} value={form.period} onChange={e => setForm(p => ({ ...p, period: e.target.value }))}>
                                {['monthly', 'quarterly', 'annual'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {['draft', 'approved', 'active', 'closed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </FormField>
                    </div>

                    {/* Categories */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Budget Categories</p>
                        <div className="grid grid-cols-12 gap-2 text-xs font-bold text-[var(--text-muted)] uppercase px-1">
                            <span className="col-span-5">Category</span>
                            <span className="col-span-3 text-right">Allocated ($)</span>
                            <span className="col-span-3 text-right">Spent ($)</span>
                        </div>
                        {form.categories.map((cat, idx) => (
                            <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                                <input placeholder="e.g. Salaries" className={cn(inputCls, 'col-span-5')} value={cat.name} onChange={e => updateCategory(idx, 'name', e.target.value)} />
                                <input type="number" min="0" className={cn(inputCls, 'col-span-3')} value={cat.allocated} onChange={e => updateCategory(idx, 'allocated', e.target.value)} />
                                <input type="number" min="0" className={cn(inputCls, 'col-span-3')} value={cat.spent} onChange={e => updateCategory(idx, 'spent', e.target.value)} />
                                {form.categories.length > 1 && <button type="button" onClick={() => removeCategory(idx)} className="col-span-1 p-1.5 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all text-center">✕</button>}
                            </div>
                        ))}
                        <button type="button" onClick={addCategory} className="text-sm text-[var(--primary-500)] hover:underline flex items-center gap-1"><Plus size={14} /> Add category</button>
                    </div>

                    <div className="bg-[var(--surface-overlay)] rounded-xl p-4 flex gap-6">
                        <div><p className="text-xs text-[var(--text-muted)]">Total Allocated</p><p className="font-black text-lg text-[var(--text-primary)]">{formatCurrency(totalAllocated)}</p></div>
                        <div><p className="text-xs text-[var(--text-muted)]">Total Spent</p><p className="font-black text-lg text-[var(--text-primary)]">{formatCurrency(totalSpent)}</p></div>
                        <div><p className="text-xs text-[var(--text-muted)]">Variance</p><p className={cn('font-black text-lg', totalAllocated - totalSpent >= 0 ? 'text-emerald-500' : 'text-rose-500')}>{formatCurrency(totalAllocated - totalSpent)}</p></div>
                    </div>

                    <FormField label="Notes">
                        <textarea className={inputCls} rows={2} value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                    </FormField>
                    <FormActions onClose={() => { setShowAdd(false); setEditBudget(null); setForm(EMPTY_BUDGET); }} loading={saving} submitLabel={editBudget ? 'Update Budget' : 'Create Budget'} />
                </form>
            </Modal>

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Budget Planning</h1>
                    <p className="text-[var(--text-muted)] text-sm">{budgets.length} budgets</p>
                </div>
                <button onClick={() => { setForm(EMPTY_BUDGET); setEditBudget(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> New Budget
                </button>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Budgets', value: budgets.length, icon: BarChart3, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Total Allocated', value: formatCurrency(grandTotal), icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Total Spent', value: formatCurrency(grandSpent), icon: TrendingUp, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Variance', value: formatCurrency(grandTotal - grandSpent), icon: AlertTriangle, color: grandTotal - grandSpent >= 0 ? 'text-emerald-500 bg-emerald-500/10' : 'text-rose-500 bg-rose-500/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className={cn('p-2 rounded-xl w-fit mb-3', s.color)}><s.icon size={18} /></div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search budgets..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
            </div>

            {loading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 animate-pulse h-40" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-16 text-center"><BarChart3 size={40} className="mx-auto text-[var(--text-muted)] opacity-40 mb-4" /><p className="text-[var(--text-muted)]">No budgets found</p></div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(b => {
                        const pctSpent = b.totalAllocated > 0 ? Math.min((b.totalSpent / b.totalAllocated) * 100, 100) : 0;
                        const overBudget = b.totalSpent > b.totalAllocated;
                        return (
                            <div key={b._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm hover:shadow-md transition-all group">
                                <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                                    <div>
                                        <h3 className="font-bold text-[var(--text-primary)]">{b.name}</h3>
                                        <p className="text-xs text-[var(--text-muted)] mt-0.5">{b.department} · {b.period} · FY{b.fiscalYear}</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', STATUS_COLORS[b.status] || '')}>{b.status}</span>
                                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => openEdit(b)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={14} /></button>
                                            <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                                    <div><p className="text-xs text-[var(--text-muted)]">Allocated</p><p className="font-bold text-[var(--text-primary)]">{formatCurrency(b.totalAllocated)}</p></div>
                                    <div><p className="text-xs text-[var(--text-muted)]">Spent</p><p className={cn('font-bold', overBudget ? 'text-rose-500' : 'text-[var(--text-primary)]')}>{formatCurrency(b.totalSpent)}</p></div>
                                    <div><p className="text-xs text-[var(--text-muted)]">Remaining</p><p className={cn('font-bold', overBudget ? 'text-rose-500' : 'text-emerald-500')}>{formatCurrency(b.totalAllocated - b.totalSpent)}</p></div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <span className="text-xs text-[var(--text-muted)]">Budget Utilization</span>
                                        <span className={cn('text-xs font-semibold', overBudget ? 'text-rose-500' : 'text-[var(--text-primary)]')}>{Math.round(pctSpent)}%</span>
                                    </div>
                                    <div className="h-2 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
                                        <div className={cn('h-full rounded-full transition-all', overBudget ? 'bg-rose-500' : 'bg-[var(--primary-500)]')} style={{ width: `${pctSpent}%` }} />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
