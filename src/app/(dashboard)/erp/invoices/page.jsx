'use client';

import { useState, useEffect } from 'react';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { Plus, Search, Edit, Trash2, Eye, Send, Printer, FileText } from 'lucide-react';
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const STATUS_OPTIONS = ['all', 'paid', 'sent', 'draft', 'overdue'];

const EMPTY_INVOICE = {
    customer: '',
    company: '',
    items: [{ description: '', quantity: 1, price: 0, total: 0 }],
    tax: 10,
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    notes: ''
};

export default function InvoicesPage() {
    const [invoices, setInvoices] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingInvoice, setEditingInvoice] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_INVOICE);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const canManage = usePermission('erp.invoices.create'); // Using create as the management permission

    const fetchInvoices = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/invoices?status=${filter === 'all' ? '' : filter}&search=${search}`);
            const data = await res.json();
            if (data.success) {
                setInvoices(data.data);
            }
        } catch (err) {
            console.error('Failed to fetch invoices:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDropdowns = async () => {
        try {
            const [cRes, coRes] = await Promise.all([
                fetch('/api/contacts'),
                fetch('/api/companies')
            ]);
            const [cData, coData] = await Promise.all([cRes.json(), coRes.json()]);
            if (cData.success) setCustomers(cData.data);
            if (coData.success) setCompanies(coData.data);
        } catch (err) {
            console.error('Failed to fetch dropdown data:', err);
        }
    };

    useEffect(() => {
        fetchInvoices();
        fetchDropdowns();
    }, [filter, search]);

    const handleAddItem = () => {
        setForm(p => ({
            ...p,
            items: [...p.items, { description: '', quantity: 1, price: 0, total: 0 }]
        }));
    };

    const handleUpdateItem = (index, field, value) => {
        const newItems = [...form.items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'price') {
            newItems[index].total = newItems[index].quantity * newItems[index].price;
        }
        setForm(p => ({ ...p, items: newItems }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingInvoice ? `/api/invoices/${editingInvoice._id}` : '/api/invoices';
            const method = editingInvoice ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingInvoice ? 'Invoice updated!' : 'Invoice generated!');
                setShowAdd(false);
                setEditingInvoice(null);
                setForm(EMPTY_INVOICE);
                fetchInvoices();
            } else {
                toast.error(data.message || 'Operation failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Annul this financial instrument? This action is irrevocable and will purge the ledger entry.')) return;
        try {
            const res = await fetch(`/api/invoices/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Ledger entry purged');
                fetchInvoices();
            }
        } catch { toast.error('Annulment failed'); }
    };

    const handleSend = async (id) => {
        setSaving(true);
        try {
            const res = await fetch(`/api/invoices/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status: 'sent' })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Invoice dispatched via neural link');
                fetchInvoices();
            }
        } catch { toast.error('Transmission failed'); }
        finally { setSaving(false); }
    };

    const handleDownload = (inv) => {
        const content = `Invoice: ${inv.invoiceNumber}\nCustomer: ${inv.customer?.name || 'Unknown'}\nTotal: ${inv.total}\nDate: ${inv.issueDate}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `invoice-${inv.invoiceNumber}.txt`;
        a.click();
        toast.success('Data packet downloaded');
    };

    const totalPaid = invoices.filter(i => i.status === 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const totalPending = invoices.filter(i => i.status !== 'paid').reduce((s, i) => s + (i.total || 0), 0);
    const totalInvoiced = totalPaid + totalPending;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Lodge/Modify Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingInvoice(null); setForm(EMPTY_INVOICE); }} title={editingInvoice ? "Modify Financial Instrument" : "Generate Neural Invoice"} size="xl">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Staff Identification / Client">
                            <select className={inputCls} value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}>
                                <option value="">Query Personnel Registry...</option>
                                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Organizational Entity">
                            <select className={inputCls} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}>
                                <option value="">Select Corporate Node...</option>
                                {companies.map(co => <option key={co._id} value={co._id}>{co.name}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.2em] italic">Transactional Components</h3>
                            <button type="button" onClick={handleAddItem} className="text-[10px] font-black text-[var(--primary-500)] hover:text-white hover:bg-[var(--primary-500)] px-3 py-1 rounded-full border border-[var(--primary-500)] transition-all uppercase tracking-widest">+ Inject Line Item</button>
                        </div>
                        <div className="space-y-2">
                            {form.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 bg-[var(--surface-raised)]/40 p-3 rounded-[1.5rem] border border-[var(--border)] shadow-inner">
                                    <div className="col-span-6">
                                        <input required className={cn(inputCls, "bg-transparent border-none")} placeholder="Operational Descriptor..." value={item.description} onChange={e => handleUpdateItem(i, 'description', e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <input required type="number" min="1" className={cn(inputCls, "bg-transparent border-none text-center")} placeholder="Qty" value={item.quantity} onChange={e => handleUpdateItem(i, 'quantity', +e.target.value)} />
                                    </div>
                                    <div className="col-span-2">
                                        <input required type="number" min="0" className={cn(inputCls, "bg-transparent border-none text-right")} placeholder="Val" value={item.price} onChange={e => handleUpdateItem(i, 'price', +e.target.value)} />
                                    </div>
                                    <div className="col-span-2 flex items-center justify-end px-4 text-xs font-black text-[var(--primary-500)] tracking-tighter">
                                        {formatCurrency(item.total)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Fiscal Tax Surcharge (%)">
                            <input type="number" className={inputCls} value={form.tax} onChange={e => setForm(p => ({ ...p, tax: +e.target.value }))} />
                        </FormField>
                        <FormField label="Temporal Deadline" required>
                            <input required type="date" className={inputCls} value={form.dueDate ? form.dueDate.split('T')[0] : ''} onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))} />
                        </FormField>
                    </div>

                    <FormActions onClose={() => { setShowAdd(false); setEditingInvoice(null); }} loading={saving} submitLabel={editingInvoice ? "Sync Modifications" : " Lodge Instrument"} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-6 px-2">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-4 underline-offset-8">Neural Ledger</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-6 flex items-center gap-2">
                        Financial Archeology • {invoices.length} Registered Instruments
                    </p>
                </div>
                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-4 px-8 py-4 bg-[var(--surface-overlay)] hover:bg-[var(--surface-raised)] text-[var(--text-primary)] rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all border border-[var(--border)] shadow-xl active:scale-95">
                        <Printer size={18} /> Hard Copy
                    </button>
                    {isMounted && (
                        <Can permission="erp.invoices.create">
                            <button onClick={() => { setForm(EMPTY_INVOICE); setEditingInvoice(null); setShowAdd(true); }}
                                className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                                <Plus size={18} /> New Invoice
                            </button>
                        </Can>
                    )}
                </div>
            </div>

            {/* Financial Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Settled Flux', value: totalPaid, color: 'text-emerald-500', border: 'border-emerald-500/20', bg: 'bg-emerald-500/5' },
                    { label: 'Pending Divergence', value: totalPending, color: 'text-amber-500', border: 'border-amber-500/20', bg: 'bg-amber-500/5' },
                    { label: 'Cumulative Volume', value: totalInvoiced, color: 'text-[var(--primary-500)]', border: 'border-[var(--primary-500)]/20', bg: 'bg-[var(--primary-500)]/5' },
                ].map((stat, i) => (
                    <div key={i} className={cn('rounded-[2.5rem] p-8 border backdrop-blur-3xl shadow-2xl relative overflow-hidden group transition-all duration-700 hover:scale-[1.02]', stat.border, stat.bg)}>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-white/10 transition-all duration-1000"></div>
                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-[var(--text-muted)] mb-4 opacity-50 italic">{stat.label}</p>
                        <p className={cn('text-4xl font-black tracking-tighter', stat.color)}>{formatCurrency(stat.value)}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Table */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
                <div className="p-4 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4 bg-[var(--surface-overlay)]/30">
                    <div className="flex bg-[var(--surface-raised)]/50 p-1.5 rounded-[1.5rem] border border-[var(--border)] shadow-inner">
                        {STATUS_OPTIONS.map(s => (
                            <button
                                key={s}
                                onClick={() => setFilter(s)}
                                className={cn(
                                    'px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
                                    filter === s
                                        ? 'bg-[var(--text-primary)] text-[var(--surface)] shadow-2xl scale-105'
                                        : 'text-[var(--text-muted)] hover:text-[var(--text-primary)]'
                                )}
                            >
                                {s}
                            </button>
                        ))}
                    </div>
                    <div className="relative w-full md:w-96 group">
                        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="QUERY LEDGER IDENTIFICATION..."
                            className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-[var(--surface-raised)]/50 border border-[var(--border)] text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all placeholder:text-[var(--text-muted)] shadow-inner"
                        />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-6 px-10">Client / Protocol</th>
                                <th className="py-6 px-6">ID Node</th>
                                <th className="py-6 px-6 text-right">Fiscal Value</th>
                                <th className="py-6 px-6 text-center">Protocol Status</th>
                                <th className="py-6 px-6">Temporal Gen</th>
                                <th className="py-6 px-6">Temporal Due</th>
                                <th className="py-6 px-10"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i} className="animate-pulse h-20 bg-[var(--surface-overlay)]/20 shadow-inner">
                                        <td colSpan="7" className="px-10"><div className="h-6 bg-[var(--border)] rounded-full w-48"></div></td>
                                    </tr>
                                ))
                            ) : invoices.length === 0 ? (
                                <tr><td colSpan="7" className="py-32 text-center text-[var(--text-muted)] font-black uppercase tracking-[0.5em] italic opacity-40">Zero Financial Divergences Found</td></tr>
                            ) : invoices.map(inv => (
                                <tr key={inv._id} className="hover:bg-[var(--surface-overlay)]/40 transition-all duration-500 group relative">
                                    <td className="py-6 px-10">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[1.2rem] bg-[var(--text-primary)]/5 flex items-center justify-center text-[var(--text-primary)] font-black text-sm border border-[var(--border)] shadow-xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-500">
                                                {(inv.customer?.name || inv.company?.name || 'C')[0]}
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[14px] font-black text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight line-clamp-1">
                                                    {inv.customer?.name || inv.company?.name || 'Anonymous Node'}
                                                </p>
                                                <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic opacity-50 mt-1">Ref: {inv.company?.name || 'Self-Liquidating'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-6 px-6 text-[11px] font-mono font-black text-[var(--text-muted)] tracking-widest opacity-60">
                                        {inv.invoiceNumber}
                                    </td>
                                    <td className="py-6 px-6 text-[15px] font-black text-[var(--text-primary)] text-right tracking-tighter">
                                        {formatCurrency(inv.total)}
                                    </td>
                                    <td className="py-6 px-6 text-center">
                                        <span className={cn('text-[10px] px-5 py-2 rounded-xl font-black uppercase border tracking-[0.2em] shadow-xl transition-all duration-500', getStatusColor(inv.status))}>
                                            {inv.status}
                                        </span>
                                    </td>
                                    <td className="py-6 px-6 text-[11px] font-black text-[var(--text-muted)] uppercase tracking-wider italic">
                                        {formatDate(inv.issueDate)}
                                    </td>
                                    <td className="py-6 px-6">
                                        <span className={cn('text-[11px] font-black tracking-wider uppercase italic', inv.status === 'overdue' ? 'text-rose-500 animate-pulse' : 'text-[var(--text-muted)]')}>
                                            {formatDate(inv.dueDate)}
                                        </span>
                                    </td>
                                    <td className="py-6 px-10">
                                        <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-4 group-hover:translate-x-0 duration-500">
                                            <button onClick={() => handleDownload(inv)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl" title="Expand Node (Download)"><Eye size={18} /></button>
                                            {isMounted && (
                                                <Can permission="erp.invoices.create">
                                                    <button onClick={() => { setForm({ ...inv }); setEditingInvoice(inv); setShowAdd(true); }} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl active:scale-90" title="Re-calibrate Vector"><Edit size={16} /></button>
                                                    <button onClick={() => handleDelete(inv._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl active:scale-90" title="Purge Record"><Trash2 size={16} /></button>
                                                </Can>
                                            )}
                                            <button onClick={() => handleSend(inv._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] border border-[var(--border)] transition-all shadow-xl" title="Broadcast Node (Send)"><Send size={18} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
