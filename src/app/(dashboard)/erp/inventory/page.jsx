'use client';

import { useState, useEffect } from 'react';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { Plus, Search, Edit, Trash2, Package, AlertTriangle, TrendingUp, DollarSign } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const EMPTY_PRODUCT = { name: '', sku: '', category: '', price: 0, cost: 0, stock: 0, minStock: 5, unit: 'pcs', description: '' };

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    const [showStockMove, setShowStockMove] = useState(null); // Product ID
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_PRODUCT);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);
    const [stockAdjustment, setStockAdjustment] = useState({ quantity: 0, type: 'add' });

    const canManage = usePermission('erp.inventory.manage');

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/products?search=${search}`);
            const data = await res.json();
            if (data.success) setProducts(data.data);
        } catch (err) {
            console.error('Failed to fetch inventory:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchProducts(); }, [search]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingProduct ? `/api/products/${editingProduct._id}` : '/api/products';
            const method = editingProduct ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingProduct ? 'Product updated!' : 'Product added!');
                setShowAdd(false);
                setEditingProduct(null);
                setForm(EMPTY_PRODUCT);
                fetchProducts();
            } else toast.error(data.message);
        } catch { toast.error('Operation failed'); }
        finally { setSaving(false); }
    };

    const handleStockUpdate = async (e) => {
        e.preventDefault();
        setSaving(true);
        const product = products.find(p => p._id === showStockMove);
        const newStock = stockAdjustment.type === 'add'
            ? product.stock + stockAdjustment.quantity
            : product.stock - stockAdjustment.quantity;

        try {
            const res = await fetch(`/api/products/${showStockMove}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ stock: newStock })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Stock adjusted!');
                setShowStockMove(null);
                setStockAdjustment({ quantity: 0, type: 'add' });
                fetchProducts();
            }
        } catch { toast.error('Stock adjustment failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product permanently?')) return;
        try {
            const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Product removed');
                fetchProducts();
            }
        } catch { toast.error('Delete failed'); }
    };

    const totalValue = products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);
    const lowStockCount = products.filter(p => p.stock < (p.minStock || 10)).length;

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-12">
            {/* Add/Edit Product Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingProduct(null); setForm(EMPTY_PRODUCT); }} title={editingProduct ? "Re-calibrate Product Nexus" : "Initialize Asset Node"} size="lg">
                <form onSubmit={handleFormSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <FormField label="Asset Identity" required>
                            <input required className={inputCls} placeholder="Product name..." value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="SKU / Barcode Protocol">
                            <input className={inputCls} placeholder="e.g. ELEC-001" value={form.sku} onChange={e => setForm(p => ({ ...p, sku: e.target.value }))} />
                        </FormField>
                        <FormField label="Category Cluster">
                            <input className={inputCls} placeholder="e.g. Neural Hardware" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))} />
                        </FormField>
                        <FormField label="Unit of Measure">
                            <input className={inputCls} placeholder="pcs, kg, m" value={form.unit} onChange={e => setForm(p => ({ ...p, unit: e.target.value }))} />
                        </FormField>
                        <FormField label="Exchange Value ($)" required>
                            <input type="number" required className={inputCls} value={form.price} onChange={e => setForm(p => ({ ...p, price: +e.target.value }))} />
                        </FormField>
                        <FormField label="Acquisition Cost ($)">
                            <input type="number" className={inputCls} value={form.cost} onChange={e => setForm(p => ({ ...p, cost: +e.target.value }))} />
                        </FormField>
                        <FormField label="Resource Volume" required>
                            <input type="number" required className={inputCls} value={form.stock} onChange={e => setForm(p => ({ ...p, stock: +e.target.value }))} />
                        </FormField>
                        <FormField label="Critical Threshold">
                            <input type="number" className={inputCls} value={form.minStock} onChange={e => setForm(p => ({ ...p, minStock: +e.target.value }))} />
                        </FormField>
                    </div>
                    <FormActions onClose={() => setShowAdd(false)} loading={saving} submitLabel={editingProduct ? "Commit Calibration" : "Initialize Asset"} />
                </form>
            </Modal>

            {/* Quick Stock ADJUST Modal */}
            <Modal isOpen={!!showStockMove} onClose={() => setShowStockMove(null)} title="Flux Adjustment Registry" size="sm">
                <form onSubmit={handleStockUpdate} className="space-y-6">
                    <div className="flex bg-[var(--surface-overlay)] p-1.5 rounded-[1rem] mb-4 border border-[var(--border)]">
                        <button type="button" onClick={() => setStockAdjustment(p => ({ ...p, type: 'add' }))}
                            className={cn("flex-1 py-3 rounded-[0.8rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all", stockAdjustment.type === 'add' ? "bg-emerald-500 text-white shadow-xl shadow-emerald-500/20" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]")}>Augment</button>
                        <button type="button" onClick={() => setStockAdjustment(p => ({ ...p, type: 'remove' }))}
                            className={cn("flex-1 py-3 rounded-[0.8rem] text-[9px] font-black uppercase tracking-[0.2em] transition-all", stockAdjustment.type === 'remove' ? "bg-rose-500 text-white shadow-xl shadow-rose-500/20" : "text-[var(--text-muted)] hover:text-[var(--text-primary)]")}>Deplete</button>
                    </div>
                    <FormField label="Transfer Volume">
                        <input type="number" required min="1" className={inputCls} value={stockAdjustment.quantity} onChange={e => setStockAdjustment(p => ({ ...p, quantity: +e.target.value }))} />
                    </FormField>
                    <FormActions onClose={() => setShowStockMove(null)} loading={saving} submitLabel="Commit Flux" />
                </form>
            </Modal>

            {/* Main Header */}
            <div className="flex flex-wrap items-end justify-between gap-8 px-2">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-8 underline-offset-8">Resource Ledger</h1>
                    <div className="flex items-center gap-6 mt-8">
                        <div className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] shadow-inner">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] animate-pulse"></span>
                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">System Entropy: Stable</span>
                        </div>
                        <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em]">Active Nodes: {products.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="text-right">
                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-2 opacity-50">Cumulative Asset Value</p>
                        <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter italic">{formatCurrency(totalValue)}</p>
                    </div>
                    <div className="w-px h-12 bg-[var(--border)] opacity-30"></div>
                    <Can permission="erp.inventory.manage">
                        <button onClick={() => setShowAdd(true)} className="h-16 w-16 rounded-[1.5rem] bg-[var(--text-primary)] text-[var(--surface)] flex items-center justify-center hover:bg-[var(--primary-500)] hover:text-white transition-all shadow-2xl hover:scale-105 active:scale-95 group">
                            <Plus size={24} className="group-hover:rotate-180 transition-transform duration-700" />
                        </button>
                    </Can>
                </div>
            </div>

            {/* Quick Actions & Filters */}
            <div className="flex flex-wrap items-center gap-6 px-2">
                <div className="relative flex-1 min-w-[360px] group">
                    <Search size={20} className="absolute left-6 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="QUERY ASSET REGISTRY..."
                        className="w-full pl-16 pr-8 py-5 rounded-[2rem] bg-[var(--surface-raised)]/50 border border-[var(--border)] text-[10px] font-black uppercase tracking-[0.3em] text-[var(--text-primary)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all placeholder:text-[var(--text-muted)] shadow-inner"
                    />
                </div>
            </div>

            {/* Critical Alerts */}
            {lowStockCount > 0 && (
                <div className="bg-rose-500/10 border-2 border-rose-500/20 p-8 rounded-[3rem] flex items-center justify-between group transition-all animate-in slide-in-from-top duration-700 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.03] rotate-12 group-hover:rotate-0 transition-transform duration-1000"><AlertTriangle size={120} /></div>
                    <div className="flex items-center gap-6 relative z-10">
                        <div className="w-16 h-16 rounded-3xl bg-rose-500 flex items-center justify-center text-white shadow-2xl shadow-rose-500/40 animate-bounce">
                            <AlertTriangle size={28} />
                        </div>
                        <div>
                            <h4 className="text-lg font-black text-[var(--text-primary)] uppercase tracking-tighter leading-none italic">Depletion Incident Detected</h4>
                            <p className="text-[10px] text-rose-500 font-black mt-3 uppercase tracking-[0.2em]">{lowStockCount} SKUs HAVE BREACHED MINIMUM THRESHOLDS</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-80 bg-[var(--surface-overlay)]/50 animate-pulse rounded-[3rem] border border-[var(--border)] shadow-xl"></div>
                    ))
                ) : products.length === 0 ? (
                    <div className="col-span-full py-48 text-center bg-[var(--surface-raised)]/30 rounded-[4rem] border-4 border-dashed border-[var(--border)] group">
                        <Package size={80} className="mx-auto text-[var(--border)] mb-8 opacity-20 group-hover:scale-110 transition-transform duration-700" />
                        <h3 className="text-2xl font-black text-[var(--text-muted)] uppercase tracking-[1em] italic">Void Registry</h3>
                    </div>
                ) : (
                    products.map(p => (
                        <div
                            key={p._id}
                            className={cn(
                                'bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border p-10 shadow-2xl transition-all duration-700 group relative overflow-hidden flex flex-col hover:scale-[1.02]',
                                p.stock < (p.minStock || 10) ? 'border-rose-500/40 shadow-rose-500/5' : 'border-[var(--card-border)] hover:border-[var(--primary-500)]/40 shadow-xl'
                            )}
                        >
                            <div className={cn(
                                'absolute top-0 right-0 w-48 h-48 blur-[120px] -mr-24 -mt-24 opacity-20 transition-all duration-700 group-hover:opacity-40',
                                p.stock < (p.minStock || 10) ? 'bg-rose-500' : 'bg-emerald-500'
                            )}></div>

                            <div className="flex items-center justify-between mb-10 relative z-10">
                                <div className={cn(
                                    'w-16 h-16 rounded-[1.5rem] flex items-center justify-center shadow-2xl transition-all duration-700 group-hover:rotate-6',
                                    p.stock < (p.minStock || 10) ? 'bg-rose-500 text-white shadow-rose-500/40' : 'bg-[var(--surface-overlay)] text-[var(--primary-500)] shadow-inner border border-[var(--border)]'
                                )}>
                                    <Package size={28} />
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0 duration-500">
                                    {isMounted && (
                                        <Can permission="erp.inventory.manage">
                                            <button onClick={() => { setForm({ ...p }); setEditingProduct(p); setShowAdd(true); }}
                                                className="p-3.5 rounded-2xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl active:scale-90">
                                                <Edit size={18} />
                                            </button>
                                            <button onClick={() => handleDelete(p._id)}
                                                className="p-3.5 rounded-2xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/20 transition-all shadow-xl active:scale-90">
                                                <Trash2 size={18} />
                                            </button>
                                        </Can>
                                    )}
                                </div>
                            </div>

                            <div className="relative z-10 mb-8 flex-1">
                                <h3 className="text-base font-black text-[var(--text-primary)] uppercase tracking-tight line-clamp-2 mb-2 group-hover:text-[var(--primary-500)] transition-colors italic leading-tight">{p.name}</h3>
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] italic opacity-60">ID: {p.sku || 'UNREADABLE'} • Cluster: {p.category || 'GENERAL'}</p>
                            </div>

                            <div className="mt-auto space-y-8 relative z-10">
                                <div className="flex items-end justify-between">
                                    <div>
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-3 opacity-40">Resources</p>
                                        <p className={cn('text-4xl font-black tracking-tighter leading-none italic', p.stock < (p.minStock || 10) ? 'text-rose-500' : 'text-emerald-500')}>
                                            {p.stock} <span className="text-[10px] uppercase font-bold text-[var(--text-muted)] italic ml-1">{p.unit || 'units'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] mb-3 opacity-40">Exchange</p>
                                        <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter leading-none italic">{formatCurrency(p.price)}</p>
                                    </div>
                                </div>

                                <div className="relative w-full h-2 bg-[var(--surface-overlay)] rounded-full overflow-hidden shadow-inner border border-[var(--border)]">
                                    <div
                                        className={cn(
                                            'h-full rounded-full transition-all duration-1000 ease-in-out',
                                            p.stock < (p.minStock || 10) ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_20px_var(--rose-500)]' : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_20px_var(--emerald-500)]'
                                        )}
                                        style={{ width: `${Math.min(100, (p.stock / (p.minStock * 4 || 40)) * 100)}%` }}
                                    />
                                </div>
                            </div>

                            <Can permission="erp.inventory.manage">
                                <div className="absolute inset-x-0 bottom-0 p-10 translate-y-full group-hover:translate-y-0 bg-gradient-to-t from-[var(--surface-overlay)] to-transparent backdrop-blur-md transition-transform duration-700 flex items-center justify-center border-t border-[var(--border)] pt-12">
                                    <button onClick={() => setShowStockMove(p._id)} className="w-full py-5 rounded-[2rem] bg-[var(--text-primary)] text-[var(--surface)] hover:bg-[var(--primary-500)] hover:text-white text-[10px] font-black uppercase tracking-[0.3em] shadow-2xl active:scale-95 transition-all italic">Initiate Flux</button>
                                </div>
                            </Can>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
