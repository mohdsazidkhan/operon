'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, User, Phone, Mail, Building2, Linkedin, Twitter, MapPin, MessageSquare, Plus, Edit, Save, X, AlertCircle } from 'lucide-react';
import { cn, formatDate, formatRelativeTime, getInitials } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ContactDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [contact, setContact] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [noteText, setNoteText] = useState('');

    const inputCls = 'w-full px-3 py-2 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all';

    const fetchContact = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/contacts/${id}`);
            const data = await res.json();
            if (data.success) { setContact(data.data); setForm(data.data); }
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (id) fetchContact(); }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/contacts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) { setContact(data.data); setEditing(false); toast.success('Contact updated!'); }
            else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const addNote = async () => {
        if (!noteText.trim()) return;
        const updated = { ...contact, notes: [...(contact.notes || []), { content: noteText, createdAt: new Date() }] };
        const res = await fetch(`/api/contacts/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
        const data = await res.json();
        if (data.success) { setContact(data.data); setNoteText(''); toast.success('Note added'); }
    };

    if (loading) return <div className="animate-pulse space-y-6"><div className="h-8 w-48 bg-[var(--surface-overlay)] rounded-xl" /><div className="h-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl" /></div>;
    if (!contact) return <div className="flex flex-col items-center py-24 gap-4"><AlertCircle size={40} className="text-[var(--text-muted)]" /><p className="text-[var(--text-muted)]">Contact not found</p><button onClick={() => router.back()} className="text-sm text-[var(--primary-500)] underline">Go back</button></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-all"><ArrowLeft size={16} /></button>
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-[var(--primary-500)]/10 flex items-center justify-center text-[var(--primary-500)] font-bold text-lg">{getInitials(contact.name)}</div>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">{contact.name}</h1>
                            <p className="text-[var(--text-muted)] text-sm">{contact.position}{contact.company?.name ? ` · ${contact.company.name}` : ''}</p>
                        </div>
                    </div>
                </div>
                <div className="flex gap-2">
                    {editing ? (
                        <>
                            <button onClick={() => { setEditing(false); setForm(contact); }} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all flex items-center gap-1"><X size={14} /> Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="px-3 py-2 rounded-xl bg-[var(--primary-500)] text-white text-sm font-semibold flex items-center gap-1 transition-all disabled:opacity-50"><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
                        </>
                    ) : (
                        <button onClick={() => setEditing(true)} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all flex items-center gap-1"><Edit size={14} /> Edit</button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Contact Info */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Contact Information</h2>
                        {editing ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Full Name', key: 'name', type: 'text' },
                                    { label: 'Email', key: 'email', type: 'email' },
                                    { label: 'Phone', key: 'phone', type: 'tel' },
                                    { label: 'Position', key: 'position', type: 'text' },
                                ].map(f => (
                                    <div key={f.key}>
                                        <label className="text-xs font-bold text-[var(--text-muted)] uppercase">{f.label}</label>
                                        <input type={f.type} className={cn(inputCls, 'mt-1')} value={form[f.key] || ''} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                                    </div>
                                ))}
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">City</label>
                                    <input className={cn(inputCls, 'mt-1')} value={form.address?.city || ''} onChange={e => setForm(p => ({ ...p, address: { ...p.address, city: e.target.value } }))} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Country</label>
                                    <input className={cn(inputCls, 'mt-1')} value={form.address?.country || ''} onChange={e => setForm(p => ({ ...p, address: { ...p.address, country: e.target.value } }))} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">LinkedIn</label>
                                    <input className={cn(inputCls, 'mt-1')} value={form.social?.linkedin || ''} onChange={e => setForm(p => ({ ...p, social: { ...p.social, linkedin: e.target.value } }))} />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-[var(--text-muted)] uppercase">Twitter</label>
                                    <input className={cn(inputCls, 'mt-1')} value={form.social?.twitter || ''} onChange={e => setForm(p => ({ ...p, social: { ...p.social, twitter: e.target.value } }))} />
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Email', icon: Mail, value: contact.email },
                                    { label: 'Phone', icon: Phone, value: contact.phone },
                                    { label: 'Company', icon: Building2, value: contact.company?.name },
                                    { label: 'Location', icon: MapPin, value: [contact.address?.city, contact.address?.country].filter(Boolean).join(', ') || '—' },
                                    { label: 'LinkedIn', icon: Linkedin, value: contact.social?.linkedin },
                                    { label: 'Twitter', icon: Twitter, value: contact.social?.twitter },
                                ].map(f => (
                                    <div key={f.label} className="flex items-start gap-3">
                                        <div className="p-2 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-muted)] flex-shrink-0"><f.icon size={14} /></div>
                                        <div>
                                            <p className="text-xs text-[var(--text-muted)]">{f.label}</p>
                                            <p className="text-sm font-semibold text-[var(--text-primary)]">{f.value || '—'}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Notes</h2>
                        <div className="flex gap-2 mb-4">
                            <input value={noteText} onChange={e => setNoteText(e.target.value)} placeholder="Add a note..." onKeyDown={e => e.key === 'Enter' && addNote()}
                                className="flex-1 px-3 py-2 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 transition-all" />
                            <button onClick={addNote} disabled={!noteText.trim()} className="px-3 py-2 rounded-xl bg-[var(--primary-500)] text-white text-sm flex items-center gap-1 disabled:opacity-40 transition-all"><Plus size={14} /></button>
                        </div>
                        <div className="space-y-3">
                            {(!contact.notes || contact.notes.length === 0) ? (
                                <p className="text-sm text-[var(--text-muted)] text-center py-4">No notes yet</p>
                            ) : [...contact.notes].reverse().map((note, i) => (
                                <div key={i} className="bg-[var(--surface-overlay)] rounded-xl p-3">
                                    <p className="text-sm text-[var(--text-secondary)]">{note.content}</p>
                                    <p className="text-xs text-[var(--text-muted)] mt-1">{formatRelativeTime(note.createdAt)}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-4">
                        <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Quick Info</h2>
                        {[
                            { label: 'Status', value: contact.isActive ? 'Active' : 'Inactive' },
                            { label: 'Owner', value: contact.owner?.name || '—' },
                            { label: 'Created', value: formatDate(contact.createdAt) },
                            { label: 'Last Updated', value: formatRelativeTime(contact.updatedAt) },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between">
                                <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                                <span className="text-sm font-semibold text-[var(--text-primary)]">{s.value}</span>
                            </div>
                        ))}
                    </div>
                    {contact.tags?.length > 0 && (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                            <h2 className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {contact.tags.map(tag => (
                                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[var(--primary-500)]/10 text-[var(--primary-500)] border border-[var(--primary-500)]/20">{tag}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
