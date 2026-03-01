'use client';

import { useState, useEffect } from 'react';
import { Plus, Globe, Building2, Edit, Trash2, Search, ExternalLink } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';
import Can from '@/components/ui/Can';
import { usePermission } from '@/hooks/usePermission';

const industryColors = {
    Technology: 'bg-blue-500 shadow-blue-500/20',
    Healthcare: 'bg-emerald-500 shadow-emerald-500/20',
    Finance: 'bg-indigo-500 shadow-indigo-500/20',
    Retail: 'bg-amber-500 shadow-amber-500/20',
    'E-Commerce': 'bg-rose-500 shadow-rose-500/20'
};

const EMPTY_COMPANY = { name: '', industry: 'Technology', size: '11-50', website: '', email: '', phone: '', revenue: 0, description: '' };

export default function CompaniesPage() {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_COMPANY);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    const canCreate = usePermission('crm.companies.create');

    const fetchCompanies = async () => {
        setLoading(true);
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

    useEffect(() => {
        fetchCompanies();
    }, [search]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const url = editingId ? `/api/companies/${editingId}` : '/api/companies';
            const method = editingId ? 'PUT' : 'POST';
            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) {
                toast.success(editingId ? 'Company updated!' : 'Company created!');
                setShowAdd(false);
                setEditingId(null);
                setForm(EMPTY_COMPANY);
                fetchCompanies();
            } else {
                toast.error(data.message || 'Action failed');
            }
        } catch { toast.error('Request failed'); }
        finally { setSaving(false); }
    };

    const handleEdit = (company) => {
        setForm({ ...company });
        setEditingId(company._id);
        setShowAdd(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this company? This will also affect linked deals/leads.')) return;
        try {
            const res = await fetch(`/api/companies/${id}`, { method: 'DELETE' });
            const data = await res.json();
            if (data.success) {
                toast.success('Company deleted');
                fetchCompanies();
            } else toast.error(data.message);
        } catch { toast.error('Delete failed'); }
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Company Modal */}
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditingId(null); setForm(EMPTY_COMPANY); }} title={editingId ? "Edit Company" : "Add New Company"} size="lg">
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <FormField label="Company Name" required>
                            <input required className={inputCls} placeholder="e.g. Acme Corp" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                        </FormField>
                        <FormField label="Industry">
                            <select className={inputCls} value={form.industry} onChange={e => setForm(p => ({ ...p, industry: e.target.value }))}>
                                {['Technology', 'Healthcare', 'Finance', 'Retail', 'E-Commerce', 'Manufacturing', 'Services', 'Other'].map(i => (
                                    <option key={i} value={i}>{i}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Website">
                            <input className={inputCls} placeholder="e.g. acme.com" value={form.website} onChange={e => setForm(p => ({ ...p, website: e.target.value }))} />
                        </FormField>
                        <FormField label="Size">
                            <select className={inputCls} value={form.size} onChange={e => setForm(p => ({ ...p, size: e.target.value }))}>
                                {['1-10', '11-50', '51-200', '201-500', '500+'].map(s => (
                                    <option key={s} value={s}>{s} employees</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Contact Email">
                            <input type="email" className={inputCls} placeholder="e.g. hello@acme.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </FormField>
                        <FormField label="Phone">
                            <input className={inputCls} placeholder="e.g. +1 (555) 000-0000" value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        </FormField>
                        <FormField label="Annual Revenue ($)">
                            <input type="number" min="0" className={inputCls} placeholder="0" value={form.revenue} onChange={e => setForm(p => ({ ...p, revenue: +e.target.value }))} />
                        </FormField>
                        <div className="sm:col-span-2">
                            <FormField label="Description">
                                <textarea rows={3} className={inputCls + " resize-none"} placeholder="Company background..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                            </FormField>
                        </div>
                    </div>
                    <FormActions onClose={() => { setShowAdd(false); setEditingId(null); setForm(EMPTY_COMPANY); }} loading={saving} submitLabel={editingId ? "Save Changes" : "Create Company"} />
                </form>
            </Modal>

            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Companies</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{companies.length} active accounts</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search accounts..."
                            className="pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-4 focus:ring-[var(--primary-500)]/10 focus:border-[var(--primary-500)] transition-all w-64 shadow-sm"
                        />
                    </div>
                    {isMounted && (
                        <Can permission="crm.companies.create">
                            <button onClick={() => { setForm(EMPTY_COMPANY); setEditingId(null); setShowAdd(true); }}
                                className="flex items-center gap-4 px-10 py-4 bg-[var(--text-primary)] hover:bg-[var(--primary-500)] text-[var(--surface)] hover:text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.3em] transition-all shadow-2xl hover:scale-105 active:scale-95">
                                <Plus size={18} /> New Company
                            </button>
                        </Can>
                    )}
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-64 bg-[var(--surface-overlay)]/50 animate-pulse rounded-2xl border border-[var(--border)]"></div>
                    ))}
                </div>
            ) : companies.length === 0 ? (
                <div className="bg-[var(--surface-overlay)]/50 rounded-2xl border border-[var(--border)] p-12 text-center">
                    <Building2 size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
                    <p className="text-[var(--text-muted)]">No companies found. Create your first account to get started.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {companies.map(co => (
                        <div key={co._id} className="bg-[var(--card-bg)] backdrop-blur-sm rounded-2xl border border-[var(--card-border)] p-6 shadow-xl hover:shadow-[var(--primary-500)]/5 hover:border-[var(--primary-500)]/30 transition-all group relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-500)]/5 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-[var(--primary-500)]/10 transition-all duration-500"></div>

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        'w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-lg transition-transform group-hover:scale-110 duration-500',
                                        industryColors[co.industry] || 'bg-slate-600 shadow-slate-600/20'
                                    )}>
                                        {co.name[0]}
                                    </div>
                                    <div>
                                        <p className="font-bold text-lg text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors">{co.name}</p>
                                        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wider">{co.industry}</p>
                                    </div>
                                </div>
                                {isMounted && (
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                        <Can permission="crm.companies.edit">
                                            <button onClick={() => handleEdit(co)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-[var(--surface-overlay)] text-[var(--text-muted)] hover:text-[var(--primary-500)] border border-[var(--border)] transition-all shadow-xl active:scale-90" title="Modify Node"><Edit size={16} /></button>
                                        </Can>
                                        <Can permission="crm.companies.delete">
                                            <button onClick={() => handleDelete(co._id)} className="h-10 w-10 flex items-center justify-center rounded-xl bg-rose-500/10 text-[var(--text-muted)] hover:text-rose-500 border border-rose-500/10 transition-all shadow-xl active:scale-90" title="Purge Record"><Trash2 size={16} /></button>
                                        </Can>
                                    </div>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4 text-sm relative z-10">
                                <div className="bg-[var(--surface-overlay)]/30 p-3 rounded-xl border border-[var(--border)]/50 hover:border-[var(--border)] transition-colors">
                                    <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest mb-1">Revenue</p>
                                    <p className="font-bold text-[var(--text-primary)] text-base">{formatCurrency(co.revenue)}</p>
                                </div>
                                <div className="bg-[var(--surface-overlay)]/30 p-3 rounded-xl border border-[var(--border)]/50 hover:border-[var(--border)] transition-colors">
                                    <p className="text-[var(--text-muted)] text-[10px] uppercase font-bold tracking-widest mb-1">Size</p>
                                    <p className="font-bold text-[var(--text-primary)] text-base">{co.size || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-6 pt-6 border-t border-[var(--border)] flex items-center justify-between relative z-10">
                                <a
                                    href={`https://${co.website}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary-500)] hover:text-[var(--primary-600)] transition-colors group/link"
                                >
                                    <Globe size={14} className="group-hover/link:rotate-12 transition-transform" />
                                    {co.website}
                                    <ExternalLink size={10} className="opacity-0 group-hover/link:opacity-100 transition-all" />
                                </a>
                                <div className="flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                    <span className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Active Account</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
