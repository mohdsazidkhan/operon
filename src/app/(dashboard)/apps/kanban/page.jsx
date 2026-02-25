'use client';

import { Plus, MoreHorizontal, UserCircle2, Calendar, Tag, AlertCircle, GripVertical, Search, Filter } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_MAP = {
    'Backlog': 'todo',
    'In Motion': 'in_progress',
    'Validation': 'review',
    'Serialized': 'done'
};

const REV_STATUS_MAP = {
    'todo': 'Backlog',
    'in_progress': 'In Motion',
    'review': 'Validation',
    'done': 'Serialized'
};

const priorityStyles = {
    urgent: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    high: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    medium: 'text-primary-500 bg-primary-500/10 border-primary-500/20',
    low: 'text-slate-500 bg-slate-500/10 border-slate-500/20'
};

export default function KanbanPage() {
    const [boards, setBoards] = useState({
        'Backlog': [],
        'In Motion': [],
        'Validation': [],
        'Serialized': []
    });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchTasks = async () => {
        try {
            const res = await fetch(`/api/tasks?search=${search}`);
            const data = await res.json();
            if (data.success) {
                const grouped = {
                    'Backlog': [],
                    'In Motion': [],
                    'Validation': [],
                    'Serialized': []
                };
                data.data.forEach(task => {
                    const col = REV_STATUS_MAP[task.status] || 'Backlog';
                    grouped[col].push(task);
                });
                setBoards(grouped);
            }
        } catch (err) {
            toast.error('Neural link failure: Could not retrieve task stream');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
    }, [search]);

    const handleCreateTask = async (col) => {
        const title = prompt('SEQUENCE NEW DATA PACKET (Task Title):');
        if (!title) return;

        try {
            const res = await fetch('/api/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    status: STATUS_MAP[col],
                    priority: 'medium',
                    module: 'general'
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Sequence initialized successfully');
                fetchTasks();
            }
        } catch (err) {
            toast.error('Failed to sequence new item');
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Neural Kanban Board</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                        <GripVertical size={12} className="text-primary-500" />
                        High-Velocity Task Orchestration • Real-time Synchronization
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-primary-500 transition-colors" />
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="QUERY TASK HASH..."
                            className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-800"
                        />
                    </div>
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                {Object.entries(boards).map(([col, tasks]) => (
                    <div key={col} className="flex-shrink-0 w-[400px] flex flex-col h-full">
                        <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 flex flex-col h-full group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary-500/10 transition-all duration-700"></div>

                            <div className="flex items-center justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-4">
                                    <span className="text-xl font-black text-white uppercase tracking-tighter italic">{col}</span>
                                    <div className="px-3 py-1 rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-black text-primary-500 shadow-inner">
                                        {tasks.length}
                                    </div>
                                </div>
                                <button className="p-3 rounded-2xl bg-slate-950 border border-slate-800 text-slate-700 hover:text-white transition-all"><MoreHorizontal size={18} /></button>
                            </div>

                            <div className="flex-1 overflow-y-auto space-y-6 relative z-10 scrollbar-hide">
                                {loading && tasks.length === 0 ? (
                                    <div className="py-12 text-center text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] animate-pulse">Decrypting Segment...</div>
                                ) : tasks.map(task => (
                                    <div
                                        key={task._id}
                                        className="bg-slate-950/40 backdrop-blur-xl rounded-[2rem] border border-slate-800 p-6 cursor-grab hover:border-primary-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all group/item"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className="text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest bg-primary-500/10 text-primary-400">#{task.module}</span>
                                            <span className={cn('text-[9px] px-2.5 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] border', priorityStyles[task.priority])}>{task.priority}</span>
                                        </div>

                                        <h3 className="text-xs font-black text-white uppercase tracking-tight mb-6 group-hover/item:text-primary-400 transition-colors leading-relaxed">
                                            {task.title}
                                        </h3>

                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-[9px] font-black text-primary-500">
                                                    {task.assignee?.name?.substring(0, 2).toUpperCase() || 'SYS'}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
                                                <Calendar size={12} className="text-slate-600" />
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">
                                                    {task.dueDate ? new Date(task.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric' }) : 'ASAP'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => handleCreateTask(col)}
                                    className="w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-800/50 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] hover:border-primary-500/50 hover:text-primary-400 transition-all flex items-center justify-center gap-3 group/add"
                                >
                                    <Plus size={16} className="group-hover/add:scale-110 transition-transform" /> Sequence Item
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
