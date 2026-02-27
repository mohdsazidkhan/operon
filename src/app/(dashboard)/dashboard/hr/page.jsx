import { Users, UserCheck, UserX, Clock, PieChart, BarChart3, TrendingUp } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import { getEmployees } from '@/lib/data-access';
import { SectorAllocationChart, AttendanceDeltaChart } from '@/components/dashboard/HRCharts';

export default async function HRDashboard() {
    const employees = await getEmployees();
    const serializedEmployees = JSON.parse(JSON.stringify(employees));

    const total = serializedEmployees.length;
    const active = serializedEmployees.filter(e => e.isActive).length;
    const onLeave = total - active; // Simplistic for demo
    const newHires = serializedEmployees.filter(e => {
        const hireDate = new Date(e.createdAt);
        const now = new Date();
        return (now - hireDate) < (30 * 24 * 60 * 60 * 1000); // Last 30 days
    }).length;

    const kpis = [
        { title: 'Total Employees', value: total, icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { title: 'Active Staff', value: active, icon: UserCheck, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'On Leave', value: onLeave, icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        { title: 'New Hires', value: newHires, icon: UserX, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Staff Overview</h1>
                    <p className="text-[var(--text-muted)] text-[11px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" />
                        Employee Roles • Performance Metrics
                    </p>
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
                        </div>
                        <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter relative z-10">{k.value}</p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 relative z-10">{k.title}</p>
                    </div>
                ))}
            </div>

            {/* Main Distribution row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl group relative overflow-hidden">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <PieChart size={16} className="text-[var(--primary-400)]" /> Department Breakdown
                    </h3>
                    <div className="h-[280px]">
                        <SectorAllocationChart total={total} />
                    </div>
                </div>

                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl group relative overflow-hidden">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <BarChart3 size={16} className="text-emerald-400" /> Weekly Attendance
                    </h3>
                    <div className="h-[280px]">
                        <AttendanceDeltaChart />
                    </div>
                </div>
            </div>

            {/* Talent Roster Preview */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden mb-12">
                <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em]">Employee List</h3>
                    <button className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--primary-500)] hover:text-[#fff] hover:bg-[var(--primary-500)] transition-colors px-2 py-1 rounded-lg">All Employees</button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] bg-[var(--surface-overlay)]/40">
                            <tr>
                                <th className="py-6 px-8">Name</th>
                                <th className="py-6 px-8">Department</th>
                                <th className="py-6 px-8">Job Title</th>
                                <th className="py-6 px-8">Status</th>
                                <th className="py-6 px-8">Joined (Year)</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {serializedEmployees.slice(0, 5).map((emp, i) => (
                                <tr key={emp._id} className="hover:bg-[var(--surface-overlay)]/30 transition-colors group">
                                    <td className="py-5 px-8">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-2xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-400)] font-black text-xs border border-[var(--primary-500)]/20">
                                                {emp.name[0]}
                                            </div>
                                            <span className="text-xs font-black text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight">{emp.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 text-[10px] font-black text-[var(--text-secondary)] uppercase tracking-widest">{emp.department}</td>
                                    <td className="py-5 px-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">{emp.designation}</td>
                                    <td className="py-5 px-8">
                                        <div className={cn(
                                            'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border',
                                            emp.isActive ? 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20' : 'text-amber-500 bg-amber-500/10 border-amber-500/20'
                                        )}>
                                            <div className={cn('w-1 h-1 rounded-full', emp.isActive ? 'bg-emerald-500' : 'bg-amber-500')}></div>
                                            {emp.isActive ? 'ACTIVE' : 'ON LEAVE'}
                                        </div>
                                    </td>
                                    <td className="py-5 px-8 text-xs font-black text-[var(--text-muted)] font-mono tracking-tighter">{new Date(emp.joiningDate).getFullYear()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
