'use client';

import { useState, useEffect } from 'react';
import {
    Inbox, Send, Drafts, Trash2, AlertCircle, Star,
    MoreVertical, RefreshCw, Search, Filter,
    Archive, Mail, Tag, ChevronLeft, ChevronRight,
    Paperclip, Trash
} from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function EmailPage() {
    const [activeFolder, setActiveFolder] = useState('inbox');
    const [selectedEmail, setSelectedEmail] = useState(null);
    const [emails, setEmails] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    const folders = [
        { id: 'inbox', label: 'INBOX', icon: Inbox, count: emails.filter(e => !e.isRead && e.folder === 'inbox').length },
        { id: 'sent', label: 'SENT', icon: Send, count: 0 },
        { id: 'drafts', label: 'DRAFTS', icon: Mail, count: 0 },
        { id: 'trash', label: 'TRASH', icon: Trash2, count: 0 },
        { id: 'spam', label: 'SPAM', icon: AlertCircle, count: 0 },
    ];

    const fetchEmails = async () => {
        try {
            const res = await fetch(`/api/emails?folder=${activeFolder}&search=${search}`);
            const data = await res.json();
            if (data.success) {
                setEmails(data.data);
            }
        } catch (err) {
            toast.error('Quantum link failure: Could not retrieve email ledger');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEmails();
    }, [activeFolder, search]);

    const handleSend = async () => {
        const email = prompt('TARGET PROTOCOL (Email Address):');
        if (!email) return;
        const subject = prompt('DATA PACKET HEADER (Subject):');
        const content = prompt('SEQUENCE CONTENT:');

        try {
            const res = await fetch('/api/emails', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    sender: { name: 'Current User', email: 'user@operon.ai' },
                    recipients: [{ email }],
                    subject,
                    content,
                    folder: 'inbox' // Simulating for demo simplicity
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Packet transmitted successfully');
                fetchEmails();
            }
        } catch (err) {
            toast.error('Transmission failure');
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
            {/* Context Header */}
            <div className="mb-6 flex items-center justify-between px-2">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Quantum Mail</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                        <Archive size={12} className="text-[var(--primary-500)]" />
                        Authenticated Vector Stream Active
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleSend}
                        className="h-14 px-8 rounded-2xl bg-[var(--primary-500)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[var(--primary-500)]/20 hover:scale-105 transition-all flex items-center gap-3"
                    >
                        Compose Packet
                    </button>
                </div>
            </div>

            <div className="flex-1 flex bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
                {/* Sidebar - Folder Ledger */}
                <div className="w-80 border-r border-[var(--border)] bg-[var(--surface-overlay)]/20 flex flex-col">
                    <div className="p-8 space-y-2">
                        {folders.map(folder => (
                            <button
                                key={folder.id}
                                onClick={() => setActiveFolder(folder.id)}
                                className={cn(
                                    'w-full flex items-center justify-between p-4 rounded-2xl transition-all group',
                                    activeFolder === folder.id ? 'bg-[var(--primary-500)]/10 border border-[var(--primary-500)]/20' : 'hover:bg-[var(--surface-overlay)] border border-transparent'
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <folder.icon size={18} className={cn(activeFolder === folder.id ? 'text-[var(--primary-500)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]')} />
                                    <span className={cn('text-[10px] font-black uppercase tracking-widest', activeFolder === folder.id ? 'text-[var(--text-primary)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]')}>{folder.label}</span>
                                </div>
                                {folder.count > 0 && (
                                    <div className="px-2 py-0.5 rounded-lg bg-[var(--primary-500)] text-[9px] font-black text-white">{folder.count}</div>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Email Ledger - Infinite Stream */}
                <div className="w-96 border-r border-[var(--border)] flex flex-col">
                    <div className="p-6 border-b border-[var(--border)] bg-[var(--surface-overlay)]/40">
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-[var(--primary-500)] transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="QUERY ARCHIVE..."
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto scrollbar-hide bg-slate-950/10">
                        {loading && emails.length === 0 ? (
                            <div className="py-12 text-center text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] animate-pulse">Decrypting Segment...</div>
                        ) : emails.map(email => (
                            <button
                                key={email._id}
                                onClick={() => setSelectedEmail(email)}
                                className={cn(
                                    'w-full p-6 border-b border-[var(--border)]/50 text-left transition-all relative group',
                                    selectedEmail?._id === email._id ? 'bg-[var(--primary-500)]/5' : 'hover:bg-[var(--surface-overlay)]/40',
                                    !email.isRead && 'after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[var(--primary-500)]'
                                )}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight truncate max-w-[140px]">{email.sender.name}</span>
                                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase">{new Date(email.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}</span>
                                </div>
                                <h3 className={cn('text-[11px] mb-2 uppercase tracking-tight truncate', email.isRead ? 'text-[var(--text-muted)] font-bold' : 'text-[var(--text-primary)] font-black')}>{email.subject}</h3>
                                <p className="text-[10px] font-bold text-[var(--text-secondary)] lowercase tracking-tight line-clamp-2 leading-relaxed">{email.content.substring(0, 100)}...</p>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tactical Detail View */}
                <div className="flex-1 flex flex-col bg-[var(--surface)]/30 relative">
                    {selectedEmail ? (
                        <>
                            <div className="p-8 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface-overlay)]/20">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center text-[var(--primary-500)] font-black text-xl shadow-inner uppercase">
                                        {selectedEmail.sender.name[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-xs font-black text-[var(--text-primary)] uppercase tracking-widest mb-1">{selectedEmail.sender.name}</h2>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] lowercase tracking-widest">{selectedEmail.sender.email} • TO: ME</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    {[RefreshCw, Archive, Trash].map((Icon, i) => (
                                        <button key={i} className="p-3 rounded-xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><Icon size={18} /></button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-1 p-10 overflow-y-auto scrollbar-hide">
                                <h1 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tight mb-10 italic">{selectedEmail.subject}</h1>
                                <div className="prose prose-invert max-w-none">
                                    <p className="text-sm font-black text-[var(--text-secondary)] leading-relaxed tracking-tight whitespace-pre-wrap">{selectedEmail.content}</p>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center group">
                                <Archive size={48} className="mx-auto text-[var(--border)] group-hover:text-[var(--primary-500)]/20 transition-all duration-700" />
                                <p className="mt-6 text-[10px] font-black text-[var(--border)] uppercase tracking-[0.5em]">Select Segment to Decrypt</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
