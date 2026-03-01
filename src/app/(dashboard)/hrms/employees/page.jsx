'use client';

import { useState, useEffect } from 'react';
import { Search, UserPlus, Mail, Calendar, Users, Edit, Trash2, ShieldCheck, Briefcase, Download, Upload, FileText } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import toast from 'react-hot-toast';
import Pagination from '@/components/ui/Pagination';
import { exportToXLSX, importFromXLSX, exportToPDF } from '@/utils/exportUtils';

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
    const [editingEmp, setEditingEmp] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_EMP);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const canViewSalary = usePermission('hrms.payroll.view');

    const fetchEmployees = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/employees?search=${search}&department=${dept === 'all' ? '' : dept}&page=${page}&limit=8`);
            const data = await res.json();
            if (data.success) {
                setEmployees(data.data);
                setPages(data.pages);
                setTotal(data.total);
            }
        } catch (err) {
            console.error('Failed to fetch employees:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchEmployees(); }, [search, dept, page]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                ...form,
                salary: Number(form.salary),
                skills: typeof form.skills === 'string' ? form.skills.split(',').map(s => s.trim()).filter(Boolean) : form.skills,
                hireDate: new Date(form.hireDate),
            };
            const url = editingEmp ? `/api/employees/${editingEmp._id}` : '/api/employees';
            const method = editingEmp ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingEmp ? 'Record updated!' : 'Employee added!');
                setShowAdd(false);
                setEditingEmp(null);
                setForm(EMPTY_EMP);
                fetchEmployees();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Terminate this employee record permanently?')) return;
        try {
            const res = await fetch(`/api/employees/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Employee deleted');
                fetchEmployees();
            }
        } catch { toast.error('Delete failed'); }
    };

    const handleExportXLSX = () => {
        const exportData = employees.map(e => ({
            Name: e.name,
            Email: e.email,
            Department: e.department,
            Position: e.position,
            Salary: e.salary,
            Status: e.status
        }));
        exportToXLSX(exportData, 'employees-list');
        toast.success('Employees exported to XLSX');
    };

    const handleExportPDF = () => {
        const headers = ['Name', 'Dept', 'Position', 'Salary'];
        const data = employees.map(e => [e.name, e.department, e.position, formatCurrency(e.salary)]);
        exportToPDF(headers, data, 'Personnel Registry Report', 'employees-report');
        toast.success('Personnel report exported to PDF');
    };

    const handleImportXLSX = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await importFromXLSX(file);
            console.log('Imported Personnel:', data);
            toast.success(`${data.length} records parsed. (Simulated)`);
            e.target.value = '';
        } catch { toast.error('Import failed'); }
    };

    const DEPTS = ['all', 'Engineering', 'Sales', 'HR', 'Finance', 'Marketing', 'Design'];

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Add/Edit Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingEmp(null); setForm(EMPTY_EMP); }} title={editingEmp ? "Update Staff Record" : "Onboard New Employee"} size="lg">
                <form onSubmit={handleFormSubmit} className="space-y-4">
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
                            <select required className={inputCls} value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}>
                                <option value="">Select Dept</option>
                                {DEPTS.filter(d => d !== 'all').map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
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
                            <input type="date" className={inputCls} value={form.hireDate ? new Date(form.hireDate).toISOString().split('T')[0] : ''} onChange={e => setForm(p => ({ ...p, hireDate: e.target.value }))} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Skills (comma separated)">
                                <input className={inputCls} placeholder="React, Node.js, MongoDB" value={Array.isArray(form.skills) ? form.skills.join(', ') : form.skills} onChange={e => setForm(p => ({ ...p, skills: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditingEmp(null); }} loading={saving} submitLabel={editingEmp ? "Synchronize Updates" : "Complete Onboarding"} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase italic underline decoration-[var(--primary-500)] decoration-4 underline-offset-8">Human Resources</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black tracking-[0.4em] uppercase mt-4">
                        Current Strength • {employees.length} Personnel
                    </p>
                </div>
                <div className="flex flex-wrap items-center gap-4">
                    <label className="flex items-center gap-4 px-6 py-4 bg-[var(--surface-overlay)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-[var(--border)] shadow-xl cursor-pointer active:scale-95">
                        <Upload size={16} /> Import
                        <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportXLSX} />
                    </label>
                    <div className="flex bg-[var(--surface-overlay)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-xl">
                        <button onClick={handleExportXLSX} className="px-6 py-4 hover:bg-[var(--surface-raised)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.3em] transition-all border-r border-[var(--border)] flex items-center gap-2">
                            <Download size={16} /> XLSX
                        </button>
                        <button onClick={handleExportPDF} className="px-6 py-4 hover:bg-[var(--surface-raised)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-2">
                            <FileText size={16} /> PDF
                        </button>
                    </div>
                    {isMounted && (
                        <Can permission="hrms.employees.create">
                            <button
                                onClick={() => setShowAdd(true)}
                                className="flex items-center gap-4 px-8 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl hover:scale-105 active:scale-95"
                            >
                                <UserPlus size={18} /> New Hire
                            </button>
                        </Can>
                    )}
                </div>
            </div>

            {/* Dept Filter */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-center">
                <div className="lg:col-span-3 flex bg-[var(--surface-overlay)] p-2 rounded-[2.5rem] border border-[var(--border)] overflow-x-auto scrollbar-none gap-2">
                    {DEPTS.map(d => (
                        <button
                            key={d}
                            onClick={() => setDept(d)}
                            className={cn(
                                'px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all whitespace-nowrap',
                                dept === d ? 'bg-[var(--primary-500)] text-white shadow-xl shadow-[var(--primary-500)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            )}
                        >
                            {d === 'all' ? 'All Personnel' : d}
                        </button>
                    ))}
                </div>
                <div className="relative group">
                    <Search size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="QUERY STAFF ARCHIVE..."
                        className="w-full pl-16 pr-8 py-4 rounded-[2.5rem] text-[10px] font-black bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all shadow-inner uppercase"
                    />
                </div>
            </div>

            {/* Employee Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-[var(--surface-overlay)]/50 animate-pulse rounded-[3rem] border border-[var(--border)] shadow-inner"></div>
                    ))}
                </div>
            ) : employees.length === 0 ? (
                <div className="py-40 text-center bg-[var(--surface-overlay)]/30 rounded-[4rem] border-2 border-dashed border-[var(--border)]">
                    <Users size={64} className="mx-auto text-[var(--border)] mb-8 opacity-20" />
                    <h3 className="text-lg font-black text-[var(--text-muted)] uppercase tracking-[0.6em] italic">Zero Personnel Nodes Detected</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {employees.map(emp => (
                        <div key={emp._id} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-[3rem] p-8 shadow-2xl hover:shadow-[0_40px_80px_-20px_rgba(0,0,0,0.3)] hover:border-[var(--primary-500)]/40 transition-all duration-700 group relative overflow-hidden flex flex-col">
                            {/* Decorative Glow */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-[var(--primary-500)] opacity-0 group-hover:opacity-10 blur-[80px] transition-opacity duration-1000"></div>

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="relative">
                                    <div className="w-20 h-20 rounded-[2.2rem] bg-gradient-to-br from-[var(--primary-500)] to-blue-600 p-[3px] shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-6">
                                        <div className="w-full h-full rounded-[2rem] bg-[var(--surface)] flex items-center justify-center text-[var(--primary-500)] font-black text-2xl overflow-hidden ring-4 ring-[var(--surface-overlay)]">
                                            {emp.avatar ? <img src={emp.avatar} alt="" className="w-full h-full object-cover" /> : <div className="text-3xl opacity-40">{emp.name?.[0]}</div>}
                                        </div>
                                    </div>
                                    <div className={cn(
                                        "absolute -bottom-1 -right-1 w-7 h-7 rounded-full border-4 border-[var(--card-bg)] shadow-xl",
                                        emp.status === 'active' ? "bg-emerald-500" : "bg-amber-500 ring-4 ring-amber-500/20"
                                    )}></div>
                                </div>
                                <div className="flex gap-2">
                                    {isMounted && (
                                        <>
                                            <Can permission="hrms.employees.edit">
                                                <button onClick={() => { setForm({ ...emp }); setEditingEmp(emp); setShowAdd(true); }} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-lg active:scale-90" title="Modify Record">
                                                    <Edit size={16} />
                                                </button>
                                            </Can>
                                            <Can permission="hrms.employees.delete">
                                                <button onClick={() => handleDelete(emp._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-lg active:scale-90" title="Decommission Node">
                                                    <Trash2 size={16} />
                                                </button>
                                            </Can>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="relative z-10 mb-8 flex-1">
                                <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-2 group-hover:text-[var(--primary-500)] transition-colors leading-tight">{emp.name}</h3>
                                <div className="flex items-center gap-3 mb-8">
                                    <span className="px-3 py-1 bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20 rounded-lg text-[8px] font-black text-[var(--primary-500)] uppercase tracking-[0.2em]">{emp.department}</span>
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-40 line-clamp-1 italic">{emp.position}</span>
                                </div>

                                <div className="space-y-4 bg-[var(--surface-overlay)]/40 p-5 rounded-2xl border border-[var(--border)]/50">
                                    <div className="flex items-center gap-4 text-[var(--text-muted)] group/item cursor-default">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center border border-[var(--border)] group-hover/item:border-[var(--primary-500)]/30 transition-colors shadow-inner">
                                            <Mail size={12} className="opacity-40" />
                                        </div>
                                        <span className="text-[9px] font-black truncate opacity-60 uppercase tracking-widest">{emp.email}</span>
                                    </div>
                                    <div className="flex items-center gap-4 text-[var(--text-muted)] group/item cursor-default">
                                        <div className="w-8 h-8 rounded-lg bg-[var(--surface)] flex items-center justify-center border border-[var(--border)] group-hover/item:border-[var(--primary-500)]/30 transition-colors shadow-inner">
                                            <Calendar size={12} className="opacity-40" />
                                        </div>
                                        <span className="text-[9px] font-black opacity-60 uppercase tracking-widest leading-none">Registered {emp.hireDate ? formatDate(emp.hireDate) : 'Recently'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="relative z-10 mt-auto pt-8 border-t border-[var(--border)] border-dashed">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2 opacity-50 italic">Financial Weight</p>
                                        <div className="flex items-center gap-3">
                                            {isMounted && (
                                                <Can permission="hrms.payroll.view">
                                                    <span className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">
                                                        {emp.salary ? formatCurrency(emp.salary) : '—'}
                                                    </span>
                                                </Can>
                                            )}
                                            {!canViewSalary && (
                                                <div className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-overlay)] rounded-xl border border-[var(--border)] shadow-inner">
                                                    <ShieldCheck size={14} className="text-emerald-500" />
                                                    <span className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-60">ENCRYPTED</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className={cn(
                                            'px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] shadow-xl transition-all duration-500',
                                            emp.status === 'active' ? 'bg-emerald-500 text-white shadow-emerald-500/20' : 'bg-amber-500 text-white shadow-amber-500/20'
                                        )}>
                                            {emp.status}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            <div className="px-4">
                <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
            </div>
        </div>
    );
}
