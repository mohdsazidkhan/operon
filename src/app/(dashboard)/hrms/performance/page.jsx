'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Star, TrendingUp, Users, Award, Edit, Trash2, ChevronDown } from 'lucide-react';
import { cn, formatDate, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const PERIOD_TYPES = ['quarterly', 'annual', 'monthly'];
const STATUS_COLORS = {
    draft: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700',
    submitted: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-200',
    reviewed: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30 border-purple-200',
    acknowledged: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200',
};

const EMPTY_FORM = {
    employeeId: '', period: '', periodType: 'quarterly',
    ratings: { quality: 3, productivity: 3, teamwork: 3, communication: 3, initiative: 3 },
    strengths: '', improvements: '', comments: '', status: 'draft'
};

function StarRating({ value, onChange }) {
    return (
        <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => onChange(n)}
                    className={cn('text-xl transition-colors', n <= value ? 'text-amber-400' : 'text-[var(--border)] hover:text-amber-300')}>★</button>
            ))}
            <span className="text-sm text-[var(--text-muted)] ml-2">{value}/5</span>
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditRev(null); setForm(EMPTY_FORM); }}
                title={editRev ? 'Edit Review' : 'New Performance Review'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Employee" required>
                            <select className={inputCls} value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}>
                                <option value="">Select employee...</option>
                                {employees.map(emp => <option key={emp._id} value={emp._id}>{emp.name} – {emp.position}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Period (e.g. Q1 2025)" required>
                            <input className={inputCls} placeholder="Q1 2025" value={form.period}
                                onChange={e => setForm(p => ({ ...p, period: e.target.value }))} />
                        </FormField>
                        <FormField label="Period Type">
                            <select className={inputCls} value={form.periodType} onChange={e => setForm(p => ({ ...p, periodType: e.target.value }))}>
                                {PERIOD_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {['draft', 'submitted', 'reviewed', 'acknowledged'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <div className="bg-[var(--surface-overlay)] rounded-xl p-4 space-y-3">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Performance Ratings</p>
                        {[
                            { key: 'quality', label: 'Work Quality' },
                            { key: 'productivity', label: 'Productivity' },
                            { key: 'teamwork', label: 'Teamwork' },
                            { key: 'communication', label: 'Communication' },
                            { key: 'initiative', label: 'Initiative' },
                        ].map(r => (
                            <div key={r.key} className="flex items-center justify-between gap-3 flex-wrap">
                                <span className="text-sm text-[var(--text-secondary)] min-w-[130px]">{r.label}</span>
                                <StarRating value={form.ratings[r.key]} onChange={val => setRating(r.key, val)} />
                            </div>
                        ))}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Strengths">
                            <textarea className={inputCls} rows={3} value={form.strengths}
                                onChange={e => setForm(p => ({ ...p, strengths: e.target.value }))} placeholder="Key strengths..." />
                        </FormField>
                        <FormField label="Areas for Improvement">
                            <textarea className={inputCls} rows={3} value={form.improvements}
                                onChange={e => setForm(p => ({ ...p, improvements: e.target.value }))} placeholder="Areas to improve..." />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Overall Comments">
                                <textarea className={inputCls} rows={2} value={form.comments}
                                    onChange={e => setForm(p => ({ ...p, comments: e.target.value }))} placeholder="Summary comments..." />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditRev(null); setForm(EMPTY_FORM); }}
                        loading={saving} submitLabel={editRev ? 'Update Review' : 'Create Review'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Performance Reviews</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{reviews.length} reviews</p>
                </div>
                <button onClick={() => { setForm(EMPTY_FORM); setEditRev(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> New Review
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Reviews', value: reviews.length, icon: Award, color: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' },
                    { label: 'Avg. Score', value: `${avgScore}/5`, icon: Star, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Submitted', value: reviews.filter(r => r.status === 'submitted').length, icon: TrendingUp, color: 'text-blue-500 bg-blue-500/10' },
                    { label: 'Acknowledged', value: reviews.filter(r => r.status === 'acknowledged').length, icon: Users, color: 'text-emerald-500 bg-emerald-500/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className={cn('p-2 rounded-xl w-fit mb-3', s.color)}><s.icon size={18} /></div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by employee or period..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
            </div>

            {/* Table */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-3.5 px-5">Employee</th>
                                <th className="py-3.5 px-5">Period</th>
                                <th className="py-3.5 px-5">Overall Score</th>
                                <th className="py-3.5 px-5">Status</th>
                                <th className="py-3.5 px-5">Date</th>
                                <th className="py-3.5 px-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">Loading reviews...</td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">No reviews found</td></tr>
                            ) : filtered.map(rev => (
                                <tr key={rev._id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors group">
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-sm">
                                                {getInitials(rev.employee?.name || 'U')}
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">{rev.employee?.name || 'Unknown'}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{rev.employee?.position || ''}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[var(--text-secondary)]">{rev.period}</td>
                                    <td className="py-4 px-5">
                                        <div className="flex items-center gap-1.5">
                                            {[1, 2, 3, 4, 5].map(n => (
                                                <span key={n} className={cn('text-sm', n <= Math.round(rev.overallScore || 0) ? 'text-amber-400' : 'text-[var(--border)]')}>★</span>
                                            ))}
                                            <span className="text-xs text-[var(--text-muted)] ml-1">{(rev.overallScore || 0).toFixed(1)}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-5">
                                        <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', STATUS_COLORS[rev.status] || '')}>
                                            {rev.status}
                                        </span>
                                    </td>
                                    <td className="py-4 px-5 text-sm text-[var(--text-muted)]">{formatDate(rev.createdAt)}</td>
                                    <td className="py-4 px-5">
                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button onClick={() => { setForm({ employeeId: rev.employee?._id || '', period: rev.period, periodType: rev.periodType, ratings: rev.ratings || EMPTY_FORM.ratings, strengths: rev.strengths || '', improvements: rev.improvements || '', comments: rev.comments || '', status: rev.status }); setEditRev(rev); setShowAdd(true); }}
                                                className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={15} /></button>
                                            <button onClick={() => handleDelete(rev._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={15} /></button>
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
