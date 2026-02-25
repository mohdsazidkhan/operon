import { TrendingUp, Target, Award, DollarSign, ArrowUpRight, ArrowDownRight, PieChart, BarChart3 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { getSalesStats } from '@/lib/data-access';
import { PipelineDensityChart, ResolutionMatrixChart, RevenueTrajectoryChart } from '@/components/dashboard/SalesCharts';

export default async function SalesDashboard() {
    const stats = await getSalesStats();

    const kpis = [
        { title: 'Total Pipeline Value', value: formatCurrency(stats.pipelineValue), change: 15.3, icon: DollarSign, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { title: 'Won This Month', value: formatCurrency(stats.wonValue), change: 22.1, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'Active Deals', value: stats.activeDeals, change: 5.5, icon: Target, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { title: 'Avg Deal Size', value: formatCurrency(stats.avgDealSize), change: -2.3, icon: TrendingUp, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Sales Intelligence</h1>
                    <p className="text-slate-500 text-[11px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" />
                        Pipeline Optimization • Real-time Forecasting
                    </p>
                </div>
                <div className="flex bg-slate-900 border border-slate-800 p-1.5 rounded-2xl">
                    <button className="px-5 py-2.5 rounded-xl bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/20 transition-all">Today</button>
                    <button className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">Quarter</button>
                    <button className="px-5 py-2.5 rounded-xl text-slate-500 hover:text-white text-[10px] font-black uppercase tracking-widest transition-all">Annual</button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((k, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-xl rounded-[2.5rem] p-7 border border-slate-800 shadow-2xl relative overflow-hidden group hover:border-slate-700 transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn('p-3 rounded-2xl bg-slate-950 border border-slate-800 transition-colors', k.color)}>
                                <k.icon size={20} />
                            </div>
                            <div className={cn('flex items-center gap-1 text-[10px] font-black uppercase tracking-widest', k.change >= 0 ? 'text-emerald-500' : 'text-rose-500')}>
                                {k.change >= 0 ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {Math.abs(k.change)}%
                            </div>
                        </div>
                        <p className="text-3xl font-black text-white tracking-tighter relative z-10">{k.value}</p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1 relative z-10">{k.title}</p>
                    </div>
                ))}
            </div>

            {/* Main Charts Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl group">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                <BarChart3 size={16} className="text-primary-400" /> Pipeline Density
                            </h3>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Valuation distribution across Lifecycle</p>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <PipelineDensityChart data={stats.pipelineData} />
                    </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-2">
                                <PieChart size={16} className="text-emerald-400" /> Resolution Matrix
                            </h3>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Efficiency ratio analysis</p>
                        </div>
                    </div>
                    <div className="h-[280px]">
                        <ResolutionMatrixChart data={stats.winLossData} />
                    </div>
                </div>
            </div>

            {/* Performance Ledger */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Revenue Trajectory</h3>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-primary-500"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Actual</span></div>
                            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-emerald-500"></div><span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Goal</span></div>
                        </div>
                    </div>
                    <div className="h-[260px]">
                        <RevenueTrajectoryChart />
                    </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
                    <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8">Elite Performers</h3>
                    <div className="space-y-5">
                        {[
                            { name: 'Sarah Johnson', deals: 5, revenue: 155000, initial: 'SJ', color: 'bg-indigo-500/20 text-indigo-400' },
                            { name: 'Alex Morgan', deals: 4, revenue: 98000, initial: 'AM', color: 'bg-emerald-500/20 text-emerald-400' },
                            { name: 'Emma Wilson', deals: 3, revenue: 52000, initial: 'EW', color: 'bg-primary-500/20 text-primary-400' },
                        ].map((p, i) => (
                            <div key={i} className="flex items-center gap-4 p-4 rounded-[2rem] bg-slate-950/40 border border-slate-800/50 hover:border-slate-700 transition-all group">
                                <div className="relative shrink-0">
                                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-2xl shadow-black group-hover:scale-110 transition-transform', p.color)}>
                                        {p.initial}
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-slate-900 border-2 border-slate-800 text-amber-500 text-[10px] font-black flex items-center justify-center shadow-2xl shadow-black">
                                        #{i + 1}
                                    </div>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-primary-400 transition-colors">{p.name}</p>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{p.deals} High-Value Cycles</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white tracking-tighter">{formatCurrency(p.revenue)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <button className="w-full mt-8 py-4 bg-slate-950/50 border border-slate-800 rounded-2xl text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] hover:text-white hover:border-slate-700 transition-all">
                        Full Leaderboard
                    </button>
                </div>
            </div>
        </div>
    );
}
