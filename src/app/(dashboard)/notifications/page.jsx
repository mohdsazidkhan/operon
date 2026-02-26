'use client';

import { useState, useEffect } from 'react';
import { Bell, AlertTriangle, Info, CheckCircle, Shield, ArrowRight, MoreHorizontal, Search, Settings, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

const initialNotifications = [
    { id: 1, type: 'critical', title: 'Asset Bulk Depletion Warning', text: 'Three neural hardware assets have breached the critical stock threshold in Sector B.', time: '2m ago', read: false, icon: AlertTriangle, color: 'text-rose-500', bg: 'bg-rose-500/10' },
    { id: 2, type: 'system', title: 'Protocol Sync Successful', text: 'Temporal sync engine version 9.4.2 has been deployed to all secondary nodes.', time: '15m ago', read: false, icon: Shield, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
    { id: 3, type: 'auth', title: 'Security Perimeter Breach Attempt', text: 'Multiple unauthorized access attempts detected from localized IP 192.168.1.104.', time: '1h ago', read: true, icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/10' },
    { id: 4, type: 'info', title: 'Fiscal Report Compiled', text: 'The Q1 expenditure matrix is now available for validation in the Finance module.', time: '3h ago', read: true, icon: Info, color: 'text-[var(--primary-500)]', bg: 'bg-[var(--primary-500)]/10' },
    { id: 5, type: 'success', title: 'Payroll Vectoring Complete', text: 'Capital disbursement protocols for March cycle have been initialized for 14 staff entities.', time: 'Yesterday', read: true, icon: CheckCircle, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
];

export default function NotificationsPage() {
    const [mounted, setMounted] = useState(false);
    const [notifications, setNotifications] = useState(initialNotifications);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="p-10 text-slate-800 uppercase tracking-widest text-[10px] font-black">Decrypting Notification Stream...</div>;

    const markAllRead = () => {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Global Alert Ledger</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <Bell size={12} className="text-[var(--primary-500)]" />
                        Real-time System Telemetry • Event Synchronization
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button onClick={markAllRead} className="px-6 py-3 bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all">
                        Normalize All Deltas
                    </button>
                    <button className="p-3 bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-2xl transition-all">
                        <Settings size={18} />
                    </button>
                </div>
            </div>

            {/* Notification Ledger */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-[var(--border)] flex flex-wrap items-center justify-between gap-4 bg-[var(--surface-overlay)]/20">
                    <div className="relative flex-1 max-w-sm">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            placeholder="QUERY SYSTEM LOGS..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        {['ALL', 'SYSTEM', 'CRITICAL', 'SECURITY'].map(cat => (
                            <button key={cat} className={cn('px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all', cat === 'ALL' ? 'bg-[var(--primary-500)] text-white shadow-xl shadow-[var(--primary-500)]/10' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]')}>{cat}</button>
                        ))}
                    </div>
                </div>

                <div className="divide-y divide-[var(--border)]">
                    {notifications.map(n => (
                        <div
                            key={n.id}
                            className={cn(
                                'flex items-start gap-6 p-10 hover:bg-white/[0.02] transition-colors relative group',
                                !n.read && 'after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-[var(--primary-500)]'
                            )}
                        >
                            <div className={cn('w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl shadow-black border border-white/5 transition-transform group-hover:rotate-12', n.bg, n.color)}>
                                <n.icon size={22} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className={cn('text-sm uppercase tracking-tighter', !n.read ? 'font-black text-[var(--text-primary)]' : 'font-bold text-[var(--text-muted)]')}>{n.title}</h3>
                                    <span className="text-[10px] font-black text-[var(--text-muted)] uppercase italic tracking-[0.2em]">{n.time}</span>
                                </div>
                                <p className="text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-widest leading-relaxed">{n.text}</p>
                                <div className="flex items-center gap-3 mt-6">
                                    <button className="flex items-center gap-2 px-4 py-2 bg-[var(--surface-overlay)] border border-[var(--border)] rounded-xl text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest hover:text-[var(--text-primary)] transition-all">
                                        EXAMINE <ArrowRight size={10} />
                                    </button>
                                    <button className="p-2 text-[var(--text-muted)] hover:text-rose-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                            <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="p-3 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><MoreHorizontal size={20} /></button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="p-8 bg-[var(--surface-raised)] border-t border-[var(--border)] flex items-center justify-center">
                    <button className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] hover:text-[var(--text-primary)] transition-colors">Load Archive Clusters</button>
                </div>
            </div>
        </div>
    );
}
