import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, Activity, Calendar } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import { getDashboardStats } from '@/lib/data-access';
import { MainRevenueChart, FunnelChart } from '@/components/dashboard/OverviewCharts';

function KPICard({ title, value, change, icon: Icon, iconColor, trend, bgGradient }) {
    const isUp = change >= 0;
    return (
        <div className={cn('bg-slate-900/50 backdrop-blur-xl rounded-[2rem] p-7 border border-slate-800 shadow-2xl relative overflow-hidden group transition-all hover:border-slate-700', bgGradient)}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 duration-500', iconColor)}>
                    <Icon size={24} className="text-white" />
                </div>
                <div className="text-right">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1">{title}</p>
                    <p className="text-3xl font-black text-white tracking-tighter">{value}</p>
                </div>
            </div>
            <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-950/50 border border-slate-800/50">
                    {isUp ? <ArrowUpRight size={14} className="text-emerald-500" /> : <ArrowDownRight size={14} className="text-rose-500" />}
                    <span className={cn('text-xs font-black', isUp ? 'text-emerald-500' : 'text-rose-500')}>{Math.abs(change)}%</span>
                </div>
                <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest italic">vs last cycle</span>
            </div>
        </div>
    );
}

export default async function OverviewDashboard() {
    const stats = await getDashboardStats();

    return (
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-white tracking-tighter uppercase italic">Neural Command Center</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20">
                            <Activity size={12} className="text-primary-500 animate-pulse" />
                            <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">System Health: Nominal</span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.3em]">
                            <Calendar size={12} className="inline mr-2" />
                            Cycle {formatDate(new Date())}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button className="h-14 px-8 rounded-2xl bg-white text-slate-950 font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/5 hover:scale-105 transition-all">
                        Execute Report
                    </button>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <KPICard title="Portfolio Valuation" value={formatCurrency(stats.revenue)} change={14.2} icon={DollarSign} iconColor="bg-emerald-500 shadow-emerald-500/30" bgGradient="bg-gradient-to-br from-emerald-500/5 to-transparent" />
                <KPICard title="Staff Capacity" value={stats.employees} change={8.4} icon={Users} iconColor="bg-indigo-500 shadow-indigo-500/30" bgGradient="bg-gradient-to-br from-indigo-500/5 to-transparent" />
                <KPICard title="Lead Pipeline" value={stats.leads} change={-2.1} icon={Target} iconColor="bg-primary-500 shadow-primary-500/30" bgGradient="bg-gradient-to-br from-primary-500/5 to-transparent" />
                <KPICard title="Asset Density" value={stats.products} change={5.7} icon={TrendingUp} iconColor="bg-amber-500 shadow-amber-500/30" bgGradient="bg-gradient-to-br from-amber-500/5 to-transparent" />
            </div>

            {/* Main Data Visuals */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Primary Chart */}
                <div className="lg:col-span-2 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl p-8 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary-500 to-transparent opacity-50"></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Fiscal Trajectory</h3>
                            <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Bi-Annual Revenue Performance Indicator</p>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800">
                            <div className="w-2 h-2 rounded-full bg-primary-500 shadow-[0_0_8px_#8b5cf6]"></div>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Feed</span>
                        </div>
                    </div>
                    <div className="h-[320px]">
                        <MainRevenueChart />
                    </div>
                </div>

                {/* Vertical Funnel */}
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl p-8 group">
                    <div className="mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Intelligence Funnel</h3>
                        <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1">Conversion Architecture Analysis</p>
                    </div>
                    <div className="h-[320px]">
                        <FunnelChart />
                    </div>
                </div>
            </div>

            {/* Tactical Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Event Log */}
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl p-8 relative overflow-hidden">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></div>
                            Chronological Telemetry
                        </h3>
                        <Activity size={16} className="text-slate-700" />
                    </div>
                    <div className="space-y-6 relative">
                        <div className="absolute left-3.5 top-0 bottom-0 w-px bg-gradient-to-b from-primary-500/50 via-slate-800 to-transparent"></div>
                        {[
                            { text: 'Global Procurement Protocol Initiated', time: '02:14 PM', val: 'CRIT-1' },
                            { text: 'Personnel Compensation Delta Normalized', time: '01:45 PM', val: 'NOM-8' },
                            { text: 'Capital Allocation Batch #924 Verified', time: '11:20 AM', val: 'AUTH-2' },
                            { text: 'Lead Conversion Threshold Breached', time: '09:05 AM', val: 'PEAK-1' },
                        ].map((a, i) => (
                            <div key={i} className="flex items-start gap-6 pl-8 relative group cursor-pointer">
                                <div className="absolute left-[11px] w-2.5 h-2.5 rounded-full bg-slate-950 border-2 border-primary-500 top-1 shadow-[0_0_10px_#8b5cf6] group-hover:scale-125 transition-transform"></div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <p className="text-xs font-black text-slate-300 uppercase tracking-tight group-hover:text-primary-400 transition-colors">{a.text}</p>
                                        <span className="text-[9px] font-black text-slate-800 group-hover:text-primary-900 transition-colors font-mono">{a.val}</span>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-600 mt-1 uppercase tracking-widest">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Priority Assets */}
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em]">Priority Acquisitions</h3>
                        <button className="text-[10px] font-black uppercase tracking-[0.2em] text-primary-500 hover:text-white transition-colors underline decoration-slate-800 underline-offset-8">Expand View</button>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                        {[
                            { name: 'Artemis Corporation', industry: 'Aero-Dynamics', valuation: '$184K', trend: '+4.2%' },
                            { name: 'Helios Industrial', industry: 'Fusion-Cells', valuation: '$142K', trend: '+2.8%' },
                            { name: 'Nova Systems', industry: 'Neural-Links', valuation: '$98K', trend: '-1.5%' },
                        ].map((asset, i) => (
                            <div key={i} className="flex items-center gap-5 p-5 rounded-3xl bg-slate-950/40 border border-slate-800/50 hover:border-primary-500/30 transition-all group overflow-hidden relative">
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-primary-500 font-black text-lg shadow-black group-hover:scale-110 transition-transform">
                                    {asset.name[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-xs font-black text-white uppercase tracking-wider truncate group-hover:text-primary-400 transition-colors">{asset.name}</p>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mt-1">{asset.industry}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-black text-white tracking-tighter">{asset.valuation}</p>
                                    <span className={cn('text-[10px] font-black uppercase italic', asset.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500')}>{asset.trend}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
