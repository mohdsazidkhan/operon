'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, Mail, Phone, Building2, Eye, MoreHorizontal, Users } from 'lucide-react';
import { formatDate, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const EMPTY_CONTACT = { name: '', email: '', phone: '', position: '', company: '', city: '', country: '' };

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_CONTACT);

    const fetchContacts = async () => {
        setLoading(true);
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

    const fetchCompanies = async () => {
        try {
            const res = await fetch('/api/companies');
            const data = await res.json();
            if (data.success) setCompanies(data.data);
        } catch (err) {
            console.error('Failed to fetch companies:', err);
        }
    };

    useEffect(() => {
        fetchContacts();
        fetchCompanies();
    }, [search]);

    const handleAdd = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            // Prepare body, handling nested address if needed by schema (Contact schema has address: {city, country})
            const body = {
                ...form,
                address: { city: form.city, country: form.country }
            };
            const res = await fetch('/api/contacts', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Contact created!');
                setShowAdd(false);
                setForm(EMPTY_CONTACT);
                fetchContacts();
            } else {
                toast.error(data.message || 'Failed to create contact');
            }
        } catch { toast.error('Failed to create contact'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Add Contact Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Contact" size="lg">
                <form onSubmit={handleAdd} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Full Name" required>
                            <input required className={inputCls} placeholder="e.g. Jane Doe" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Position / Title">
                            <input className={inputCls} placeholder="e.g. Software Architect" value={form.position} onChange={e => setForm(p => ({ ...p, position: e.target.value }))} />
                        </FormField>
                        <FormField label="Email" required>
                            <input required type="email" className={inputCls} placeholder="e.g. jane@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </FormField>
                        <FormField label="Phone">
                            <input className={inputCls} placeholder="e.g. +1 (555) 000-0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        </FormField>
                        <FormField label="Company">
                            <select className={inputCls} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}>
                                <option value="">Select Company</option>
                                {companies.map(co => (
                                    <option key={co._id} value={co._id}>{co.name}</option>
                                ))}
                            </select>
                        </FormField>
                        <div className="grid grid-cols-2 gap-2">
                            <FormField label="City">
                                <input className={inputCls} placeholder="e.g. New York" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                            </FormField>
                            <FormField label="Country">
                                <input className={inputCls} placeholder="e.g. USA" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => setShowAdd(false)} loading={saving} submitLabel="Create Contact" />
                </form>
            </Modal>

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
                    <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
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
