'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, UserPlus, Users, Calendar, Briefcase, Mail, Phone } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const EMPTY_EMP = {
    name: '', email: '', phone: '', department: '', position: '',
    salary: '', employmentType: 'full_time', status: 'active',
    hireDate: new Date().toISOString().split('T')[0], skills: ''
};

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dept, setDept] = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_EMP);

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`/api/employees?search=${search}&department=${dept === 'all' ? '' : dept}`);
            const data = await res.json();
            if (data.success) setEmployees(data.data);
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, [search, dept]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                salary: Number(form.salary),
                skills: form.skills.split(',').map(s => s.trim()).filter(Boolean),
                hireDate: new Date(form.hireDate),
            };
            const res = await fetch('/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Employee added!');
                setShowAdd(false);
                setForm(EMPTY_EMP);
                fetchEmployees();
            } else {
                toast.error(data.message || 'Failed to add employee');
            }
        } catch { toast.error('Failed to add employee'); }
        finally { setSaving(false); }
    };

    const DEPTS = ['all', ...new Set(employees.map(e => e.department).filter(Boolean))];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Add Employee Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Employee" size="lg">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Full Name" required>
                            <input required className={inputCls} placeholder="e.g. John Smith" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Email" required>
                            <input required type="email" className={inputCls} placeholder="john@company.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </FormField>
                        <FormField label="Phone">
                            <input className={inputCls} placeholder="+91 98765 43210" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        </FormField>
                        <FormField label="Department" required>
                            <input required className={inputCls} placeholder="e.g. Engineering" value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))} />
                        </FormField>
                        <FormField label="Position" required>
                            <input required className={inputCls} placeholder="e.g. Frontend Developer" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
                        </FormField>
                        <FormField label="Monthly Salary ($)" required>
                            <input required type="number" min="0" className={inputCls} placeholder="60000" value={form.salary} onChange={e => setForm(p => ({ ...p, salary: e.target.value }))} />
                        </FormField>
                        <FormField label="Employment Type">
                            <select className={inputCls} value={form.employmentType} onChange={e => setForm(p => ({ ...p, employmentType: e.target.value }))}>
                                <option value="full_time">Full Time</option>
                                <option value="part_time">Part Time</option>
                                <option value="contract">Contract</option>
                                <option value="intern">Intern</option>
                            </select>
                        </FormField>
                        <FormField label="Hire Date">
                            <input type="date" className={inputCls} value={form.hireDate} onChange={e => setForm(p => ({ ...p, hireDate: e.target.value }))} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Skills (comma separated)">
                                <input className={inputCls} placeholder="React, Node.js, MongoDB" value={form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => setShowAdd(false)} loading={saving} submitLabel="Add Employee" />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">Staff Directory</h1>
                    <p className="text-[var(--text-muted)] text-sm font-bold tracking-widest mt-1">
                        Total Staff • {employees.length} Employees
                    </p>
                </div>
                <button
                    onClick={() => setShowAdd(true)}
                    className="flex items-center gap-2 px-5 py-3 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[var(--primary-500)]/30"
                >
                    <UserPlus size={16} /> Add Employee
                </button>
            </div>

            {/* Dept Filter */}
            <div className="flex flex-wrap items-center gap-4 bg-[var(--surface-overlay)] p-4 rounded-3xl border border-[var(--border)] backdrop-blur-sm">
                <div className="flex bg-[var(--surface-overlay)]/50 p-1 rounded-2xl border border-[var(--border)] overflow-x-auto scrollbar-none">
                    {DEPTS.map(d => (
                        <button
                            key={d}
                            onClick={() => setDept(d)}
                            className={cn(
                                'px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap',
                                dept === d ? 'bg-[var(--primary-500)] text-white shadow' : 'text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)]'
                            )}
                        >
                            {d === 'all' ? 'All Depts' : d}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search employees..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all"
                    />
                </div>
            </div>

            {/* Employee Grid */}
            {loading ? (
                <div className="py-20 text-center text-[var(--text-muted)]">Loading employees...</div>
            ) : employees.length === 0 ? (
                <div className="py-20 text-center text-[var(--text-muted)]">No employees found</div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {employees.map(emp => (
                        <div key={emp._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-lg hover:shadow-xl hover:border-[var(--primary-500)]/30 transition-all group">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-2xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-xl flex-shrink-0">
                                    {emp.name?.[0] || 'E'}
                                </div>
                                <div className="min-w-0">
                                    <p className="font-bold text-[var(--text-primary)] truncate text-sm">{emp.name}</p>
                                    <p className="text-xs text-[var(--text-muted)] truncate">{emp.position}</p>
                                </div>
                            </div>
                            <div className="space-y-2 text-xs">
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <Briefcase size={12} className="shrink-0" /><span className="truncate">{emp.department}</span>
                                </div>
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <Mail size={12} className="shrink-0" /><span className="truncate">{emp.email}</span>
                                </div>
                                {emp.phone && (
                                    <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                        <Phone size={12} className="shrink-0" /><span>{emp.phone}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-2 text-[var(--text-muted)]">
                                    <Calendar size={12} className="shrink-0" />
                                    <span>Joined {emp.hireDate ? formatDate(emp.hireDate) : '—'}</span>
                                </div>
                            </div>
                            <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
                                <span className={cn(
                                    'text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider',
                                    emp.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'
                                )}>{emp.status}</span>
                                <span className="text-sm font-bold text-[var(--text-primary)]">
                                    {emp.salary ? formatCurrency(emp.salary) : '—'}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
