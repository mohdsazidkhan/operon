'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, User, Phone, Mail, Briefcase, Building2, DollarSign,
    Calendar, Edit, Save, X, FileText, Star, AlertCircle, MapPin
} from 'lucide-react';
import { cn, formatDate, formatCurrency, getInitials, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    active: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    inactive: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200',
    on_leave: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    terminated: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

export default function EmployeeDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [employee, setEmployee] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);

    const inputCls = 'w-full px-3 py-2 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all';

    const fetchEmployee = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/employees/${id}`);
            const data = await res.json();
            if (data.success) { setEmployee(data.data); setForm(data.data); }
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (id) fetchEmployee(); }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/employees/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) { setEmployee(data.data); setEditing(false); toast.success('Employee updated!'); }
            else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    if (loading) return <div className="animate-pulse space-y-6"><div className="h-8 w-48 bg-[var(--surface-overlay)] rounded-xl" /><div className="h-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl" /></div>;
    if (!employee) return <div className="flex flex-col items-center py-24 gap-4"><AlertCircle size={40} className="text-[var(--text-muted)]" /><p className="text-[var(--text-muted)]">Employee not found</p><button onClick={() => router.back()} className="text-sm text-[var(--primary-500)] underline">Go back</button></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all"><ArrowLeft size={16} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-xl">{getInitials(employee.name)}</div>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">{employee.name}</h1>
                            <p className="text-[var(--text-muted)] text-sm">{employee.position} · {employee.department}</p>
                            <p className="text-xs text-[var(--text-muted)] font-mono">{employee.employeeId}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold uppercase px-3 py-1.5 rounded-full border', STATUS_COLORS[employee.status] || '')}>{employee.status.replace('_', ' ')}</span>
                    {editing ? (
                        <div className="flex gap-2">
                            <button onClick={() => { setEditing(false); setForm(employee); }} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all flex items-center gap-1"><X size={14} /> Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="px-3 py-2 rounded-xl bg-[var(--primary-500)] text-white text-sm font-semibold flex items-center gap-1 transition-all disabled:opacity-50"><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    ) : (
                        <button onClick={() => setEditing(true)} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all flex items-center gap-1"><Edit size={14} /> Edit</button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Personal Info */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Personal Information</h2>
                        {editing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Full Name', key: 'name' },
                                    { label: 'Email', key: 'email', type: 'email' },
                                    { label: 'Phone', key: 'phone' },
                                    { label: 'Department', key: 'department' },
                                    { label: 'Position', key: 'position' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">{f.label}</label>
                                        <input type={f.type || 'text'} className={cn(inputCls, 'mt-1')} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                                    </div>
                                ))}
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Status</label>
                                    <select className={cn(inputCls, 'mt-1')} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                        {['active', 'inactive', 'on_leave', 'terminated'].map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Employment Type</label>
                                    <select className={cn(inputCls, 'mt-1')} value={form.employmentType} onChange={e => setForm(p => ({ ...p, employmentType: e.target.value }))}>
                                        {['full_time', 'part_time', 'contract', 'intern'].map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Salary ($)</label>
                                    <input type="number" className={cn(inputCls, 'mt-1')} value={form.salary || 0} onChange={e => setForm(p => ({ ...p, salary: +e.target.value }))} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Hire Date</label>
                                    <input type="date" className={cn(inputCls, 'mt-1')} value={form.hireDate ? form.hireDate.slice(0, 10) : ''} onChange={e => setForm(p => ({ ...p, hireDate: e.target.value }))} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Email', icon: Mail, value: employee.email },
                                    { label: 'Phone', icon: Phone, value: employee.phone },
                                    { label: 'Department', icon: Building2, value: employee.department },
                                    { label: 'Position', icon: Briefcase, value: employee.position },
                                    { label: 'Type', icon: User, value: employee.employmentType?.replace('_', ' ') },
                                    { label: 'Salary', icon: DollarSign, value: formatCurrency(employee.salary || 0) + '/mo' },
                                    { label: 'Hire Date', icon: Calendar, value: formatDate(employee.hireDate) },
                                    { label: 'Manager', icon: User, value: employee.manager?.name || '—' },
                                ].map(f => (
                                    <div key={f.label} className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-muted)] flex-shrink-0"><f.icon size={14} /></div>
                                        <div>
                                            <p className="text-xs text-[var(--text-muted)]">{f.label}</p>
                                            <p className="text-sm font-semibold text-[var(--text-primary)] capitalize">{f.value || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Address */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Address</h2>
                        {editing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Street', key: 'street' },
                                    { label: 'City', key: 'city' },
                                    { label: 'State', key: 'state' },
                                    { label: 'Country', key: 'country' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">{f.label}</label>
                                        <input className={cn(inputCls, 'mt-1')} value={form.address?.[f.key] || ''} onChange={e => setForm(p => ({ ...p, address: { ...p.address, [f.key]: e.target.value } }))} />
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-muted)]"><MapPin size={14} /></div>
                                <p className="text-sm text-[var(--text-secondary)]">
                                    {[employee.address?.street, employee.address?.city, employee.address?.state, employee.address?.country].filter(Boolean).join(', ') || '—'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Emergency Contact */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Emergency Contact</h2>
                        {employee.emergencyContact?.name ? (
                            <div className="space-y-3">
                                {[
                                    { label: 'Name', value: employee.emergencyContact.name },
                                    { label: 'Phone', value: employee.emergencyContact.phone },
                                    { label: 'Relationship', value: employee.emergencyContact.relationship },
                                ].map(s => (
                                    <div key={s.label} className="flex items-center justify-between">
                                        <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                                        <span className="text-sm font-semibold text-[var(--text-primary)]">{s.value || '—'}</span>
                                    </div>
                                ))}
                            </div>
                        ) : <p className="text-sm text-[var(--text-muted)]">No emergency contact on file</p>}
                    </div>

                    {/* Skills */}
                    {employee.skills?.length > 0 && (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Skills</h2>
                            <div className="flex flex-wrap gap-2">
                                {employee.skills.map(skill => (
                                    <span key={skill} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--primary-500)]/10 text-[var(--primary-500)] border border-[var(--primary-500)]/20">{skill}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-4">
                        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Summary</h2>
                        {[
                            { label: 'Employee ID', value: employee.employeeId },
                            { label: 'Salary', value: formatCurrency(employee.salary || 0) },
                            { label: 'Type', value: employee.salaryType },
                            { label: 'Status', value: employee.status.replace('_', ' ') },
                            { label: 'Hire Date', value: formatDate(employee.hireDate) },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between">
                                <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                                <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">{s.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Documents */}
                    {employee.documents?.length > 0 && (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Documents</h2>
                            <div className="space-y-2">
                                {employee.documents.map((doc, i) => (
                                    <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer"
                                        className="flex items-center gap-2 p-2 rounded-xl hover:bg-[var(--surface-overlay)] transition-all">
                                        <FileText size={14} className="text-[var(--text-muted)]" />
                                        <span className="text-sm text-[var(--primary-500)] hover:underline">{doc.name}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
