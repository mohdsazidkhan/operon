'use client';

import { useState, useEffect } from 'react';
import { Building2, Globe, Mail, Phone, MapPin, Upload, Save, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

const inputCls = 'w-full px-3 py-2.5 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all';

export default function OrganizationSettingsPage() {
    const [form, setForm] = useState({
        name: '', industry: '', website: '', email: '', phone: '', size: '',
        address: { street: '', city: '', state: '', country: '', zip: '' },
        timezone: 'UTC', currency: 'USD', fiscalYearStart: '01',
        logo: '', description: '',
    });
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch('/api/organization');
                const data = await res.json();
                if (data.success && data.data) {
                    setForm(prev => ({ ...prev, ...data.data, address: { ...prev.address, ...data.data.address } }));
                }
            } catch { }
            finally { setLoading(false); }
        })();
    }, []);

    const handleSave = async (e) => {
        e?.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/organization', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) toast.success('Organization settings saved!');
            else toast.error(data.message);
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    const set = (key, val) => setForm(p => ({ ...p, [key]: val }));
    const setAddr = (key, val) => setForm(p => ({ ...p, address: { ...p.address, [key]: val } }));

    const TIMEZONES = ['UTC', 'America/New_York', 'America/Chicago', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris', 'Asia/Kolkata', 'Asia/Singapore', 'Australia/Sydney'];
    const CURRENCIES = ['USD', 'EUR', 'GBP', 'INR', 'AUD', 'CAD', 'JPY', 'CNY', 'AED'];
    const INDUSTRIES = ['Technology', 'Finance', 'Healthcare', 'Education', 'Manufacturing', 'Retail', 'Real Estate', 'Consulting', 'Media', 'Other'];
    const SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'];
    const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    if (loading) return <div className="animate-pulse space-y-6"><div className="h-24 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl" /><div className="h-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl" /></div>;

    const SectionCard = ({ title, icon: Icon, children }) => (
        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
                <div className="p-2 rounded-xl bg-[var(--primary-500)]/10 text-[var(--primary-500)]"><Icon size={16} /></div>
                <h2 className="font-bold text-[var(--text-primary)]">{title}</h2>
            </div>
            {children}
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Organization Settings</h1>
                    <p className="text-[var(--text-muted)] text-sm">Manage your organization profile and preferences</p>
                </div>
                <button onClick={handleSave} disabled={saving}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20 disabled:opacity-50">
                    <Save size={16} /> {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <form onSubmit={handleSave} className="space-y-6">
                {/* Basic Info */}
                <SectionCard title="Company Information" icon={Building2}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Company Name *</label>
                            <input required className={cn(inputCls, 'mt-1')} value={form.name} onChange={e => set('name', e.target.value)} placeholder="Acme Corp" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Industry</label>
                            <select className={cn(inputCls, 'mt-1')} value={form.industry} onChange={e => set('industry', e.target.value)}>
                                <option value="">Select industry...</option>
                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Company Size</label>
                            <select className={cn(inputCls, 'mt-1')} value={form.size} onChange={e => set('size', e.target.value)}>
                                <option value="">Select size...</option>
                                {SIZES.map(s => <option key={s} value={s}>{s} employees</option>)}
                            </select>
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Description</label>
                            <textarea className={cn(inputCls, 'mt-1')} rows={3} value={form.description} onChange={e => set('description', e.target.value)} placeholder="What does your company do?" />
                        </div>
                    </div>
                </SectionCard>

                {/* Contact Info */}
                <SectionCard title="Contact Details" icon={Phone}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Email</label>
                            <input type="email" className={cn(inputCls, 'mt-1')} value={form.email} onChange={e => set('email', e.target.value)} placeholder="hello@company.com" />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Phone</label>
                            <input type="tel" className={cn(inputCls, 'mt-1')} value={form.phone} onChange={e => set('phone', e.target.value)} placeholder="+1 555 0000" />
                        </div>
                        <div className="sm:col-span-2">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Website</label>
                            <input type="url" className={cn(inputCls, 'mt-1')} value={form.website} onChange={e => set('website', e.target.value)} placeholder="https://yourcompany.com" />
                        </div>
                    </div>
                </SectionCard>

                {/* Address */}
                <SectionCard title="Office Address" icon={MapPin}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="sm:col-span-2">
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Street Address</label>
                            <input className={cn(inputCls, 'mt-1')} value={form.address.street} onChange={e => setAddr('street', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">City</label>
                            <input className={cn(inputCls, 'mt-1')} value={form.address.city} onChange={e => setAddr('city', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">State / Province</label>
                            <input className={cn(inputCls, 'mt-1')} value={form.address.state} onChange={e => setAddr('state', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Country</label>
                            <input className={cn(inputCls, 'mt-1')} value={form.address.country} onChange={e => setAddr('country', e.target.value)} />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">ZIP / Postal Code</label>
                            <input className={cn(inputCls, 'mt-1')} value={form.address.zip} onChange={e => setAddr('zip', e.target.value)} />
                        </div>
                    </div>
                </SectionCard>

                {/* Regional */}
                <SectionCard title="Regional Settings" icon={Globe}>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Timezone</label>
                            <select className={cn(inputCls, 'mt-1')} value={form.timezone} onChange={e => set('timezone', e.target.value)}>
                                {TIMEZONES.map(t => <option key={t} value={t}>{t}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Default Currency</label>
                            <select className={cn(inputCls, 'mt-1')} value={form.currency} onChange={e => set('currency', e.target.value)}>
                                {CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wide">Fiscal Year Start</label>
                            <select className={cn(inputCls, 'mt-1')} value={form.fiscalYearStart} onChange={e => set('fiscalYearStart', e.target.value)}>
                                {MONTHS.map((m, i) => <option key={i} value={String(i + 1).padStart(2, '0')}>{m}</option>)}
                            </select>
                        </div>
                    </div>
                </SectionCard>
            </form>
        </div>
    );
}
