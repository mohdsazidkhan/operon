'use client';

import { useState, useEffect } from 'react';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { Award, Star, TrendingUp, Users, Search, Plus, Edit, Trash2 } from 'lucide-react';
import { cn, getInitials, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const PERIOD_TYPES = ['quarterly', 'annual', 'monthly'];
const STATUS_COLORS = {
    draft: 'text-slate-500 bg-slate-500/10 border-slate-500/20 shadow-inner',
    submitted: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    reviewed: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    acknowledged: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
};

const EMPTY_FORM = {
    employeeId: '', period: '', periodType: 'quarterly',
    ratings: { quality: 3, productivity: 3, teamwork: 3, communication: 3, initiative: 3 },
    strengths: '', improvements: '', comments: '', status: 'draft'
};

function StarRating({ value, onChange }) {
    return (
        <div className="flex gap-1.5 p-2 bg-[var(--surface-raised)]/50 rounded-xl border border-[var(--border)] shadow-inner">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => onChange(n)}
                    className={cn('text-2xl transition-all duration-300 transform hover:scale-125 active:scale-95', n <= value ? 'text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.4)]' : 'text-[var(--border)] opacity-30')}>★</button>
            ))}
            <span className="text-[10px] font-black text-[var(--text-muted)] ml-3 self-center uppercase tracking-widest">{value}/5</span>
        </div>
    );
}

