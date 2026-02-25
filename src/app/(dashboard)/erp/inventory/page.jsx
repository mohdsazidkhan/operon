'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, TrendingUp, Filter, Search, MoreHorizontal, ArrowUpRight } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

export default function InventoryPage() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await fetch(`/api/products?search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setProducts(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch inventory:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, [search]);

    const totalValue = products.reduce((s, p) => s + (p.price || 0) * (p.stock || 0), 0);
    const lowStockCount = products.filter(p => p.stock < 10).length;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Main Header */}
            <div className="flex flex-wrap items-end justify-between gap-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Inventory Intelligence</h1>
                    <div className="flex items-center gap-4 mt-2">
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]"></span>
                            <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Global Status: Optimal</span>
                        </div>
                        <p className="text-slate-500 text-[11px] font-bold uppercase tracking-[0.2em]">Active SKUs: {products.length}</p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Portfolio Valuation</p>
                        <p className="text-2xl font-black text-white tracking-tighter">{formatCurrency(totalValue)}</p>
                    </div>
                    <div className="w-px h-10 bg-slate-800"></div>
                    <button className="h-12 w-12 rounded-2xl bg-white text-slate-950 flex items-center justify-center hover:bg-primary-400 transition-all shadow-xl shadow-white/5 group">
                        <ArrowUpRight size={20} className="group-hover:rotate-45 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Quick Actions & Filters */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="relative flex-1 min-w-[320px]">
                    <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" />
                    <input
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="IDENTIFY ASSET VIA SKU OR NAME..."
                        className="w-full pl-12 pr-4 py-4 rounded-3xl bg-slate-900 border border-slate-800 text-white text-xs font-black uppercase tracking-[0.2em] focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500/40 transition-all placeholder:text-slate-800"
                    />
                </div>
                <button className="px-6 py-4 rounded-3xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-white transition-all flex items-center gap-3 font-black text-[10px] uppercase tracking-widest">
                    <Filter size={16} /> Advanced Parameters
                </button>
            </div>

            {/* Critical Alerts */}
            {lowStockCount > 0 && (
                <div className="bg-rose-500/10 border-l-4 border-rose-500 p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:bg-rose-500/20 transition-all animate-pulse shadow-2xl shadow-rose-500/5">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/30">
                            <AlertTriangle size={24} />
                        </div>
                        <div>
                            <h4 className="text-sm font-black text-white uppercase tracking-widest">Supply Chain Warning</h4>
                            <p className="text-xs text-rose-400 font-bold mt-0.5">{lowStockCount} critical assets are below minimum threshold levels.</p>
                        </div>
                    </div>
                    <button className="text-[10px] font-black uppercase tracking-[0.3em] text-rose-500 group-hover:underline">Procure Now</button>
                </div>
            )}

            {/* Asset Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {loading ? (
                    Array(8).fill(0).map((_, i) => (
                        <div key={i} className="h-64 bg-slate-900 animate-pulse rounded-[2.5rem] border border-slate-800"></div>
                    ))
                ) : products.length === 0 ? (
                    <div className="col-span-full py-32 text-center bg-slate-900/50 rounded-[2.5rem] border border-slate-800 border-dashed">
                        <Package size={64} className="mx-auto text-slate-800 mb-6" />
                        <h3 className="text-xl font-black text-slate-700 uppercase tracking-[0.5em]">Zero Inventory Depth</h3>
                    </div>
                ) : products.map(p => (
                    <div
                        key={p._id}
                        className={cn(
                            'bg-slate-900/80 backdrop-blur-3xl rounded-[2.5rem] border p-8 shadow-2xl transition-all duration-500 group relative overflow-hidden flex flex-col',
                            p.stock < 10 ? 'border-rose-500/30 hover:border-rose-500' : 'border-slate-800 hover:border-primary-500/50'
                        )}
                    >
                        {/* Status Glow */}
                        <div className={cn(
                            'absolute top-0 right-0 w-32 h-32 blur-[100px] -mr-16 -mt-16 opacity-20',
                            p.stock < 10 ? 'bg-rose-500' : 'bg-emerald-500'
                        )}></div>

                        <div className="flex items-center justify-between mb-8 relative z-10">
                            <div className={cn(
                                'w-12 h-12 rounded-2xl flex items-center justify-center shadow-2xl transition-transform group-hover:scale-110 duration-500',
                                p.stock < 10 ? 'bg-rose-500 text-white shadow-rose-500/30' : 'bg-slate-950 text-primary-400 shadow-black'
                            )}>
                                <Package size={20} />
                            </div>
                            <button className="text-slate-700 hover:text-white transition-colors">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>

                        <div className="relative z-10 mb-6">
                            <h3 className="text-sm font-black text-white uppercase tracking-wider line-clamp-1 mb-1 group-hover:text-primary-400 transition-colors">{p.name}</h3>
                            <p className="text-[10px] font-black text-slate-600 uppercase tracking-[0.2em]">{p.sku} • {p.category}</p>
                        </div>

                        <div className="mt-auto space-y-5 relative z-10">
                            <div className="flex items-end justify-between">
                                <div>
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">Inventory Level</p>
                                    <p className={cn('text-2xl font-black tracking-tighter', p.stock < 10 ? 'text-rose-500' : 'text-emerald-400')}>
                                        {p.stock} <span className="text-xs">UNITS</span>
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest mb-1">MSRP</p>
                                    <p className="text-lg font-black text-white tracking-tighter">{formatCurrency(p.price)}</p>
                                </div>
                            </div>

                            <div className="relative w-full h-1.5 bg-slate-950 rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={cn(
                                        'h-full rounded-full transition-all duration-1000 ease-out',
                                        p.stock < 10 ? 'bg-rose-500 shadow-[0_0_15px_#f43f5e]' : 'bg-emerald-500 shadow-[0_0_15px_#10b981]'
                                    )}
                                    style={{ width: `${Math.min(100, (p.stock / 100) * 100)}%` }}
                                />
                            </div>
                        </div>

                        {/* Hover Overlay */}
                        <div className="absolute inset-x-0 bottom-0 p-8 translate-y-full group-hover:translate-y-0 bg-slate-950 transition-transform duration-500 flex items-center justify-between border-t border-slate-800">
                            <button className="text-[10px] font-black uppercase tracking-widest text-primary-400 hover:text-white transition-colors">Update Stock</button>
                            <button className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Audit logs</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
