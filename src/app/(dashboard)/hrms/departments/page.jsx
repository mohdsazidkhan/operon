'use client';

import { useState, useEffect } from 'react';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { LayoutGrid, List, Plus, Search, DollarSign, Users, Edit, Trash2, Building2 } from 'lucide-react';
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
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

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
        <div className="space-y-10 animate-in fade-in duration-700 pb-12">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditDept(null); setForm(EMPTY_DEPT); }}
                title={editDept ? 'Synchronize Department Vector' : 'Initialize New Department Node'} size="md">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <FormField label="Identifier / Name" required>
                        <input required className={inputCls} placeholder="e.g. Engineering Archive" value={form.name}
                            onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </FormField>
                    <FormField label="Operational Context">
                        <textarea className={inputCls} rows={4} placeholder="Define the department's role within the organization..."
                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-6">
                        <FormField label="Annual Allocation ($)">
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input type="number" min="0" className={cn(inputCls, "pl-10")} value={form.budget}
                                    onChange={e => setForm(p => ({ ...p, budget: +e.target.value }))} />
                            </div>
                        </FormField>
                        <FormField label="Personnel Count">
                            <div className="relative">
                                <Users size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input type="number" min="0" className={cn(inputCls, "pl-10")} value={form.headcount}
                                    onChange={e => setForm(p => ({ ...p, headcount: +e.target.value }))} />
                            </div>
                        </FormField>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditDept(null); setForm(EMPTY_DEPT); }}
                        loading={saving} submitLabel={editDept ? 'Commit Sync' : 'Initialize Dept'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-8 underline-offset-8">Departments</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black tracking-[0.4em] uppercase mt-8 opacity-60">
                        Organizational Architecture • {departments.length} Units Active
                    </p>
                </div>
                {isMounted && (
                    <Can permission="hrms.departments.manage">
                        <button onClick={() => { setForm(EMPTY_DEPT); setEditDept(null); setShowAdd(true); }}
                            className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                            <Plus size={18} /> Add Department
                        </button>
                    </Can>
                )}
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active Clusters', value: departments.length, icon: Building2, color: 'text-indigo-500', bg: 'from-indigo-500/10' },
                    { label: 'Total Personnel Nodes', value: totalHeadcount, icon: Users, color: 'text-emerald-500', bg: 'from-emerald-500/10' },
                    { label: 'Aggregate Allocation', value: formatCurrency(totalBudget), icon: DollarSign, color: 'text-amber-500', bg: 'from-amber-500/10' },
                ].map((s, i) => (
                    <div key={i} className={cn('bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] p-10 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group bg-gradient-to-br transition-all duration-700 hover:translate-y-[-4px]', s.bg, 'to-transparent')}>
                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={cn('p-5 rounded-[1.5rem] bg-white/5 border border-white/10 shadow-inner', s.color)}><s.icon size={28} /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] italic opacity-50">{s.label}</span>
                        </div>
                        <p className={cn('text-3xl font-black tracking-tighter relative z-10', s.color)}>{s.value}</p>
                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] scale-150 rotate-12 transition-all group-hover:rotate-0 group-hover:scale-110 duration-1000">
                            <s.icon size={180} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Matrix Management Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 p-4 bg-[var(--surface-overlay)]/30 backdrop-blur-3xl rounded-[2.5rem] border border-[var(--border)]">
                <div className="relative flex-1 max-w-md group">
                    <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="QUERY ARCHIVE NODES..."
                        className="w-full pl-16 pr-8 py-5 rounded-[2rem] text-[10px] font-black bg-[var(--surface-raised)]/50 border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] tracking-[0.3em] uppercase focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all shadow-inner" />
                </div>
            </div>

            {/* Dept Matrix Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-[var(--surface-overlay)]/50 border border-[var(--border)] rounded-[3.5rem] p-10 animate-pulse h-64 shadow-inner" />
                    ))}
                </div>
            ) : departments.length === 0 ? (
                <div className="bg-[var(--surface-overlay)]/20 border-4 border-dashed border-[var(--border)] rounded-[4rem] p-40 text-center">
                    <Building2 size={80} className="mx-auto text-[var(--text-muted)] mb-10 opacity-20" />
                    <p className="text-xl font-black text-[var(--text-muted)] uppercase tracking-[0.6em] italic">Zero Departmental Vectors Detected</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {departments.map(dept => (
                        <div key={dept._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[3rem] p-10 shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] hover:border-[var(--primary-500)]/40 hover:scale-[1.02] transition-all duration-700 group relative flex flex-col overflow-hidden">
                            {/* Accent Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary-500)] opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-1000"></div>

                            <div className="flex items-start justify-between mb-10 relative z-10">
                                <div className="w-16 h-16 rounded-[1.8rem] bg-gradient-to-br from-[var(--primary-500)] to-blue-600 p-[3px] shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                                    <div className="w-full h-full rounded-[1.65rem] bg-[var(--surface)] flex items-center justify-center text-[var(--primary-500)] shadow-inner">
                                        <Building2 size={28} />
                                    </div>
                                </div>
                                {isMounted && (
                                    <div className="flex gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-500">
                                        <Can permission="hrms.departments.manage">
                                            <button onClick={() => openEdit(dept)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl active:scale-90"><Edit size={16} /></button>
                                            <button onClick={() => handleDelete(dept._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl active:scale-90"><Trash2 size={16} /></button>
                                        </Can>
                                    </div>
                                )}
                            </div>

                            <div className="relative z-10 mb-8 flex-1">
                                <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4 group-hover:text-[var(--primary-500)] transition-colors leading-tight">{dept.name}</h3>
                                {dept.description && <p className="text-[11px] font-bold text-[var(--text-muted)] leading-relaxed mb-8 opacity-70 line-clamp-3">{dept.description}</p>}
                            </div>

                            <div className="relative z-10 pt-8 border-t border-[var(--border)] border-dashed bg-gradient-to-b from-transparent to-[var(--surface-overlay)]/20 -mx-10 px-10 rounded-b-[3rem]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center shadow-inner">
                                            <Users size={14} className="text-[var(--primary-500)]" />
                                        </div>
                                        <div>
                                            <span className="block text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight leading-none">{dept.headcount || 0} Nodes</span>
                                            <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 leading-none mt-1 inline-block">Headcount</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-[14px] font-black text-[var(--text-primary)] tracking-tighter leading-none">{formatCurrency(dept.budget || 0)}</span>
                                        <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 leading-none mt-1 inline-block italic">Ann. Allocation</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
