'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Can from '@/components/ui/Can';
import { Plus, Search, Filter, Edit, Trash2, Eye, Sparkles, Zap, TrendingUp, Target, Download, Upload, FileText } from 'lucide-react';
import { cn, formatCurrency, getInitials } from '@/lib/utils';
import { usePermission } from '@/hooks/usePermission';
import Pagination from '@/components/ui/Pagination';
import { exportToXLSX, importFromXLSX, exportToPDF } from '@/utils/exportUtils';

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });
import { useThemeStore } from '@/store/useThemeStore';

const STATUS_OPTIONS = ['all', 'new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];

const getStatusColor = (status) => {
    switch (status) {
        case 'new': return 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/10';
        case 'contacted': return 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10';
        case 'qualified': return 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 shadow-indigo-500/10';
        case 'proposal': return 'bg-purple-500/10 text-purple-500 border-purple-500/20 shadow-purple-500/10';
        case 'negotiation': return 'bg-orange-500/10 text-orange-500 border-orange-500/20 shadow-orange-500/10';
        case 'won': return 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/22 shadow-lg';
        case 'lost': return 'bg-rose-500/10 text-rose-500 border-rose-500/20 shadow-rose-500/5';
        default: return 'bg-[var(--text-muted)]/10 text-[var(--text-muted)] border-[var(--text-muted)]/20';
    }
};

const EMPTY_LEAD = { name: '', email: '', phone: '', company: '', position: '', source: 'website', status: 'new', score: 50, value: 0, industry: '' };

export default function LeadsPage() {
    const { isDark } = useThemeStore();
    const [leads, setLeads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_LEAD);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const canDelete = usePermission('crm.leads.delete');

    const fetchLeads = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/leads?status=${filter === 'all' ? '' : filter}&search=${search}&page=${page}&limit=10`);
            const data = await res.json();
            if (data.success) {
                setLeads(data.data);
                setPages(data.pages);
                setTotal(data.total);
            }
        } catch (err) {
            console.error('Failed to fetch leads:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchLeads(); }, [filter, search, page]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingId ? `/api/leads/${editingId}` : '/api/leads';
            const method = editingId ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingId ? 'Lead re-calibrated!' : 'Lead initialized!');
                setShowAdd(false);
                setEditingId(null);
                setForm(EMPTY_LEAD);
                fetchLeads();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setSaving(false); }
    };

    const handleEdit = (lead) => {
        setForm({ ...lead });
        setEditingId(lead._id);
        setShowAdd(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Purge this prospect node? This action is irrevocable.')) return;
        try {
            const res = await fetch(`/api/leads/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Node purged');
                fetchLeads();
            } else toast.error(data.message);
        } catch { toast.error('Purge failed'); }
    };

    const handleExportXLSX = () => {
        const exportData = leads.map(l => ({
            Name: l.name,
            Email: l.email,
            Phone: l.phone,
            Company: l.company,
            Position: l.position,
            Status: l.status,
            Value: l.value,
            Score: l.score,
            Industry: l.industry,
            Source: l.source
        }));
        exportToXLSX(exportData, 'leads-export');
        toast.success('Leads exported to XLSX');
    };

    const handleExportPDF = () => {
        const headers = ['Name', 'Company', 'Status', 'Value', 'Score'];
        const data = leads.map(l => [l.name, l.company, l.status, formatCurrency(l.value), `${l.score}%`]);
        exportToPDF(headers, data, 'Leads Pipeline Report', 'leads-report');
        toast.success('Leads exported to PDF');
    };

    const handleImportXLSX = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await importFromXLSX(file);
            console.log('Imported Data:', data);
            toast.success(`${data.length} leads parsed from file. (Simulated)`);
            e.target.value = '';
        } catch (err) {
            toast.error('Import failed');
            console.error(err);
        }
    };

    const statusCounts = STATUS_OPTIONS.slice(1).reduce((acc, s) => {
        acc[s] = leads.filter(l => l.status === s).length;
        return acc;
    }, {});

    const funnelChart = {
        options: {
            chart: { type: 'bar', toolbar: { show: false }, background: 'transparent' },
            colors: ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
            theme: { mode: isDark ? 'dark' : 'light' },
            plotOptions: { bar: { horizontal: true, borderRadius: 12, distributed: true, barHeight: '60%' } },
            dataLabels: { enabled: true, formatter: val => `${val} Nodes`, style: { fontSize: '10px', fontWeight: '900', colors: ['#fff'] } },
            xaxis: {
                categories: Object.keys(statusCounts).map(s => s.toUpperCase()),
                labels: { style: { colors: 'var(--text-muted)', fontSize: '9px', fontWeight: '900' } }
            },
            yaxis: { labels: { style: { colors: 'var(--text-muted)', fontSize: '9px', fontWeight: '900' } } },
            grid: { borderColor: 'var(--border)', strokeDashArray: 4, padding: { left: 0, right: 0 } },
            legend: { show: false },
        },
        series: [{ data: Object.values(statusCounts) }],
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-12">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingId(null); setForm(EMPTY_LEAD); }} title={editingId ? "Re-calibrate Prospect Vector" : "Initiate Lead Genesis"} size="lg">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField label="Prospect Identity" required>
                            <input required className={inputCls} placeholder="Full name of target..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Neural Signal (Email)">
                            <input type="email" className={inputCls} placeholder="target@entity.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </FormField>
                        <FormField label="Protocol (Phone)">
                            <input className={inputCls} placeholder="+Signal ID" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        </FormField>
                        <FormField label="Organizational Entity">
                            <input className={inputCls} placeholder="Entity name" value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))} />
                        </FormField>
                        <FormField label="Node Position">
                            <input className={inputCls} placeholder="e.g. Chief Executive" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
                        </FormField>
                        <FormField label="Industry Cluster">
                            <input className={inputCls} placeholder="e.g. Neural Tech" value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))} />
                        </FormField>
                        <FormField label="Acquisition Source">
                            <select className={inputCls} value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                                {['website', 'referral', 'linkedin', 'email', 'cold_call', 'event', 'other'].map(s => (
                                    <option key={s} value={s}>{s.toUpperCase().replace('_', ' ')}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Pipeline Stage">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'].map(s => (
                                    <option key={s} value={s}>{s.toUpperCase()}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Fiscal Projection ($)">
                            <input type="number" min="0" className={inputCls} placeholder="0" value={form.value} onChange={e => setForm(p => ({ ...p, value: +e.target.value }))} />
                        </FormField>
                        <FormField label="Probability Score (0–100)">
                            <input type="number" min="0" max="100" className={inputCls} placeholder="50" value={form.score} onChange={e => setForm(p => ({ ...p, score: +e.target.value }))} />
                        </FormField>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditingId(null); setForm(EMPTY_LEAD); }} loading={saving} submitLabel={editingId ? "Commit Calibration" : "Initialize Lead"} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-8 underline-offset-8 text-shadow-xl shadow-[var(--primary-500)]/10">Prospect Pipeline</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-8 flex items-center gap-2">
                        <TrendingUp size={12} className="text-[var(--primary-500)]" />
                        Neural Lead Acquisition • {leads.length} Active Nodes
                    </p>
                </div>
                {isMounted && (
                    <div className="flex flex-wrap items-center gap-4">
                        <label className="flex items-center gap-4 px-6 py-4 bg-[var(--surface-overlay)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all border border-[var(--border)] shadow-xl cursor-pointer active:scale-95">
                            <Upload size={16} /> Import
                            <input type="file" accept=".xlsx, .xls" className="hidden" onChange={handleImportXLSX} />
                        </label>
                        <div className="flex bg-[var(--surface-overlay)] rounded-[2rem] border border-[var(--border)] overflow-hidden shadow-xl">
                            <button onClick={handleExportXLSX} className="px-6 py-4 hover:bg-[var(--surface-raised)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.3em] transition-all border-r border-[var(--border)] flex items-center gap-2">
                                <Download size={16} /> XLSX
                            </button>
                            <button onClick={handleExportPDF} className="px-6 py-4 hover:bg-[var(--surface-raised)] text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.3em] transition-all flex items-center gap-2">
                                <FileText size={16} /> PDF
                            </button>
                        </div>
                        <Can permission="crm.leads.create">
                            <button onClick={() => { setForm(EMPTY_LEAD); setEditingId(null); setShowAdd(true); }}
                                className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                                <Plus size={18} /> New Lead
                            </button>
                        </Can>
                    </div>
                )}
            </div>

            {/* Stage Flux Filters */}
            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0">
                {[{ label: 'Global Registry', value: 'all', count: leads.length }, ...STATUS_OPTIONS.slice(1).map(s => ({ label: s, value: s, count: statusCounts[s] || 0 }))].map(s => (
                    <button
                        key={s.value}
                        onClick={() => setFilter(s.value)}
                        className={cn(
                            'px-6 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all border-2 whitespace-nowrap min-w-[140px] shadow-xl',
                            filter === s.value
                                ? 'bg-[var(--text-primary)] text-[var(--surface)] border-[var(--text-primary)] scale-105 z-10'
                                : 'bg-[var(--surface-raised)]/50 text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/50'
                        )}
                    >
                        {s.label} <span className={cn('ml-3 px-2 py-0.5 rounded-md text-[8px] font-black', filter === s.value ? 'bg-[var(--primary-500)] text-white' : 'bg-[var(--primary-500)]/10 text-[var(--primary-500)]')}>{s.count}</span>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                <div className="xl:col-span-2 space-y-8">
                    <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
                        <div className="flex items-center gap-6 p-6 border-b border-[var(--border)] bg-[var(--surface-overlay)]/30">
                            <div className="relative flex-1 group">
                                <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                                <input
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    placeholder="SEARCH NEURAL REGISTRY..."
                                    className="w-full pl-16 pr-8 py-4 rounded-[2rem] bg-[var(--surface-raised)]/50 border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all placeholder:text-[var(--text-muted)] shadow-inner"
                                />
                            </div>
                        </div>

                        {/* Mobile Node Card View */}
                        <div className="block sm:hidden divide-y divide-[var(--border)]">
                            {loading ? (
                                <div className="p-20 text-center"><div className="w-10 h-10 border-4 border-[var(--primary-500)]/20 border-t-[var(--primary-500)] animate-spin rounded-full mx-auto" /></div>
                            ) : leads.length === 0 ? (
                                <div className="p-20 text-center text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] italic opacity-40">Zero Signal Detected</div>
                            ) : leads.map(lead => (
                                <div key={lead._id} className="p-6 space-y-6 hover:bg-[var(--primary-500)]/[0.03] transition-colors">
                                    <div className="flex justify-between items-start">
                                        <div className="flex gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-blue-600 p-[2px] shadow-2xl">
                                                <div className="w-full h-full rounded-[0.9rem] bg-[var(--surface)] flex items-center justify-center text-[var(--primary-500)] font-black text-sm uppercase tracking-tighter">
                                                    {getInitials(lead.name || 'L')}
                                                </div>
                                            </div>
                                            <div>
                                                <h4 className="font-black text-[var(--text-primary)] uppercase tracking-tight leading-none text-base">{lead.name}</h4>
                                                <p className="text-[9px] text-[var(--text-muted)] font-black uppercase tracking-widest mt-2 italic opacity-60">{lead.company}</p>
                                            </div>
                                        </div>
                                        <span className={cn('text-[8px] px-3 py-1.5 rounded-xl font-black uppercase border-2 shadow-xl tracking-widest transition-all', getStatusColor(lead.status))}>
                                            {lead.status}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="space-y-1">
                                            <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40 italic">Fiscal Projection</p>
                                            <p className="text-xl font-black text-[var(--text-primary)] tracking-tighter">{formatCurrency(lead.value)}</p>
                                        </div>
                                        <div className="flex gap-3">
                                            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] border border-[var(--border)]"><Eye size={16} /></button>
                                            {isMounted && (
                                                <>
                                                    <Can permission="crm.leads.edit">
                                                        <button onClick={() => openEdit(lead)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl"><Edit size={16} /></button>
                                                    </Can>
                                                    <Can permission="crm.leads.delete">
                                                        <button onClick={() => handleDelete(lead._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl"><Trash2 size={16} /></button>
                                                    </Can>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Desktop Ledger View */}
                        <div className="hidden sm:block overflow-x-auto scrollbar-none">
                            <table className="w-full text-left border-collapse">
                                <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] bg-[var(--surface-overlay)]/60">
                                    <tr>
                                        <th className="py-8 px-10 italic">Node / Entity</th>
                                        <th className="py-8 px-6 italic">Flux Stage</th>
                                        <th className="py-8 px-6 text-right italic">Projected Value</th>
                                        <th className="py-8 px-6 italic text-center">Confidence Index</th>
                                        <th className="py-8 px-10"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {loading ? (
                                        <tr><td colSpan="5" className="py-32 text-center text-[var(--text-muted)] font-black tracking-[1em] uppercase text-xs opacity-40 italic">Syncing Prospect Data...</td></tr>
                                    ) : leads.length === 0 ? (
                                        <tr><td colSpan="5" className="py-32 text-center text-[var(--text-muted)] font-black tracking-[1em] uppercase text-xs opacity-40 italic">Zero Presence Recorded</td></tr>
                                    ) : leads.map(lead => (
                                        <tr key={lead._id} className="hover:bg-[var(--primary-500)]/[0.03] transition-all duration-500 group">
                                            <td className="py-8 px-10">
                                                <div className="flex items-center gap-6">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-blue-600 p-[2px] shadow-2xl group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                                                        <div className="w-full h-full rounded-[0.9rem] bg-[var(--surface)] flex items-center justify-center text-[var(--primary-500)] font-black text-xs shadow-inner uppercase tracking-tighter">
                                                            {getInitials(lead.name || 'L')}
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-[13px] font-black text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight leading-none italic">{lead.name}</p>
                                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2 italic opacity-60">{lead.company}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-8 px-6">
                                                <span className={cn('text-[9px] px-4 py-2 rounded-xl font-black uppercase border-2 shadow-xl tracking-[0.2em] transition-all duration-500 leading-none', getStatusColor(lead.status))}>
                                                    {lead.status}
                                                </span>
                                            </td>
                                            <td className="py-8 px-6 text-lg font-black text-[var(--text-primary)] text-right tracking-tighter italic">
                                                {formatCurrency(lead.value)}
                                            </td>
                                            <td className="py-8 px-6">
                                                <div className="flex flex-col items-center gap-2">
                                                    <div className="w-24 h-2 bg-[var(--surface-raised)] rounded-full overflow-hidden shadow-inner border border-[var(--border)]">
                                                        <div className="h-full bg-gradient-to-r from-[var(--primary-500)] to-emerald-500 rounded-full shadow-[0_0_12px_var(--primary-500)] transition-all duration-1000" style={{ width: `${lead.score}%` }} />
                                                    </div>
                                                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">{lead.score}% PROBABILITY</span>
                                                </div>
                                            </td>
                                            <td className="py-8 px-10 text-right">
                                                <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-500">
                                                    <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-white border border-[var(--border)] transition-all transform active:scale-90" title="Expand Node"><Eye size={18} /></button>
                                                    {isMounted && (
                                                        <>
                                                            <Can permission="crm.leads.edit">
                                                                <button onClick={() => openEdit(lead)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl active:scale-90" title="Modify Vector"><Edit size={16} /></button>
                                                            </Can>
                                                            <Can permission="crm.leads.delete">
                                                                <button onClick={() => handleDelete(lead._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl active:scale-90" title="Purge Record"><Trash2 size={16} /></button>
                                                            </Can>
                                                        </>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="px-10 pb-10">
                            <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] p-10 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none group-hover:opacity-10 transition-opacity duration-1000 rotate-12 group-hover:rotate-0"><Target size={120} /></div>
                        <h3 className="font-black text-[var(--text-primary)] mb-2 uppercase tracking-tighter text-xl italic underline decoration-[var(--primary-500)] decoration-4 underline-offset-4">Pipeline Matrix</h3>
                        <p className="text-[10px] font-black text-[var(--text-muted)] mb-10 uppercase tracking-[0.4em] opacity-50">Flux Distribution Overview</p>
                        <div className="h-[320px]">
                            <ReactApexChart options={funnelChart.options} series={funnelChart.series} type="bar" height="100%" />
                        </div>
                        <div className="mt-10 space-y-6 pt-10 border-t border-[var(--border)]">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] opacity-40">Cumulative Potential</span>
                                <span className="text-3xl font-black text-[var(--primary-500)] tracking-tighter italic">{formatCurrency(leads.reduce((s, l) => s + (l.value || 0), 0))}</span>
                            </div>
                            <div className="flex justify-between items-center bg-[var(--surface-overlay)]/50 p-4 rounded-2xl border border-[var(--border)] shadow-inner">
                                <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest opacity-60">System Efficiency</span>
                                <span className="px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-500 font-black text-[9px] uppercase tracking-widest shadow-emerald-500/10 shadow-lg border border-emerald-500/20">NEURAL OPTIMAL</span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-gradient-to-br from-[var(--text-primary)] to-indigo-950 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group border border-white/5">
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-[var(--primary-500)] opacity-20 rounded-full blur-[100px] group-hover:scale-150 transition-transform duration-1000"></div>
                        <h4 className="font-black text-2xl mb-4 relative z-10 flex items-center gap-4 uppercase italic tracking-widest opacity-90">
                            <Sparkles size={28} className="text-[var(--primary-500)] drop-shadow-[0_0_15px_rgba(139,92,246,0.8)]" /> Neural AI
                        </h4>
                        <p className="text-xs font-black text-white/70 relative z-10 leading-relaxed italic uppercase tracking-[0.1em] mb-8">
                            High-velocity signals detected in the "NEGOTIATION" sub-sector. Probability of node conversion exceeds 84% if re-calibrated within 18 cycles.
                        </p>
                        <button className="w-full py-5 bg-white text-black hover:bg-[var(--primary-500)] hover:text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-2xl hover:scale-105 active:scale-95 border-none">
                            Engage Neural Playbook
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
