'use client';

import { useState, useEffect } from 'react';
import { Plus, CheckCircle, XCircle, Clock, Calendar, AlertCircle, Filter, Search, MoreVertical, Check, X } from 'lucide-react';
import { formatDate, getStatusColor, cn } from '@/lib/utils';

export default function LeavesPage() {
    const [leaves, setLeaves] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchLeaves = async () => {
            try {
                const res = await fetch(`/api/leaves?search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setLeaves(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch leaves:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeaves();
    }, [search]);

    const stats = [
        { label: 'Authorized', count: leaves.filter(l => l.status === 'approved').length, color: 'text-emerald-500', bg: 'bg-emerald-500/5', border: 'border-emerald-500/10' },
        { label: 'Awaiting Review', count: leaves.filter(l => l.status === 'pending').length, color: 'text-amber-500', bg: 'bg-amber-500/5', border: 'border-amber-500/10' },
        { label: 'Cumulative Absence', count: leaves.filter(l => l.status === 'approved').reduce((s, l) => s + (l.days || 0), 0), color: 'text-primary-500', bg: 'bg-primary-500/5', border: 'border-primary-500/10' },
    ];

    const handleAction = async (id, action) => {
        try {
            const res = await fetch(`/api/leaves/${id}/${action}`, { method: 'POST' });
            if (res.ok) {
                setLeaves(prev => prev.map(l => l._id === id ? { ...l, status: action === 'approve' ? 'approved' : 'rejected' } : l));
            }
        } catch (err) {
            console.error(`Failed to ${action} leave:`, err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Time-Off Protocol</h1>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-2">
                        Resource Availability Ledger • {leaves.length} Applications Detected
                    </p>
                </div>
                <button className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-2xl shadow-primary-500/20">
                    <Plus size={16} /> Lodge Application
                </button>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className={cn('rounded-3xl p-6 border backdrop-blur-sm shadow-xl relative overflow-hidden group', s.bg, s.border)}>
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-all duration-500"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-2">{s.label}</p>
                        <p className={cn('text-3xl font-black tracking-tight', s.color)}>{s.count} <span className="text-xs uppercase ml-1 italic">{i === 2 ? 'Days' : 'Files'}</span></p>
                    </div>
                ))}
            </div>

            {/* Toolbar */}
            <div className="flex bg-slate-900/50 p-2 rounded-3xl border border-slate-800 backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="SEARCH BY PERSONNEL NAME OR REASON..."
                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-[10px] font-black uppercase tracking-[0.2em] text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-800"
                    />
                </div>
                <button className="px-6 py-4 rounded-2xl bg-slate-800 text-slate-400 hover:text-white transition-all font-black text-[10px] uppercase tracking-widest border border-slate-700 ml-3">
                    <Filter size={16} /> Filter
                </button>
            </div>

            {/* Applications List */}
            <div className="space-y-4 pb-12">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-28 bg-slate-900/50 animate-pulse rounded-[2rem] border border-slate-800"></div>
                    ))
                ) : leaves.length === 0 ? (
                    <div className="py-20 text-center bg-slate-900/40 rounded-[2.5rem] border border-slate-800 border-dashed">
                        <Calendar size={48} className="mx-auto text-slate-800 mb-4 opacity-50" />
                        <h3 className="text-xs font-black text-slate-700 uppercase tracking-widest italic">Zero application delta</h3>
                    </div>
                ) : leaves.map(leave => (
                    <div key={leave._id} className="bg-slate-900/50 backdrop-blur-xl rounded-[2.5rem] border border-slate-800 p-6 shadow-2xl hover:border-slate-700 transition-all group relative overflow-hidden flex flex-wrap items-center gap-8">
                        {/* Glow effect for status */}
                        <div className={cn(
                            'absolute top-0 right-0 w-40 h-40 blur-[100px] -mr-20 -mt-20 opacity-10',
                            leave.status === 'approved' ? 'bg-emerald-500' : leave.status === 'pending' ? 'bg-amber-500' : 'bg-rose-500'
                        )}></div>

                        <div className="flex items-center gap-4 min-w-[240px] flex-1">
                            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-slate-950 shadow-2xl shrink-0 group-hover:scale-105 transition-transform duration-500">
                                <img src={leave.employee?.avatar || 'https://i.pravatar.cc/150'} alt="" className="w-full h-full object-cover" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-black text-white group-hover:text-primary-400 transition-colors uppercase tracking-tight">{leave.employee?.name}</p>
                                <p className="text-[10px] font-bold text-slate-500 line-clamp-1 italic mt-0.5">{leave.reason}</p>
                            </div>
                        </div>

                        <div className="text-center px-4">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Category</p>
                            <span className="text-[10px] font-black text-slate-200 uppercase bg-slate-800/80 px-3 py-1 rounded-lg border border-slate-700">{leave.type}</span>
                        </div>

                        <div className="text-center px-4">
                            <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Quantifier</p>
                            <p className="text-sm font-black text-white">{leave.days} <span className="text-[9px] text-slate-500 uppercase">Days</span></p>
                        </div>

                        <div className="flex items-center gap-6 px-4">
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Initiation</p>
                                <p className="text-[11px] font-bold text-slate-400">{formatDate(leave.startDate)}</p>
                            </div>
                            <ArrowRight size={14} className="text-slate-800" />
                            <div className="text-center">
                                <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Termination</p>
                                <p className="text-[11px] font-bold text-slate-400">{formatDate(leave.endDate)}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                            <div className={cn(
                                'inline-flex items-center gap-2 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all',
                                getStatusColor(leave.status)
                            )}>
                                {leave.status === 'approved' ? <CheckCircle size={12} /> : leave.status === 'pending' ? <Clock size={12} /> : <XCircle size={12} />}
                                {leave.status}
                            </div>

                            {leave.status === 'pending' && (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => handleAction(leave._id, 'approve')}
                                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all shadow-lg hover:shadow-emerald-500/20"
                                        title="Approve protocol"
                                    >
                                        <Check size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleAction(leave._id, 'reject')}
                                        className="h-9 w-9 flex items-center justify-center rounded-xl bg-rose-500/10 text-rose-500 border border-rose-500/20 hover:bg-rose-500 hover:text-white transition-all shadow-lg hover:shadow-rose-500/20"
                                        title="Reject protocol"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            <button className="p-2 text-slate-700 hover:text-white transition-colors">
                                <MoreVertical size={18} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
