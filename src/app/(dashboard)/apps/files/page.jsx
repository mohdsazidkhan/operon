'use client';

import { Folder, FileText, Image, Archive, Download, Search, Plus, MoreHorizontal, Grid, List, HardDrive, Share2, Trash2, Clock, UploadCloud } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const fileEntries = [
    { id: 1, name: 'Fiscal_Q1_Neural_Report.pdf', type: 'pdf', size: '2.4 MB', modified: 'Mar 15, 2024', icon: FileText, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    { id: 2, name: 'Expansion_Pipeline_9.4.pptx', type: 'ppt', size: '5.8 MB', modified: 'Mar 12, 2024', icon: FileText, color: 'text-amber-400', bg: 'bg-amber-500/10' },
    { id: 3, name: 'Personnel_Auth_Protocols', type: 'folder', size: '12 Files', modified: 'Mar 10, 2024', icon: Folder, color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
    { id: 4, name: 'Branding_High_Res_Vectors', type: 'folder', size: '34 Assets', modified: 'Mar 8, 2024', icon: Folder, color: 'text-primary-400', bg: 'bg-primary-500/10' },
    { id: 5, name: 'Neural_Ledger_Integrity.zip', type: 'zip', size: '1.2 MB', modified: 'Mar 5, 2024', icon: Archive, color: 'text-purple-400', bg: 'bg-purple-500/10' },
    { id: 6, name: 'HQ_Sector_Surveillance.zip', type: 'zip', size: '48.2 MB', modified: 'Mar 1, 2024', icon: Image, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
];

export default function FilesPage() {
    const [viewMode, setViewMode] = useState('grid');
    const [selected, setSelected] = useState(null);

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Galactic Vault</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                        <HardDrive size={12} className="text-primary-500" />
                        Decentralized Neural Asset Repository • 94% Capacity Available
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="h-14 px-8 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                        <UploadCloud size={18} /> Inject Asset
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col space-y-8">
                    {/* Filter / View Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 shadow-2xl">
                        <div className="relative flex-1 max-w-md group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-primary-500 transition-colors" />
                            <input
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950/50 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-slate-900"
                                placeholder="QUERY VAULT ENCRYPTION..."
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                                <button onClick={() => setViewMode('grid')} className={cn('p-2.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-600 hover:text-slate-400')}><Grid size={18} /></button>
                                <button onClick={() => setViewMode('list')} className={cn('p-2.5 rounded-lg transition-all', viewMode === 'list' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-600 hover:text-slate-400')}><List size={18} /></button>
                            </div>
                        </div>
                    </div>

                    {/* Files Grid */}
                    <div className="flex-1 overflow-y-auto pb-12">
                        <div className={cn(
                            viewMode === 'grid'
                                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6'
                                : 'flex flex-col gap-3'
                        )}>
                            {fileEntries.map(f => (
                                <div
                                    key={f.id}
                                    onClick={() => setSelected(f)}
                                    className={cn(
                                        'group bg-slate-900/40 backdrop-blur-xl border border-slate-800 p-6 shadow-2xl cursor-pointer hover:border-primary-500/50 transition-all overflow-hidden relative',
                                        viewMode === 'grid' ? 'rounded-[2.5rem] flex flex-col items-center' : 'rounded-[1.5rem] flex items-center gap-6',
                                        selected?.id === f.id && 'border-primary-500/50 bg-primary-500/5'
                                    )}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-white/10"></div>

                                    <div className={cn(
                                        'rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:scale-110 duration-500',
                                        viewMode === 'grid' ? 'w-20 h-20 mb-6' : 'w-14 h-14',
                                        f.bg
                                    )}>
                                        <f.icon size={viewMode === 'grid' ? 32 : 24} className={f.color} />
                                    </div>

                                    <div className={cn('min-w-0', viewMode === 'grid' ? 'text-center' : 'flex-1')}>
                                        <p className="text-xs font-black text-white uppercase tracking-tight truncate group-hover:text-primary-400 transition-colors">{f.name}</p>
                                        <div className={cn('flex items-center gap-3 mt-1.5', viewMode === 'grid' ? 'justify-center' : '')}>
                                            <span className="text-[9px] font-black text-slate-700 uppercase tracking-widest">{f.size}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                            <span className="text-[9px] font-bold text-slate-700 uppercase italic tracking-widest">{f.modified}</span>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        'flex items-center gap-2 transition-opacity duration-300',
                                        viewMode === 'grid' ? 'mt-6 opacity-0 group-hover:opacity-100' : 'opacity-100'
                                    )}>
                                        {[Download, Share2, MoreHorizontal].map((Icon, idx) => (
                                            <button key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-500 hover:text-white transition-all">
                                                <Icon size={14} />
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Info Sidebar */}
                <div className="hidden 2xl:flex w-96 flex-col space-y-8 animate-in slide-in-from-right duration-700">
                    {/* Capacity Pulse */}
                    <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8">Vault Integrity</h3>
                        <div className="relative w-full h-24 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full border-4 border-slate-800 border-t-primary-500 animate-[spin_3s_linear_infinite] shadow-[0_0_15px_#8b5cf6]"></div>
                            </div>
                            <div className="text-center z-10">
                                <p className="text-xl font-black text-white tracking-tighter">94%</p>
                                <p className="text-[8px] font-black text-slate-600 uppercase tracking-widest">Available</p>
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-6 text-center italic">Next scaling sequence scheduled in 24h</p>
                    </div>

                    {/* Recent Delta Feed */}
                    <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl flex-1 overflow-hidden">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                            <Clock size={16} className="text-primary-400" /> Delta Feed
                        </h3>
                        <div className="space-y-6 overflow-y-auto max-h-[400px] scrollbar-hide">
                            {[
                                { event: 'Report_Q1_Inject', time: '12m ago', user: 'Adams.J' },
                                { event: 'Branding_Vectors_Link', time: '45m ago', user: 'Morgan.A' },
                                { event: 'Contracts_Auth_Verify', time: '2h ago', user: 'System' },
                                { event: 'Photo_Asset_Purge', time: 'Yesterday', user: 'Admin' },
                            ].map((delta, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-2xl bg-slate-950 border border-slate-800 group hover:border-slate-700 transition-all cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-primary-500 font-black text-xs group-hover:scale-110 transition-transform">#</div>
                                    <div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight group-hover:text-primary-400 transition-colors">{delta.event}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-bold text-slate-700 uppercase italic">{delta.user}</span>
                                            <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                                            <span className="text-[9px] font-black text-slate-800 uppercase tracking-widest">{delta.time}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-[9px] font-black text-slate-700 uppercase tracking-widest hover:text-white transition-all">
                            Full Delta Audit
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
