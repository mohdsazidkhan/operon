'use client';

import { useState, useEffect } from 'react';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';
import { Plus, Search, Users, Edit, Trash2, Mail, Phone, Building2, Eye } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const EMPTY_CONTACT = { name: '', email: '', phone: '', position: '', company: '', city: '', country: '' };

export default function ContactsPage() {
    const [contacts, setContacts] = useState([]);
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingContact, setEditingContact] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_CONTACT);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const fetchContacts = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/contacts?search=${search}`);
            const data = await res.json();
            if (data.success) setContacts(data.data);
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

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const body = {
                ...form,
                address: { city: form.city, country: form.country }
            };
            const url = editingContact ? `/api/contacts/${editingContact._id}` : '/api/contacts';
            const method = editingContact ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingContact ? 'Contact updated!' : 'Contact created!');
                setShowAdd(false);
                setEditingContact(null);
                setForm(EMPTY_CONTACT);
                fetchContacts();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Archive this contact permanently?')) return;
        try {
            const res = await fetch(`/api/contacts/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Contact removed');
                fetchContacts();
            }
        } catch { toast.error('Deletion failed'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500 pb-12">
            {/* Add/Edit Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingContact(null); setForm(EMPTY_CONTACT); }} title={editingContact ? "Update Connection" : "Acquire New Contact"} size="lg">
                <form onSubmit={handleFormSubmit} className="space-y-4">
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
                        <FormField label="Link Company">
                            <select className={inputCls} value={form.company} onChange={e => setForm(p => ({ ...p, company: e.target.value }))}>
                                <option value="">Independent Entity</option>
                                {companies.map(co => (
                                    <option key={co._id} value={co._id}>{co.name}</option>
                                ))}
                            </select>
                        </FormField>
                        <div className="grid grid-cols-2 gap-2">
                            <FormField label="City">
                                <input className={inputCls} placeholder="City" value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                            </FormField>
                            <FormField label="Country">
                                <input className={inputCls} placeholder="Country" value={form.country} onChange={e => setForm(p => ({ ...p, country: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditingContact(null); }} loading={saving} submitLabel={editingContact ? "Sync Changes" : "Create Record"} />
                </form>
            </Modal>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Contacts</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-1">{contacts.length} VERIFIED CONNECTIONS</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-focus-within:text-[var(--primary-500)] transition-colors" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="QUERY NETWORK..."
                            className="pl-10 pr-4 py-3 rounded-2xl text-[10px] font-black bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] uppercase tracking-widest focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 transition-all w-64 shadow-inner"
                        />
                    </div>
                    {isMounted && (
                        <Can permission="crm.contacts.create">
                            <button onClick={() => { setForm(EMPTY_CONTACT); setEditingContact(null); setShowAdd(true); }}
                                className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                                <Plus size={18} /> New Contact
                            </button>
                        </Can>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-48 bg-[var(--surface-overlay)] animate-pulse rounded-[2.5rem] border border-[var(--border)]"></div>
                    ))}
                </div>
            ) : contacts.length === 0 ? (
                <div className="bg-[var(--surface-overlay)]/50 rounded-[3rem] border-2 border-dashed border-[var(--border)] p-20 text-center">
                    <Users size={48} className="mx-auto text-[var(--border)] mb-6 opacity-30" />
                    <h3 className="text-sm font-black text-[var(--text-muted)] uppercase tracking-[0.5em]">No digital footprint found</h3>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {contacts.map(c => (
                        <div key={c._id} className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl hover:shadow-[0_30px_60px_-15px_rgba(0,0,0,0.2)] hover:border-[var(--primary-500)]/40 transition-all duration-500 group relative overflow-hidden flex flex-col">
                            {/* Accent Glow */}
                            <div className="absolute -top-12 -right-12 w-32 h-32 bg-[var(--primary-500)] opacity-0 group-hover:opacity-10 blur-[50px] transition-opacity"></div>

                            <div className="flex items-start justify-between mb-8 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[1.5rem] bg-gradient-to-br from-[var(--surface-overlay)] to-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--primary-500)] font-black text-2xl shadow-xl transition-all group-hover:scale-110 group-hover:bg-[var(--primary-500)] group-hover:text-white duration-500">
                                        {c.name?.[0] || 'C'}
                                    </div>
                                    <div>
                                        <p className="font-black text-sm text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors uppercase tracking-tight leading-none">{c.name}</p>
                                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-2 opacity-60 italic">{c.position || 'Independent'}</p>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all transform translate-y-1 group-hover:translate-y-0">
                                    {isMounted && (
                                        <>
                                            <Can permission="crm.contacts.edit">
                                                <button onClick={() => openEdit(c)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl active:scale-90" title="Modify Record"><Edit size={16} /></button>
                                            </Can>
                                            <Can permission="crm.contacts.delete">
                                                <button onClick={() => handleDelete(c._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl active:scale-90" title="Purge Record"><Trash2 size={16} /></button>
                                            </Can>
                                        </>
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10 flex-1">
                                <div className="flex items-center gap-4 text-[10px] font-black text-[var(--text-muted)] group/item cursor-pointer">
                                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-overlay)] flex items-center justify-center border border-[var(--border)] group-hover/item:border-[var(--primary-500)]/30 transition-colors">
                                        <Mail size={12} className="opacity-60" />
                                    </div>
                                    <span className="truncate tracking-widest">{c.email}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-[var(--text-muted)] group/item cursor-pointer">
                                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-overlay)] flex items-center justify-center border border-[var(--border)] group-hover/item:border-[var(--primary-500)]/30 transition-colors">
                                        <Phone size={12} className="opacity-60" />
                                    </div>
                                    <span className="tracking-widest">{c.phone || 'NO-PROTOCOL'}</span>
                                </div>
                                <div className="flex items-center gap-4 text-[10px] font-black text-[var(--text-muted)] group/item cursor-pointer">
                                    <div className="w-8 h-8 rounded-xl bg-[var(--surface-overlay)] flex items-center justify-center border border-[var(--border)] group-hover/item:border-[var(--primary-500)]/30 transition-colors">
                                        <Building2 size={12} className="opacity-60" />
                                    </div>
                                    <span className="truncate tracking-widest">{c.company?.name || 'PRIVATE ENTITY'}</span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-[var(--border)] border-dashed flex items-center justify-between text-[9px] font-black tracking-widest text-[var(--text-muted)] relative z-10">
                                <span className="opacity-50">LOGGED: {formatDate(c.createdAt)}</span>
                                <button className="flex items-center gap-1.5 text-[var(--primary-500)] hover:text-[var(--primary-600)] transition-colors uppercase">
                                    DEPTH VIEW <Eye size={10} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
