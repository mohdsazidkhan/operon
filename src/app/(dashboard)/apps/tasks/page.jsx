'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, CheckSquare, Clock, AlertTriangle, CheckCircle, Trash2, Edit, Flag, ChevronDown, ChevronRight } from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const PRIORITY_CFG = {
    low: { color: 'text-slate-500 bg-slate-100 dark:bg-slate-800', dot: 'bg-slate-400', border: 'border-l-slate-300' },
    medium: { color: 'text-blue-600 bg-blue-100 dark:bg-blue-900/30', dot: 'bg-blue-500', border: 'border-l-blue-400' },
    high: { color: 'text-amber-600 bg-amber-100 dark:bg-amber-900/30', dot: 'bg-amber-500', border: 'border-l-amber-400' },
    urgent: { color: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30', dot: 'bg-rose-500', border: 'border-l-rose-400' },
};

const STATUS_OPTS = ['todo', 'in_progress', 'done', 'cancelled'];

const EMPTY_TASK = { title: '', description: '', priority: 'medium', status: 'todo', dueDate: '', subtasks: [], tags: [] };

export default function TasksPage() {
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editTask, setEditTask] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_TASK);
    const [expanded, setExpanded] = useState({});
    const [subtaskInput, setSubtaskInput] = useState('');

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/tasks?status=${filter === 'all' ? '' : filter}&search=${search}&limit=100`);
            const data = await res.json();
            if (data.success) setTasks(data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchTasks(); }, [filter, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editTask ? 'PUT' : 'POST';
            const url = editTask ? `/api/tasks/${editTask._id}` : '/api/tasks';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) {
                toast.success(editTask ? 'Task updated!' : 'Task created!');
                setShowAdd(false); setEditTask(null); setForm(EMPTY_TASK); fetchTasks();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this task?')) return;
        await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchTasks();
    };

    const toggleDone = async (task) => {
        const newStatus = task.status === 'done' ? 'todo' : 'done';
        await fetch(`/api/tasks/${task._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: newStatus }) });
        fetchTasks();
    };

    const openEdit = (t) => {
        setForm({ title: t.title, description: t.description || '', priority: t.priority, status: t.status, dueDate: t.dueDate ? t.dueDate.slice(0, 10) : '', subtasks: t.subtasks || [], tags: t.tags || [] });
        setEditTask(t); setShowAdd(true);
    };

    const addSubtask = () => {
        if (!subtaskInput.trim()) return;
        setForm(p => ({ ...p, subtasks: [...p.subtasks, { title: subtaskInput, done: false }] }));
        setSubtaskInput('');
    };

    const toggleSubtask = (idx) => {
        const subtasks = form.subtasks.map((s, i) => i === idx ? { ...s, done: !s.done } : s);
        setForm(p => ({ ...p, subtasks }));
    };

    const groups = { todo: [], in_progress: [], done: [], cancelled: [] };
    tasks.filter(t => filter === 'all' || t.status === filter)
        .filter(t => !search || t.title.toLowerCase().includes(search.toLowerCase()))
        .forEach(t => { if (groups[t.status]) groups[t.status].push(t); });

    const completedPct = tasks.length ? Math.round((groups.done.length / tasks.length) * 100) : 0;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditTask(null); setForm(EMPTY_TASK); }}
                title={editTask ? 'Edit Task' : 'New Task'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Task Title" required>
                        <input required className={inputCls} placeholder="What needs to be done?" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                    </FormField>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <FormField label="Priority">
                            <select className={inputCls} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                {['low', 'medium', 'high', 'urgent'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {STATUS_OPTS.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Due Date">
                            <input type="date" className={inputCls} value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                        </FormField>
                    </div>
                    <FormField label="Description">
                        <textarea className={inputCls} rows={3} value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </FormField>

                    {/* Subtasks */}
                    <div>
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-2">Subtasks</p>
                        <div className="space-y-2 mb-2">
                            {form.subtasks.map((sub, i) => (
                                <div key={i} className="flex items-center gap-2">
                                    <button type="button" onClick={() => toggleSubtask(i)} className={cn('w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-all', sub.done ? 'bg-[var(--primary-500)] border-[var(--primary-500)] text-white' : 'border-[var(--border)]')}>{sub.done && <CheckCircle size={10} />}</button>
                                    <span className={cn('text-sm flex-1', sub.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]')}>{sub.title}</span>
                                    <button type="button" onClick={() => setForm(p => ({ ...p, subtasks: p.subtasks.filter((_, j) => j !== i) }))} className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg">✕</button>
                                </div>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input value={subtaskInput} onChange={e => setSubtaskInput(e.target.value)} placeholder="Add subtask..." onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSubtask())}
                                className="flex-1 px-3 py-2 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 transition-all" />
                            <button type="button" onClick={addSubtask} className="px-3 py-2 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-sm text-[var(--text-muted)] hover:text-[var(--primary-500)] transition-all"><Plus size={14} /></button>
                        </div>
                    </div>

                    <FormActions onClose={() => { setShowAdd(false); setEditTask(null); setForm(EMPTY_TASK); }} loading={saving} submitLabel={editTask ? 'Update Task' : 'Create Task'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Tasks</h1>
                    <p className="text-[var(--text-muted)] text-sm">{tasks.length} tasks · {completedPct}% complete</p>
                </div>
                <button onClick={() => { setForm(EMPTY_TASK); setEditTask(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> New Task
                </button>
            </div>

            {/* KPI */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: tasks.length, icon: CheckSquare, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'In Progress', value: groups.in_progress.length, icon: Clock, color: 'text-blue-500 bg-blue-500/10' },
                    { label: 'Urgent', value: tasks.filter(t => t.priority === 'urgent' && t.status !== 'done').length, icon: AlertTriangle, color: 'text-rose-500 bg-rose-500/10' },
                    { label: 'Done', value: groups.done.length, icon: CheckCircle, color: 'text-emerald-500 bg-emerald-500/10' },
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
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {['all', ...STATUS_OPTS].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                                filter === s ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {s === 'all' ? 'All' : s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}
                        </button>
                    ))}
                </div>
            </div>

            {/* Task columns */}
            {loading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 animate-pulse h-20" />)}</div>
            ) : tasks.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-16 text-center"><CheckSquare size={40} className="mx-auto text-[var(--text-muted)] opacity-40 mb-4" /><p className="text-[var(--text-muted)]">No tasks yet</p></div>
            ) : (
                <div className="space-y-6">
                    {Object.entries(groups).filter(([, items]) => items.length > 0 || filter === 'all').map(([status, items]) => (
                        items.length > 0 && (
                            <div key={status}>
                                <div className="flex items-center gap-2 mb-3">
                                    <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">{status.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</h2>
                                    <span className="text-xs bg-[var(--surface-overlay)] text-[var(--text-muted)] rounded-full px-2 py-0.5 border border-[var(--border)]">{items.length}</span>
                                </div>
                                <div className="space-y-3">
                                    {items.map(task => {
                                        const pc = PRIORITY_CFG[task.priority] || PRIORITY_CFG.medium;
                                        const doneSubtasks = (task.subtasks || []).filter(s => s.done).length;
                                        const totalSubtasks = (task.subtasks || []).length;
                                        const isExpanded = expanded[task._id];
                                        return (
                                            <div key={task._id} className={cn('bg-[var(--card-bg)] border border-[var(--card-border)] border-l-4 rounded-xl shadow-sm hover:shadow-md transition-all group', pc.border)}>
                                                <div className="p-4">
                                                    <div className="flex items-start gap-3">
                                                        <button onClick={() => toggleDone(task)}
                                                            className={cn('mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all', task.status === 'done' ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-[var(--border)] hover:border-emerald-500')}>
                                                            {task.status === 'done' && <CheckCircle size={12} />}
                                                        </button>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <p className={cn('text-sm font-semibold', task.status === 'done' ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-primary)]')}>{task.title}</p>
                                                                <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                                                    <button onClick={() => openEdit(task)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={13} /></button>
                                                                    <button onClick={() => handleDelete(task._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={13} /></button>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-wrap items-center gap-2 mt-1.5">
                                                                <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full', pc.color)}>{task.priority}</span>
                                                                {task.dueDate && <span className="text-xs text-[var(--text-muted)]">Due {formatDate(task.dueDate)}</span>}
                                                                {totalSubtasks > 0 && (
                                                                    <button onClick={() => setExpanded(p => ({ ...p, [task._id]: !p[task._id] }))}
                                                                        className="flex items-center gap-1 text-xs text-[var(--text-muted)] hover:text-[var(--primary-500)] transition-all">
                                                                        {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                                                                        {doneSubtasks}/{totalSubtasks} subtasks
                                                                    </button>
                                                                )}
                                                            </div>
                                                            {task.description && <p className="text-xs text-[var(--text-muted)] mt-1 line-clamp-2">{task.description}</p>}
                                                        </div>
                                                    </div>

                                                    {/* Subtasks */}
                                                    {isExpanded && totalSubtasks > 0 && (
                                                        <div className="mt-3 ml-8 space-y-2 pt-3 border-t border-[var(--border)]">
                                                            {task.subtasks.map((sub, i) => (
                                                                <div key={i} className="flex items-center gap-2">
                                                                    <div className={cn('w-3.5 h-3.5 rounded border-2 flex-shrink-0 flex items-center justify-center', sub.done ? 'bg-[var(--primary-500)] border-[var(--primary-500)] text-white' : 'border-[var(--border)]')}>
                                                                        {sub.done && <CheckCircle size={8} />}
                                                                    </div>
                                                                    <span className={cn('text-xs', sub.done ? 'line-through text-[var(--text-muted)]' : 'text-[var(--text-secondary)]')}>{sub.title}</span>
                                                                </div>
                                                            ))}
                                                            {totalSubtasks > 0 && (
                                                                <div className="h-1 bg-[var(--surface-overlay)] rounded-full overflow-hidden mt-2">
                                                                    <div className="h-full bg-[var(--primary-500)] rounded-full" style={{ width: `${(doneSubtasks / totalSubtasks) * 100}%` }} />
                                                                </div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    ))}
                </div>
            )}
        </div>
    );
}
