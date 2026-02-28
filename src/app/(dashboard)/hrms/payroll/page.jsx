'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, Wallet, ArrowUpRight, ArrowDownRight, Printer, Search, MoreHorizontal, UserCircle, Briefcase, CreditCard, Landmark, TrendingUp, Users, CheckCircle, Download, Trash2, Edit, AlertCircle } from 'lucide-react';
import { formatCurrency, formatDate, cn, getStatusColor } from '@/lib/utils';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import toast from 'react-hot-toast';

export default function PayrollPage() {
    const [payrollRecords, setPayrollRecords] = useState([]);
    const [summary, setSummary] = useState({ totalNetPay: 0, totalEmployees: 0, averageSalary: 0 });
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showProcess, setShowProcess] = useState(false);
    const [processing, setProcessing] = useState(false);
    const [deleteId, setDeleteId] = useState(null);
    const [processForm, setProcessForm] = useState({
        period: new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' }),
        payDate: new Date().toISOString().split('T')[0]
    });
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const canManage = usePermission('hrms.payroll.manage');

    const fetchPayroll = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/payroll/summary?search=${search}`);
            const data = await res.json();
            if (data.success) {
                setPayrollRecords(data.data.records || []);
                setSummary(data.data.totals || { totalNetPay: 0, totalEmployees: 0, averageSalary: 0 });
            }
        } catch (err) {
            console.error('Failed to fetch payroll:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayroll();
    }, [search]);

    const handleRunPayroll = async (e) => {
        e.preventDefault();
        setProcessing(true);
        try {
            const res = await fetch('/api/payroll/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(processForm)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(`Payroll processed for ${data.count} employees!`);
                setShowProcess(false);
                fetchPayroll();
            } else {
                toast.error(data.message || 'Processing failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setProcessing(false); }
    };

    const handleDelete = async (id) => {
        try {
            const res = await fetch(`/api/payroll/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Payroll record purged');
                setDeleteId(null);
                fetchPayroll();
            } else toast.error(data.message);
        } catch { toast.error('Purge failed'); }
    };

    const payrolls = payrollRecords;
    const currentPeriod = new Date().toLocaleString('en-US', { month: 'long', year: 'numeric' });
    const totalDisbursed = summary.totalNetPay || 0;
    const avgNet = summary.averageSalary || 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Process Payroll Modal */}
            <Modal isOpen={showProcess} onClose={() => setShowProcess(false)} title="Initialize Salary Distribution Matrix" size="sm">
                <form onSubmit={handleRunPayroll} className="space-y-6">
                    <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                        <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest leading-relaxed">Warning: This action will synthesize records for ALL active personnel. Ensure attendance logs are vectorized.</p>
                    </div>
                    <FormField label="Fiscal Period (Month/Year)">
                        <input required className={inputCls} value={processForm.period} onChange={e => setProcessForm(p => ({ ...p, period: e.target.value }))} placeholder="e.g. March 2024" />
                    </FormField>
                    <FormField label="Disbursement Date">
                        <input required type="date" className={inputCls} value={processForm.payDate} onChange={e => setProcessForm(p => ({ ...p, payDate: e.target.value }))} />
                    </FormField>
                    <FormActions onClose={() => setShowProcess(false)} loading={processing} submitLabel="Execute Distribution" />
                </form>
            </Modal>

            {/* Delete Confirm Modal */}
            <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Purge Ledger Record" size="sm">
                <div className="space-y-6">
                    <p className="text-sm text-[var(--text-secondary)]">Are you sure you want to annul this financial record? This action will de-materialize the salary record from the history.</p>
                    <div className="flex gap-3 justify-end">
                        <button onClick={() => setDeleteId(null)} className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-xs font-black uppercase tracking-widest hover:bg-[var(--surface-overlay)] transition-all">Cancel</button>
                        <button onClick={() => handleDelete(deleteId)} className="px-5 py-2.5 rounded-xl bg-rose-500 hover:bg-rose-600 text-white text-xs font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 transition-all">Purge</button>
                    </div>
                </div>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tight uppercase italic underline decoration-[var(--primary-500)] underline-offset-8">Payroll Management</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black tracking-[0.4em] uppercase mt-6 opacity-60">
                        Operational Vector • {currentPeriod}
                    </p>
                </div>
                <div className="flex gap-4">
                    <button className="flex items-center gap-4 px-6 py-4 bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary-500)] rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-xl active:scale-95">
                        <Download size={16} /> Data Export
                    </button>
                    {isMounted && (
                        <Can permission="hrms.payroll.manage">
                            <button onClick={() => setShowProcess(true)} className="flex items-center gap-4 px-8 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-[10px] uppercase tracking-[0.2em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                                <Plus size={16} /> Execute Run
                            </button>
                        </Can>
                    )}
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Settled Capital', value: totalDisbursed, color: 'text-emerald-500', icon: Landmark, bg: 'from-emerald-500/10' },
                    { label: 'Neural Salary Mean', value: avgNet, color: 'text-[var(--primary-500)]', icon: TrendingUp, bg: 'from-[var(--primary-500)]/10' },
                    { label: 'Staff Nodes', value: payrolls.length, color: 'text-indigo-500', icon: Users, bg: 'from-indigo-500/10' },
                ].map((stat, i) => (
                    <div key={i} className={cn('bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] p-10 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group bg-gradient-to-br transition-all duration-700 hover:scale-[1.02]', stat.bg, 'to-transparent')}>
                        <div className="flex items-center justify-between mb-6 relative z-10">
                            <div className={cn('p-4 rounded-[1.2rem] bg-white/5 border border-white/10 shadow-inner', stat.color)}>
                                <stat.icon size={24} />
                            </div>
                            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] italic opacity-50">{stat.label}</span>
                        </div>
                        <p className={cn('text-4xl font-black tracking-tighter relative z-10', stat.color)}>
                            {typeof stat.value === 'string' || i === 2 ? stat.value : formatCurrency(stat.value)}
                        </p>
                        <div className="absolute -right-8 -bottom-8 opacity-[0.03] scale-150 rotate-12 transition-all group-hover:rotate-0 group-hover:scale-110 duration-1000">
                            <stat.icon size={180} />
                        </div>
                    </div>
                ))}
            </div>

            {/* Payroll Ledger */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4 bg-[var(--surface-overlay)]/30">
                    <div className="relative flex-1 max-w-sm group">
                        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="QUERY STAFF ARCHIVE..."
                            className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-[var(--surface-raised)]/50 border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all placeholder:text-[var(--text-muted)] shadow-inner"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-6 px-10">Employee / Persona</th>
                                <th className="py-6 px-6 text-right">Base Vector</th>
                                <th className="py-6 px-6 text-right">Allowances +</th>
                                <th className="py-6 px-6 text-right">Deductions -</th>
                                <th className="py-6 px-6 text-right">Net Liquidity</th>
                                <th className="py-6 px-6 text-center">Status</th>
                                <th className="py-6 px-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-20 bg-[var(--surface-overlay)]/20 shadow-inner">
                                        <td colSpan="7" className="px-10"><div className="h-6 bg-[var(--border)] rounded-full w-64"></div></td>
                                    </tr>
                                ))
                            ) : payrolls.length === 0 ? (
                                <tr><td colSpan="7" className="py-32 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.6em] italic opacity-40">Zero Financial Deltas Registered</td></tr>
                            ) : payrolls.map(r => (
                                <tr key={r._id} className="hover:bg-[var(--primary-500)]/[0.03] transition-all duration-500 group relative">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl overflow-hidden ring-4 ring-[var(--surface-raised)] shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-700">
                                                <img src={r.employee?.avatar || 'https://i.pravatar.cc/150'} alt="" className="w-full h-full object-cover" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[14px] font-black text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight line-clamp-1">{r.employee?.name}</p>
                                                <div className="flex items-center gap-2 mt-1 opacity-60">
                                                    <Briefcase size={12} className="text-[var(--text-muted)]" />
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">{r.employee?.position}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-[13px] font-black text-[var(--text-muted)] text-right opacity-60">{formatCurrency(r.baseSalary)}</td>
                                    <td className="py-6 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-emerald-500 font-black text-xs">
                                            <ArrowUpRight size={14} />
                                            {formatCurrency(r.allowances)}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-right">
                                        <div className="flex items-center justify-end gap-1.5 text-rose-500 font-black text-xs">
                                            <ArrowDownRight size={14} />
                                            {formatCurrency(r.deductions)}
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-right">
                                        <p className="text-xl font-black text-[var(--text-primary)] tracking-tighter">{formatCurrency(r.netPay)}</p>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic opacity-50">{r.period}</p>
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <div className={cn('inline-flex items-center gap-2 px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.2em] border shadow-2xl transition-all duration-500', getStatusColor(r.status))}>
                                            <CheckCircle size={10} />
                                            {r.status}
                                        </div>
                                    </td>
                                    <td className="py-6 px-10 text-right">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-500">
                                            <button className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-all shadow-xl" title="Expand Record">
                                                <Printer size={18} />
                                            </button>
                                            {isMounted && (
                                                <Can permission="hrms.payroll.manage">
                                                    <button onClick={() => setDeleteId(r._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl" title="Purge Record">
                                                        <Trash2 size={18} />
                                                    </button>
                                                </Can>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Matrix Synchronization Tip */}
            <div className="bg-gradient-to-r from-[var(--primary-500)]/10 via-transparent to-transparent border-l-4 border-[var(--primary-500)] p-8 rounded-[2.5rem] shadow-xl">
                <div className="flex items-center gap-5">
                    <div className="w-12 h-12 rounded-[1.2rem] bg-[var(--primary-500)]/20 flex items-center justify-center text-[var(--primary-500)] shadow-inner">
                        <DollarSign size={20} />
                    </div>
                    <div>
                        <p className="text-[11px] font-black text-[var(--primary-500)] uppercase tracking-[0.2em] leading-relaxed italic">
                            Operational Protocol: Payroll synchronization for <span className="text-[var(--text-primary)] underline decoration-dotted">{new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleString('en-US', { month: 'long', year: 'numeric' })}</span> is scheduled to trigger in <span className="text-[var(--text-primary)] font-black">6 days</span>.
                        </p>
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2 opacity-50">Ensure all personnel attendance vectors are normalized before execution.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
