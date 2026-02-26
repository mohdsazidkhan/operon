'use client';

import { useState } from 'react';
import { Package, Search, Plus, Filter, MoreVertical, Edit3, Trash2, ArrowUpDown, ChevronDown, CheckCircle2, ShieldAlert } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

export default function ProductsLedger({ initialProducts }) {
    const [products] = useState(initialProducts);
    const [search, setSearch] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('ALL');

    const categories = ['ALL', ...new Set(products.map(p => p.category?.toUpperCase() || 'UNCATEGORIZED'))];

    const filteredProducts = products.filter(p => {
        const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
            p.sku.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = categoryFilter === 'ALL' || p.category?.toUpperCase() === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const totalPortfolioValue = products.reduce((s, p) => s + (p.price * p.stock || 0), 0);
    const avgMargin = 42.5;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Active SKUs', value: products.length, icon: Package, color: 'text-[var(--primary-500)]' },
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
                        {categories.slice(0, 4).map(cat => (
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
                        <button className="px-3 py-2.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><ChevronDown size={14} /></button>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <button className="h-14 w-14 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><Filter size={20} /></button>
                    <button className="h-14 px-8 rounded-2xl bg-[var(--text-primary)] text-[var(--surface)] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                        <Plus size={18} /> Initialize SKU
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
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center">
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.5em]">No Data Vectors Found</p>
                                    </td>
                                </tr>
                            ) : filteredProducts.map(p => (
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
                                            <div className={cn('w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]', p.isActive ? 'text-emerald-500 bg-emerald-500' : 'text-[var(--border)] bg-[var(--border)]')}></div>
                                            <span className={cn('text-[10px] font-black uppercase tracking-widest', p.isActive ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)]')}>
                                                {p.isActive ? 'NOMINAL' : 'DEACTIVATED'}
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
            </div>
        </div>
    );
}
