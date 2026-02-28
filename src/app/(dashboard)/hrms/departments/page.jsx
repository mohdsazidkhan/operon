'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Users, Briefcase, Edit, Trash2, TrendingUp, DollarSign } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const EMPTY_DEPT = { name: '', description: '', budget: 0, headcount: 0 };

export default function DepartmentsPage() {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editDept, setEditDept] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_DEPT);

    const fetchDepts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/departments?search=${search}`);
            const data = await res.json();
            if (data.success) setDepartments(data.data || []);
        } catch { toast.error('Failed to fetch departments'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchDepts(); }, [search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editDept ? 'PUT' : 'POST';
            const url = editDept ? `/api/departments/${editDept._id}` : '/api/departments';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) {
                toast.success(editDept ? 'Department updated!' : 'Department created!');
                setShowAdd(false); setEditDept(null); setForm(EMPTY_DEPT); fetchDepts();
            } else toast.error(data.message);
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this department?')) return;
        try {
            await fetch(`/api/departments/${id}`, { method: 'DELETE' });
            toast.success('Deleted'); fetchDepts();
        } catch { toast.error('Failed to delete'); }
    };

    const openEdit = (d) => {
        setForm({ name: d.name, description: d.description || '', budget: d.budget || 0, headcount: d.headcount || 0 });
        setEditDept(d); setShowAdd(true);
    };

    const totalBudget = departments.reduce((s, d) => s + (d.budget || 0), 0);
    const totalHeadcount = departments.reduce((s, d) => s + (d.headcount || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditDept(null); setForm(EMPTY_DEPT); }}
                title={editDept ? 'Edit Department' : 'Add Department'} size="md">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Department Name" required>
                        <input required className={inputCls} placeholder="e.g. Engineering" value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </FormField>
                    <FormField label="Description">
                        <textarea className={inputCls} rows={3} placeholder="Department description..."
                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Annual Budget ($)">
                            <input type="number" min="0" className={inputCls} value={form.budget}
                                onChange={e => setForm(p => ({ ...p, budget: +e.target.value }))} />
                        </FormField>
                        <FormField label="Headcount">
                            <input type="number" min="0" className={inputCls} value={form.headcount}
                                onChange={e => setForm(p => ({ ...p, headcount: +e.target.value }))} />
                        </FormField>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditDept(null); setForm(EMPTY_DEPT); }}
                        loading={saving} submitLabel={editDept ? 'Update' : 'Add Department'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Departments</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{departments.length} departments</p>
                </div>
                <button onClick={() => { setForm(EMPTY_DEPT); setEditDept(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> Add Department
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: 'Total Departments', value: departments.length, icon: Building2, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Total Headcount', value: totalHeadcount, icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Total Budget', value: formatCurrency(totalBudget), icon: DollarSign, color: 'text-amber-500 bg-amber-500/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className="flex items-center gap-3 mb-2">
                            <div className={cn('p-2 rounded-xl', s.color)}><s.icon size={18} /></div>
                            <span className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wide">{s.label}</span>
                        </div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search departments..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
            </div>

            {/* Grid */}
            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 animate-pulse">
                            <div className="h-4 bg-[var(--surface-overlay)] rounded w-1/2 mb-3" />
                            <div className="h-3 bg-[var(--surface-overlay)] rounded w-3/4" />
                        </div>
                    ))}
                </div>
            ) : departments.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-16 text-center">
                    <Building2 size={40} className="mx-auto text-[var(--text-muted)] mb-4 opacity-40" />
                    <p className="text-[var(--text-muted)] font-medium">No departments found</p>
                    <p className="text-[var(--text-muted)] text-sm mt-1">Add your first department to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                    {departments.map(dept => (
                        <div key={dept._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-[var(--primary-500)]/30 transition-all group">
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-500)]/10 flex items-center justify-center">
                                    <Building2 size={22} className="text-[var(--primary-500)]" />
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                    <button onClick={() => openEdit(dept)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={14} /></button>
                                    <button onClick={() => handleDelete(dept._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
                                </div>
                            </div>
                            <h3 className="font-bold text-[var(--text-primary)] mb-1">{dept.name}</h3>
                            {dept.description && <p className="text-xs text-[var(--text-muted)] mb-4 line-clamp-2">{dept.description}</p>}
                            <div className="flex items-center justify-between pt-4 border-t border-[var(--border)]">
                                <div className="flex items-center gap-1.5 text-xs text-[var(--text-muted)]">
                                    <Users size={13} />
                                    <span>{dept.headcount || 0} staff</span>
                                </div>
                                <span className="text-xs font-semibold text-[var(--text-secondary)]">{formatCurrency(dept.budget || 0)}</span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
