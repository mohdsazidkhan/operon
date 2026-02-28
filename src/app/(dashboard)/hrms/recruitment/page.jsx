'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Briefcase, Users, Clock, CheckCircle, Eye, Edit, Trash2, ChevronDown, ChevronUp, MapPin, DollarSign } from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const STATUS_OPTS = ['all', 'open', 'interviewing', 'closed', 'on_hold'];
const TYPE_OPTS = ['full_time', 'part_time', 'contract', 'intern'];

const STATUS_COLORS = {
    open: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-200 dark:border-emerald-700',
    interviewing: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200 dark:border-blue-700',
    closed: 'text-slate-600 bg-slate-100 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700',
    on_hold: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200 dark:border-amber-700',
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditJob(null); setForm(EMPTY_JOB); }}
                title={editJob ? 'Edit Job Posting' : 'New Job Posting'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <FormField label="Job Title" required>
                                <input required className={inputCls} placeholder="e.g. Senior Frontend Engineer" value={form.jobTitle}
                                    onChange={e => setForm(p => ({ ...p, jobTitle: e.target.value }))} />
                            </FormField>
                        </div>
                        <FormField label="Department">
                            <input className={inputCls} placeholder="e.g. Engineering" value={form.departmentName}
                                onChange={e => setForm(p => ({ ...p, departmentName: e.target.value }))} />
                        </FormField>
                        <FormField label="Location">
                            <input className={inputCls} placeholder="e.g. Remote, New York" value={form.location}
                                onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                        </FormField>
                        <FormField label="Employment Type">
                            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                {TYPE_OPTS.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {STATUS_OPTS.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Min Salary ($)">
                            <input type="number" min="0" className={inputCls} value={form.salaryMin}
                                onChange={e => setForm(p => ({ ...p, salaryMin: +e.target.value }))} />
                        </FormField>
                        <FormField label="Max Salary ($)">
                            <input type="number" min="0" className={inputCls} value={form.salaryMax}
                                onChange={e => setForm(p => ({ ...p, salaryMax: +e.target.value }))} />
                        </FormField>
                        <FormField label="Open Positions">
                            <input type="number" min="1" className={inputCls} value={form.positions}
                                onChange={e => setForm(p => ({ ...p, positions: +e.target.value }))} />
                        </FormField>
                        <FormField label="Closing Date">
                            <input type="date" className={inputCls} value={form.closingDate}
                                onChange={e => setForm(p => ({ ...p, closingDate: e.target.value }))} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Job Description">
                                <textarea className={inputCls} rows={3} placeholder="Describe the role..." value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </FormField>
                        </div>
                        <div className="sm:col-span-2">
                            <FormField label="Requirements">
                                <textarea className={inputCls} rows={3} placeholder="Skills, qualifications..." value={form.requirements}
                                    onChange={e => setForm(p => ({ ...p, requirements: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditJob(null); setForm(EMPTY_JOB); }}
                        loading={saving} submitLabel={editJob ? 'Update Job' : 'Post Job'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Recruitment</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">Manage job postings & applicants</p>
                </div>
                <button onClick={() => { setForm(EMPTY_JOB); setEditJob(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> Post Job
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Open Roles', value: jobs.filter(j => j.status === 'open').length, icon: Briefcase, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Interviewing', value: jobs.filter(j => j.status === 'interviewing').length, icon: Users, color: 'text-blue-500 bg-blue-500/10' },
                    { label: 'Total Applications', value: totalApplications, icon: CheckCircle, color: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' },
                    { label: 'Total Postings', value: jobs.length, icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className={cn('p-2 rounded-xl w-fit mb-3', s.color)}><s.icon size={18} /></div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search jobs..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {filterBtns.map(b => (
                        <button key={b.value} onClick={() => setFilter(b.value)}
                            className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                                filter === b.value ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {b.label} <span className="ml-1 opacity-70">{b.count}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Job Cards */}
            {loading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 animate-pulse h-32" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-16 text-center">
                    <Briefcase size={40} className="mx-auto text-[var(--text-muted)] opacity-40 mb-4" />
                    <p className="text-[var(--text-muted)] font-medium">No job postings found</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(job => (
                        <div key={job._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm hover:shadow-md hover:border-[var(--primary-500)]/30 transition-all">
                            <div className="p-5">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div className="flex items-start gap-4 flex-1 min-w-0">
                                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-500)]/10 flex items-center justify-center flex-shrink-0">
                                            <Briefcase size={20} className="text-[var(--primary-500)]" />
                                        </div>
                                        <div className="min-w-0">
                                            <h3 className="font-bold text-[var(--text-primary)] text-base">{job.jobTitle}</h3>
                                            <div className="flex flex-wrap items-center gap-3 mt-1">
                                                {job.departmentName && <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><Users size={11} />{job.departmentName}</span>}
                                                {job.location && <span className="text-xs text-[var(--text-muted)] flex items-center gap-1"><MapPin size={11} />{job.location}</span>}
                                                {(job.salaryMin || job.salaryMax) && (
                                                    <span className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                                        <DollarSign size={11} />
                                                        {formatCurrency(job.salaryMin)} – {formatCurrency(job.salaryMax)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 flex-shrink-0">
                                        <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', STATUS_COLORS[job.status] || '')}>
                                            {job.status.replace('_', ' ')}
                                        </span>
                                        <span className="text-xs font-semibold text-[var(--text-muted)] bg-[var(--surface-overlay)] border border-[var(--border)] px-2.5 py-1 rounded-full">
                                            {job.type.replace('_', ' ')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center justify-between mt-4 pt-4 border-t border-[var(--border)] gap-3">
                                    <div className="flex items-center gap-4 text-xs text-[var(--text-muted)]">
                                        <span>{job.positions || 1} position{job.positions !== 1 ? 's' : ''}</span>
                                        <span className="font-semibold text-[var(--primary-500)]">{job.applications?.length || 0} applicant{job.applications?.length !== 1 ? 's' : ''}</span>
                                        {job.closingDate && <span>Closes {formatDate(job.closingDate)}</span>}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <button onClick={() => setExpandedJob(expandedJob === job._id ? null : job._id)}
                                            className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--primary-500)] transition-colors px-2 py-1">
                                            Details {expandedJob === job._id ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                                        </button>
                                        <button onClick={() => openEdit(job)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={14} /></button>
                                        <button onClick={() => handleDelete(job._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                            {expandedJob === job._id && (
                                <div className="px-5 pb-5 space-y-3 border-t border-[var(--border)]">
                                    {job.description && (
                                        <div className="pt-4">
                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Description</p>
                                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{job.description}</p>
                                        </div>
                                    )}
                                    {job.requirements && (
                                        <div>
                                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1.5">Requirements</p>
                                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed">{job.requirements}</p>
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
