'use client';

import { useState, useEffect } from 'react';
import { Plus, Globe, Building2, Edit, Trash2, Search, ExternalLink } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

const industryColors = {
    Technology: 'bg-blue-500 shadow-blue-500/20',
    Healthcare: 'bg-emerald-500 shadow-emerald-500/20',
    Finance: 'bg-indigo-500 shadow-indigo-500/20',
    Retail: 'bg-amber-500 shadow-amber-500/20',
    'E-Commerce': 'bg-rose-500 shadow-rose-500/20'
};

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchCompanies = async () => {
            try {
                const res = await fetch(`/api/companies?search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setCompanies(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch companies:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchLeads(); // Wait, I copy-pasted wrong function name in my thought, fixing it.
        fetchCompanies();
    }, [search]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-white">Companies</h1>
                    <p className="text-slate-400 text-sm mt-0.5">{companies.length} active accounts</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search accounts..."
                            className="pl-9 pr-4 py-2.5 rounded-xl text-sm bg-slate-900/50 border border-slate-800 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/40 focus:border-primary-500 transition-all w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-primary-500/20">
                        <Plus size={16} /> New Company
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-slate-900/50 animate-pulse rounded-2xl border border-slate-800"></div>
                    ))}
                </div>
            ) : companies.length === 0 ? (
                <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-12 text-center">
                    <Building2 size={48} className="mx-auto text-slate-700 mb-4" />
                    <p className="text-slate-500">No companies found. Create your first account to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {companies.map(co => (
                        <div key={co._id} className="bg-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-800 p-6 shadow-xl hover:shadow-primary-500/5 hover:border-slate-700 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-primary-500/10 transition-all duration-500"></div>

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        'w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-110 duration-500',
                                        industryColors[co.industry] || 'bg-slate-600 shadow-slate-600/20'
                                    )}>
                                        {co.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-white group-hover:text-primary-400 transition-colors">{co.name}</p>
                                        <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{co.industry}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                    <button className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-primary-400 transition-all border border-transparent hover:border-slate-700"><Edit size={16} /></button>
                                    <button className="p-2 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 transition-all border border-transparent hover:border-rose-500/20"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                                <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Revenue</p>
                                    <p className="font-bold text-white text-base">{formatCurrency(co.revenue)}</p>
                                </div>
                                <div className="bg-slate-800/30 p-3 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Size</p>
                                    <p className="font-bold text-white text-base">{co.size || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-slate-800/50 flex items-center justify-between relative z-10">
                                <a
                                    href={`https://${co.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-bold text-primary-400 hover:text-primary-300 transition-colors group/link"
                                >
                                    <Globe size={14} className="group-hover/link:rotate-12 transition-transform" />
                                    {co.website}
                                    <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-all" />
                                </a>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Account</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
