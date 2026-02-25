'use client';

import dynamic from 'next/dynamic';
import { formatCurrency, cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Activity, Download, Calendar } from 'lucide-react';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

export default function FinanceReportsPage() {
    const quarterlyChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6', '#22c55e'],
            plotOptions: {
                bar: {
                    borderRadius: 12,
                    columnWidth: '60%',
                    grouped: true,
                    dataLabels: { position: 'top' }
                }
            },
            xaxis: {
                categories: ['Q1 2024', 'Q2 2024', 'Q3 2024', 'Q4 2024 (Est)'],
                labels: { style: { colors: '#64748b', fontWeight: 600 } },
                axisBorder: { show: false }
            },
            yaxis: {
                labels: {
                    formatter: v => `$${(v / 1000).toFixed(0)}k`,
                    style: { colors: '#64748b', fontWeight: 600 }
                },
                grid: { show: false }
            },
            grid: { borderColor: '#1e293b', strokeDashArray: 4 },
            legend: {
                position: 'top',
                horizontalAlign: 'right',
                labels: { colors: '#94a3b8', fontWeight: 600 },
                itemMargin: { horizontal: 20 }
            },
            theme: { mode: 'dark' },
            tooltip: { theme: 'dark', x: { show: false } }
        },
        series: [
            { name: 'Revenue', data: [70300, 89100, 103300, 130000] },
            { name: 'Expenses', data: [42700, 47100, 54600, 64200] },
        ],
    };

    const stats = [
        { label: 'Annual Revenue', val: 392700, trend: '+24%', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
        { label: 'Annual Expenses', val: 208600, trend: '+12%', icon: TrendingDown, color: 'text-rose-500', bg: 'bg-rose-500/10' },
        { label: 'Net Profit', val: 184100, trend: '+38%', icon: TrendingUp, color: 'text-primary-500', bg: 'bg-primary-500/10' },
        { label: 'Growth Vector', val: '46.9%', trend: 'NOMINAL', icon: Activity, color: 'text-amber-500', bg: 'bg-amber-500/10', raw: true },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Institutional Fiscal Intelligence</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <PieChart size={12} className="text-primary-500" />
                        Quarterly P&L Vectoring • Fiscal Audit Active
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-12 px-6 rounded-2xl bg-slate-900 border border-slate-800 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-white transition-all flex items-center gap-2">
                        <Calendar size={14} /> Fiscal Year 2024
                    </button>
                    <button className="h-12 w-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center hover:bg-primary-400 transition-all shadow-xl shadow-white/5">
                        <Download size={18} />
                    </button>
                </div>
            </div>

            {/* Tactical Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((s, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl group relative overflow-hidden">
                        <div className={cn("absolute top-0 right-0 w-24 h-24 blur-[60px] opacity-10 -mr-8 -mt-8", s.bg.replace('bg-', 'bg-'))}></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn('p-3 rounded-2xl bg-slate-950 border border-slate-800', s.color)}>
                                <s.icon size={20} />
                            </div>
                            <span className={cn('text-[9px] font-black uppercase tracking-widest', s.color)}>{s.trend}</span>
                        </div>
                        <p className="text-3xl font-black text-white tracking-tighter relative z-10">{s.raw ? s.val : formatCurrency(s.val)}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 relative z-10">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Analytical Chart */}
            <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-10 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <div className="flex items-center justify-between mb-10 relative z-10">
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Quarterly Revenue vs Expenditure Core</h3>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-[0.3em] mt-1">Cross-sectional Fiscal Stream Visualization</p>
                    </div>
                </div>

                <div className="relative z-10 h-[400px]">
                    <ReactApexChart options={quarterlyChart.options} series={quarterlyChart.series} type="bar" height="100%" />
                </div>
            </div>

            {/* Bottom Insights */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pb-12">
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl">
                    <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 border-b border-slate-800 pb-4">Key Performance Vectors</h4>
                    <div className="space-y-6">
                        {[
                            { name: 'Operating Margin Flow', val: '46.9%', status: 'optimal' },
                            { name: 'Burn Rate Alpha', val: '$15.4k/mo', status: 'stable' },
                            { name: 'Customer LTV:CAC', val: '4.8x', status: 'high' }
                        ].map((item, i) => (
                            <div key={i} className="flex items-center justify-between">
                                <span className="text-sm font-black text-white uppercase tracking-tighter">{item.name}</span>
                                <div className="flex items-center gap-4">
                                    <span className="text-sm font-black text-primary-400">{item.val}</span>
                                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[8px] font-black uppercase tracking-widest border border-emerald-500/20">{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl flex flex-col items-center justify-center text-center">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.5em] mb-4">Institutional Audit Integrity</p>
                    <p className="text-xs text-slate-300 font-bold uppercase tracking-widest leading-relaxed max-w-sm">
                        Fiscal data vectors are cryptographically signed and immutable. <br />
                        <span className="text-primary-500">Verified by OPERON-CORE-FINANCE</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
