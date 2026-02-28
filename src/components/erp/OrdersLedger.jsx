'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { ShoppingCart, Search, Edit, Trash2, MoreVertical, Plus, Package, CreditCard, Ship, ShieldAlert } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

const EMPTY_ORDER = {
    type: 'sale',
    customer: '',
    company: '',
    items: [{ product: '', name: '', quantity: 1, price: 0, total: 0 }],
    tax: 0,
    shipping: 0,
    status: 'pending',
    paymentStatus: 'unpaid',
    notes: '',
    shippingAddress: { street: '', city: '', state: '', country: '', zip: '' },
    billingAddress: { street: '', city: '', state: '', country: '', zip: '' }
};

export default function OrdersLedger({ initialOrders = [] }) {
    const [orders, setOrders] = useState(initialOrders || []);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [showAdd, setShowAdd] = useState(false);
    const [editingOrder, setEditingOrder] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_ORDER);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [companies, setCompanies] = useState([]);

    const canProcess = usePermission('erp.orders.process');

    const fetchOrders = async () => {
        try {
            const res = await fetch(`/api/orders?type=${typeFilter === 'ALL' ? '' : typeFilter.toLowerCase()}`);
            const data = await res.json();
            if (data.success) setOrders(data.data);
        } catch (err) { console.error('Failed to fetch orders:', err); }
    };

    const fetchDropdowns = async () => {
        try {
            const [pRes, cRes, coRes] = await Promise.all([
                fetch('/api/products'),
                fetch('/api/contacts'),
                fetch('/api/companies')
            ]);
            const [pData, cData, coData] = await Promise.all([pRes.json(), cRes.json(), coRes.json()]);
            if (pData.success) setProducts(pData.data);
            if (cData.success) setCustomers(cData.data);
            if (coData.success) setCompanies(coData.data);
        } catch (err) { console.error('Failed to fetch dropdown data:', err); }
    };

    useEffect(() => { fetchDropdowns(); }, []);
    useEffect(() => { fetchOrders(); }, [typeFilter]);

    const handleAddItem = () => {
        setForm(p => ({
            ...p,
            items: [...p.items, { product: '', name: '', quantity: 1, price: 0, total: 0 }]
        }));
    };

    const handleRemoveItem = (index) => {
        if (form.items.length === 1) return;
        const newItems = form.items.filter((_, i) => i !== index);
        setForm(p => ({ ...p, items: newItems }));
    };

    const handleUpdateItem = (index, field, value) => {
        const newItems = [...form.items];
        if (field === 'product') {
            const prod = products.find(p => p._id === value);
            newItems[index].product = value;
            newItems[index].name = prod?.name || '';
            newItems[index].price = prod?.price || 0;
        } else {
            newItems[index][field] = value;
        }
        newItems[index].total = newItems[index].quantity * newItems[index].price;
        setForm(p => ({ ...p, items: newItems }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const subtotal = form.items.reduce((s, i) => s + i.total, 0);
            const total = subtotal + Number(form.tax || 0) + Number(form.shipping || 0);
            const url = editingOrder ? `/api/orders/${editingOrder._id}` : '/api/orders';
            const method = editingOrder ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, subtotal, total })
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingOrder ? 'Transaction Synchronized' : 'Transaction Initialized!');
                setShowAdd(false);
                setEditingOrder(null);
                setForm(EMPTY_ORDER);
                fetchOrders();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Vaporize this transaction record? This action is non-reversible.')) return;
        try {
            const res = await fetch(`/api/orders/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Transaction record purged');
                fetchOrders();
            }
        } catch { toast.error('Purge failed'); }
    };

    const filteredOrders = orders.filter(o =>
        (typeFilter === 'ALL' || o.type?.toUpperCase() === typeFilter) &&
        ((o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.customer?.name || o.company?.name || '').toLowerCase().includes(search.toLowerCase()))
    );

    const statusStyles = {
        delivered: 'bg-emerald-500 text-white border-emerald-400/50 shadow-emerald-500/20',
        shipped: 'bg-blue-500 text-white border-blue-400/50 shadow-blue-500/20',
        processing: 'bg-indigo-500 text-white border-indigo-400/50 shadow-indigo-500/20',
        pending: 'bg-amber-500 text-white border-amber-400/50 shadow-amber-500/20',
        cancelled: 'bg-rose-500 text-white border-rose-400/50 shadow-rose-500/20',
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Initialize/Update Transaction Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingOrder(null); setForm(EMPTY_ORDER); }} title={editingOrder ? "Synchronize Transaction" : "Initialize New Transaction"} size="xl">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FormField label="Type Protocol" required>
                            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                <option value="sale">SALE SEQUENCE</option>
                                <option value="purchase">PURCHASE SEQUENCE</option>
                            </select>
                        </FormField>
                        <FormField label="Authorized Customer">
                            <select className={inputCls} value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}>
                                <option value="">SELECT ENTITY...</option>
                                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Linked Corporation">
                            <select className={inputCls} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}>
                                <option value="">SELECT CORP...</option>
                                {companies.map(co => <option key={co._id} value={co._id}>{co.name}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b border-[var(--border)] pb-2">
                            <h3 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-[0.3em]">Asset Composition</h3>
                            <button type="button" onClick={handleAddItem} className="px-4 py-1.5 bg-[var(--surface-overlay)] border border-[var(--border)] rounded-full text-[9px] font-black text-[var(--primary-500)] hover:bg-[var(--primary-500)] hover:text-white transition-all uppercase tracking-widest">+ Link asset</button>
                        </div>
                        <div className="space-y-3">
                            {form.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-4 bg-[var(--surface-overlay)]/40 p-4 rounded-3xl border border-[var(--border)] group/row relative">
                                    <div className="col-span-12 md:col-span-7">
                                        <select required className={inputCls} value={item.product?._id || item.product} onChange={e => handleUpdateItem(i, 'product', e.target.value)}>
                                            <option value="">Query Asset Registry...</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name} ({formatCurrency(p.price)})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-6 md:col-span-2">
                                        <input required type="number" min="1" className={inputCls} value={item.quantity} onChange={e => handleUpdateItem(i, 'quantity', +e.target.value)} placeholder="QTY" />
                                    </div>
                                    <div className="col-span-6 md:col-span-3 flex items-center justify-between pl-2">
                                        <span className="text-xs font-black text-[var(--text-primary)] font-mono">{formatCurrency(item.total)}</span>
                                        {form.items.length > 1 && (
                                            <button type="button" onClick={() => handleRemoveItem(i)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all">
                                                <Trash2 size={14} />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 bg-[var(--surface-overlay)]/20 p-6 rounded-[2.5rem] border border-[var(--border)]">
                        <FormField label="Tax Layer">
                            <input type="number" className={inputCls} value={form.tax} onChange={e => setForm(p => ({ ...p, tax: +e.target.value }))} />
                        </FormField>
                        <FormField label="Logistics Fee">
                            <input type="number" className={inputCls} value={form.shipping} onChange={e => setForm(p => ({ ...p, shipping: +e.target.value }))} />
                        </FormField>
                        <FormField label="Fulfillment">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Capital State">
                            <select className={inputCls} value={form.paymentStatus} onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                                {['unpaid', 'partially_paid', 'paid', 'refunded'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <FormActions onClose={() => { setShowAdd(false); setEditingOrder(null); }} loading={saving} submitLabel={editingOrder ? "Synchronize Transaction" : "Authorize Registry"} />
                </form>
            </Modal>

            {/* Table Controller */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 flex flex-wrap items-center justify-between gap-8 shadow-2xl">
                <div className="flex items-center gap-6 flex-1 max-w-3xl">
                    <div className="relative flex-1 group">
                        <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-[var(--surface-overlay)] border border-[var(--border)] text-[11px] font-black uppercase tracking-[0.2em] text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all placeholder:text-[var(--text-muted)] shadow-inner"
                            placeholder="QUERY SECURE TRANSACTION HASH..."
                        />
                    </div>
                    <div className="flex items-center gap-3 p-2 bg-[var(--surface-overlay)] border border-[var(--border)] rounded-[2rem] shadow-inner">
                        {['ALL', 'PURCHASE', 'SALE'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={cn(
                                    'px-8 py-3 rounded-full text-[10px] font-black uppercase tracking-[0.2em] transition-all',
                                    typeFilter === type ? 'bg-[var(--primary-500)] text-white shadow-xl shadow-[var(--primary-500)]/30' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <Can permission="erp.orders.create">
                    <button onClick={() => setShowAdd(true)} className="h-16 px-10 rounded-[2rem] bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white font-black text-[10px] uppercase tracking-[0.3em] shadow-2xl hover:scale-105 active:scale-95 transition-all flex items-center gap-4">
                        <Plus size={20} /> Initialize
                    </button>
                </Can>
            </div>

            {/* Order Ledger */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[4rem] border border-[var(--card-border)] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--surface-overlay)]/60">
                                {['Transaction Identity', 'Authorized Entity', 'Asset Volume', 'Capital Deep', 'Fulfillment State', 'Actions'].map((h, i) => (
                                    <th key={i} className="p-10 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] whitespace-nowrap">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="p-32 text-center text-slate-700 uppercase font-black tracking-[1em] italic opacity-40">Zero Results Retrieved</td></tr>
                            ) : filteredOrders.map(o => (
                                <tr key={o._id} className="group hover:bg-white/[0.03] transition-all duration-300">
                                    <td className="p-10">
                                        <div className="flex items-center gap-6">
                                            <div className={cn(
                                                'w-16 h-16 rounded-[1.8rem] flex items-center justify-center group-hover:rotate-12 group-hover:scale-110 transition-all duration-700 shadow-2xl relative overflow-hidden border border-white/5',
                                                o.type === 'purchase' ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-white'
                                            )}>
                                                <Package size={24} />
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-[var(--text-primary)] uppercase tracking-tighter group-hover:text-[var(--primary-500)] transition-colors">{o.orderNumber}</p>
                                                <div className="flex items-center gap-2 mt-2 opacity-50">
                                                    <Clock size={10} className="text-[var(--text-muted)]" />
                                                    <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{formatDate(o.orderDate)}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-widest">{o.customer?.name || o.company?.name || 'PRIVATE ENTITY'}</p>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em] mt-2 italic flex items-center gap-2">
                                            <ShieldAlert size={10} className="text-amber-500" /> Authorized Source
                                        </p>
                                    </td>
                                    <td className="p-10">
                                        <div className="flex items-center gap-3">
                                            <div className="px-3 py-1.5 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center text-[10px] font-black text-[var(--text-primary)] shadow-inner">
                                                {o.items?.length || 0}
                                            </div>
                                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">Linked Units</span>
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className="flex flex-col">
                                            <p className="text-xl font-black text-[var(--text-primary)] tracking-tighter group-hover:text-[var(--primary-500)] transition-colors">{formatCurrency(o.total)}</p>
                                            <div className="flex items-center gap-1.5 mt-2">
                                                <CreditCard size={10} className="text-emerald-500" />
                                                <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest italic">{o.paymentStatus}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className={cn('px-6 py-2.5 rounded-[1.2rem] text-[10px] font-black uppercase tracking-[0.2em] border w-fit shadow-2xl flex items-center gap-2', statusStyles[o.status] || statusStyles.pending)}>
                                            <Ship size={12} className="opacity-80" />
                                            {o.status}
                                        </div>
                                    </td>
                                    <td className="p-10">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                                            <Can permission="erp.orders.process">
                                                <button onClick={() => { setForm({ ...o, customer: o.customer?._id || o.customer || '', company: o.company?._id || o.company || '' }); setEditingOrder(o); setShowAdd(true); }} className="p-3.5 rounded-2xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl hover:shadow-[var(--primary-500)]/20">
                                                    <Edit size={18} />
                                                </button>
                                            </Can>
                                            <Can permission="erp.orders.delete">
                                                <button onClick={() => handleDelete(o._id)} className="p-3.5 rounded-2xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/20 transition-all shadow-xl hover:shadow-rose-500/20">
                                                    <Trash2 size={18} />
                                                </button>
                                            </Can>
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
