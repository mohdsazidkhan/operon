'use client';

import { Star, Trash2, Archive, Reply, Search, Mail, Inbox, Send, AlertCircle, Bookmark, ChevronDown, MoreVertical, Plus, Paperclip } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

const emails = [
    { id: 1, from: 'Jennifer Adams', email: 'j.adams@neural.io', subject: 'Vector Audit Follow-up', preview: "Analysis core protocols finalized successfully. The team identifies high-gradient potential in the Q4 roadmap. When can we initialize technical review?", time: '10:32 AM', read: false, starred: false, label: 'Neural' },
    { id: 2, from: 'Nina Patel', email: 'nina@ecomhub.com', subject: 'EcomHub — Scaling Proposal', preview: "Protocol evaluation completed. High-velocity metrics observed. Requesting synchronous sync to finalize resource allocation and pricing matrix.", time: '9:15 AM', read: false, starred: true, label: 'Sales' },
    { id: 3, from: 'David Chen', email: 'david@operon.io', subject: 'Temporal Request Approved', preview: "Authorized leave sequence for March 20–25 is logged in the temporal registry. Sync all pending vectors before initialization.", time: 'Yesterday', read: true, starred: false, label: 'System' },
    { id: 4, from: 'Sophia Turner', email: 'sophia@operon.io', subject: 'Fiscal Report Ready', preview: "The Q1 expenditure matrix has been compiled. Validation required for finalized capital disbursement protocols.", time: 'Yesterday', read: true, starred: false, label: 'Finance' },
    { id: 5, from: 'Daniel Wu', email: 'daniel.wu@bizsuite.com', subject: 'Core Inquiry: BizSuite', preview: "Evaluating operational infrastructures for fiscal year 2025. OPERON telemetry shows optimal sector penetration. Requesting detailed demo.", time: 'Mar 14', read: true, starred: false, label: 'Lead' },
];

