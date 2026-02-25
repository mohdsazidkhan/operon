'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Receipt, PieChart, TrendingDown, Clock, CheckCircle2, MoreVertical, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function ExpensesPage() {
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
            theme: { mode: 'dark' },
            stroke: { show: false },
            legend: {
                position: 'bottom',
                labels: { colors: '#94a3b8' },
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
                            name: { show: true, fontSize: '12px', fontWeight: 'bold', color: '#64748b' },
                            value: { show: true, fontSize: '20px', fontWeight: 'bold', color: '#ffffff', formatter: val => formatCurrency(val) },
                            total: { show: true, label: 'Total', color: '#64748b', formatter: () => formatCurrency(total) }
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
                    <h1 className="text-2xl font-black text-white tracking-tight uppercase">Expense Tracking</h1>
                    <p className="text-slate-500 text-sm font-bold tracking-widest mt-1">
                        Fiscal Report • {expenses.length} Records Documented
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-primary-500/30">
                        <Plus size={16} /> Submit New Claim
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-3 space-y-6">
                    {/* Stats */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                        {[
                            { label: 'Cumulative spend', value: total, cls: 'text-rose-400', icon: TrendingDown, bg: 'from-rose-500/10 to-transparent' },
                            { label: 'Authorized claims', value: approved, cls: 'text-emerald-400', icon: CheckCircle2, bg: 'from-emerald-500/10 to-transparent' },
                            { label: 'Under validation', value: pending, cls: 'text-amber-400', icon: Clock, bg: 'from-amber-500/10 to-transparent' },
                        ].map((s, i) => (
                            <div key={i} className={cn('bg-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-800 shadow-xl overflow-hidden relative group bg-gradient-to-br', s.bg)}>
                                <s.icon size={24} className={cn('absolute -right-2 -bottom-2 opacity-5 scale-150 transition-transform group-hover:scale-110 duration-500', s.cls)} />
                                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-2">{s.label}</p>
                                <p className={cn('text-3xl font-black tracking-tighter', s.cls)}>{formatCurrency(s.value)}</p>
                                <div className="mt-4 flex items-center gap-1.5 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700"></div>
                                    Real-time audited
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Table */}
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
                        <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                            <div className="relative flex-1 max-w-sm">
                                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="Verify transactions..."
                                    className="w-full pl-11 pr-4 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest bg-slate-950/50 border border-slate-800 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-700"
                                />
                            </div>
                            <button className="p-3 rounded-2xl border border-slate-800 text-slate-500 hover:text-white transition-all"><Filter size={18} /></button>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] bg-slate-950/30">
                                    <tr>
                                        <th className="py-5 px-6">Source/Merchant</th>
                                        <th className="py-5 px-6">Valuation</th>
                                        <th className="py-5 px-6">Classification</th>
                                        <th className="py-5 px-6">Timestamp</th>
                                        <th className="py-5 px-6">Approver</th>
                                        <th className="py-5 px-6">Status</th>
                                        <th className="py-5 px-6"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800/50">
                                    {loading ? (
                                        <tr><td colSpan="7" className="py-12 text-center text-slate-700 font-bold tracking-widest uppercase text-[10px]">Retrieving secure ledger...</td></tr>
                                    ) : expenses.length === 0 ? (
                                        <tr><td colSpan="7" className="py-16 text-center text-slate-700 font-bold tracking-widest uppercase text-[10px]">Zero transaction delta</td></tr>
                                    ) : expenses.map(e => (
                                        <tr key={e._id} className="hover:bg-white/[0.02] transition-colors group">
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/20 shadow-lg shadow-indigo-500/5 group-hover:scale-110 transition-transform">
                                                        <Receipt size={18} />
                                                    </div>
                                                    <span className="text-xs font-black text-slate-200 uppercase tracking-tight group-hover:text-primary-400 transition-colors">{e.title}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm font-black text-white">{formatCurrency(e.amount)}</td>
                                            <td className="py-4 px-6">
                                                <span className="text-[9px] font-black px-2.5 py-1 rounded-lg bg-slate-800 text-slate-400 uppercase tracking-[0.1em] border border-slate-700">
                                                    {e.category}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-[10px] font-bold text-slate-500">{formatDate(e.date)}</td>
                                            <td className="py-4 px-6">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 rounded-full bg-slate-800 flex items-center justify-center text-[8px] font-black text-slate-500 border border-slate-700 uppercase">{e.submittedBy?.name?.[0] || 'S'}</div>
                                                    <span className="text-[10px] font-bold text-slate-400">{e.submittedBy?.name || 'System'}</span>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={cn('text-[9px] px-2.5 py-1 rounded-full font-black uppercase tracking-[0.2em] border', getStatusColor(e.status))}>
                                                    {e.status}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-right">
                                                <button className="p-2 rounded-xl hover:bg-slate-800 text-slate-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"><MoreVertical size={16} /></button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-slate-900/50 backdrop-blur-sm rounded-3xl p-6 border border-slate-800 shadow-2xl relative overflow-hidden group">
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl group-hover:bg-primary-500/20 transition-all duration-700"></div>
                        <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8 flex items-center gap-2">
                            <PieChart size={16} className="text-primary-400" /> Capital Allocation
                        </h3>
                        <div className="h-[280px]">
                            <ReactApexChart options={expenseChart.options} series={expenseChart.series} type="donut" height="100%" />
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-xl rounded-3xl p-6 border border-white/5 shadow-2xl relative group overflow-hidden">
                        <AlertCircle size={48} className="absolute -right-4 -bottom-4 text-white/5 rotate-12 scale-150" />
                        <h4 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-3">Policy compliance</h4>
                        <p className="text-[11px] text-slate-400 leading-relaxed font-medium">
                            All expenses exceeding <span className="text-white font-bold">$2,000</span> require multi-factor authorization from the finance director.
                        </p>
                        <button className="mt-5 w-full py-3 bg-white/5 hover:bg-white/10 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border border-white/10">
                            Download policy
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
