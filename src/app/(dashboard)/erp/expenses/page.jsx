'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Receipt, PieChart, TrendingDown, Clock, CheckCircle2, MoreVertical, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { useThemeStore } from '@/store/useThemeStore';

export default function ExpensesPage() {
    const { isDark } = useThemeStore();
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchExpenses = async () => {
            try {
                const res = await fetch(`/api/expenses?search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setExpenses(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch expenses:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchExpenses();
    }, [search]);

    const total = expenses.reduce((s, e) => s + (e.amount || 0), 0);
    const approved = expenses.filter(e => e.status === 'approved').reduce((s, e) => s + (e.amount || 0), 0);
    const pending = total - approved;

    const catSums = expenses.reduce((acc, e) => {
        acc[e.category] = (acc[e.category] || 0) + (e.amount || 0);
        return acc;
    }, {});

    const expenseChart = {
        options: {
            chart: { type: 'donut', background: 'transparent' },
            labels: Object.keys(catSums).map(c => c.charAt(0).toUpperCase() + c.slice(1)),
            colors: ['#8b5cf6', '#3b82f6', '#f59e0b', '#22c55e', '#ef4444', '#06b6d4'],
            theme: { mode: isDark ? 'dark' : 'light' },
            stroke: { show: false },
            legend: {
                position: 'bottom',
                labels: { colors: 'var(--text-muted)' },
                fontSize: '11px',
                fontWeight: 600,
                markers: { radius: 12 }
            },
            plotOptions: {
                pie: {
                    donut: {
                        size: '75%',
                        labels: {
                            show: true,
                            name: { show: true, fontSize: '12px', fontWeight: 'bold', color: 'var(--text-muted)' },
                            value: { show: true, fontSize: '20px', fontWeight: 'bold', color: 'var(--text-primary)', formatter: val => formatCurrency(val) },
                            total: { show: true, label: 'Total', color: 'var(--text-muted)', formatter: () => formatCurrency(total) }
                        }
                    }
                }
            }
        },
        series: Object.values(catSums),
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-black text-[var(--text-primary)] tracking-tight uppercase">Expense Tracking</h1>
                    <p className="text-[var(--text-muted)] text-sm font-bold tracking-widest mt-1">
                        Expense Report • {expenses.length} Expenses Recorded
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-[var(--primary-500)]/30">
                        <Plus size={16} /> Add Expense
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { label: 'Total Spent', value: total, cls: 'text-rose-500', icon: TrendingDown, bg: 'from-rose-500/10 to-transparent' },
                            { label: 'Approved expenses', value: approved, cls: 'text-emerald-500', icon: CheckCircle2, bg: 'from-emerald-500/10 to-transparent' },
                            { label: 'Pending approval', value: pending, cls: 'text-amber-500', icon: Clock, bg: 'from-amber-500/10 to-transparent' },
                        ].map((s, i) => (
                            <div key={i} className={cn('bg-[var(--surface-overlay)] backdrop-blur-sm rounded-3xl p-6 border border-[var(--border)] shadow-xl overflow-hidden relative group bg-gradient-to-br', s.bg)}>
                                <s.icon size={24} className={cn('absolute -right-2 -bottom-2 opacity-5 scale-150 transition-transform group-hover:scale-110 duration-500', s.cls)} />
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--text-muted)] mb-2">{s.label}</p>
                                <p className={cn('text-3xl font-black tracking-tighter', s.cls)}>{formatCurrency(s.value)}</p>
                                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-[var(--border)]"></div>
                                    Verified
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-3xl border border-[var(--card-border)] shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Search expenses..."
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                                />
                            </div>
                            <button className="p-3 rounded-2xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><Filter size={18} /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] bg-[var(--surface-overlay)]/30">
                                    <tr>
                                        <th className="py-5 px-6">Vendor</th>
                                        <th className="py-5 px-6">Amount</th>
                                        <th className="py-5 px-6">Category</th>
                                        <th className="py-5 px-6">Date</th>
                                        <th className="py-5 px-6">Approved By</th>
                                        <th className="py-5 px-6">Status</th>
                                        <th className="py-5 px-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {loading ? (
                                        <tr><td colSpan="7" className="py-12 text-center text-[var(--text-muted)] font-bold tracking-widest uppercase text-[10px]">Loading expenses...</td></tr>
                                    ) : expenses.length === 0 ? (
                                        <tr><td colSpan="7" className="py-16 text-center text-[var(--text-muted)] font-bold tracking-widest uppercase text-[10px]">No expenses found</td></tr>
                                    ) : expenses.map(e => (
                                        <tr key={e._id} className="hover:bg-[var(--surface-overlay)]/50 transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] border border-[var(--primary-500)]/20 shadow-lg group-hover:scale-110 transition-transform">
                                                        <Receipt size={18} />
                                                    </div>
                                                    <span className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--primary-500)] transition-colors">{e.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-black text-[var(--text-primary)]">{formatCurrency(e.amount)}</td>
                                            <td className="py-4 px-6">
                                                <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-muted)] uppercase tracking-[0.1em] border border-[var(--border)]">
                                                    {e.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-[10px] font-bold text-[var(--text-muted)]">{formatDate(e.date)}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center text-[8px] font-black text-[var(--text-muted)] border border-[var(--border)] uppercase">{e.submittedBy?.name?.[0] || 'S'}</div>
                                                    <span className="text-[10px] font-bold text-[var(--text-muted)]">{e.submittedBy?.name || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={cn('text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-[0.2em] border', getStatusColor(e.status))}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="p-2 rounded-xl hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all opacity-0 group-hover:opacity-100"><MoreVertical size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-3xl p-6 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--primary-500)]/10 rounded-full blur-3xl group-hover:bg-[var(--primary-500)]/20 transition-all duration-700"></div>
                        <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <PieChart size={16} className="text-[var(--primary-500)]" /> Expense Categories
                        </h3>
                        <div className="h-[280px]">
                            <ReactApexChart options={expenseChart.options} series={expenseChart.series} type="donut" height="100%" />
                        </div>
                    </div>

                    <div className="bg-[var(--surface-overlay)]/50 backdrop-blur-xl rounded-3xl p-6 border border-[var(--border)] shadow-2xl relative group overflow-hidden">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-[var(--primary-500)]/10 rounded-full blur-3xl group-hover:bg-[var(--primary-500)]/20 transition-all duration-700"></div>
                        <AlertCircle size={48} className="absolute -right-4 -bottom-4 text-[var(--primary-500)]/5 rotate-12 scale-150" />
                        <h4 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.2em] mb-3">Policy compliance</h4>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed font-medium">
                            All expenses exceeding <span className="text-[var(--text-primary)] font-black">$2,000</span> require multi-factor authorization from the finance director.
                        </p>
                        <button className="mt-5 w-full py-3 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-lg shadow-[var(--primary-500)]/20">
                            Download policy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
