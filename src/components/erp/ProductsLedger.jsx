'use client';

import { useState, useEffect } from 'react';
import { Package, Search, Plus, Filter, MoreVertical, Edit3, Trash2, ArrowUpDown, ChevronDown, CheckCircle2, ShieldAlert, Download, Upload, FileText } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Pagination from '@/components/ui/Pagination';
import { exportToXLSX, importFromXLSX, exportToPDF } from '@/utils/exportUtils';

const EMPTY_PRODUCT = { name: '', sku: '', description: '', category: '', price: '', cost: '', stock: '', unit: 'piece', status: 'active' };

export default function ProductsLedger({ initialProducts = [] }) {
    const [products, setProducts] = useState(initialProducts || []);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [page, setPage] = useState(1);
    const [pages, setPages] = useState(1);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(false);
    const [form, setForm] = useState(EMPTY_PRODUCT);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?search=${search}&category=${categoryFilter === 'ALL' ? '' : categoryFilter}&page=${page}&limit=10`);
            const data = await res.json();
            if (data.success) {
                setProducts(data.data);
                setPages(data.pages);
                setTotal(data.total);
            }
        } catch (err) {
            console.error('Failed to fetch products:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, [search, categoryFilter, page]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/products', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...form, price: +form.price, cost: +form.cost, stock: +form.stock })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Product added!');
                setShowAdd(false);
                setForm(EMPTY_PRODUCT);
                fetchProducts();
            } else {
                toast.error(data.message || 'Failed to add product');
            }
        } catch { toast.error('Failed to add product'); }
        finally { setSaving(false); }
    };

    const categories = ['ALL', ...new Set(products.map(p => p.category?.toUpperCase() || 'UNCATEGORIZED'))];

    const handleExportXLSX = () => {
        const exportData = products.map(p => ({
            Name: p.name,
            SKU: p.sku,
            Category: p.category,
            Price: p.price,
            Stock: p.stock,
            Status: p.status
        }));
        exportToXLSX(exportData, 'products-inventory');
        toast.success('Inventory exported to XLSX');
    };

    const handleExportPDF = () => {
        const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock'];
        const data = products.map(p => [p.name, p.sku, p.category, formatCurrency(p.price), p.stock]);
        exportToPDF(headers, data, 'Inventory Status Report', 'inventory-report');
        toast.success('Inventory exported to PDF');
    };

    const handleImportXLSX = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        try {
            const data = await importFromXLSX(file);
            console.log('Imported Products:', data);
            toast.success(`${data.length} items parsed. (Simulated)`);
            e.target.value = '';
        } catch { toast.error('Import failed'); }
    };

    const totalPortfolioValue = products.reduce((s, p) => s + (p.price * p.stock || 0), 0);
    const avgMargin = 42.5;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Add Product Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Product" size="lg">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Product Name" required>
                            <input required className={inputCls} placeholder="e.g. Operon ERP Suite" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="SKU" required>
                            <input required className={inputCls} placeholder="e.g. OPS-ERP-002" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
                        </FormField>
                        <FormField label="Category">
                            <input className={inputCls} placeholder="e.g. Software" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                        </FormField>
                        <FormField label="Unit">
                            <select className={inputCls} value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))}>
                                {['piece', 'license', 'month', 'year', 'kg', 'box'].map(u => <option key={u} value={u}>{u}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Selling Price ($)" required>
                            <input required type="number" min="0" className={inputCls} placeholder="0" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                        </FormField>
                        <FormField label="Cost Price ($)">
                            <input type="number" min="0" className={inputCls} placeholder="0" value={form.cost} onChange={e => setForm(p => ({ ...p, cost: e.target.value }))} />
                        </FormField>
                        <FormField label="Stock Quantity">
                            <input type="number" min="0" className={inputCls} placeholder="0" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                        </FormField>
                        <FormField label="Status">
                            <select className={inputCls} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                            </select>
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Description">
                                <textarea rows={2} className={inputCls + " resize-none"} placeholder="Short description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => setShowAdd(false)} loading={saving} submitLabel="Add Product" />
                </form>
            </Modal>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active SKUs', value: total, icon: Package, color: 'text-[var(--primary-500)]' },
                    { label: 'Avg Unit Margin', value: `${avgMargin}%`, icon: CheckCircle2, color: 'text-emerald-500' },
                    { label: 'Critical Thresholds', value: products.filter(p => p.stock < 10).length, icon: ShieldAlert, color: 'text-rose-500' },
                ].map((stat, i) => (
                    <div key={i} className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-white/10 transition-all duration-700"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn('p-3 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)]', stat.color)}>
                                <stat.icon size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter relative z-10">{stat.value}</p>
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 relative z-10">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Operations Bar */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-6 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1 group">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                            placeholder="SEARCH PRODUCT HASH OR SKU..."
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-[var(--surface-overlay)] border border-[var(--border)] rounded-2xl overflow-x-auto scrollbar-hide">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={cn(
                                    'px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap',
                                    categoryFilter === cat ? 'bg-[var(--primary-500)] text-white shadow-xl shadow-[var(--primary-500)]/20' : 'text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-white/5'
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
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
                    <button onClick={() => setShowAdd(true)} className="h-14 px-8 rounded-2xl bg-[var(--primary-500)] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-[var(--primary-500)]/20 hover:scale-105 transition-all flex items-center gap-3">
                        <Plus size={18} /> Add Product
                    </button>
                </div>
            </div>

            {/* Catalog Ledger */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-[var(--border)] bg-[var(--surface-overlay)]/40">
                                {[
                                    { name: 'Identity & Vector', icon: Package },
                                    { name: 'Category Spectrum' },
                                    { name: 'Unit Economics' },
                                    { name: 'Asset Volume', icon: ArrowUpDown },
                                    { name: 'System State' },
                                    { name: 'Protocols' }
                                ].map((h, i) => (
                                    <th key={i} className="p-8 text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">
                                        <div className="flex items-center gap-2">
                                            {h.icon && <h.icon size={14} />}
                                            {h.name}
                                        </div>
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[var(--border)]">
                            {products.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em]">No products found</p>
                                    </td>
                                </tr>
                            ) : products.map(p => (
                                <tr key={p._id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center group-hover:border-[var(--primary-500)]/50 group-hover:scale-110 transition-all duration-500 shadow-xl shadow-black/10 overflow-hidden relative">
                                                <div className="absolute inset-0 bg-gradient-to-br from-[var(--primary-500)]/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                                <Package size={20} className="text-[var(--text-muted)] group-hover:text-[var(--primary-500)] relative z-10" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tighter group-hover:text-[var(--primary-500)] transition-colors">{p.name}</p>
                                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">{p.sku}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <span className="px-4 py-1.5 rounded-lg bg-[var(--surface-overlay)] border border-[var(--border)] text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest group-hover:text-[var(--primary-500)] group-hover:border-[var(--primary-500)]/30 transition-all">
                                            {p.category || 'GENERIC'}
                                        </span>
                                    </td>
                                    <td className="p-8 text-center">
                                        <div className="space-y-1">
                                            <p className="text-sm font-black text-[var(--text-primary)] tracking-tighter uppercase">{formatCurrency(p.price)}</p>
                                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest italic">VAL: {formatCurrency(p.price * 0.6)}</p>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-baseline justify-between mb-1">
                                                <span className={cn('text-lg font-black tracking-tighter', p.stock < 10 ? 'text-rose-500' : 'text-emerald-500')}>{p.stock}</span>
                                                <span className="text-[9px] font-black text-[var(--text-muted)]">/ 100 MAX</span>
                                            </div>
                                            <div className="w-32 h-1 bg-[var(--surface-overlay)] rounded-full overflow-hidden shadow-inner">
                                                <div
                                                    className={cn('h-full rounded-full transition-all duration-1000', p.stock < 10 ? 'bg-rose-500 shadow-[0_0_8px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_8px_#10b981]')}
                                                    style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-3">
                                            <div className={cn('w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]', p.status === 'active' ? 'text-emerald-500 bg-emerald-500' : 'text-[var(--border)] bg-[var(--border)]')}></div>
                                            <span className={cn('text-[10px] font-black uppercase tracking-widest', p.status === 'active' ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
                                                {p.status === 'active' ? 'Active' : 'Inactive'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                                            <button className="p-3 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-emerald-500 hover:border-emerald-500/30 transition-all shadow-xl shadow-black/10"><Edit3 size={16} /></button>
                                            <button className="p-3 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-rose-500 hover:border-rose-500/30 transition-all shadow-xl shadow-black/10"><Trash2 size={16} /></button>
                                            <button className="p-3 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all shadow-xl shadow-black/10"><MoreVertical size={16} /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="px-10 pb-10 border-t border-[var(--border)] pt-10">
                    <Pagination page={page} pages={pages} total={total} onPageChange={setPage} />
                </div>
            </div>
        </div>
    );
}
