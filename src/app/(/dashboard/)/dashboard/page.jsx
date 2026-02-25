'use client';

import dynamic from 'next/dynamic';
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import { cn } from '@/lib/utils';

// Dynamic import for ApexCharts to avoid SSR issues
const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

// Demo documentation/data (should ideally be in a separate file, but using some static data for now)
const overviewData = {
    totalRevenue: 2450000,
    totalLeads: 1240,
    activeEmployees: 8,
    wonDeals: 45,
    revenueChartData: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        series: [
            { name: 'Revenue', data: [45000, 52000, 48000, 61000, 55000, 67000] },
            { name: 'Expenses', data: [32000, 38000, 35000, 42000, 39000, 45000] }
        ]
    },
    recentActivity: [
        { id: 1, text: 'New lead "Acme Corp" added by Sarah', time: '2 hours ago' },
        { id: 2, text: 'Invoice #INV-2024-001 paid by Globex', time: '4 hours ago' },
        { id: 3, text: 'New employee "Michael Scott" onboarded', time: 'Yesterday' }
    ],
    topLeads: [
        { name: 'John Doe', company: 'Google', value: 12000, status: 'qualified' },
        { name: 'Jane Smith', company: 'Microsoft', value: 8500, status: 'proposal' },
        { name: 'Bob Wilson', company: 'Amazon', value: 15400, status: 'new' }
    ]
};

function KPICard({ title, value, change, icon: Icon, iconColor, trend }) {
    const isUp = change >= 0;
    return (
        <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-card hover:shadow-soft transition-shadow">
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[var(--muted)] text-sm font-medium">{title}</p>
                    <p className="text-2xl font-bold text-[var(--text-primary)] mt-1">{value}</p>
                </div>
                <div className={cn('w-11 h-11 rounded-xl flex items-center justify-center', iconColor)}>
                    <Icon size={20} className="text-white" />
                </div>
            </div>
            <div className="flex items-center gap-1">
                {isUp ? <ArrowUpRight size={15} className="text-green-500" /> : <ArrowDownRight size={15} className="text-red-500" />}
                <span className={cn('text-sm font-medium', isUp ? 'text-green-500' : 'text-red-500')}>{Math.abs(change)}%</span>
                <span className="text-[var(--muted)] text-sm">vs last month</span>
            </div>
        </div>
    );
}

export default function OverviewDashboard() {
    const overview = overviewData;

    const revenueChart = {
        options: {
            chart: { type: 'area', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6', '#e2e8f0'],
            fill: { type: 'gradient', gradient: { shade: 'light', type: 'vertical', shadeIntensity: 0.3, stops: [0, 90, 100] } },
            stroke: { curve: 'smooth', width: [3, 2] },
            xaxis: { categories: overview.revenueChartData.categories, labels: { style: { colors: 'var(--muted)', fontSize: '12px' } } },
            yaxis: { labels: { formatter: v => `$${(v / 1000).toFixed(0)}k`, style: { colors: 'var(--muted)' } } },
            grid: { borderColor: 'var(--border)', strokeDashArray: 4 },
            legend: { labels: { colors: 'var(--text-secondary)' } },
            tooltip: { theme: 'light' }, // theme management needed
        },
        series: overview.revenueChartData.series,
    };

    const funnelChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6'],
            plotOptions: { bar: { horizontal: true, borderRadius: 8, distributed: true } },
            xaxis: { categories: ['New', 'Contacted', 'Qualified', 'Proposal', 'Nego.', 'Won'], labels: { style: { colors: 'var(--muted)' } } },
            yaxis: { labels: { style: { colors: 'var(--muted)' } } },
            grid: { borderColor: 'var(--border)' },
            legend: { show: false },
        },
        series: [{ name: 'Leads', data: [32, 28, 22, 15, 10, 7] }],
    };

    return (
        <div className="space-y-6 animate-fade-in">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Business Overview</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">Welcome back! Here's what's happening today.</p>
                </div>
                <span className="text-xs text-[var(--muted)] bg-[var(--surface-overlay)] px-3 py-1.5 rounded-full">{formatDate(new Date())}</span>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KPICard title="Total Revenue" value={formatCurrency(overview.totalRevenue)} change={12.4} icon={DollarSign} iconColor="bg-primary-500" />
                <KPICard title="Total Leads" value={overview.totalLeads} change={8.2} icon={Target} iconColor="bg-blue-500" />
                <KPICard title="Active Employees" value={overview.activeEmployees} change={2.5} icon={Users} iconColor="bg-green-500" />
                <KPICard title="Deals Won" value={overview.wonDeals} change={-3.1} icon={TrendingUp} iconColor="bg-amber-500" />
            </div>

            {/* Charts row */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                {/* Revenue chart */}
                <div className="xl:col-span-2 bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-card">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h3 className="font-semibold text-[var(--text-primary)]">Revenue vs Expenses</h3>
                            <p className="text-xs text-[var(--muted)] mt-0.5">Monthly comparison 2024</p>
                        </div>
                        <span className="text-sm font-semibold text-green-500 bg-green-50 dark:bg-green-900/20 px-2.5 py-1 rounded-full">+12.4%</span>
                    </div>
                    <ReactApexChart options={revenueChart.options} series={revenueChart.series} type="area" height={260} />
                </div>

                {/* Sales funnel */}
                <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-card">
                    <div className="mb-4">
                        <h3 className="font-semibold text-[var(--text-primary)]">Lead Funnel</h3>
                        <p className="text-xs text-[var(--muted)] mt-0.5">Pipeline conversion stages</p>
                    </div>
                    <ReactApexChart options={funnelChart.options} series={funnelChart.series} type="bar" height={260} />
                </div>
            </div>

            {/* Bottom row */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                {/* Recent Activity */}
                <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[var(--text-primary)]">Recent Activity</h3>
                        <Activity size={16} className="text-[var(--muted)]" />
                    </div>
                    <div className="relative space-y-4">
                        <div className="absolute left-2 top-0 bottom-0 w-px bg-[var(--border)]" />
                        {overview.recentActivity.map((a, i) => (
                            <div key={i} className="flex items-start gap-4 pl-6 relative">
                                <div className="absolute left-0 w-4 h-4 rounded-full bg-primary-500/20 border-2 border-primary-500 top-1" />
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-[var(--text-primary)]">{a.text}</p>
                                    <p className="text-xs text-[var(--muted)] mt-0.5">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Leads */}
                <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-card">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="font-semibold text-[var(--text-primary)]">Top Leads</h3>
                        <Link href="/crm/leads" className="text-xs text-primary-500 font-medium hover:text-primary-600">View all →</Link>
                    </div>
                    <div className="space-y-3">
                        {overview.topLeads.map((lead, i) => (
                            <div key={i} className="flex items-center gap-3 p-3 rounded-xl hover:bg-[var(--surface-overlay)] transition-colors">
                                <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center text-primary-600 text-sm font-bold">{lead.name[0]}</div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium text-[var(--text-primary)] truncate">{lead.name}</p>
                                    <p className="text-xs text-[var(--muted)]">{lead.company}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{formatCurrency(lead.value)}</p>
                                    <span className={cn('text-xs px-1.5 py-0.5 rounded-full font-medium', getStatusColor(lead.status))}>{lead.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
