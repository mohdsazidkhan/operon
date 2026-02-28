'use client';

import { useState, useEffect } from 'react';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { Plus, CheckCircle, XCircle, Clock, Calendar, AlertCircle, Filter, Search, MoreVertical, Check, X, ArrowRight, Trash2, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import { cn, formatDate, getStatusColor } from '@/lib/utils';

const EMPTY_LEAVE = { type: 'annual', startDate: '', endDate: '', reason: '', employee: '' };

export default function LeavesPage() {
    const [leaves, setLeaves] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_LEAVE);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const canManage = usePermission('hrms.leaves.approve');

    const fetchLeaves = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/leaves?search=${search}`);
            const data = await res.json();
            if (data.success) setLeaves(data.data);
        } catch (err) {
            console.error('Failed to fetch leaves:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            if (data.success) setEmployees(data.data);
        } catch (err) { console.error('Failed to fetch employees:', err); }
    };

    useEffect(() => {
        fetchLeaves();
        fetchEmployees();
    }, [search]);

    const stats = [
        { label: 'Authorized', count: leaves.filter(l => l.status === 'approved').length, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
        { label: 'Awaiting Review', count: leaves.filter(l => l.status === 'pending').length, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
        { label: 'Cumulative Absence', count: leaves.filter(l => l.status === 'approved').reduce((s, l) => s + (l.days || 0), 0), color: 'text-[var(--primary-500)]', bg: 'bg-[var(--primary-500)]/5', border: 'border-[var(--primary-500)]/10' },
    ];

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingLeave ? `/api/leaves/${editingLeave._id}` : '/api/leaves';
            const method = editingLeave ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingLeave ? 'Request Modified' : 'Application Lodged');
                setShowAdd(false);
                setEditingLeave(null);
                setForm(EMPTY_LEAVE);
                fetchLeaves();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setSaving(false); }
    };

    const handleAction = async (id, action) => {
        try {
            const res = await fetch(`/api/leaves/${id}/${action}`, { method: 'POST' });
            if (res.ok) {
                toast.success(`Request ${action === 'approve' ? 'authorized' : 'rejected'}`);
                fetchLeaves();
            }
        } catch (err) {
            console.error(`Failed to ${action} leave:`, err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Archive this leave record? This will purge it from active tracking.')) return;
        try {
            const res = await fetch(`/api/leaves/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Record archived');
                fetchLeaves();
            }
        } catch { toast.error('Action failed'); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Lodge/Modify Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingLeave(null); setForm(EMPTY_LEAVE); }} title={editingLeave ? "Refine Leave Request" : "Neural Leave Application"} size="md">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Staff Identification" required>
                        <select required className={inputCls} value={form.employee} onChange={e => setForm(p => ({ ...p, employee: e.target.value }))}>
                            <option value="">Query Personnel Registry...</option>
                            {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.department})</option>)}
                        </select>
                    </FormField>
                    <FormField label="Leave Protocol" required>
                        <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                            <option value="annual">Annual Sabbatical</option>
                            <option value="sick">Medical Recovery</option>
                            <option value="personal">Personal Deployment</option>
                            <option value="other">Unclassified Flux</option>
                        </select>
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Temporal Start" required>
                            <input required type="date" className={inputCls} value={form.startDate ? form.startDate.split('T')[0] : ''} onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                        </FormField>
                        <FormField label="Temporal End" required>
                            <input required type="date" className={inputCls} value={form.endDate ? form.endDate.split('T')[0] : ''} onChange={e => setForm(p => ({ ...p, endDate: e.target.value }))} />
                        </FormField>
                    </div>
                    <FormField label="Logical Justification" required>
                        <textarea required className={inputCls} rows={4} value={form.reason} onChange={e => setForm(p => ({ ...p, reason: e.target.value }))} placeholder="Provide operational context..." />
                    </FormField>
                    <FormActions onClose={() => { setShowAdd(false); setEditingLeave(null); }} loading={saving} submitLabel={editingLeave ? "Sync Modifications" : " Lodge Application"} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-4 underline-offset-8">Cognitive Leaves</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-6 flex items-center gap-2">
                        <AlertCircle size={12} className="text-amber-500" />
                        Absence Orchestration • {leaves.length} Parallel Threads
                    </p>
                </div>
                {isMounted && (
                    <Can permission="hrms.leaves.apply">
                        <button onClick={() => setShowAdd(true)} className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                            <Plus size={18} /> Lodge Request
                        </button>
                    </Can>
                )}
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className={cn('rounded-[2.5rem] p-8 border backdrop-blur-3xl shadow-2xl relative overflow-hidden group transition-all duration-700 hover:scale-[1.02]', s.bg, i === 2 ? 'border-[var(--primary-500)]/20' : s.border)}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-4 opacity-50 italic">{s.label}</p>
                        <p className={cn('text-4xl font-black tracking-tighter', i === 2 ? 'text-[var(--primary-500)]' : s.color)}>{s.count} <span className="text-xs uppercase ml-1 opacity-40">{i === 2 ? 'Days' : 'Files'}</span></p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex bg-[var(--card-bg)] p-3 rounded-[2.5rem] border border-[var(--card-border)] backdrop-blur-3xl shadow-2xl">
                <div className="relative flex-1 group">
                    <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="QUERY PERSONNEL OR RATIONALE..."
                        className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-[var(--surface-overlay)] border border-[var(--border)] text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all placeholder:text-[var(--text-muted)] shadow-inner"
                    />
                </div>
                <button className="px-10 py-5 rounded-[2rem] bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all font-black text-[11px] uppercase tracking-[0.2em] border border-[var(--border)] ml-4 shadow-xl">
                    <Filter size={18} /> Filter
                </button>
            </div>

            {/* Applications List */}
            <div className="space-y-6 pb-12">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-32 bg-[var(--surface-overlay)]/40 animate-pulse rounded-[3rem] border border-[var(--border)]"></div>
                    ))
                ) : leaves.length === 0 ? (
                    <div className="py-32 text-center bg-[var(--surface-overlay)]/30 rounded-[3rem] border border-[var(--border)] border-dashed">
                        <Calendar size={64} className="mx-auto text-[var(--text-muted)] mb-6 opacity-20" />
                        <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-[1em] italic opacity-40">Zero Applications Detected</h3>
                    </div>
                ) : leaves.map(leave => (
                    <div key={leave._id} className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl hover:border-[var(--primary-500)]/40 transition-all duration-500 group relative overflow-hidden flex flex-wrap items-center gap-10">
                        {/* Status dynamic highlight */}
                        <div className={cn(
                            'absolute top-0 right-0 w-64 h-64 blur-[120px] -mr-32 -mt-32 opacity-10 transition-all duration-1000 group-hover:opacity-20',
                            leave.status === 'approved' ? 'bg-emerald-500' : leave.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                        )}></div>

                        <div className="flex items-center gap-6 min-w-[280px] flex-1">
                            <div className="w-16 h-16 rounded-[1.8rem] overflow-hidden ring-4 ring-[var(--surface-raised)] shadow-2xl shrink-0 group-hover:rotate-6 group-hover:scale-110 transition-all duration-700">
                                <img src={leave.employee?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leave.employee?.name || '')}`} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-[15px] font-black text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight">{leave.employee?.name}</p>
                                <p className="text-[10px] font-black text-[var(--text-muted)] line-clamp-1 italic mt-1.5 opacity-60 tracking-wider">"{leave.reason}"</p>
                            </div>
                        </div>

                        <div className="text-center px-4">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2.5 opacity-50">Category</p>
                            <span className="text-[10px] font-black text-[var(--text-secondary)] uppercase bg-[var(--surface-overlay)] px-5 py-2 rounded-xl border border-[var(--border)] shadow-inner">{leave.type}</span>
                        </div>

                        <div className="text-center px-4">
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2.5 opacity-50">Quantifier</p>
                            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">{leave.days} <span className="text-[10px] text-[var(--text-muted)] uppercase opacity-50 ml-1">Days</span></p>
                        </div>

                        <div className="flex items-center gap-8 px-4 bg-[var(--surface-overlay)]/40 py-3 rounded-2xl border border-[var(--border)] shadow-inner">
                            <div className="text-center">
                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-1.5 opacity-60">Temporal Start</p>
                                <p className="text-[11px] font-black text-[var(--text-primary)] font-mono">{formatDate(leave.startDate)}</p>
                            </div>
                            <ArrowRight size={14} className="text-[var(--primary-500)] animate-pulse" />
                            <div className="text-center">
                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-1.5 opacity-60">Temporal End</p>
                                <p className="text-[11px] font-black text-[var(--text-primary)] font-mono">{formatDate(leave.endDate)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0 relative z-10">
                            <div className={cn(
                                'inline-flex items-center gap-2.5 px-6 py-3 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all duration-500',
                                getStatusColor(leave.status)
                            )}>
                                {leave.status === 'approved' ? <CheckCircle size={14} /> : leave.status === 'pending' ? <Clock size={14} /> : <XCircle size={14} />}
                                {leave.status}
                            </div>

                            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-500 transform translate-x-4 group-hover:translate-x-0">
                                {isMounted && (
                                    <>
                                        {leave.status === 'pending' && (
                                            <div className="flex gap-2">
                                                <Can permission="hrms.leaves.approve">
                                                    <button
                                                        onClick={() => handleAction(leave._id, 'approve')}
                                                        className="h-11 w-11 flex items-center justify-center rounded-[1.2rem] bg-emerald-500/10 text-emerald-500 border border-emerald-400/30 hover:bg-emerald-500 hover:text-white transition-all shadow-xl hover:shadow-emerald-500/30"
                                                        title="Authorize Request"
                                                    >
                                                        <Check size={20} />
                                                    </button>
                                                    <button
                                                        onClick={() => handleAction(leave._id, 'reject')}
                                                        className="h-11 w-11 flex items-center justify-center rounded-[1.2rem] bg-rose-500/10 text-rose-500 border border-rose-400/30 hover:bg-rose-500 hover:text-white transition-all shadow-xl hover:shadow-rose-500/30"
                                                        title="Reject Request"
                                                    >
                                                        <X size={20} />
                                                    </button>
                                                </Can>
                                                <Can permission="hrms.leaves.apply">
                                                    <button onClick={() => { setForm({ ...leave, employee: leave.employee?._id || leave.employee || '' }); setEditingLeave(leave); setShowAdd(true); }} className="h-11 w-11 flex items-center justify-center rounded-[1.2rem] bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl">
                                                        <Edit size={18} />
                                                    </button>
                                                </Can>
                                            </div>
                                        )}
                                        <Can permission="hrms.leaves.approve">
                                            <button onClick={() => handleDelete(leave._id)} className="h-11 w-11 flex items-center justify-center rounded-[1.2rem] bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl">
                                                <Trash2 size={18} />
                                            </button>
                                        </Can>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
