'use client';

import { useState, useEffect } from 'react';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { Edit, Trash2, MoreVertical, ShieldCheck, Download, Power, Activity, CheckCircle2, XCircle, Clock, Calendar, CheckCircle, Search, Filter, Plus } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const EMPTY_ATT = { employee: '', status: 'present', checkIn: '', checkOut: '', date: new Date().toISOString().split('T')[0] };

const statusIcon = {
    present: CheckCircle2,
    late: Clock,
    absent: XCircle,
    on_leave: Calendar
};

const statusCls = {
    present: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20 shadow-emerald-500/10',
    late: 'text-amber-500 bg-amber-500/10 border-amber-500/20 shadow-amber-500/10',
    absent: 'text-rose-500 bg-rose-500/10 border-rose-500/20 shadow-rose-500/10',
    on_leave: 'text-blue-500 bg-blue-500/10 border-blue-500/20 shadow-blue-500/10'
};

export default function AttendancePage() {
    const [attendance, setAttendance] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingAtt, setEditingAtt] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_ATT);
    const [isMounted, setIsMounted] = useState(false);
    const canManageAttendance = usePermission('hrms.attendance.manage');

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchAttendance = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/attendance/summary?date=${new Date().toISOString().split('T')[0]}&search=${search}`);
            const data = await res.json();
            if (data.success) setAttendance(data.data.records || []);
        } catch (err) {
            console.error('Failed to fetch attendance:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchEmployees = async () => {
        try {
            const res = await fetch('/api/employees');
            const data = await res.json();
            if (data.success) setEmployees(data.data);
        } catch (err) { console.error('Failed to fetch employees:', err); }
    };

    useEffect(() => {
        fetchAttendance();
        fetchEmployees();
    }, [search]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingAtt ? `/api/attendance/${editingAtt._id}` : '/api/attendance';
            const method = editingAtt ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingAtt ? 'Log Corrected' : 'Entry Logged');
                setShowAdd(false);
                setEditingAtt(null);
                setForm(EMPTY_ATT);
                fetchAttendance();
            } else {
                toast.error(data.message || 'Transmission failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this attendance log? This will affect payroll metrics.')) return;
        try {
            const res = await fetch(`/api/attendance/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Log purged');
                fetchAttendance();
            }
        } catch { toast.error('Purge failed'); }
    };

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
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Log Entry Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingAtt(null); setForm(EMPTY_ATT); }} title={editingAtt ? "Correct Attendance Log" : "Manual Attendance Entry"} size="md">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <FormField label="Staff Member" required>
                        <select required className={inputCls} value={form.employee} onChange={e => setForm(p => ({ ...p, employee: e.target.value }))}>
                            <option value="">Select Personnel...</option>
                            {employees.map(e => <option key={e._id} value={e._id}>{e.name} ({e.department})</option>)}
                        </select>
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Status" required>
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                <option value="present">Present</option>
                                <option value="late">Late</option>
                                <option value="absent">Absent</option>
                                <option value="on_leave">On Leave</option>
                            </select>
                        </FormField>
                        <FormField label="Date" required>
                            <input required type="date" className={inputCls} value={form.date} onChange={e => setForm(p => ({ ...p, date: e.target.value }))} />
                        </FormField>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Check In">
                            <input type="time" className={inputCls} value={form.checkIn} onChange={e => setForm(p => ({ ...p, checkIn: e.target.value }))} />
                        </FormField>
                        <FormField label="Check Out">
                            <input type="time" className={inputCls} value={form.checkOut} onChange={e => setForm(p => ({ ...p, checkOut: e.target.value }))} />
                        </FormField>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditingAtt(null); }} loading={saving} submitLabel={editingAtt ? "Sync Correction" : "Authorize Log"} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-4 underline-offset-8">Neural Attendance</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-6 flex items-center gap-2">
                        <Activity size={12} className="text-emerald-500" />
                        Presence Monitoring • Level {attendance.length} Active Logs
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-3 px-6 py-3 bg-[var(--surface-overlay)] border border-[var(--border)] rounded-2xl shadow-xl">
                        <Calendar size={14} className="text-[var(--primary-500)]" />
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">
                            {isMounted ? formatDate(new Date(), { weekday: 'long' }) : 'Syncing...'}
                        </span>
                    </div>
                    <Can permission="hrms.attendance.manage">
                        <button onClick={() => setShowAdd(true)} className="px-8 py-3 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                            Override Log
                        </button>
                    </Can>
                </div>
            </div>

            {/* Real-time Tally */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] p-8 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group hover:border-[var(--primary-500)]/40 transition-all duration-700 h-44 flex flex-col justify-between">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-500)] opacity-0 group-hover:opacity-5 blur-[60px] transition-opacity"></div>
                        <div className="flex items-center justify-between relative z-10">
                            <div className={cn('p-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] shadow-xl group-hover:scale-110 transition-transform duration-500', s.color)}>
                                <s.icon size={22} />
                            </div>
                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40 italic">{s.label}</span>
                        </div>
                        <p className={cn('text-5xl font-black tracking-tighter relative z-10 font-mono', s.color)}>{s.count.toString().padStart(2, '0')}</p>
                    </div>
                ))}
            </div>

            {/* Attendance Ledger */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-6 bg-[var(--surface-overlay)]/30">
                    <div className="relative flex-1 max-w-lg group">
                        <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="QUERY PERSONNEL OR DEPT..."
                            className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-[var(--surface-overlay)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all placeholder:text-[var(--text-muted)]"
                        />
                    </div>
                    <div className="flex gap-4">
                        <button className="flex items-center gap-3 px-8 py-4 rounded-[2rem] bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all font-black text-[10px] uppercase tracking-widest border border-[var(--border)] shadow-xl">
                            <Download size={16} /> Export Metrics
                        </button>
                        <Can permission="hrms.attendance.manage">
                            <button className="flex items-center gap-3 px-8 py-4 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white border border-rose-500/20 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-xl hover:shadow-rose-500/30">
                                <Power size={16} /> Termination Sync
                            </button>
                        </Can>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] bg-[var(--surface-overlay)]/60">
                            <tr>
                                <th className="py-8 px-10">Personnel Identity</th>
                                <th className="py-8 px-10">Neural Check-In</th>
                                <th className="py-8 px-10">Neural Check-Out</th>
                                <th className="py-8 px-10">Computation</th>
                                <th className="py-8 px-10">Flux Status</th>
                                <th className="py-8 px-10">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan="6" className="py-32 text-center text-[var(--text-muted)] font-black tracking-[1em] uppercase text-xs opacity-40 italic">Querying Registry...</td></tr>
                            ) : attendance.length === 0 ? (
                                <tr><td colSpan="6" className="py-32 text-center text-[var(--text-muted)] font-black tracking-[1em] uppercase text-xs opacity-40 italic">Zero Presence Recorded</td></tr>
                            ) : attendance.map(a => {
                                const Icon = statusIcon[a.status] || CheckCircle;
                                return (
                                    <tr key={a._id} className="hover:bg-[var(--primary-500)]/[0.03] transition-all duration-300 group">
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-5">
                                                <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-[var(--surface-raised)] shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                                    <img
                                                        src={a.employee?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(a.employee?.name || '')}&background=8b5cf6&color=fff`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div>
                                                    <p className="text-[13px] font-black text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight">{a.employee?.name}</p>
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1.5 opacity-60 italic">{a.employee?.department}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex items-center gap-3 text-xs font-black text-[var(--text-primary)] font-mono">
                                                <div className="p-2 rounded-lg bg-[var(--surface-overlay)] border border-[var(--border)] group-hover:border-[var(--primary-500)]/30 transition-colors">
                                                    <Clock size={12} className="text-emerald-500" />
                                                </div>
                                                {a.checkIn || 'PENDING'}
                                            </div>
                                        </td>
                                        <td className="py-6 px-10 text-xs font-black text-[var(--text-muted)] font-mono uppercase italic opacity-60">
                                            {a.checkOut || 'Active Sync'}
                                        </td>
                                        <td className="py-6 px-10">
                                            <span className="text-lg font-black text-[var(--text-primary)] tracking-tighter">
                                                {a.hours > 0 ? `${a.hours}h` : '—'}
                                            </span>
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-tighter -mt-1 opacity-50">COMPUTED LOG</p>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className={cn('inline-flex items-center gap-2.5 px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all', statusCls[a.status])}>
                                                <Icon size={12} />
                                                {a.status.replace('_', ' ')}
                                            </div>
                                        </td>
                                        <td className="py-6 px-10">
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                                <Can permission="hrms.attendance.manage">
                                                    <button onClick={() => { setForm({ ...a, employee: a.employee?._id || a.employee || '' }); setEditingAtt(a); setShowAdd(true); }} className="p-3 rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl hover:shadow-[var(--primary-500)]/20">
                                                        <Edit size={16} />
                                                    </button>
                                                    <button onClick={() => handleDelete(a._id)} className="p-3 rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/20 transition-all shadow-xl hover:shadow-rose-500/20">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </Can>
                                                {!canManageAttendance && (
                                                    <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[var(--surface-overlay)] rounded-xl border border-[var(--border)]">
                                                        <ShieldCheck size={12} className="text-emerald-500" />
                                                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-tighter italic">LOCKED</span>
                                                    </div>
                                                )}
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
