'use client';

import { Folder, FileText, Image, Archive, Download, Search, Plus, MoreHorizontal, Grid, List, HardDrive, Share2, Trash2, Clock, UploadCloud } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function FilesPage() {
    const [viewMode, setViewMode] = useState('grid');
    const [selected, setSelected] = useState(null);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const fetchFiles = async () => {
        try {
            const res = await fetch(`/api/files?search=${search}`);
            const data = await res.json();
            if (data.success) {
                setFiles(data.data);
            }
        } catch (err) {
            toast.error('Vault link failure: Could not retrieve asset stream');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchFiles();
    }, [search]);

    const handleUpload = async () => {
        const name = prompt('ASSET IDENTIFIER (Filename):');
        if (!name) return;
        const sizeString = prompt('PROTOCOL SIZE (e.g. 2.4 MB):', '0.0 MB');

        try {
            const res = await fetch('/api/files', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    size: sizeString,
                    type: name.split('.').pop() || 'unknown',
                    url: '#' // Mock URL for demonstration
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Asset injected successfully');
                fetchFiles();
            }
        } catch (err) {
            toast.error('Asset injection failed');
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Galactic Vault</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                        <HardDrive size={12} className="text-[var(--primary-500)]" />
                        Decentralized Neural Asset Repository • Integrity Verified
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleUpload}
                        className="h-14 px-8 rounded-2xl bg-[var(--text-primary)] text-[var(--surface)] font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                    >
                        <UploadCloud size={18} /> Inject Asset
                    </button>
                </div>
            </div>

            <div className="flex-1 flex gap-8 overflow-hidden">
                {/* Main Content Area */}
                <div className="flex-1 flex flex-col space-y-8">
                    {/* Filter / View Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-6 p-6 bg-[var(--surface-overlay)]/40 backdrop-blur-3xl rounded-[2.5rem] border border-[var(--border)] shadow-2xl">
                        <div className="relative flex-1 max-w-md group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-[var(--primary-500)] transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[10px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                                placeholder="QUERY VAULT ENCRYPTION..."
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex bg-[var(--surface-overlay)] p-1 rounded-xl border border-[var(--border)]">
                                <button onClick={() => setViewMode('grid')} className={cn('p-2.5 rounded-lg transition-all', viewMode === 'grid' ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}><Grid size={18} /></button>
                                <button onClick={() => setViewMode('list')} className={cn('p-2.5 rounded-lg transition-all', viewMode === 'list' ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}><List size={18} /></button>
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
                            {loading && files.length === 0 ? (
                                <div className="col-span-full py-24 text-center text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] animate-pulse">Scanning Vault...</div>
                            ) : files.map(f => (
                                <div
                                    key={f._id}
                                    onClick={() => setSelected(f)}
                                    className={cn(
                                        'group bg-[var(--card-bg)] backdrop-blur-xl border border-[var(--card-border)] p-6 shadow-2xl cursor-pointer hover:border-[var(--primary-500)]/50 transition-all overflow-hidden relative',
                                        viewMode === 'grid' ? 'rounded-[2.5rem] flex flex-col items-center' : 'rounded-[1.5rem] flex items-center gap-6',
                                        selected?._id === f._id && 'border-[var(--primary-500)]/50 bg-[var(--primary-500)]/5'
                                    )}
                                >
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full blur-3xl -mr-12 -mt-12 transition-all group-hover:bg-white/10"></div>

                                    <div className={cn(
                                        'rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover:scale-110 duration-500',
                                        viewMode === 'grid' ? 'w-20 h-20 mb-6' : 'w-14 h-14',
                                        'bg-[var(--primary-500)]/10'
                                    )}>
                                        <FileText size={viewMode === 'grid' ? 32 : 24} className="text-[var(--primary-500)]" />
                                    </div>

                                    <div className={cn('min-w-0', viewMode === 'grid' ? 'text-center' : 'flex-1')}>
                                        <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight truncate group-hover:text-[var(--primary-500)] transition-colors">{f.name}</p>
                                        <div className={cn('flex items-center gap-3 mt-1.5', viewMode === 'grid' ? 'justify-center' : '')}>
                                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{f.size}</span>
                                            <div className="w-1 h-1 rounded-full bg-[var(--border)]"></div>
                                            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase italic tracking-widest">{new Date(f.updatedAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>

                                    <div className={cn(
                                        'flex items-center gap-2 transition-opacity duration-300',
                                        viewMode === 'grid' ? 'mt-6 opacity-0 group-hover:opacity-100' : 'opacity-100'
                                    )}>
                                        {[Download, Share2, MoreHorizontal].map((Icon, idx) => (
                                            <button key={idx} className="p-2.5 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all">
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
                    <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-500)]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8">Vault Integrity</h3>
                        <div className="relative w-full h-24 flex items-center justify-center">
                            <div className="absolute inset-0 flex items-center justify-center">
                                <div className="w-20 h-20 rounded-full border-4 border-[var(--border)] border-t-[var(--primary-500)] animate-[spin_3s_linear_infinite] shadow-[0_0_15px_var(--glow-primary)]"></div>
                            </div>
                            <div className="text-center z-10">
                                <p className="text-xl font-black text-[var(--text-primary)] tracking-tighter">100%</p>
                                <p className="text-[8px] font-black text-[var(--text-muted)] uppercase tracking-widest">NOMINAL</p>
                            </div>
                        </div>
                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-6 text-center italic">All sectors synchronized</p>
                    </div>

                    <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl flex-1 overflow-hidden">
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                            <Clock size={16} className="text-[var(--primary-500)]" /> Recent Activity
                        </h3>
                        <div className="space-y-6 overflow-y-auto max-h-[400px] scrollbar-hide">
                            {files.slice(0, 5).map((file, i) => (
                                <div key={file._id} className="flex gap-4 p-4 rounded-2xl bg-[var(--surface-overlay)]/40 border border-[var(--border)] group hover:border-[var(--primary-500)]/30 transition-all cursor-pointer">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--primary-500)] font-black text-xs group-hover:scale-110 transition-transform">#</div>
                                    <div className="min-w-0">
                                        <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight group-hover:text-[var(--primary-500)] transition-colors truncate">{file.name}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <span className="text-[9px] font-bold text-[var(--text-muted)] uppercase italic">Injected</span>
                                            <div className="w-1 h-1 rounded-full bg-[var(--border)]"></div>
                                            <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{new Date(file.createdAt).toLocaleDateString()}</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
