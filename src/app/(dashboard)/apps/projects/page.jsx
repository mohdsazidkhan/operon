'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, FolderKanban, Calendar, Users, TrendingUp, CheckCircle, Clock, Edit, Trash2, Target } from 'lucide-react';
import { cn, formatDate, formatCurrency, getStatusColor, getPriorityColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const STATUS_OPTS = ['all', 'planning', 'active', 'on_hold', 'completed', 'cancelled'];
const PRIORITY_OPTS = ['low', 'medium', 'high', 'urgent'];

const STATUS_COLORS = {
    planning: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    on_hold: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    completed: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10 border-[var(--primary-500)]/20',
    cancelled: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

const PRIORITY_DOT = { low: 'bg-slate-400', medium: 'bg-blue-500', high: 'bg-amber-500', urgent: 'bg-rose-500' };

const EMPTY_PROJECT = {
    name: '', description: '', status: 'planning', priority: 'medium',
    startDate: '', dueDate: '', budget: 0, client: '', tags: []
};

export default function ProjectsPage() {
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editProj, setEditProj] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_PROJECT);

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/projects?status=${filter === 'all' ? '' : filter}&search=${search}`);
            const data = await res.json();
            if (data.success) setProjects(data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchProjects(); }, [filter, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editProj ? 'PUT' : 'POST';
            const url = editProj ? `/api/projects/${editProj._id}` : '/api/projects';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) {
                toast.success(editProj ? 'Project updated!' : 'Project created!');
                setShowAdd(false); setEditProj(null); setForm(EMPTY_PROJECT); fetchProjects();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this project?')) return;
        await fetch(`/api/projects/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchProjects();
    };

    const openEdit = (p) => {
        setForm({ name: p.name, description: p.description || '', status: p.status, priority: p.priority, startDate: p.startDate ? p.startDate.slice(0, 10) : '', dueDate: p.dueDate ? p.dueDate.slice(0, 10) : '', budget: p.budget || 0, client: p.client || '', tags: p.tags || [] });
        setEditProj(p); setShowAdd(true);
    };

    const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter);
    const activeCount = projects.filter(p => p.status === 'active').length;
    const totalBudget = projects.reduce((s, p) => s + (p.budget || 0), 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditProj(null); setForm(EMPTY_PROJECT); }}
                title={editProj ? 'Edit Project' : 'New Project'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <FormField label="Project Name" required>
                                <input required className={inputCls} placeholder="Project name" value={form.name}
                                    onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                            </FormField>
                        </div>
                        <FormField label="Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {STATUS_OPTS.slice(1).map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Priority">
                            <select className={inputCls} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                {PRIORITY_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Client">
                            <input className={inputCls} placeholder="Client name" value={form.client}
                                onChange={e => setForm(p => ({ ...p, client: e.target.value }))} />
                        </FormField>
                        <FormField label="Budget ($)">
                            <input type="number" min="0" className={inputCls} value={form.budget}
                                onChange={e => setForm(p => ({ ...p, budget: +e.target.value }))} />
                        </FormField>
                        <FormField label="Start Date">
                            <input type="date" className={inputCls} value={form.startDate}
                                onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))} />
                        </FormField>
                        <FormField label="Due Date">
                            <input type="date" className={inputCls} value={form.dueDate}
                                onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Description">
                                <textarea className={inputCls} rows={3} value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditProj(null); setForm(EMPTY_PROJECT); }}
                        loading={saving} submitLabel={editProj ? 'Update Project' : 'Create Project'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Projects</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{projects.length} projects</p>
                </div>
                <button onClick={() => { setForm(EMPTY_PROJECT); setEditProj(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> New Project
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Projects', value: projects.length, icon: FolderKanban, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Active', value: activeCount, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Completed', value: projects.filter(p => p.status === 'completed').length, icon: CheckCircle, color: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' },
                    { label: 'Total Budget', value: formatCurrency(totalBudget), icon: Target, color: 'text-amber-500 bg-amber-500/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className={cn('p-2 rounded-xl w-fit mb-3', s.color)}><s.icon size={18} /></div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {STATUS_OPTS.map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                                filter === s ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Cards */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {[1, 2, 3].map(i => <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 animate-pulse h-48" />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-16 text-center">
                    <FolderKanban size={40} className="mx-auto text-[var(--text-muted)] opacity-40 mb-4" />
                    <p className="text-[var(--text-muted)] font-medium">No projects found</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {filtered.map(proj => (
                        <div key={proj._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm hover:shadow-md hover:border-[var(--primary-500)]/30 transition-all group">
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className={cn('w-2 h-2 rounded-full flex-shrink-0 mt-1', PRIORITY_DOT[proj.priority] || 'bg-slate-400')} />
                                    <h3 className="font-bold text-[var(--text-primary)] text-sm line-clamp-1">{proj.name}</h3>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all flex-shrink-0">
                                    <button onClick={() => openEdit(proj)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={13} /></button>
                                    <button onClick={() => handleDelete(proj._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={13} /></button>
                                </div>
                            </div>

                            {proj.description && <p className="text-xs text-[var(--text-muted)] line-clamp-2 mb-3">{proj.description}</p>}

                            <div className="flex items-center gap-2 mb-4">
                                <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', STATUS_COLORS[proj.status] || '')}>
                                    {proj.status.replace('_', ' ')}
                                </span>
                                {proj.client && <span className="text-xs text-[var(--text-muted)]">· {proj.client}</span>}
                            </div>

                            {/* Progress bar */}
                            <div className="mb-3">
                                <div className="flex items-center justify-between mb-1.5">
                                    <span className="text-xs text-[var(--text-muted)]">Progress</span>
                                    <span className="text-xs font-semibold text-[var(--text-primary)]">{proj.progress || 0}%</span>
                                </div>
                                <div className="h-1.5 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
                                    <div className="h-full bg-[var(--primary-500)] rounded-full transition-all" style={{ width: `${proj.progress || 0}%` }} />
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-xs text-[var(--text-muted)] pt-3 border-t border-[var(--border)]">
                                <span className="flex items-center gap-1"><Calendar size={11} />{proj.dueDate ? formatDate(proj.dueDate) : 'No due date'}</span>
                                {proj.budget > 0 && <span className="font-semibold">{formatCurrency(proj.budget)}</span>}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
