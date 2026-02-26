import { CreditCard, ArrowUpRight, ArrowDownRight, Activity, Wallet, PieChart, BarChart3, Landmark, TrendingUp } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { PLVarianceChart, CashPropagationChart, OverheadSegregationChart } from '@/components/dashboard/FinanceCharts';

export default async function FinanceDashboard() {
    // In a real scenario, we'd fetch specific finance data here
    const kpis = [
        { title: 'Gross Liquid Assets', value: 248350, change: '+12.4%', up: true, icon: Landmark, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'Operational Burn', value: 52480, change: '+3.1%', up: false, icon: CreditCard, color: 'text-rose-400', bg: 'bg-rose-500/10' },
        { title: 'Neural Margin', value: 195870, change: '+18.2%', up: true, icon: TrendingUp, color: 'text-[var(--primary-400)]', bg: 'bg-[var(--primary-500)]/10' },
        { title: 'Capital Delta', value: 81283, change: '-5.3%', up: true, icon: Wallet, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    ];

    function FinanceTrendingUp({ size, className }) { return <Activity size={size} className={className} />; }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Fiscal Matrix</h1>
                    <p className="text-[var(--text-muted)] text-[11px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <Activity size={14} className="text-emerald-500" />
                        Capital Flow Infrastructure • Audited Real-time Ledger
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-6 py-3 bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                        Ledger Verification
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((k, i) => (
                    <div key={i} className="bg-[var(--card-bg)] backdrop-blur-xl rounded-[2.5rem] p-7 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group hover:border-[var(--primary-500)]/30 transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn('p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] transition-colors', k.color)}>
                                <k.icon size={20} />
                            </div>
                            <div className={cn('flex items-center gap-1 text-[10px] font-black uppercase tracking-widest', k.up ? 'text-emerald-500' : 'text-rose-500')}>
                                {k.up ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                {k.change}
                            </div>
                        </div>
                        <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter relative z-10">{formatCurrency(k.value)}</p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 relative z-10">{k.title}</p>
                    </div>
                ))}
            </div>

            {/* Main P&L Chart */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl group relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-30"></div>
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] flex items-center gap-2">
                            <BarChart3 size={16} className="text-[var(--primary-400)]" /> P&L Variance
                        </h3>
                        <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Revenue Performance vs Operating Overheads</p>
                    </div>
                </div>
                <div className="h-[320px]">
                    <PLVarianceChart />
                </div>
            </div>

            {/* Secondary Charts Architecture */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] flex items-center gap-2">
                                <Activity size={16} className="text-[var(--primary-400)]" /> Cash Propagation
                            </h3>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">H1 {new Date().getFullYear()} Liquidity Assessment</p>
                        </div>
                    </div>
                    <div className="h-[220px]">
                        <CashPropagationChart />
                    </div>
                </div>

                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] flex items-center gap-2">
                                <PieChart size={16} className="text-rose-400" /> Overhead Segregation
                            </h3>
                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Expenditure classification breakdown</p>
                        </div>
                    </div>
                    <div className="h-[220px]">
                        <OverheadSegregationChart />
                    </div>
                </div>
            </div>
        </div>
    );
}
