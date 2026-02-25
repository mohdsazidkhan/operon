'use client';

import { Plus, MoreHorizontal, UserCircle2, Calendar, Tag, AlertCircle, GripVertical, Search, Filter } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const initialBoards = {
    'Backlog': [
        { id: 't1', title: 'Neural Pipeline Refactor', tag: 'Architect', priority: 'high', date: 'Mar 24', members: ['SJ'] },
        { id: 't2', title: 'Global CI/CD Integration', tag: 'Ops', priority: 'medium', date: 'Mar 25', members: ['AM'] },
        { id: 't3', title: 'Audit Protocol 9.4', tag: 'Audit', priority: 'urgent', date: 'Mar 22', members: ['EW', 'SJ'] },
    ],
    'In Motion': [
        { id: 't4', title: 'Lead Velocity Dashboard', tag: 'Frontend', priority: 'high', date: 'Mar 26', members: ['DW'] },
        { id: 't5', title: 'Capital Flow API Core', tag: 'Backend', priority: 'medium', date: 'Mar 28', members: ['SJ'] },
    ],
    'Validation': [
        { id: 't6', title: 'CRM Bulk Action Delta', tag: 'Frontend', priority: 'low', date: 'Mar 20', members: ['AM'] },
    ],
    'Serialized': [
        { id: 't7', title: 'MongoDB Cluster Scaling', tag: 'Backend', priority: 'high', date: 'Mar 15', members: ['SJ'] },
        { id: 't8', title: 'Fiscal Year 2024 Audit', tag: 'Finance', priority: 'medium', date: 'Mar 10', members: ['EW'] },
    ],
};

const priorityStyles = {
    urgent: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
    high: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    medium: 'text-primary-500 bg-primary-500/10 border-primary-500/20',
    low: 'text-slate-500 bg-slate-500/10 border-slate-500/20'
};

const tagStyles = {
    Architect: 'bg-indigo-500/10 text-indigo-400',
    Ops: 'bg-emerald-500/10 text-emerald-400',
    Audit: 'bg-rose-500/10 text-rose-400',
    Frontend: 'bg-primary-500/10 text-primary-400',
    Backend: 'bg-purple-500/10 text-purple-400',
    Finance: 'bg-amber-500/10 text-amber-400'
};

export default function KanbanPage() {
    const [boards, setBoards] = useState(initialBoards);

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
                <div className="flex gap-3">
                    <button className="h-14 px-8 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                        <Plus size={18} /> Initialize Task
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-x-auto pb-8 scrollbar-hide">
                {Object.entries(boards).map(([col, tasks], colIdx) => (
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
                                {tasks.map(task => (
                                    <div
                                        key={task.id}
                                        className="bg-slate-950/40 backdrop-blur-xl rounded-[2rem] border border-slate-800 p-6 cursor-grab hover:border-primary-500/50 hover:shadow-[0_0_20px_rgba(139,92,246,0.1)] transition-all group/item"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <span className={cn('text-[9px] px-3 py-1.5 rounded-xl font-black uppercase tracking-widest', tagStyles[task.tag] || 'bg-slate-900 text-slate-600')}>#{task.tag}</span>
                                            <span className={cn('text-[9px] px-2.5 py-1.5 rounded-xl font-black uppercase tracking-[0.2em] border', priorityStyles[task.priority])}>{task.priority}</span>
                                        </div>

                                        <h3 className="text-xs font-black text-white uppercase tracking-tight mb-6 group-hover/item:text-primary-400 transition-colors leading-relaxed">
                                            {task.title}
                                        </h3>

                                        <div className="flex items-center justify-between">
                                            <div className="flex -space-x-2">
                                                {task.members.map((m, idx) => (
                                                    <div key={idx} className="w-8 h-8 rounded-xl bg-slate-900 border-2 border-slate-950 flex items-center justify-center text-[9px] font-black text-primary-500 shadow-2xl transition-transform hover:scale-110 hover:z-20 cursor-pointer">
                                                        {m}
                                                    </div>
                                                ))}
                                                <div className="w-8 h-8 rounded-xl bg-slate-950 border-2 border-slate-900 flex items-center justify-center text-slate-700 hover:text-white transition-colors cursor-pointer">
                                                    <Plus size={12} />
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-xl border border-slate-800">
                                                <Calendar size={12} className="text-slate-600" />
                                                <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{task.date}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                <button className="w-full py-6 rounded-[2rem] border-2 border-dashed border-slate-800/50 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em] hover:border-primary-500/50 hover:text-primary-400 transition-all flex items-center justify-center gap-3 group/add">
                                    <Plus size={16} className="group-hover/add:scale-110 transition-transform" /> Sequence Item
                                </button>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Add Section */}
                <div className="flex-shrink-0 w-[400px]">
                    <button className="w-full h-full rounded-[3rem] border-2 border-dashed border-slate-800/30 text-slate-800 hover:border-slate-800 hover:text-slate-600 transition-all flex flex-col items-center justify-center gap-4 group">
                        <div className="w-16 h-16 rounded-3xl bg-slate-900/50 border border-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Plus size={32} />
                        </div>
                        <span className="text-xs font-black uppercase tracking-[0.4em]">Initialize Section</span>
                    </button>
                </div>
            </div>
        </div>
    );
}
