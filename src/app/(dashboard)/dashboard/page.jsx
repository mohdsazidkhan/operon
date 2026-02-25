'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { TrendingUp, Users, DollarSign, Target, ArrowUpRight, ArrowDownRight, Activity } from 'lucide-react';
import { formatCurrency, formatDate, getStatusColor, cn } from '@/lib/utils';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

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

function KPICard({ title, value, change, icon: Icon, iconColor }) {
    const isUp = change >= 0;
    return (
        <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-card">
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
            colors: ['#8b5cf6', '#a78bfa'],
            stroke: { curve: 'smooth', width: 2 },
            xaxis: { categories: overview.revenueChartData.categories },
            tooltip: { theme: 'light' },
        },
        series: overview.revenueChartData.series,
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold">Business Overview</h1>
                    <p className="text-[var(--muted)] text-sm mt-1">Welcome back! Here's what's happening today.</p>
                </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <KPICard title="Total Revenue" value={formatCurrency(overview.totalRevenue)} change={12.4} icon={DollarSign} iconColor="bg-primary-500" />
                <KPICard title="Total Leads" value={overview.totalLeads} change={8.2} icon={Target} iconColor="bg-blue-500" />
                <KPICard title="Active Employees" value={overview.activeEmployees} change={2.5} icon={Users} iconColor="bg-green-500" />
                <KPICard title="Deals Won" value={overview.wonDeals} change={-3.1} icon={TrendingUp} iconColor="bg-amber-500" />
            </div>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
                <div className="xl:col-span-2 bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-card">
                    <ReactApexChart options={revenueChart.options} series={revenueChart.series} type="area" height={300} />
                </div>
                <div className="bg-[var(--surface)] rounded-2xl p-5 border border-[var(--border)] shadow-card">
                    <h3 className="font-semibold mb-4">Recent Activity</h3>
                    <div className="space-y-4">
                        {overview.recentActivity.map((a, i) => (
                            <div key={i} className="flex items-start gap-4">
                                <div className="w-2 h-2 rounded-full bg-primary-500 mt-1.5" />
                                <div>
                                    <p className="text-sm">{a.text}</p>
                                    <p className="text-xs text-[var(--muted)]">{a.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
