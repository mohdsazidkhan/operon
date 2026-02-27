'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Printer, Search, MoreHorizontal, UserCircle, Briefcase, CreditCard, Landmark, TrendingUp, Users, CheckCircle, Download } from 'lucide-react';
import { formatCurrency, formatDate, cn, getStatusColor } from '@/lib/utils';

export default function PayrollPage() {
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [summary, setSummary] = useState({ totalNetPay: 0, totalEmployees: 0, averageSalary: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchPayroll = async () => {
            try {
                const res = await fetch(`/api/payroll/summary?search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setPayrollRecords(data.data.records || []);
                    setSummary(data.data.totals || { totalNetPay: 0, totalEmployees: 0, averageSalary: 0 });
                }
            } catch (err) {
                console.error('Failed to fetch payroll:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPayroll();
    }, [search]);

    const payrolls = payrollRecords;
    const currentPeriod = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const totalDisbursed = summary.totalNetPay || 0;
    const avgNet = summary.averageSalary || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">Payroll Management</h1>
                    <p className="text-[var(--text-muted)] text-sm font-bold tracking-widest mt-1">
                        Current Period: {currentPeriod}
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary-500)] rounded-xl font-bold text-[10px] uppercase tracking-widest transition-all">
                        <Download size={14} /> Download Report
                    </button>
                    <button className="flex items-center gap-2 px-5 py-3 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[var(--primary-500)]/30">
                        <CreditCard size={16} /> Process Payroll
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Paid', value: totalDisbursed, color: 'text-emerald-500', icon: Landmark, bg: 'from-emerald-500/10 to-transparent' },
                    { label: 'Average Salary', value: avgNet, color: 'text-[var(--primary-500)]', icon: TrendingUp, bg: 'from-[var(--primary-500)]/10 to-transparent' },
                    { label: 'Total Employees', value: payrolls.length, color: 'text-indigo-500', icon: Users, bg: 'from-indigo-500/10 to-transparent' },
                ].map((stat, i) => (
                    <div key={i} className={cn('bg-[var(--card-bg)] backdrop-blur-sm rounded-[2rem] p-8 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group bg-gradient-to-br', stat.bg)}>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <stat.icon size={22} className={stat.color} />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">{stat.label}</span>
                        </div>
                        <p className={cn('text-3xl font-black tracking-tighter relative z-10', stat.color)}>
                            {typeof stat.value === 'string' || i === 2 ? stat.value : formatCurrency(stat.value)}
                            {stat.suffix && <span className="text-xs uppercase ml-1 opacity-50 font-bold italic">{stat.suffix}</span>}
                        </p>
                        <div className="absolute -right-4 -bottom-4 opacity-[0.03] scale-150 rotate-12 transition-transform group-hover:rotate-0 group-hover:scale-125 duration-700">
                            <stat.icon size={120} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Payroll Ledger */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
                <div className="p-6 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="SEARCH VIA STAFF OR POSITION..."
                            className="w-full pl-12 pr-4 py-4 rounded-3xl bg-[var(--surface-overlay)]/50 border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] bg-[var(--surface-overlay)]/30">
                            <tr>
                                <th className="py-5 px-6">Employee Name</th>
                                <th className="py-5 px-6">Basic Salary</th>
                                <th className="py-5 px-6">Allowances</th>
                                <th className="py-5 px-6">Net Pay</th>
                                <th className="py-5 px-6">Attendance records</th>
                                <th className="py-5 px-6">Status</th>
                                <th className="py-5 px-6"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan="7" className="py-12 text-center text-[var(--text-muted)] font-black tracking-widest uppercase text-xs">Loading payroll...</td></tr>
                            ) : payrolls.length === 0 ? (
                                <tr><td colSpan="7" className="py-16 text-center text-[var(--text-muted)] font-black tracking-widest uppercase text-xs">No payroll data found</td></tr>
                            ) : payrolls.map(r => (
                                <tr key={r._id} className="hover:bg-[var(--primary-500)]/[0.02] transition-colors group">
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-2xl overflow-hidden ring-4 ring-[var(--surface-raised)] shadow-2xl group-hover:scale-105 transition-transform duration-500">
                                                <img src={r.employee?.avatar || 'https://i.pravatar.cc/150'} alt="" className="w-full h-full object-cover text-[8px]" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight">{r.employee?.name}</p>
                                                <div className="flex items-center gap-1.5 mt-0.5">
                                                    <Briefcase size={10} className="text-[var(--text-muted)]" />
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{r.employee?.position}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 text-sm font-black text-[var(--text-muted)] text-right">{formatCurrency(r.baseSalary)}</td>
                                    <td className="py-5 px-8 text-right">
                                        <div className="flex items-center justify-end gap-1 text-emerald-500 font-black text-xs">
                                            <ArrowUpRight size={12} />
                                            {formatCurrency(r.allowances)}
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 text-right">
                                        <div className="flex items-center justify-end gap-1 text-rose-500 font-black text-xs">
                                            <ArrowDownRight size={12} />
                                            {formatCurrency(r.deductions)}
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 text-right">
                                        <p className="text-base font-black text-[var(--text-primary)] tracking-tighter">{formatCurrency(r.netPay)}</p>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-0.5 italic">{r.period}</p>
                                    </td>
                                    <td className="py-5 px-8">
                                        <div className={cn('inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl', getStatusColor(r.status))}>
                                            <CheckCircle size={10} />
                                            {r.status}
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 text-right">
                                        <button className="p-2.5 rounded-xl hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all transform group-hover:translate-x-1">
                                            <MoreHorizontal size={20} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Quick Tip */}
            <div className="bg-gradient-to-r from-[var(--primary-500)]/10 via-transparent to-transparent border-l-2 border-[var(--primary-500)] p-6 rounded-3xl">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary-500)]/20 flex items-center justify-center text-[var(--primary-500)]">
                        <DollarSign size={16} />
                    </div>
                    <p className="text-[10px] font-black text-[var(--primary-500)] uppercase tracking-widest leading-relaxed">
                        Payroll execution for <span className="text-[var(--text-primary)]">{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span> is scheduled to trigger in <span className="text-[var(--text-primary)]">6 days</span>. Ensure all attendance vector deltas are normalized before then.
                    </p>
                </div>
            </div>
        </div>
    );
}

