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
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase">Workforce Insights</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <TrendingUp size={12} className="text-emerald-500" />
                        Staff Performance • System Health
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="h-12 px-6 rounded-2xl bg-[var(--text-primary)] text-[var(--surface)] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--primary-500)] transition-all flex items-center gap-2 shadow-xl shadow-black/5">
                        <Download size={14} /> Export Data
                    </button>
                </div>
            </div>

            {/* Core HR Metrics */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl">
                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mb-8 border-b border-[var(--border)] pb-4">Core Staff Metrics</h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {[
                        { label: 'Total Staff', value: serializedEmployees.length, trend: '+12%', icon: Users, color: 'text-indigo-400' },
                        { label: 'Total Payroll', value: formatCurrency(totalPayroll), trend: '+5.4%', icon: DollarSign, color: 'text-emerald-400' },
                        { label: 'Average Tenure', value: '2.4 Years', trend: '+0.5', icon: Clock, color: 'text-amber-400' },
                        { label: 'Retention Rate', value: '94.2%', trend: '+2.1%', icon: Target, color: 'text-rose-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-all duration-700"></div>
                            <div className="flex items-center justify-between mb-4 relative z-10">
                                <div className={cn('p-3 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)]', stat.color)}>
                                    <stat.icon size={20} />
                                </div>
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{stat.trend}</span>
                            </div>
                            <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter relative z-10">{stat.value}</p>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 relative z-10">{stat.label}</p>
                        </div>
                    ))}
                </div>
            </div>

            {/* Analytical Grids */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-12">
                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8">Spending by Department</h3>
                    <div className="h-[350px] relative z-10">
                        <SalaryVelocityChart employees={serializedEmployees} />
                    </div>
                </div>

                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl group overflow-hidden relative">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8">Top Salaries</h3>
                    <div className="h-[350px] relative z-10 flex items-center justify-center">
                        <DepartmentalExpenditureChart employees={serializedEmployees} />
                    </div>
                </div>
            </div>

            {/* Operational Integrity */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl">
                <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8">Salary Distribution</h3>
                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl group flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="h-16 w-16 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center text-emerald-500 shadow-2xl shadow-black relative overflow-hidden mb-4">
                        <div className="absolute inset-0 bg-emerald-500/5 animate-pulse"></div>
                        <ShieldCheck size={32} className="relative z-10" />
                    </div>
                    <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em] mb-4 relative z-10">Data Integrity</p>
                    <p className="text-xs text-[var(--text-muted)] font-bold uppercase tracking-widest leading-relaxed max-w-xs relative z-10">
                        Workforce data streams are secured and verified. <br />
                        <span className="text-[var(--primary-500)]">SECURE-LINK-ACTIVE</span>
                    </p>
                </div>
            </div>
        </div>
    );
}