export default function EmailPage() {
    const [selectedEmail, setSelectedEmail] = useState(emails[0]);
    const [activeFolder, setActiveFolder] = useState('Inbox');

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2 mb-6">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Quantum Mail</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                        <Mail size={12} className="text-primary-500" />
                        Asynchronous Data Propagation • Encrypted Stream
                    </p>
                </div>
                <div className="flex gap-3">
                    <button className="h-12 px-8 rounded-2xl bg-white text-slate-950 font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl hover:scale-105 transition-all flex items-center gap-3">
                        <Plus size={16} /> Sequence Message
                    </button>
                </div>
            </div>

            <div className="flex-1 flex bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
                {/* Sidebar - Nav Ledger */}
                <div className="w-20 lg:w-64 border-r border-slate-800 flex flex-col bg-slate-950/20 p-4">
                    <div className="space-y-2 mt-4">
                        {[
                            { name: 'Inbox', icon: Inbox, count: 2 },
                            { name: 'Starred', icon: Star, count: 1 },
                            { name: 'Sent', icon: Send, count: 0 },
                            { name: 'Archive', icon: Archive, count: 0 },
                            { name: 'Trash', icon: Trash2, count: 0 },
                        ].map(folder => (
                            <button
                                key={folder.name}
                                onClick={() => setActiveFolder(folder.name)}
                                className={cn(
                                    'w-full flex items-center gap-4 p-4 rounded-2xl transition-all group relative overflow-hidden',
                                    activeFolder === folder.name ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/10' : 'text-slate-600 hover:text-white hover:bg-white/5'
                                )}
                            >
                                <folder.icon size={18} className={cn(activeFolder === folder.name ? 'text-white' : 'group-hover:text-primary-400')} />
                                <span className="hidden lg:block text-[10px] font-black uppercase tracking-widest">{folder.name}</span>
                                {folder.count > 0 && activeFolder !== folder.name && (
                                    <span className="hidden lg:flex ml-auto w-5 h-5 rounded-lg bg-slate-900 border border-slate-800 text-[9px] font-black text-primary-500 items-center justify-center">
                                        {folder.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* List Ledger */}
                <div className="w-80 lg:w-96 border-r border-slate-800 flex flex-col bg-slate-950/10">
                    <div className="p-6 border-b border-slate-800 bg-slate-900/40">
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-primary-500 transition-colors" />
                            <input
                                className="w-full pl-12 pr-4 py-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all placeholder:text-slate-900"
                                placeholder="QUERY INBOX..."
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto divide-y divide-slate-800/50">
                        {emails.map(email => (
                            <button
                                key={email.id}
                                onClick={() => setSelectedEmail(email)}
                                className={cn(
                                    'w-full flex items-start gap-4 p-6 text-left transition-all relative group overflow-hidden',
                                    selectedEmail.id === email.id ? 'bg-white/[0.04]' : 'hover:bg-white/[0.02]',
                                    !email.read && 'after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-primary-500'
                                )}
                            >
                                <div className="shrink-0 w-10 h-10 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500 group-hover:border-primary-500/50 group-hover:text-primary-400 transition-all">
                                    {email.from[0]}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className={cn('text-[11px] uppercase tracking-tight truncate', !email.read ? 'font-black text-white' : 'font-bold text-slate-500')}>{email.from}</p>
                                        <span className="text-[9px] font-bold text-slate-800 uppercase italic shrink-0">{email.time}</span>
                                    </div>
                                    <p className={cn('text-[10px] uppercase tracking-widest truncate mb-1', !email.read ? 'font-black text-primary-400 shadow-primary-500/50' : 'font-bold text-slate-600')}>{email.subject}</p>
                                    <p className="text-[9px] text-slate-700 font-bold uppercase tracking-wider truncate italic">{email.preview}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail View */}
                <div className="flex-1 flex flex-col bg-slate-950/30 overflow-hidden relative">
                    {/* Detail Header */}
                    <div className="p-8 border-b border-slate-800 bg-slate-900/40">
                        <div className="flex items-start justify-between mb-8 group">
                            <div>
                                <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic group-hover:text-primary-400 transition-colors">{selectedEmail.subject}</h2>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="px-3 py-1 rounded-lg bg-primary-500/10 border border-primary-500/20 text-[9px] font-black text-primary-400 uppercase tracking-widest">{selectedEmail.label}</span>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-800"></div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">Protocol Version: 9.4.2</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {[Star, Archive, Trash2, MoreVertical].map((Icon, idx) => (
                                    <button
                                        key={idx}
                                        className={cn(
                                            'p-3 rounded-2xl bg-slate-900 border border-slate-800 transition-all hover:scale-105',
                                            idx === 0 && selectedEmail.starred ? 'text-amber-500' : 'text-slate-600 hover:text-white'
                                        )}
                                    >
                                        <Icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-[1.5rem] bg-gradient-to-br from-primary-500 to-indigo-600 p-px">
                                <div className="w-full h-full rounded-[1.4rem] bg-slate-950 flex items-center justify-center text-white font-black text-lg">
                                    {selectedEmail.from[0]}
                                </div>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-xs font-black text-white uppercase tracking-widest">{selectedEmail.from}</p>
                                    <span className="text-[9px] font-black text-slate-800 uppercase italic tracking-widest">{selectedEmail.time}</span>
                                </div>
                                <p className="text-[10px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic">&lt;{selectedEmail.email}&gt;</p>
                            </div>
                        </div>
                    </div>

                    {/* Email Content */}
                    <div className="flex-1 overflow-y-auto p-12 scrollbar-hide">
                        <div className="max-w-3xl">
                            <p className="text-sm font-black text-slate-300 leading-[1.8] tracking-tight uppercase mb-8">
                                {selectedEmail.preview}
                            </p>
                            <p className="text-xs font-bold text-slate-500 leading-relaxed uppercase tracking-widest mb-12">
                                Quantum transmission log indicates successful vector injection. <br />
                                System integrity state: Nominal. <br /><br />
                                Strategic directives await your validation cycle. <br /><br />
                                Integrity Hash: 0x8249F2EE94B <br />
                                Protocol Agent: Neural-Auto-Gen
                            </p>

                            <div className="flex gap-4">
                                <div className="p-6 rounded-[2rem] border border-slate-800 bg-slate-900/40 w-64 group cursor-pointer hover:border-primary-500/50 transition-all">
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 rounded-xl bg-slate-950 text-emerald-400 group-hover:scale-110 transition-transform"><Paperclip size={18} /></div>
                                        <p className="text-[10px] font-black text-white uppercase tracking-tight">Strategy_Map.pdf</p>
                                    </div>
                                    <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">2.4 MB • PDF Document</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Resolve Footer */}
                    <div className="p-8 border-t border-slate-800 bg-slate-900/40">
                        <div className="flex items-center gap-4">
                            <button className="h-14 px-10 rounded-[1.5rem] bg-primary-500 text-white text-[10px] font-black uppercase tracking-widest shadow-2xl shadow-primary-500/20 flex items-center gap-3 hover:scale-105 transition-all active:scale-95">
                                <Reply size={16} /> Execute Reply
                            </button>
                            <button className="h-14 px-8 rounded-[1.5rem] border border-slate-800 bg-slate-950 text-slate-600 text-[10px] font-black uppercase tracking-widest hover:text-white hover:border-slate-700 transition-all">
                                Forward Sequence
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
