'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Eye, Edit, Trash2, Medal, Building2, Mail, Phone, Calendar } from 'lucide-react';
import { formatCurrency, formatDate, cn, getStatusColor } from '@/lib/utils';

export default function EmployeesPage() {
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [dept, setDept] = useState('all');

    useEffect(() => {
        const fetchEmployees = async () => {
            try {
                const res = await fetch(`/api/employees?search=${search}&department=${dept === 'all' ? '' : dept}`);
                const data = await res.json();
                if (data.success) {
                    setEmployees(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch employees:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchEmployees();
    }, [search, dept]);

    const departments = ['all', ...new Set(employees.map(e => e.department))];

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">Staff Directory</h1>
                    <p className="text-[var(--text-muted)] text-sm font-bold tracking-widest mt-1">
                        Workspace Force • {employees.length} Personnel Registered
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[var(--primary-500)]/30">
                        <Plus size={16} /> Onboard Personnel
                    </button>
                </div>
            </div>

            {/* Filter Hub */}
            <div className="flex flex-wrap items-center gap-4 bg-[var(--surface-overlay)] p-4 rounded-3xl border border-[var(--border)] backdrop-blur-sm">
                <div className="flex bg-[var(--surface-overlay)]/50 p-1 rounded-2xl border border-[var(--border)] overflow-x-auto scrollbar-none">
                    {departments.map(d => (
                        <button
                            key={d}
                            onClick={() => setDept(d)}
                            className={cn(
                                'px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
                                dept === d
                                    ? 'bg-[var(--primary-500)] text-white shadow-lg shadow-[var(--primary-500)]/20'
                                    : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                            )}
                        >
                            {d}
                        </button>
                    ))}
                </div>
                <div className="relative flex-1 min-w-[300px]">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="SEARCH VIA NAME OR EMPLOYEE ID..."
                        className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-[var(--surface-overlay)]/50 border border-[var(--border)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.2em] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 focus:border-[var(--primary-500)]/40 transition-all placeholder:text-[var(--text-muted)]"
                    />
                </div>
            </div>

            {/* Employee Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-[var(--surface-overlay)]/50 animate-pulse rounded-3xl border border-[var(--border)]"></div>
                    ))
                ) : employees.length === 0 ? (
                    <div className="col-span-full py-20 text-center bg-[var(--surface-overlay)]/50 rounded-3xl border border-[var(--border)] border-dashed">
                        <Building2 size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                        <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-widest">Personnel Archive Empty</h3>
                    </div>
                ) : employees.map(emp => (
                    <div key={emp._id} className="bg-[var(--card-bg)] backdrop-blur-xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl hover:shadow-[var(--primary-500)]/5 hover:border-[var(--primary-500)]/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-500)]/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-[var(--primary-500)]/10 transition-all duration-700"></div>

                        <div className="flex items-start justify-between mb-8 relative z-10">
                            <div className="relative">
                                <div className="w-16 h-16 rounded-3xl overflow-hidden ring-4 ring-[var(--surface-raised)] shadow-2xl group-hover:scale-110 transition-transform duration-500">
                                    <img
                                        src={emp.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(emp.name)}&background=8b5cf6&color=fff`}
                                        alt={emp.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <div className={cn(
                                    'absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-[var(--surface)] shadow-xl',
                                    emp.status === 'active' ? 'bg-emerald-500' : 'bg-amber-500'
                                )} />
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                <button className="p-2 rounded-xl hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><Edit size={16} /></button>
                                <button className="p-2 rounded-xl hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                            </div>
                        </div>

                        <div className="relative z-10 space-y-4">
                            <div>
                                <h3 className="text-lg font-black text-[var(--text-primary)] tracking-tight group-hover:text-[var(--primary-500)] transition-colors uppercase leading-tight">{emp.name}</h3>
                                <p className="text-[10px] font-black text-[var(--primary-500)] uppercase tracking-[0.2em] mt-1">{emp.position}</p>
                            </div>

                            <div className="py-4 space-y-2 text-[10px] border-y border-[var(--border)]">
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-[var(--text-muted)] uppercase tracking-widest">Department</span>
                                    <span className="font-black text-[var(--text-primary)] uppercase tracking-tight bg-[var(--surface-overlay)] px-2 py-0.5 rounded-lg">{emp.department}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-[var(--text-muted)] uppercase tracking-widest">Compensation</span>
                                    <span className="font-black text-emerald-500 tracking-tight">{formatCurrency(emp.salary)}<span className="text-[8px] text-[var(--text-muted)] ml-1">/MON</span></span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="font-black text-[var(--text-muted)] uppercase tracking-widest">Staff Code</span>
                                    <span className="font-mono font-bold text-[var(--text-muted)]">{emp.employeeId}</span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-[0.1em] text-[var(--text-muted)]">
                                <span className="flex items-center gap-1.5 min-w-0">
                                    <Calendar size={12} className="text-[var(--text-muted)] opacity-50" /> Joined {formatDate(emp.hireDate)}
                                </span>
                                <button className="flex items-center gap-1 text-[var(--primary-500)] hover:text-[var(--primary-600)] transition-colors shrink-0">
                                    Profile <Eye size={12} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
