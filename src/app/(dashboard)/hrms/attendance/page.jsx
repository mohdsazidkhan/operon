'use client';

import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle, Calendar, ArrowRight, UserCheck, Search, Filter } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

const statusIcon = { present: CheckCircle, absent: XCircle, late: AlertCircle, on_leave: Clock };
const statusCls = {
    present: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]',
    absent: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]',
    late: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-[0_0_10px_rgba(245,158,11,0.1)]',
    on_leave: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]'
};

export default function AttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchAttendance = async () => {
            try {
                const res = await fetch(`/api/attendance/summary?date=${new Date().toISOString().split('T')[0]}&search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setAttendance(data.data.records || []);
                }
            } catch (err) {
                console.error('Failed to fetch attendance:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAttendance();
    }, [search]);

    const present = attendance.filter(a => a.status === 'present').length;
    const absent = attendance.filter(a => a.status === 'absent').length;
    const late = attendance.filter(a => a.status === 'late').length;
    const onLeave = attendance.filter(a => a.status === 'on_leave').length;

    const stats = [
        { label: 'Present', count: present, color: 'text-emerald-500', icon: CheckCircle2 },
        { label: 'Absent', count: absent, color: 'text-rose-500', icon: XCircle },
        { label: 'Late', count: late, color: 'text-amber-500', icon: Clock },
        { label: 'On Leave', count: onLeave, color: 'text-blue-500', icon: Calendar },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">Attendance Tracking</h1>
                    <p className="text-[var(--text-muted)] text-sm font-bold tracking-widest mt-1">
                        Presence Monitoring • Real-time Summary
                    </p>
                </div>
                <div className="flex items-center gap-3 mt-2">
                    <Calendar size={14} className="text-[var(--primary-500)]" />
                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{formatDate(new Date(), { weekday: 'long' })}</span>
                </div>
            </div>

            {/* Real-time Tally */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] backdrop-blur-sm rounded-[2rem] p-6 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group hover:border-[var(--primary-500)]/30 transition-all">
                        <div className="flex items-center justify-between mb-3 relative z-10">
                            <div className={cn('p-3 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] transition-colors', s.color)}>
                                <s.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{s.label}</span>
                        </div>
                        <p className={cn('text-4xl font-black tracking-tighter relative z-10', s.color)}>{s.count}</p>
                        <div className="absolute -right-4 -bottom-4 opacity-5 translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                            <s.icon size={80} className={s.color} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Attendance Ledger */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="SEARCH BY NAME OR DEPT..."
                            className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-3 rounded-2xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all font-black text-[10px] uppercase tracking-widest border border-[var(--border)]">
                            Export logs
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 border border-rose-500/30 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
                            <Activity size={14} /> Clock-out all
                        </button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] bg-[var(--surface-overlay)]/30">
                            <tr>
                                <th className="py-5 px-6">Name</th>
                                <th className="py-5 px-6">Check-in time</th>
                                <th className="py-5 px-6">Status</th>
                                <th className="py-5 px-6">Shift</th>
                                <th className="py-5 px-6">Location</th>
                                <th className="py-5 px-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] font-bold tracking-widest uppercase text-[10px]">Loading attendance...</td></tr>
                            ) : attendance.length === 0 ? (
                                <tr><td colSpan="6" className="py-16 text-center text-[var(--text-muted)] font-bold tracking-widest uppercase text-[10px]">No data found</td></tr>
                            ) : attendance.map(a => {
                                const Icon = statusIcon[a.status] || CheckCircle;
                                return (
                                    <tr key={a._id} className="hover:bg-[var(--primary-500)]/[0.02] transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl overflow-hidden ring-2 ring-[var(--border)] group-hover:ring-[var(--primary-500)]/30 transition-all">
                                                    <img
                                                        src={a.employee?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.employee?.name || '')}&background=8b5cf6&color=fff`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight">{a.employee?.name}</p>
                                                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{a.employee?.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                                                <Clock size={12} className="text-[var(--text-muted)]" />
                                                {a.checkIn || '—'}
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-muted)]">
                                                <ArrowRight size={12} className="text-[var(--border)]" />
                                                {a.checkOut || 'Active'}
                                            </div>
                                        </td>
                                        <td className="py-5 px-8 text-sm font-black text-[var(--text-primary)]">
                                            {a.hours > 0 ? `${a.hours}h` : '—'}
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border transition-all', statusCls[a.status])}>
                                                <Icon size={12} />
                                                {a.status.replace('_', ' ')}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
