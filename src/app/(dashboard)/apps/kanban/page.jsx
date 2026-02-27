'use client';

import { Plus, MoreHorizontal, UserCircle2, Calendar, Tag, AlertCircle, GripVertical, Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const STATUS_MAP = {
    'To Do': 'todo',
    'In Progress': 'in_progress',
    'In Review': 'review',
    'Done': 'done'
};

const REV_STATUS_MAP = {
    'todo': 'To Do',
    'in_progress': 'In Progress',
    'review': 'In Review',
    'done': 'Done'
};

const priorityStyles = {
    urgent: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    high: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    medium: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10 border-[var(--primary-500)]/20',
    low: 'text-[var(--text-muted)] bg-[var(--text-muted)]/10 border-[var(--text-muted)]/20'
};

const EMPTY_TASK = { title: '', priority: 'medium', module: 'general', dueDate: '', description: '' };

export default function KanbanPage() {
    const [boards, setBoards] = useState({
        'To Do': [],
        'In Progress': [],
        'In Review': [],
        'Done': []
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [activeCol, setActiveCol] = useState('To Do');
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_TASK);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/api/tasks?search=${search}`);
            const data = await res.json();
            if (data.success) {
                const grouped = {
                    'To Do': [],
                    'In Progress': [],
                    'In Review': [],
                    'Done': []
                };
                data.data.forEach(task => {
                    const col = REV_STATUS_MAP[task.status] || 'To Do';
                    grouped[col].push(task);
                });
                setBoards(grouped);
            }
        } catch (err) {
            toast.error('Could not load tasks. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [search]);

    const handleCreateTask = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    status: STATUS_MAP[activeCol],
                    dueDate: form.dueDate ? new Date(form.dueDate) : undefined
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Task created!');
                setShowAdd(false);
                setForm(EMPTY_TASK);
                fetchTasks();
            } else {
                toast.error(data.message || 'Failed to create task');
            }
        } catch { toast.error('Failed to create task'); }
        finally { setSaving(false); }
    };

    const openAdd = (col) => { setActiveCol(col); setShowAdd(true); };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
            {/* Add Task Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title={`Add Task to "${activeCol}"`} size="md">
                <form onSubmit={handleCreateTask} className="space-y-4">
                    <FormField label="Task Title" required>
                        <input required className={inputCls} placeholder="e.g. Fix login page bug" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Priority">
                            <select className={inputCls} value={form.priority} onChange={e => setForm(p => ({ ...p, priority: e.target.value }))}>
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                                <option value="urgent">Urgent</option>
                            </select>
                        </FormField>
                        <FormField label="Due Date">
                            <input type="date" className={inputCls} value={form.dueDate} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                        </FormField>
                    </div>
                    <FormField label="Module / Area">
                        <input className={inputCls} placeholder="e.g. Frontend, Backend, HR" value={form.module} onChange={e => setForm(p => ({ ...p, module: e.target.value }))} />
                    </FormField>
                    <FormField label="Description">
                        <textarea rows={2} className={inputCls + " resize-none"} placeholder="Task details..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </FormField>
                    <FormActions onClose={() => setShowAdd(false)} loading={saving} submitLabel="Add Task" />
                </form>
            </Modal>

            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2 mb-8">

                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Task Board</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                        <GripVertical size={12} className="text-[var(--primary-500)]" />
                        Organize and track your team's tasks
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-[var(--primary-500)] transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Search tasks..."
                            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-[var(--surface-overlay)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                {Object.entries(boards).map(([col, tasks]) => (
                    <div key={col} className="flex-shrink-0 w-[400px] flex flex-col h-full">
                        <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 flex flex-col h-full group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-500)]/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-[var(--primary-500)]/10 transition-all duration-700"></div>

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{col}</span>
                                    <div className="px-3 py-1 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[10px] font-black text-[var(--primary-500)] shadow-inner">
                                        {tasks.length}
                                    </div>
                                </div>
                                <button className="p-3 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><MoreHorizontal size={18} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 relative z-10 scrollbar-hide">
                                {loading && tasks.length === 0 ? (
                                    <div className="py-12 text-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] animate-pulse">Loading tasks...</div>
                                ) : tasks.map(task => (
                                    <div
                                        key={task._id}
                                        className="bg-[var(--surface-overlay)]/40 backdrop-blur-xl rounded-[2rem] border border-[var(--border)] p-6 cursor-grab hover:border-[var(--primary-500)]/50 hover:shadow-[0_0_20px_var(--glow-primary)] transition-all group/item"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest bg-[var(--primary-500)]/10 text-[var(--primary-400)]">#{task.module}</span>
                                            <span className={cn('text-[9px] px-2.5 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] border', priorityStyles[task.priority])}>{task.priority}</span>
                                        </div>

                                        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight mb-6 group-hover/item:text-[var(--primary-500)] transition-colors leading-relaxed">
                                            {task.title}
                                        </h3>

                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-xl bg-[var(--surface-overlay)] border-2 border-[var(--surface)] flex items-center justify-center text-[9px] font-black text-[var(--primary-500)]">
                                                    {task.assignee?.name?.substring(0, 2).toUpperCase() || 'SYS'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--surface-overlay)] rounded-xl border border-[var(--border)]">
                                                <Calendar size={12} className="text-[var(--text-muted)]" />
                                                <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'ASAP'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => openAdd(col)}
                                    className="w-full py-6 rounded-[2rem] border-2 border-dashed border-[var(--border)]/50 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] hover:border-[var(--primary-500)]/50 hover:text-[var(--primary-500)] transition-all flex items-center justify-center gap-3 group/add"
                                >
                                    <Plus size={16} className="group-hover/add:scale-110 transition-transform" /> Add Task
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
