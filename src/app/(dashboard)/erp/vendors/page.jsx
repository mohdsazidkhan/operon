'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Building2, Phone, Mail, Globe, Star, Edit, Trash2, TrendingUp, Package } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const STATUS_COLORS = {
    active: 'text-emerald-600 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200',
    inactive: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200',
    blacklisted: 'text-rose-600 bg-rose-100 dark:bg-rose-900/30 border-rose-200',
};

const EMPTY_VENDOR = {
    name: '', email: '', phone: '', website: '', contactPerson: '', category: 'general',
    paymentTerms: 'net30', status: 'active', rating: 3, notes: '',
    address: { street: '', city: '', country: '' }
};

export default function VendorsPage() {
    const [vendors, setVendors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filter, setFilter] = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [editVendor, setEditVendor] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_VENDOR);

    const fetchVendors = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/vendors?status=${filter === 'all' ? '' : filter}&search=${search}`);
            const data = await res.json();
            if (data.success) setVendors(data.data || []);
        } catch { toast.error('Failed to fetch vendors'); }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchVendors(); }, [filter, search]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editVendor ? 'PUT' : 'POST';
            const url = editVendor ? `/api/vendors/${editVendor._id}` : '/api/vendors';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) {
                toast.success(editVendor ? 'Vendor updated!' : 'Vendor added!');
                setShowAdd(false); setEditVendor(null); setForm(EMPTY_VENDOR); fetchVendors();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this vendor?')) return;
        await fetch(`/api/vendors/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchVendors();
    };

    const openEdit = (v) => {
        setForm({ name: v.name, email: v.email || '', phone: v.phone || '', website: v.website || '', contactPerson: v.contactPerson || '', category: v.category || 'general', paymentTerms: v.paymentTerms || 'net30', status: v.status, rating: v.rating || 3, notes: v.notes || '', address: v.address || { street: '', city: '', country: '' } });
        setEditVendor(v); setShowAdd(true);
    };

    const filtered = vendors;
    const activeCount = vendors.filter(v => v.status === 'active').length;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditVendor(null); setForm(EMPTY_VENDOR); }}
                title={editVendor ? 'Edit Vendor' : 'Add Vendor'} size="xl">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Company Name" required>
                            <input required className={inputCls} placeholder="e.g. Acme Supplies" value={form.name}
                                onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Contact Person">
                            <input className={inputCls} placeholder="Primary contact" value={form.contactPerson}
                                onChange={e => setForm(p => ({ ...p, contactPerson: e.target.value }))} />
                        </FormField>
                        <FormField label="Email">
                            <input type="email" className={inputCls} value={form.email}
                                onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </FormField>
                        <FormField label="Phone">
                            <input className={inputCls} value={form.phone}
                                onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        </FormField>
                        <FormField label="Website">
                            <input className={inputCls} placeholder="https://..." value={form.website}
                                onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
                        </FormField>
                        <FormField label="Category">
                            <input className={inputCls} placeholder="e.g. Electronics, Office Supplies" value={form.category}
                                onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                        </FormField>
                        <FormField label="Payment Terms">
                            <select className={inputCls} value={form.paymentTerms} onChange={e => setForm(p => ({ ...p, paymentTerms: e.target.value }))}>
                                {['net15', 'net30', 'net60', 'net90', 'prepaid', 'cod'].map(t => <option key={t} value={t}>{t.toUpperCase()}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                {['active', 'inactive', 'blacklisted'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Rating">
                            <select className={inputCls} value={form.rating} onChange={e => setForm(p => ({ ...p, rating: +e.target.value }))}>
                                {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Star{n > 1 ? 's' : ''}</option>)}
                            </select>
                        </FormField>
                        <FormField label="City">
                            <input className={inputCls} value={form.address.city}
                                onChange={e => setForm(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
                        </FormField>
                        <FormField label="Country">
                            <input className={inputCls} value={form.address.country}
                                onChange={e => setForm(p => ({ ...p, address: { ...p.address, country: e.target.value } }))} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Notes">
                                <textarea className={inputCls} rows={2} value={form.notes}
                                    onChange={e => setForm(p => ({ ...p, notes: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditVendor(null); setForm(EMPTY_VENDOR); }}
                        loading={saving} submitLabel={editVendor ? 'Update Vendor' : 'Add Vendor'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Vendors</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{vendors.length} vendors · {activeCount} active</p>
                </div>
                <button onClick={() => { setForm(EMPTY_VENDOR); setEditVendor(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> Add Vendor
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Vendors', value: vendors.length, icon: Building2, color: 'text-indigo-500 bg-indigo-500/10' },
                    { label: 'Active', value: activeCount, icon: TrendingUp, color: 'text-emerald-500 bg-emerald-500/10' },
                    { label: 'Inactive', value: vendors.filter(v => v.status === 'inactive').length, icon: Package, color: 'text-amber-500 bg-amber-500/10' },
                    { label: 'Avg. Rating', value: vendors.length ? (vendors.reduce((s, v) => s + (v.rating || 3), 0) / vendors.length).toFixed(1) : '—', icon: Star, color: 'text-[var(--primary-500)] bg-[var(--primary-500)]/10' },
                ].map((s, i) => (
                    <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5">
                        <div className={cn('p-2 rounded-xl w-fit mb-3', s.color)}><s.icon size={18} /></div>
                        <p className="text-2xl font-black text-[var(--text-primary)]">{s.value}</p>
                        <p className="text-xs text-[var(--text-muted)] mt-1">{s.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search vendors..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                </div>
                <div className="flex gap-2">
                    {['all', 'active', 'inactive', 'blacklisted'].map(s => (
                        <button key={s} onClick={() => setFilter(s)}
                            className={cn('px-3 py-2 rounded-xl text-xs font-semibold border transition-all',
                                filter === s ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-sm overflow-hidden">
                {/* Mobile cards */}
                <div className="block sm:hidden divide-y divide-[var(--border)]">
                    {loading ? <div className="py-12 text-center text-[var(--text-muted)] text-sm">Loading...</div>
                        : filtered.length === 0 ? <div className="py-12 text-center text-[var(--text-muted)] text-sm">No vendors found</div>
                            : filtered.map(v => (
                                <div key={v._id} className="p-4 space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="font-semibold text-[var(--text-primary)] text-sm">{v.name}</p>
                                            {v.contactPerson && <p className="text-xs text-[var(--text-muted)]">{v.contactPerson}</p>}
                                        </div>
                                        <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full border', STATUS_COLORS[v.status] || '')}>{v.status}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-xs text-[var(--text-muted)]">
                                        {v.email && <span className="flex items-center gap-1"><Mail size={11} />{v.email}</span>}
                                        {v.phone && <span className="flex items-center gap-1"><Phone size={11} />{v.phone}</span>}
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(n => <span key={n} className={cn('text-xs', n <= v.rating ? 'text-amber-400' : 'text-[var(--border)]')}>★</span>)}</div>
                                        <div className="flex gap-1">
                                            <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={13} /></button>
                                            <button onClick={() => handleDelete(v._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={13} /></button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                </div>
                {/* Desktop table */}
                <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider bg-[var(--surface-overlay)]/50">
                            <tr>
                                <th className="py-3.5 px-5">Vendor</th>
                                <th className="py-3.5 px-5">Contact</th>
                                <th className="py-3.5 px-5">Category</th>
                                <th className="py-3.5 px-5">Rating</th>
                                <th className="py-3.5 px-5">Terms</th>
                                <th className="py-3.5 px-5">Status</th>
                                <th className="py-3.5 px-5"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {loading ? <tr><td colSpan="7" className="py-12 text-center text-[var(--text-muted)] text-sm">Loading vendors...</td></tr>
                                : filtered.length === 0 ? <tr><td colSpan="7" className="py-12 text-center text-[var(--text-muted)] text-sm">No vendors found</td></tr>
                                    : filtered.map(v => (
                                        <tr key={v._id} className="hover:bg-[var(--surface-overlay)]/40 transition-colors group">
                                            <td className="py-4 px-5">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-9 h-9 rounded-xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-sm">{v.name?.[0]}</div>
                                                    <div>
                                                        <p className="text-sm font-semibold text-[var(--text-primary)]">{v.name}</p>
                                                        <p className="text-xs text-[var(--text-muted)]">{v.code}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-5">
                                                <p className="text-sm text-[var(--text-secondary)]">{v.contactPerson || '—'}</p>
                                                <p className="text-xs text-[var(--text-muted)]">{v.email || v.phone || ''}</p>
                                            </td>
                                            <td className="py-4 px-5 text-sm text-[var(--text-muted)] capitalize">{v.category}</td>
                                            <td className="py-4 px-5">
                                                <div className="flex gap-0.5">{[1, 2, 3, 4, 5].map(n => <span key={n} className={cn('text-sm', n <= v.rating ? 'text-amber-400' : 'text-[var(--border)]')}>★</span>)}</div>
                                            </td>
                                            <td className="py-4 px-5 text-sm text-[var(--text-muted)] uppercase">{v.paymentTerms}</td>
                                            <td className="py-4 px-5">
                                                <span className={cn('text-[10px] font-bold uppercase px-2.5 py-1 rounded-full border', STATUS_COLORS[v.status] || '')}>{v.status}</span>
                                            </td>
                                            <td className="py-4 px-5">
                                                <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <button onClick={() => openEdit(v)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={15} /></button>
                                                    <button onClick={() => handleDelete(v._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={15} /></button>
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
