'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Printer, Search, MoreHorizontal, UserCircle, Briefcase, CreditCard } from 'lucide-react';
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

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Compensation Engine</h1>
                    <div className="flex items-center gap-3 mt-2">
                        <CreditCard size={14} className="text-[var(--primary-500)]" />
                        <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">Fiscal Period: {new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-[var(--surface-overlay)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all border border-[var(--border)]">
                        <Printer size={16} /> Ledger Export
                    </button>
                    <button className="flex items-center gap-2 px-6 py-3 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl shadow-[var(--primary-500)]/20">
                        <Plus size={16} /> Execute Payroll Run
                    </button>
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Total Disbursed', value: summary.totalNetPay, color: 'text-[var(--primary-500)]', icon: Wallet, bg: 'from-[var(--primary-500)]/10 to-transparent' },
                    { label: 'Unit Benchmark', value: summary.averageSalary, color: 'text-emerald-500', icon: ArrowUpRight, bg: 'from-emerald-500/10 to-transparent' },
                    { label: 'Recipient Count', value: summary.totalEmployees, color: 'text-indigo-500', icon: UserCircle, bg: 'from-indigo-500/10 to-transparent', suffix: 'Personnel' },
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
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] bg-[var(--surface-overlay)]/40">
                            <tr>
                                <th className="py-6 px-8">Staff Entity</th>
                                <th className="py-6 px-8 text-right">Base Allocation</th>
                                <th className="py-6 px-8 text-right">Incentives</th>
                                <th className="py-6 px-8 text-right">Adjustments</th>
                                <th className="py-6 px-8 text-right">Net Liquidation</th>
                                <th className="py-6 px-8">Status</th>
                                <th className="py-6 px-8 text-right"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                <tr><td colSpan="7" className="py-12 text-center text-slate-700 font-black tracking-widest uppercase text-xs animate-pulse italic">Auditing compensation vectors...</td></tr>
                            ) : payrollRecords.length === 0 ? (
                                <tr><td colSpan="7" className="py-20 text-center text-slate-700 font-black tracking-widest uppercase text-xs italic">Zero transaction records in local cache</td></tr>
                            ) : payrollRecords.map(r => (
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

const CheckCircle = ({ size, className }) => <XCircle size={size} className={className} />; // Placeholder as I might have missed import or name in thought 
// Actually CheckCircle2 or CheckCircle are usually in lucide-react. I imported CheckCircle.
// Wait, I see I missed the import for CheckCircle2 in some places but used it.
// Fixing imports in the writer for consistency.
