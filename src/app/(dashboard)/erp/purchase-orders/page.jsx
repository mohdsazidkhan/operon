'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, ShoppingBag, Clock, CheckCircle, Truck, Edit, Trash2, Package, DollarSign, AlertCircle } from 'lucide-react';
import { cn, formatCurrency, formatDate, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const EMPTY_PO = {
    vendorId: '', vendorName: '', items: [{ description: '', quantity: 1, unitPrice: 0, total: 0 }],
    tax: 0, shipping: 0, status: 'draft', expectedDelivery: '', notes: '', paymentTerms: 'net30'
};

const STATUS_COLORS = {
    draft: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200',
    sent: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-200',
    confirmed: 'text-indigo-500 bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200',
    received: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200',
    partial: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30 border-amber-200',
    cancelled: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30 border-rose-200',
};

export default function PurchaseOrdersPage() {
    const [orders, setOrders] = useState([]);
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editPO, setEditPO] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_PO);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/purchase-orders?status=${filter === 'all' ? '' : filter}&search=${search}`);
            const data = await res.json();
            if (data.success) setOrders(data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    const fetchVendors = async () => {
        try {
            const res = await fetch('/api/vendors?limit=100');
            const data = await res.json();
            if (data.success) setVendors(data.data || []);
        } catch { }
    };

    useEffect(() => { fetchOrders(); }, [filter, search]);
    useEffect(() => { fetchVendors(); }, []);

    const updateItem = (idx, field, val) => {
        const items = [...form.items];
        items[idx] = { ...items[idx], [field]: field === 'description' ? val : +val };
        items[idx].total = items[idx].quantity * items[idx].unitPrice;
        setForm(p => ({ ...p, items }));
    };

    const addItem = () => setForm(p => ({ ...p, items: [...p.items, { description: '', quantity: 1, unitPrice: 0, total: 0 }] }));
    const removeItem = (idx) => setForm(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }));

    const subtotal = form.items.reduce((s, i) => s + (i.total || 0), 0);
    const total = subtotal + (form.tax || 0) + (form.shipping || 0);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editPO ? 'PUT' : 'POST';
            const url = editPO ? `/api/purchase-orders/${editPO._id}` : '/api/purchase-orders';
            const payload = { ...form, vendor: form.vendorId, subtotal, total };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
            const data = await res.json();
            if (data.success) {
                toast.success(editPO ? 'PO updated!' : 'Purchase order created!');
                setShowAdd(false); setEditPO(null); setForm(EMPTY_PO); fetchOrders();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this purchase order?')) return;
        await fetch(`/api/purchase-orders/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchOrders();
    };

    const totalValue = orders.reduce((s, o) => s + (o.total || 0), 0);
    const pendingValue = orders.filter(o => ['sent', 'confirmed', 'partial'].includes(o.status)).reduce((s, o) => s + (o.total || 0), 0);

    const statuses = ['all', 'draft', 'sent', 'confirmed', 'received', 'partial', 'cancelled'];
    const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditPO(null); setForm(EMPTY_PO); }}
                title={editPO ? 'Edit Purchase Order' : 'New Purchase Order'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Vendor" required>
                            <select className={inputCls} value={form.vendorId}
                                onChange={e => {
                                    const v = vendors.find(v => v._id === e.target.value);
                                    setForm(p => ({ ...p, vendorId: e.target.value, vendorName: v?.name || '' }));
                                }}>
                                <option value="">Select vendor...</option>
                                {vendors.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {statuses.slice(1).map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Expected Delivery">
                            <input type="date" className={inputCls} value={form.expectedDelivery}
                                onChange={e => setForm(p => ({ ...p, expectedDelivery: e.target.value }))} />
                        </FormField>
                        <FormField label="Payment Terms">
                            <select className={inputCls} value={form.paymentTerms} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))}>
                                {['net15', 'net30', 'net60', 'prepaid', 'cod'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                        </FormField>
                    </div>

                    {/* Line items */}
                    <div className="space-y-2">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Line Items</p>
                        {form.items.map((item, idx) => (
                            <div key={idx} className="flex gap-2 flex-wrap sm:flex-nowrap">
                                <input placeholder="Description" className={cn(inputCls, 'flex-1 min-w-[120px]')} value={item.description}
                                    onChange={e => updateItem(idx, 'description', e.target.value)} />
                                <input type="number" placeholder="Qty" min="1" className={cn(inputCls, 'w-20')} value={item.quantity}
                                    onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                                <input type="number" placeholder="Unit $" min="0" className={cn(inputCls, 'w-28')} value={item.unitPrice}
                                    onChange={e => updateItem(idx, 'unitPrice', e.target.value)} />
                                <span className="flex items-center text-sm font-semibold text-[var(--text-primary)] min-w-[70px]">{formatCurrency(item.total)}</span>
                                {form.items.length > 1 && (
                                    <button type="button" onClick={() => removeItem(idx)} className="p-2 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all flex-shrink-0">✕</button>
                                )}
                            </div>
                        ))}
                        <button type="button" onClick={addItem} className="text-sm text-[var(--primary-500)] hover:underline flex items-center gap-1">
                            <Plus size={14} /> Add item
                        </button>
                    </div>

                    <div className="grid grid-cols-3 gap-3 bg-[var(--surface-overlay)] rounded-xl p-4">
                        <FormField label="Tax ($)">
                            <input type="number" min="0" className={inputCls} value={form.tax}
                                onChange={e => setForm(p => ({ ...p, tax: +e.target.value }))} />
                        </FormField>
                        <FormField label="Shipping ($)">
                            <input type="number" min="0" className={inputCls} value={form.shipping}
                                onChange={e => setForm(p => ({ ...p, shipping: +e.target.value }))} />
                        </FormField>
                        <div className="flex items-end pb-0.5">
                            <div>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide mb-1">Total</p>
                                <p className="text-lg font-black text-[var(--text-primary)]">{formatCurrency(total)}</p>
                            </div>
                        </div>
                    </div>

                    <FormField label="Notes">
                        <textarea className={inputCls} rows={2} value={form.notes}
                            onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                    </FormField>
                    <FormActions onClose={() => { setShowAdd(false); setEditPO(null); setForm(EMPTY_PO); }}
                        loading={saving} submitLabel={editPO ? 'Update PO' : 'Create PO'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Purchase Orders</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{orders.length} purchase orders</p>
                </div>
                <button onClick={() => { setForm(EMPTY_PO); setEditPO(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> New PO
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Orders', value: orders.length, icon: ShoppingBag, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Total Value', value: formatCurrency(totalValue), icon: DollarSign, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Pending Value', value: formatCurrency(pendingValue), icon: Clock, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Received', value: orders.filter(o => o.status === 'received').length, icon: CheckCircle, color: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className={cn('p-2 rounded-xl w-fit mb-3', s.color)}><s.icon size={18} /></div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter tabs */}
            <div className="flex overflow-x-auto gap-2 pb-1 scrollbar-none">
                {statuses.map(s => (
                    <button key={s} onClick={() => setFilter(s)}
                        className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                            filter === s ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                ))}
            </div>

            {/* Table */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-[var(--border)]">
                    <div className="relative max-w-sm">
                        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search purchase orders..."
                            className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                    </div>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-3.5 px-5">PO Number</th>
                                <th className="py-3.5 px-5">Vendor</th>
                                <th className="py-3.5 px-5">Status</th>
                                <th className="py-3.5 px-5 text-right">Total</th>
                                <th className="py-3.5 px-5">Expected</th>
                                <th className="py-3.5 px-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">Loading...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="6" className="py-12 text-center text-[var(--text-muted)] text-sm">No purchase orders found</td></tr>
                                    : filtered.map(po => (
                                        <tr key={po._id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors group">
                                            <td className="py-4 px-5">
                                                <p className="text-sm font-semibold text-[var(--primary-500)]">{po.poNumber}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{formatDate(po.orderDate)}</p>
                                            </td>
                                            <td className="py-4 px-5 text-sm text-[var(--text-secondary)]">{po.vendor?.name || po.vendorName || '—'}</td>
                                            <td className="py-4 px-5">
                                                <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', STATUS_COLORS[po.status] || '')}>{po.status}</span>
                                            </td>
                                            <td className="py-4 px-5 text-sm font-bold text-right text-[var(--text-primary)]">{formatCurrency(po.total)}</td>
                                            <td className="py-4 px-5 text-sm text-[var(--text-muted)]">{formatDate(po.expectedDelivery)}</td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => handleDelete(po._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={15} /></button>
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
