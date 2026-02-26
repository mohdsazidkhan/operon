'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, Building2, Eye, MoreHorizontal, Users } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        const fetchContacts = async () => {
            try {
                const res = await fetch(`/api/contacts?search=${search}`);
                const data = await res.json();
                if (data.success) {
                    setContacts(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch contacts:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchContacts();
    }, [search]);

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Contacts</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{contacts.length} people in your network</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search contacts..."
                            className="pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/40 focus:border-[var(--primary-500)] transition-all w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                        <Plus size={16} /> New Contact
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-[var(--surface-overlay)] animate-pulse rounded-2xl border border-[var(--border)]"></div>
                    ))}
                </div>
            ) : contacts.length === 0 ? (
                <div className="bg-[var(--surface-overlay)] rounded-2xl border border-[var(--border)] p-12 text-center">
                    <Users size={48} className="mx-auto text-[var(--border-strong)] mb-4" />
                    <p className="text-[var(--text-muted)]">No contacts found. Start building your CRM.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {contacts.map(c => (
                        <div key={c._id} className="bg-[var(--card-bg)] backdrop-blur-sm rounded-2xl border border-[var(--card-border)] p-6 shadow-xl hover:shadow-[var(--primary-500)]/5 hover:border-[var(--primary-500)]/30 transition-all group relative overflow-hidden">
                            <div className="flex items-start justify-between mb-5 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[var(--primary-500)] to-[var(--primary-600)] flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[var(--primary-500)]/20 group-hover:scale-105 transition-transform duration-500">
                                        {c.name?.[0] || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight">{c.name}</p>
                                        <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-widest">{c.title || 'Professional contact'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                    <button className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><Edit size={16} /></button>
                                    <button className="p-2 rounded-lg hover:bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 transition-all"><Trash2 size={16} /></button>
                                </div>
                            </div>

                            <div className="space-y-3 relative z-10">
                                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer group/item">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-overlay)] flex items-center justify-center group-hover/item:text-[var(--primary-500)] transition-colors">
                                        <Mail size={14} />
                                    </div>
                                    <span className="truncate">{c.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer group/item">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-overlay)] flex items-center justify-center group-hover/item:text-[var(--primary-500)] transition-colors">
                                        <Phone size={14} />
                                    </div>
                                    <span>{c.phone || 'No phone'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors cursor-pointer group/item">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--surface-overlay)] flex items-center justify-center group-hover/item:text-[var(--primary-500)] transition-colors">
                                        <Building2 size={14} />
                                    </div>
                                    <span className="truncate font-medium">{c.company?.name || 'Independent'}</span>
                                </div>
                            </div>

                            <div className="mt-6 pt-5 border-t border-[var(--border)] flex items-center justify-between text-[10px] uppercase font-bold tracking-widest text-[var(--text-muted)] relative z-10">
                                <span>Created {formatDate(c.createdAt)}</span>
                                <button className="flex items-center gap-1 text-[var(--primary-500)] hover:text-[var(--primary-600)] transition-colors">
                                    View full profile <Eye size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
