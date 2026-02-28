'use client';

import { useState, useEffect } from 'react';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { Users, MapPin, Plus, Search, Edit, Trash2, Briefcase, Calendar, Clock, AlertCircle, ChevronDown, ChevronUp, DollarSign, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import { cn, formatCurrency, formatDate } from '@/lib/utils';

const STATUS_OPTS = ['all', 'open', 'interviewing', 'closed', 'on_hold'];
const TYPE_OPTS = ['full_time', 'part_time', 'contract', 'intern'];

const STATUS_COLORS = {
    open: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
    interviewing: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10',
    closed: 'text-[var(--text-muted)] bg-[var(--surface-overlay)] border-[var(--border)] shadow-inner',
    on_hold: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
};

const EMPTY_JOB = {
    jobTitle: '', departmentName: '', description: '', requirements: '', type: 'full_time',
    location: '', salaryMin: 0, salaryMax: 0, status: 'open', positions: 1,
    closingDate: ''
};

export default function RecruitmentPage() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editJob, setEditJob] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_JOB);
    const [expandedJob, setExpandedJob] = useState(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/recruitment?status=${filter === 'all' ? '' : filter}&search=${search}`);
            const data = await res.json();
            if (data.success) setJobs(data.data || []);
        } catch { toast.error('Failed to fetch jobs'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchJobs(); }, [filter, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editJob ? 'PUT' : 'POST';
            const url = editJob ? `/api/recruitment/${editJob._id}` : '/api/recruitment';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) {
                toast.success(editJob ? 'Job updated!' : 'Job created!');
                setShowAdd(false); setEditJob(null); setForm(EMPTY_JOB); fetchJobs();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this job posting?')) return;
        await fetch(`/api/recruitment/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchJobs();
    };

    const openEdit = (j) => {
        setForm({ jobTitle: j.jobTitle, departmentName: j.departmentName || '', description: j.description || '', requirements: j.requirements || '', type: j.type, location: j.location || '', salaryMin: j.salaryMin || 0, salaryMax: j.salaryMax || 0, status: j.status, positions: j.positions || 1, closingDate: j.closingDate ? j.closingDate.slice(0, 10) : '' });
        setEditJob(j); setShowAdd(true);
    };

    const filterBtns = STATUS_OPTS.map(s => ({ value: s, label: s === 'all' ? 'All' : s.charAt(0).toUpperCase() + s.slice(1).replace('_', ' '), count: s === 'all' ? jobs.length : jobs.filter(j => j.status === s).length }));
    const filtered = filter === 'all' ? jobs : jobs.filter(j => j.status === filter);
    const totalApplications = jobs.reduce((s, j) => s + (j.applications?.length || 0), 0);

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-12">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditJob(null); setForm(EMPTY_JOB); }}
                title={editJob ? 'Synchronize Opportunity Vector' : 'Broadcast Talent Requirement'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="sm:col-span-2">
                            <FormField label="Job Designation" required>
                                <input required className={inputCls} placeholder="e.g. Principal Neural Architect" value={form.jobTitle}
                                    onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} />
                            </FormField>
                        </div>
                        <FormField label="Target Cluster (Dept)">
                            <div className="relative">
                                <Users size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input className={cn(inputCls, "pl-10")} placeholder="e.g. Core Intelligence" value={form.departmentName}
                                    onChange={e => setForm(p => ({ ...p, departmentName: e.target.value }))} />
                            </div>
                        </FormField>
                        <FormField label="Operational Sector (Loc)">
                            <div className="relative">
                                <MapPin size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input className={cn(inputCls, "pl-10")} placeholder="e.g. Distributed / Zurich" value={form.location}
                                    onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                            </div>
                        </FormField>
                        <FormField label="Contractual Vector">
                            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                {TYPE_OPTS.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Execution Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {STATUS_OPTS.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Min. Allocation ($)">
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input type="number" min="0" className={cn(inputCls, "pl-10")} value={form.salaryMin}
                                    onChange={e => setForm(p => ({ ...p, salaryMin: +e.target.value }))} />
                            </div>
                        </FormField>
                        <FormField label="Max. Allocation ($)">
                            <div className="relative">
                                <DollarSign size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input type="number" min="0" className={cn(inputCls, "pl-10")} value={form.salaryMax}
                                    onChange={e => setForm(p => ({ ...p, salaryMax: +e.target.value }))} />
                            </div>
                        </FormField>
                        <FormField label="Available Slots">
                            <input type="number" min="1" className={inputCls} value={form.positions}
                                onChange={e => setForm(p => ({ ...p, positions: +e.target.value }))} />
                        </FormField>
                        <FormField label="Broadcast End Date">
                            <input type="date" className={inputCls} value={form.closingDate}
                                onChange={e => setForm(p => ({ ...p, closingDate: e.target.value }))} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Mission Description">
                                <textarea className={inputCls} rows={4} placeholder="Describe the mission mandate..." value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </FormField>
                        </div>
                        <div className="sm:col-span-2">
                            <FormField label="Skill Prerequisites">
                                <textarea className={inputCls} rows={4} placeholder="Required neural patterns and skill vectors..." value={form.requirements}
                                    onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditJob(null); setForm(EMPTY_JOB); }}
                        loading={saving} submitLabel={editJob ? 'Commit Broadcast' : 'Deploy Posting'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-8 underline-offset-8 text-shadow-xl shadow-[var(--primary-500)]/10">Recruitment</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black tracking-[0.4em] uppercase mt-8 opacity-60">
                        Talent Acquisition Matrix • {totalApplications} Candidates Queued
                    </p>
                </div>
                {isMounted && (
                    <Can permission="hrms.recruitment.manage">
                        <button onClick={() => { setForm(EMPTY_JOB); setEditJob(null); setShowAdd(true); }}
                            className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2.5rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                            <Plus size={18} /> Deploy Opportunity
                        </button>
                    </Can>
                )}
            </div>

            {/* Stats Dashboard */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Active Channels', value: jobs.filter(j => j.status === 'open').length, icon: Briefcase, color: 'text-emerald-500', bg: 'from-emerald-500/10' },
                    { label: 'Evaluation Phase', value: jobs.filter(j => j.status === 'interviewing').length, icon: Users, color: 'text-blue-500', bg: 'from-blue-500/10' },
                    { label: 'Global Applicant Pool', value: totalApplications, icon: CheckCircle, color: 'text-[var(--primary-500)]', bg: 'from-[var(--primary-500)]/10' },
                    { label: 'Aggregate Postings', value: jobs.length, icon: Clock, color: 'text-amber-500', bg: 'from-amber-500/10' },
                ].map((s, i) => (
                    <div key={i} className={cn('bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group bg-gradient-to-br transition-all duration-700 hover:scale-[1.02]', s.bg, 'to-transparent')}>
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

            {/* Tactical Control Bar */}
            <div className="flex flex-wrap items-center justify-between gap-6 p-4 bg-[var(--surface-overlay)]/30 backdrop-blur-3xl rounded-[2.5rem] border border-[var(--border)]">
                <div className="relative flex-1 max-w-md group">
                    <Search size={22} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="PROBE TALENT DIRECTORY..."
                        className="w-full pl-16 pr-8 py-5 rounded-[2rem] text-[10px] font-black bg-[var(--surface-raised)]/50 border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] tracking-[0.3em] uppercase focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all shadow-inner" />
                </div>
                <div className="flex gap-3 overflow-x-auto scrollbar-none pb-2 sm:pb-0">
                    {filterBtns.map(b => (
                        <button key={b.value} onClick={() => setFilter(b.value)}
                            className={cn('px-6 py-4 rounded-[1.5rem] text-[9px] font-black uppercase tracking-[0.2em] whitespace-nowrap border-2 transition-all shadow-xl active:scale-95',
                                filter === b.value ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)] shadow-[var(--primary-500)]/30 scale-105' : 'bg-[var(--surface-raised)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {b.label} <span className="ml-3 px-2 py-0.5 rounded-full bg-white/10 text-[8px] font-black">{b.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Deployment Stream */}
            {loading ? (
                <div className="space-y-6">{[1, 2, 3].map(i => <div key={i} className="bg-[var(--surface-overlay)]/30 border border-[var(--border)] rounded-[3rem] p-10 animate-pulse h-40 shadow-inner" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="bg-[var(--surface-overlay)]/20 border-4 border-dashed border-[var(--border)] rounded-[4rem] p-40 text-center">
                    <Briefcase size={80} className="mx-auto text-[var(--text-muted)] opacity-20 mb-10" />
                    <p className="text-xl font-black text-[var(--text-muted)] uppercase tracking-[0.6em] italic">Zero Opportunity Transmissions Active</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {filtered.map(job => (
                        <div key={job._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[3rem] shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] hover:border-[var(--primary-500)]/40 transition-all duration-700 group relative flex flex-col overflow-hidden">
                            {/* Accent Stripe */}
                            <div className={cn("absolute left-0 top-0 bottom-0 w-2", job.status === 'open' ? "bg-emerald-500" : "bg-amber-500 opacity-50")}></div>

                            <div className="p-10">
                                <div className="flex flex-wrap items-start justify-between gap-8">
                                    <div className="flex items-start gap-8 flex-1 min-w-0">
                                        <div className="w-20 h-20 rounded-[1.8rem] bg-gradient-to-br from-[var(--primary-500)] to-blue-600 p-[3px] shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                                            <div className="w-full h-full rounded-[1.65rem] bg-[var(--surface)] flex items-center justify-center text-[var(--primary-500)] shadow-inner">
                                                <Briefcase size={32} />
                                            </div>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h3 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-4 group-hover:text-[var(--primary-500)] transition-colors leading-tight">{job.jobTitle}</h3>
                                            <div className="flex flex-wrap items-center gap-6">
                                                {job.departmentName && <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3 bg-[var(--surface-overlay)] px-4 py-2 rounded-xl border border-[var(--border)]"><Users size={14} className="text-[var(--primary-500)]" />{job.departmentName}</span>}
                                                {job.location && <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3 bg-[var(--surface-overlay)] px-4 py-2 rounded-xl border border-[var(--border)]"><MapPin size={14} className="text-blue-500" />{job.location}</span>}
                                                {(job.salaryMin || job.salaryMax) && (
                                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] flex items-center gap-3 bg-[var(--surface-overlay)] px-4 py-2 rounded-xl border border-[var(--border)]">
                                                        <DollarSign size={14} className="text-emerald-500" />
                                                        {formatCurrency(job.salaryMin)} — {formatCurrency(job.salaryMax)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                        <div className={cn('text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-xl border-2 shadow-2xl transition-all duration-500', STATUS_COLORS[job.status] || '')}>
                                            {job.status.replace('_', ' ')}
                                        </div>
                                        <div className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] bg-[var(--surface-overlay)] border border-[var(--border)] px-4 py-2 rounded-xl italic opacity-50">
                                            {job.type.replace('_', ' ')}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between mt-10 pt-10 border-t border-[var(--border)] border-dashed gap-6">
                                    <div className="flex items-center gap-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
                                        <div className="flex items-center gap-3"><div className="w-2 h-2 rounded-full bg-[var(--primary-500)] animate-pulse"></div><span>{job.positions || 1} Open Slots</span></div>
                                        <div className="flex items-center gap-3 bg-[var(--primary-500)]/5 px-4 py-2 rounded-xl border border-[var(--primary-500)]/20 shadow-inner"><span className="text-[var(--primary-500)]">{job.applications?.length || 0} Candidates Queued</span></div>
                                        {job.closingDate && <span className="opacity-40 italic">Vector Close: {formatDate(job.closingDate)}</span>}
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <button onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                                            className="px-6 py-3 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[9px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:border-[var(--primary-500)]/40 transition-all flex items-center gap-3 shadow-xl active:scale-95">
                                            Tactical Intel {expandedJob === job._id ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                        </button>
                                        {isMounted && (
                                            <>
                                                <Can permission="hrms.recruitment.manage">
                                                    <button onClick={() => openEdit(job)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl active:scale-90" title="Modify Vector"><Edit size={18} /></button>
                                                    <button onClick={() => handleDelete(job._id)} className="h-12 w-12 flex items-center justify-center rounded-2xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl active:scale-90" title="Purge Posting"><Trash2 size={18} /></button>
                                                </Can>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {expandedJob === job._id && (
                                <div className="px-10 pb-10 space-y-8 animate-in slide-in-from-top-4 duration-500 border-t border-[var(--border)] border-dashed bg-gradient-to-b from-transparent to-[var(--surface-overlay)]/20">
                                    {job.description && (
                                        <div className="pt-8">
                                            <p className="text-[10px] font-black text-[var(--primary-500)] uppercase tracking-[0.3em] mb-4 italic">Mission Mandate</p>
                                            <p className="text-[12px] font-bold text-[var(--text-secondary)] leading-relaxed bg-[var(--surface)]/50 p-6 rounded-3xl border border-[var(--border)] shadow-inner">{job.description}</p>
                                        </div>
                                    )}
                                    {job.requirements && (
                                        <div>
                                            <p className="text-[10px] font-black text-blue-500 uppercase tracking-[0.3em] mb-4 italic">Neural Prerequisite Vector</p>
                                            <p className="text-[12px] font-bold text-[var(--text-secondary)] leading-relaxed bg-[var(--surface)]/50 p-6 rounded-3xl border border-[var(--border)] shadow-inner">{job.requirements}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
