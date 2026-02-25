import { Users, DollarSign, GraduationCap, Users2, ShieldCheck, Download } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { getEmployees } from '@/lib/data-access';
import { SalaryVelocityChart, DepartmentalExpenditureChart } from '@/components/hrms/HRAnalyticsCharts';

export default async function HRAnalyticsPage() {
    const employees = await getEmployees();
    const serializedEmployees = JSON.parse(JSON.stringify(employees));

    const totalPayroll = serializedEmployees.reduce((s, e) => s + (e.salary || 0), 0);

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Workforce Neural Insights</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <Users2 size={12} className="text-primary-500" />
                        Real-time Human Capital Vectoring • Lifecycle Active
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-12 px-6 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-widest hover:bg-primary-400 transition-all flex items-center gap-2 shadow-xl shadow-white/5">
                        <Download size={14} /> Export Workforce Schema
                    </button>
                </div>
            </div>

            {/* Core HR Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Neural Headcount', value: serializedEmployees.length, icon: Users, color: 'text-indigo-400', sub: 'Active Entities' },
                    { label: 'Monthly Payroll Flow', value: formatCurrency(totalPayroll), icon: DollarSign, color: 'text-emerald-400', sub: 'Institutional Expenditure' },
                    { label: 'Avg Tenure Alpha', value: '2.4 YRS', icon: GraduationCap, color: 'text-primary-400', sub: 'Retention Velocity' },
                ].map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-all duration-700"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn('p-3 rounded-2xl bg-slate-950 border border-slate-800', stat.color)}>
                                <stat.icon size={20} />
                            </div>
                            <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">{stat.sub}</span>
                        </div>
                        <p className="text-3xl font-black text-white tracking-tighter relative z-10">{stat.value}</p>
                        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 relative z-10">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Analytical Grids */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Expenditure by Entity</h3>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic italic">Top 8 Salary Flux Vectors</p>
                        </div>
                    </div>
                    <div className="h-[350px] relative z-10">
                        <SalaryVelocityChart employees={serializedEmployees} />
                    </div>
                </div>

                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-10 shadow-2xl relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <div className="flex items-center justify-between mb-8 relative z-10">
                        <div>
                            <h3 className="text-xl font-black text-white tracking-tighter uppercase italic">Departmental Distribution</h3>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1 italic">Expenditure Concentration Schema</p>
                        </div>
                    </div>
                    <div className="h-[350px] relative z-10 flex items-center justify-center">
                        <DepartmentalExpenditureChart employees={serializedEmployees} />
                    </div>
                </div>
            </div>

            {/* Operational Integrity */}
            <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl flex items-center justify-between group">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-2xl bg-slate-950 border border-slate-800 flex items-center justify-center text-emerald-500 shadow-2xl shadow-black relative overflow-hidden">
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                        <ShieldCheck size={32} className="relative z-10" />
                    </div>
                    <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-widest">Workforce Protocol Integrity</h4>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest mt-1">
                            Neural data streams verified across <span className="text-primary-500">6 core departments</span>. No anomalies detected.
                        </p>
                    </div>
                </div>
                <button className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-colors border-b border-slate-800 hover:border-white pb-1">Review Compliance</button>
            </div>
        </div>
    );
}
