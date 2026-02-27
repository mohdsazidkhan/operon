'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Search, MoreVertical, Plus, Package } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';



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

export default function OrdersLedger({ initialOrders }) {
    const [orders, setOrders] = useState(initialOrders);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_ORDER);
    const [products, setProducts] = useState([]);
    const [customers, setCustomers] = useState([]);
    const [companies, setCompanies] = useState([]);

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

    useEffect(() => {
        fetchDropdowns();
    }, []);

    useEffect(() => {
        fetchOrders();
    }, [typeFilter]);

    const handleAddItem = () => {
        setForm(p => ({
            ...p,
            items: [...p.items, { product: '', name: '', quantity: 1, price: 0, total: 0 }]
        }));
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

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const subtotal = form.items.reduce((s, i) => s + i.total, 0);
            const total = subtotal + form.tax + form.shipping;
            const res = await fetch('/api/orders', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, subtotal, total })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Transaction Initialized!');
                setShowAdd(false);
                setForm(EMPTY_ORDER);
                fetchOrders();
            } else {
                toast.error(data.message || 'Failed to initialize transaction');
            }
        } catch { toast.error('Failed to initialize transaction'); }
        finally { setSaving(false); }
    };

    const filteredOrders = orders.filter(o =>
        (typeFilter === 'ALL' || o.type?.toUpperCase() === typeFilter) &&
        ((o.orderNumber || '').toLowerCase().includes(search.toLowerCase()) ||
            (o.customer?.name || o.company?.name || '').toLowerCase().includes(search.toLowerCase()))
    );

    const statusStyles = {
        delivered: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
        processing: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
        pending: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
        cancelled: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Initialize Transaction Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Initialize New Transaction" size="xl">
                <form onSubmit={handleAdd} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <FormField label="Type">
                            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                <option value="sale">Sale</option>
                                <option value="purchase">Purchase</option>
                            </select>
                        </FormField>
                        <FormField label="Link Customer">
                            <select className={inputCls} value={form.customer} onChange={e => setForm(p => ({ ...p, customer: e.target.value }))}>
                                <option value="">Select Customer</option>
                                {customers.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Link Company">
                            <select className={inputCls} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}>
                                <option value="">Select Company</option>
                                {companies.map(co => <option key={co._id} value={co._id}>{co.name}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-widest">Asset Composition</h3>
                            <button type="button" onClick={handleAddItem} className="text-xs font-black text-[var(--primary-500)] hover:text-[var(--primary-600)] uppercase">+ Link product</button>
                        </div>
                        <div className="space-y-2">
                            {form.items.map((item, i) => (
                                <div key={i} className="grid grid-cols-12 gap-2 bg-[var(--surface-overlay)]/30 p-3 rounded-2xl border border-[var(--border)]">
                                    <div className="col-span-6">
                                        <select required className={inputCls} value={item.product} onChange={e => handleUpdateItem(i, 'product', e.target.value)}>
                                            <option value="">Choose Asset...</option>
                                            {products.map(p => <option key={p._id} value={p._id}>{p.name} ({formatCurrency(p.price)})</option>)}
                                        </select>
                                    </div>
                                    <div className="col-span-2">
                                        <input required type="number" min="1" className={inputCls} value={item.quantity} onChange={e => handleUpdateItem(i, 'quantity', +e.target.value)} />
                                    </div>
                                    <div className="col-span-4 flex items-center justify-end px-3 text-[10px] font-black text-[var(--text-primary)] font-mono">
                                        {formatCurrency(item.total)}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField label="Logistics Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Payment Protocol">
                            <select className={inputCls} value={form.paymentStatus} onChange={e => setForm(p => ({ ...p, paymentStatus: e.target.value }))}>
                                {['unpaid', 'partially_paid', 'paid', 'refunded'].map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
                            </select>
                        </FormField>
                    </div>

                    <FormActions onClose={() => setShowAdd(false)} loading={saving} submitLabel="Finalize & Initialize Transaction" />
                </form>
            </Modal>

            {/* Table Controller */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-6 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1 group">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                            placeholder="QUERY SECURE TRANSACTION HASH..."
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-overlay)] border border-[var(--border)] rounded-2xl">
                        {['ALL', 'PURCHASE', 'SALE'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={cn(
                                    'px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                                    typeFilter === type ? 'bg-[var(--primary-500)] text-white shadow-xl shadow-[var(--primary-500)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <button onClick={() => setShowAdd(true)} className="h-14 px-8 rounded-2xl bg-[var(--text-primary)] text-[var(--surface)] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                    <Plus size={18} /> Initialize Transaction
                </button>
            </div>

            {/* Order Transaction Table */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--surface-overlay)]/40">
                                {['Order Identity', 'Entity Protocol', 'Asset Flux', 'Capital Depth', 'Logistics State', 'Actions'].map((h, i) => (
                                    <th key={i} className="p-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-slate-700 uppercase font-black tracking-widest">No matching transactions</td></tr>
                            ) : filteredOrders.map(o => (
                                <tr key={o._id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                'w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-xl shadow-black/10 relative overflow-hidden border border-white/5',
                                                o.type === 'purchase' ? 'bg-indigo-500/10 text-indigo-500' : 'bg-emerald-500/10 text-emerald-500'
                                            )}>
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tighter group-hover:text-[var(--primary-500)] transition-colors">{o.orderNumber}</p>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">{formatDate(o.orderDate)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest">{o.customer?.name || o.company?.name || 'N/A'}</p>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic italic">Authorized Entity</p>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-lg bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center text-[9px] font-black text-[var(--text-muted)]">{o.items?.length || 0}</span>
                                            <span className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest">Units Linked</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-lg font-black text-[var(--text-primary)] tracking-tighter">{formatCurrency(o.total)}</p>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Verified Flow</p>
                                    </td>
                                    <td className="p-8">
                                        <div className={cn('px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border w-fit shadow-xl shadow-black/20', statusStyles[o.status] || statusStyles.pending)}>
                                            {o.status}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <button className="p-3 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-xl shadow-black/10 group-hover:border-[var(--border-strong)]">
                                            <MoreVertical size={18} />
                                        </button>
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
