'use client';

import { useState } from 'react';
import { ShoppingCart, Search, MoreVertical, Plus, Package } from 'lucide-react';
import { formatCurrency, formatDate, cn } from '@/lib/utils';

const statusStyles = {
    delivered: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    processing: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    cancelled: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
};

export default function OrdersLedger({ initialOrders }) {
    const [orders] = useState(initialOrders);
    const [search, setSearch] = useState('');
    const [typeFilter, setTypeFilter] = useState('ALL');

    const filteredOrders = orders.filter(o =>
        (typeFilter === 'ALL' || o.type.toUpperCase() === typeFilter) &&
        (o.orderNumber.toLowerCase().includes(search.toLowerCase()) || o.vendorCustomer.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Table Controller */}
            <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-6 flex flex-wrap items-center justify-between gap-6 shadow-2xl">
                <div className="flex items-center gap-4 flex-1 max-w-2xl">
                    <div className="relative flex-1 group">
                        <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-primary-500 transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-slate-900"
                            placeholder="QUERY SECURE TRANSACTION HASH..."
                        />
                    </div>
                    <div className="flex items-center gap-2 p-1.5 bg-slate-950 border border-slate-800 rounded-2xl">
                        {['ALL', 'PURCHASE', 'SALE'].map(type => (
                            <button
                                key={type}
                                onClick={() => setTypeFilter(type)}
                                className={cn(
                                    'px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all',
                                    typeFilter === type ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : 'text-slate-600 hover:text-white hover:bg-white/5'
                                )}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>
                <button className="h-14 px-8 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                    <Plus size={18} /> Initialize Transaction
                </button>
            </div>

            {/* Order Transaction Table */}
            <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden mb-12">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-800/50 bg-slate-900/40">
                                {['Order Identity', 'Entity Protocol', 'Asset Flux', 'Capital Depth', 'Logistics State', 'Actions'].map((h, i) => (
                                    <th key={i} className="p-8 text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/30">
                            {filteredOrders.length === 0 ? (
                                <tr><td colSpan={6} className="p-20 text-center text-slate-700 uppercase font-black tracking-widest">No matching transactions</td></tr>
                            ) : filteredOrders.map(o => (
                                <tr key={o._id} className="group hover:bg-white/[0.02] transition-colors">
                                    <td className="p-8">
                                        <div className="flex items-center gap-5">
                                            <div className={cn(
                                                'w-14 h-14 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-500 shadow-xl shadow-black relative overflow-hidden border border-white/5',
                                                o.type === 'purchase' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-emerald-500/10 text-emerald-400'
                                            )}>
                                                <Package size={20} />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-white uppercase tracking-tighter group-hover:text-primary-400 transition-colors">{o.orderNumber}</p>
                                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mt-1 italic">{formatDate(o.orderDate)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-xs font-black text-white uppercase tracking-widest">{o.vendorCustomer}</p>
                                        <p className="text-[9px] font-black text-slate-700 uppercase tracking-widest mt-1 italic">Authorized Entity</p>
                                    </td>
                                    <td className="p-8">
                                        <div className="flex items-center gap-2">
                                            <span className="w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-[9px] font-black text-slate-500">{o.items?.length || 0}</span>
                                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Units Linked</span>
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <p className="text-lg font-black text-white tracking-tighter">{formatCurrency(o.total)}</p>
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mt-0.5">Verified Flow</p>
                                    </td>
                                    <td className="p-8">
                                        <div className={cn('px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border w-fit shadow-xl shadow-black/20', statusStyles[o.status] || statusStyles.pending)}>
                                            {o.status}
                                        </div>
                                    </td>
                                    <td className="p-8">
                                        <button className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-slate-600 hover:text-white transition-all shadow-xl shadow-black group-hover:border-slate-700">
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