export default function PerformancePage() {
    const [reviews, setReviews] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editRev, setEditRev] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchReviews = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/performance?limit=50');
            const data = await res.json();
            if (data.success) setReviews(data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            if (data.success) setEmployees(data.data || []);
        } catch { }
    };

    useEffect(() => { fetchReviews(); fetchEmployees(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editRev ? 'PUT' : 'POST';
            const url = editRev ? `/api/performance/${editRev._id}` : '/api/performance';
            const body = { ...form, employee: form.employeeId };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (data.success) {
                toast.success(editRev ? 'Review updated!' : 'Review created!');
                setShowAdd(false); setEditRev(null); setForm(EMPTY_FORM); fetchReviews();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this review?')) return;
        await fetch(`/api/performance/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchReviews();
    };

    const filtered = reviews.filter(r => {
        const name = r.employee?.name || '';
        return name.toLowerCase().includes(search.toLowerCase()) || (r.period || '').toLowerCase().includes(search.toLowerCase());
    });

    const avgScore = reviews.length > 0 ? (reviews.reduce((s, r) => s + (r.overallScore || 0), 0) / reviews.length).toFixed(1) : '0.0';

    const setRating = (key, val) => setForm(p => ({ ...p, ratings: { ...p.ratings, [key]: val } }));

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-12">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditRev(null); setForm(EMPTY_FORM); }}
                title={editRev ? 'Re-calibrate Performance Vector' : 'Initiate Performance Review'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField label="Target Employee Node" required>
                            <select className={inputCls} value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}>
                                <option value="">Select node...</option>
                                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} — {emp.position}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Evaluation Cycle (e.g. Q4 2025)" required>
                            <input className={inputCls} placeholder="e.g. Q4 2025 Matrix" value={form.period}
                                onChange={e => setForm(p => ({ ...p, period: e.target.value }))} />
                        </FormField>
                        <FormField label="Vector Frequency">
                            <select className={inputCls} value={form.periodType} onChange={e => setForm(p => ({ ...p, periodType: e.target.value }))}>
                                {PERIOD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Sync Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {['draft', 'submitted', 'reviewed', 'acknowledged'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <div className="bg-[var(--surface-overlay)]/50 border border-[var(--border)] rounded-[2.5rem] p-8 space-y-6 shadow-inner backdrop-blur-3xl">
                        <p className="text-[10px] font-black text-[var(--primary-500)] uppercase tracking-[0.4em] italic mb-4 opacity-70">Neural Performance Calibration</p>
                        {[
                            { key: 'quality', label: 'Work Quality Vector' },
                            { key: 'productivity', label: 'Throughput Efficiency' },
                            { key: 'teamwork', label: 'Cluster Synergism' },
                            { key: 'communication', label: 'Protocol Signal Strength' },
                            { key: 'initiative', label: 'Proactive Execution' },
                        ].map(r => (
                            <div key={r.key} className="flex items-center justify-between gap-6 flex-wrap">
                                <span className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-tight">{r.label}</span>
                                <StarRating value={form.ratings[r.key]} onChange={val => setRating(r.key, val)} />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField label="Primary Strengths">
                            <textarea className={inputCls} rows={4} value={form.strengths}
                                onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))} placeholder="Key performance highlights..." />
                        </FormField>
                        <FormField label="Improvement Directives">
                            <textarea className={inputCls} rows={4} value={form.improvements}
                                onChange={e => setForm(p => ({ ...p, improvements: e.target.value }))} placeholder="Optimization targets..." />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Strategic Synthesis (Comments)">
                                <textarea className={inputCls} rows={3} value={form.comments}
                                    onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} placeholder="Final review summary..." />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditRev(null); setForm(EMPTY_FORM); }}
                        loading={saving} submitLabel={editRev ? 'Commit Sync' : 'Initialize Review'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-8 underline-offset-8 text-shadow-xl shadow-[var(--primary-500)]/10">Performance</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black tracking-[0.4em] uppercase mt-8 opacity-60">
                        Operational Evaluation Analytics • {reviews.length} Audits Completed
                    </p>
                </div>
                {isMounted && (
                    <Can permission="hrms.performance.manage">
                        <button onClick={() => { setForm(EMPTY_FORM); setEditRev(null); setShowAdd(true); }}
                            className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                            <Plus size={18} /> New Performance Review
                        </button>
                    </Can>
                )}
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Audits', value: reviews.length, icon: Award, color: 'text-indigo-500', bg: 'from-indigo-500/10' },
                    { label: 'Global Merit Index', value: `${avgScore}/5`, icon: Star, color: 'text-amber-500', bg: 'from-amber-500/10' },
                    { label: 'Active Submissions', value: reviews.filter(r => r.status === 'submitted').length, icon: TrendingUp, color: 'text-blue-500', bg: 'from-blue-500/10' },
                    { label: 'Acknowledged nodes', value: reviews.filter(r => r.status === 'acknowledged').length, icon: Users, color: 'text-emerald-500', bg: 'from-emerald-500/10' },
                ].map((s, i) => (
                    <div key={i} className={cn('bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group bg-gradient-to-br transition-all duration-700 hover:translate-y-[-4px]', s.bg, 'to-transparent')}>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className={cn('p-4 rounded-[1.2rem] bg-white/5 border border-white/10 shadow-inner', s.color)}><s.icon size={22} /></div>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] italic opacity-40 leading-none">{s.label}</span>
                        </div>
                        <p className={cn('text-3xl font-black tracking-tighter relative z-10', s.color)}>{s.value}</p>
                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] scale-150 rotate-12 transition-all group-hover:rotate-0 group-hover:scale-110 duration-1000">
                            <s.icon size={120} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Table Matrix Container */}
            <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-6 p-4 bg-[var(--surface-overlay)]/30 backdrop-blur-3xl rounded-[2.5rem] border border-[var(--border)]">
                    <div className="relative flex-1 max-w-md group">
                        <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="SEARCH PERFORMANCE LOGS..."
                            className="w-full pl-16 pr-8 py-5 rounded-[2rem] text-[10px] font-black bg-[var(--surface-raised)]/50 border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] tracking-[0.3em] uppercase focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all shadow-inner" />
                    </div>
                </div>

                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[3rem] shadow-2xl overflow-hidden backdrop-blur-3xl">
                    <div className="overflow-x-auto scrollbar-none">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-[var(--surface-overlay)]/50 border-b border-[var(--border)]">
                                    <th className="py-8 px-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Node / Identity</th>
                                    <th className="py-8 px-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Cycle Window</th>
                                    <th className="py-8 px-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Merit Score</th>
                                    <th className="py-8 px-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Sync State</th>
                                    <th className="py-8 px-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic">Timestamp</th>
                                    <th className="py-8 px-10"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {loading ? (
                                    <tr><td colSpan="6" className="py-32 text-center"><div className="w-12 h-12 rounded-full border-4 border-[var(--primary-500)]/20 border-t-[var(--primary-500)] animate-spin mx-auto pb-4"></div><p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] italic mt-4">Synthesizing Audit Data...</p></td></tr>
                                ) : filtered.length === 0 ? (
                                    <tr><td colSpan="6" className="py-32 text-center text-[var(--text-muted)]"><TrendingUp size={60} className="mx-auto opacity-10 mb-8" /><p className="text-sm font-black uppercase tracking-[0.4em] italic">Zero Performance Logs Detected</p></td></tr>
                                ) : filtered.map(rev => (
                                    <tr key={rev._id} className="hover:bg-[var(--primary-500)]/5 transition-all duration-500 group">
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-blue-600 p-[2px] shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                    <div className="w-full h-full rounded-[0.9rem] bg-[var(--surface)] flex items-center justify-center text-[var(--primary-500)] font-black text-xs shadow-inner uppercase tracking-tighter">
                                                        {getInitials(rev.employee?.name || 'U')}
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight leading-none group-hover:text-[var(--primary-500)] transition-colors">{rev.employee?.name || 'Unknown Node'}</p>
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2 opacity-50 italic">{rev.employee?.position || 'Unassigned Role'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10 text-[11px] font-black text-[var(--text-secondary)] uppercase tracking-[0.1em] italic">{rev.period}</td>
                                        <td className="py-8 px-10">
                                            <div className="flex items-center gap-2">
                                                {[1, 2, 3, 4, 5].map(n => (
                                                    <span key={n} className={cn('text-lg leading-none transition-all duration-700', n <= Math.round(rev.overallScore || 0) ? 'text-amber-400 drop-shadow-[0_0_5px_rgba(251,191,36,0.3)]' : 'text-[var(--border)] opacity-20')}>★</span>
                                                ))}
                                                <span className="text-[12px] font-black text-[var(--primary-500)] ml-3 tracking-tighter">{(rev.overallScore || 0).toFixed(1)}</span>
                                            </div>
                                        </td>
                                        <td className="py-8 px-10">
                                            <span className={cn('text-[9px] font-black uppercase tracking-[0.2em] px-4 py-2 rounded-xl border-2 transition-all duration-500 shadow-xl', STATUS_COLORS[rev.status] || 'border-[var(--border)]')}>
                                                {rev.status}
                                            </span>
                                        </td>
                                        <td className="py-8 px-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40">{formatDate(rev.createdAt)}</td>
                                        <td className="py-8 px-10">
                                            <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-500">
                                                {isMounted && (
                                                    <Can permission="hrms.performance.manage">
                                                        <button onClick={() => { setForm({ employeeId: rev.employee?._id || '', period: rev.period, periodType: rev.periodType, ratings: rev.ratings || EMPTY_FORM.ratings, strengths: rev.strengths || '', improvements: rev.improvements || '', comments: rev.comments || '', status: rev.status }); setEditRev(rev); setShowAdd(true); }}
                                                            className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl active:scale-90" title="Re-calibrate Vector"><Edit size={16} /></button>
                                                        <button onClick={() => handleDelete(rev._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl active:scale-90" title="Purge Record"><Trash2 size={16} /></button>
                                                    </Can>
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
        </div >
    );
}
