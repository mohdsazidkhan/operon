'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Edit, Trash2, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import dynamic from 'next/dynamic';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { useThemeStore } from '@/store/useThemeStore';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

const getStatusColor = (status) => {
    switch (status) {
        case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
        case 'contacted': return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
        case 'qualified': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20';
        case 'proposal': return 'bg-purple-500/10 text-purple-500 border-purple-500/20';
        case 'negotiation': return 'bg-orange-500/10 text-orange-500 border-orange-500/20';
        case 'won': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20';
        case 'lost': return 'bg-rose-500/10 text-rose-500 border-rose-500/20';
        default: return 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--text-muted)]/20';
    }
};

export default function LeadsPage() {
    const { isDark } = useThemeStore();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchLeads = async () => {
            try {
                const res = await fetch(`/api/leads?status=${filter === 'all' ? '' : filter}&search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setLeads(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch leads:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads();
    }, [filter, search]);

    const statusCounts = STATUS_OPTIONS.slice(1).reduce((acc, s) => {
        acc[s] = leads.filter(l => l.status === s).length;
        return acc;
    }, {});

    const funnelChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6'],
            theme: { mode: isDark ? 'dark' : 'light' },
            plotOptions: { bar: { horizontal: true, borderRadius: 6, distributed: true } },
            xaxis: {
                categories: Object.keys(statusCounts).map(s => s.charAt(0).toUpperCase() + s.slice(1)),
                labels: { style: { colors: 'var(--text-muted)', fontSize: '12px' } }
            },
            yaxis: { labels: { style: { colors: 'var(--text-muted)' } } },
            grid: { borderColor: 'var(--border)' },
            legend: { show: false },
        },
        series: [{ data: Object.values(statusCounts) }],
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Leads</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{leads.length} total leads</p>
                </div>
                <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> Add Lead
                </button>
            </div>

            {/* Status cards */}
            <div className="flex overflow-x-auto gap-2 pb-2 scrollbar-none">
                {[{ label: 'All', value: 'all', count: leads.length }, ...STATUS_OPTIONS.slice(1).map(s => ({ label: s.charAt(0).toUpperCase() + s.slice(1), value: s, count: statusCounts[s] || 0 }))].map(s => (
                    <button
                        key={s.value}
                        onClick={() => setFilter(s.value)}
                        className={cn(
                            'px-4 py-2 rounded-xl text-sm font-medium transition-all border whitespace-nowrap min-w-[100px]',
                            filter === s.value
                                ? 'bg-[var(--primary-500)] text-[var(--surface)] border-[var(--primary-500)] shadow-lg shadow-[var(--primary-500)]/20'
                                : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/50 hover:bg-[var(--surface-overlay)]/80'
                        )}
                    >
                        {s.label} <span className={cn('ml-1.5 font-bold', filter === s.value ? 'text-[var(--surface)]/80' : 'text-[var(--text-muted)]')}>{s.count}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                {/* Table */}
                <div className="xl:col-span-2 bg-[var(--card-bg)] backdrop-blur-sm rounded-2xl border border-[var(--border)] shadow-xl overflow-hidden">
                    <div className="flex items-center gap-3 p-4 border-b border-[var(--border)]">
                        <div className="relative flex-1">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                            <input
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                placeholder="Search leads..."
                                className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40 focus:border-[var(--primary-500)] transition-all"
                            />
                        </div>
                        <button className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)] transition-all">
                            <Filter size={14} /> Filter
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-overlay)]/50">
                                <tr>
                                    <th className="py-4 px-6">Lead</th>
                                    <th className="py-4 px-6">Company</th>
                                    <th className="py-4 px-6">Status</th>
                                    <th className="py-4 px-6 text-right">Value</th>
                                    <th className="py-4 px-6">Score</th>
                                    <th className="py-4 px-6"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--border)]">
                                {loading ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)]">Loading leads...</td></tr>
                                ) : leads.length === 0 ? (
                                    <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)]">No leads found</td></tr>
                                ) : leads.map(lead => (
                                    <tr key={lead._id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors group">
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-base">
                                                    {lead.name?.[0] || 'L'}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{lead.name}</p>
                                                    <p className="text-xs text-[var(--text-muted)]">{lead.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-sm text-[var(--text-secondary)]">{lead.company}</td>
                                        <td className="py-4 px-6">
                                            <span className={cn('text-[10px] px-2.5 py-1 rounded-full font-bold uppercase border', getStatusColor(lead.status))}>
                                                {lead.status}
                                            </span>
                                        </td>
                                        <td className="py-4 px-6 text-sm font-bold text-[var(--text-primary)] text-right">
                                            ${(lead.value || 0).toLocaleString()}
                                        </td>
                                        <td className="py-4 px-6">
                                            <div className="flex items-center gap-2.5">
                                                <div className="w-20 h-1.5 bg-[var(--surface-overlay)] rounded-full overflow-hidden">
                                                    <div
                                                        className="h-full bg-[var(--primary-500)] rounded-full shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                                                        style={{ width: `${lead.score}%` }}
                                                    />
                                                </div>
                                                <span className="text-xs font-medium text-[var(--text-muted)]">{lead.score}%</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-6 text-right">
                                            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                                <button className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><Eye size={16} /></button>
                                                <button className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] transition-all"><Edit size={16} /></button>
                                                <button className="p-2 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Sidebar Stats */}
                <div className="space-y-6">
                    <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-2xl p-6 border border-[var(--border)] shadow-xl">
                        <h3 className="font-bold text-[var(--text-primary)] mb-1">Lead Funnel</h3>
                        <p className="text-xs text-[var(--text-muted)] mb-6">Pipeline distribution by stage</p>
                        <div className="h-[280px]">
                            <ReactApexChart options={funnelChart.options} series={funnelChart.series} type="bar" height="100%" />
                        </div>
                        <div className="mt-6 space-y-3 pt-6 border-t border-[var(--border)]">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-muted)] font-medium">Potential Revenue</span>
                                <span className="font-bold text-[var(--text-primary)]">${leads.reduce((s, l) => s + (l.value || 0), 0).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-[var(--text-muted)] font-medium">Avg. Deal Size</span>
                                <span className="font-bold text-[var(--text-primary)]">
                                    ${(leads.length > 0 ? leads.reduce((s, l) => s + (l.value || 0), 0) / leads.length : 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[var(--primary-500)]/20 to-purple-500/20 backdrop-blur-md rounded-2xl p-6 border border-[var(--primary-500)]/20 shadow-lg relative overflow-hidden group">
                        <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-[var(--primary-500)]/10 rounded-full blur-2xl group-hover:bg-[var(--primary-500)]/20 transition-all duration-500"></div>
                        <h4 className="font-bold text-[var(--text-primary)] mb-2 relative z-10 flex items-center gap-2">
                            <Plus size={18} className="text-[var(--primary-500)]" /> Smart Insights
                        </h4>
                        <p className="text-xs text-[var(--text-secondary)] relative z-10 leading-relaxed">
                            Based on your lead pipeline, you have {statusCounts.negotiation || 0} deals in negotiation. Focus on these to hit your monthly target.
                        </p>
                        <button className="mt-4 text-xs font-bold text-[var(--primary-500)] hover:text-[var(--primary-600)] relative z-10 flex items-center gap-1 transition-colors">
                            View Suggestions <Plus size={12} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
