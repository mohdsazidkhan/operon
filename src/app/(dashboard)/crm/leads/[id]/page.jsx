'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ArrowLeft, User, Phone, Mail, Building2, Tag, TrendingUp, Plus,
    MessageSquare, Calendar, Star, Edit, Save, X, Check, AlertCircle
} from 'lucide-react';
import { cn, formatDate, formatCurrency, formatRelativeTime, getStatusColor } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_OPTS = ['new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'];
const SOURCE_OPTS = ['website', 'referral', 'linkedin', 'email', 'cold_call', 'event', 'other'];

const STATUS_COLORS = {
    new: 'text-purple-500 bg-purple-500/10 border-purple-500/20',
    contacted: 'text-blue-500 bg-blue-500/10 border-blue-500/20',
    qualified: 'text-indigo-500 bg-indigo-500/10 border-indigo-500/20',
    proposal: 'text-cyan-500 bg-cyan-500/10 border-cyan-500/20',
    negotiation: 'text-amber-500 bg-amber-500/10 border-amber-500/20',
    won: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20',
    lost: 'text-rose-500 bg-rose-500/10 border-rose-500/20',
};

export default function LeadDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [lead, setLead] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [form, setForm] = useState({});
    const [saving, setSaving] = useState(false);
    const [noteText, setNoteText] = useState('');
    const [addingNote, setAddingNote] = useState(false);

    const fetchLead = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/leads/${id}`);
            const data = await res.json();
            if (data.success) { setLead(data.data); setForm(data.data); }
            else toast.error('Lead not found');
        } catch { toast.error('Failed to load'); }
        finally { setLoading(false); }
    };

    useEffect(() => { if (id) fetchLead(); }, [id]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form)
            });
            const data = await res.json();
            if (data.success) { setLead(data.data); setEditing(false); toast.success('Lead updated!'); }
            else toast.error(data.message);
        } catch { toast.error('Failed to save'); }
        finally { setSaving(false); }
    };

    const addNote = async () => {
        if (!noteText.trim()) return;
        setAddingNote(true);
        try {
            const updated = { ...lead, notes: [...(lead.notes || []), { content: noteText, createdAt: new Date() }] };
            const res = await fetch(`/api/leads/${id}`, {
                method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated)
            });
            const data = await res.json();
            if (data.success) { setLead(data.data); setNoteText(''); toast.success('Note added'); }
        } catch { toast.error('Failed'); }
        finally { setAddingNote(false); }
    };

    const addActivity = async (type) => {
        const description = prompt(`Add ${type} note:`);
        if (!description) return;
        const updated = { ...lead, activities: [...(lead.activities || []), { type, description, date: new Date() }] };
        const res = await fetch(`/api/leads/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(updated) });
        const data = await res.json();
        if (data.success) { setLead(data.data); toast.success('Activity logged'); }
    };

    const inputCls = 'w-full px-3 py-2 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all';

    if (loading) return (
        <div className="animate-pulse space-y-6">
            <div className="h-8 w-48 bg-[var(--surface-overlay)] rounded-xl" />
            <div className="h-64 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl" />
        </div>
    );

    if (!lead) return (
        <div className="flex flex-col items-center justify-center py-24 gap-4">
            <AlertCircle size={40} className="text-[var(--text-muted)]" />
            <p className="text-[var(--text-muted)]">Lead not found</p>
            <button onClick={() => router.back()} className="text-sm text-[var(--primary-500)] underline">Go back</button>
        </div>
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-wrap items-center gap-4 justify-between">
                <div className="flex items-center gap-3">
                    <button onClick={() => router.back()} className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-all">
                        <ArrowLeft size={16} />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text-primary)]">{lead.name}</h1>
                        <p className="text-[var(--text-muted)] text-sm">{lead.company} · {lead.position}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn('text-xs font-bold uppercase px-3 py-1.5 rounded-full border', STATUS_COLORS[lead.status] || '')}>
                        {lead.status}
                    </span>
                    {editing ? (
                        <div className="flex gap-2">
                            <button onClick={() => { setEditing(false); setForm(lead); }} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all flex items-center gap-1"><X size={14} /> Cancel</button>
                            <button onClick={handleSave} disabled={saving} className="px-3 py-2 rounded-xl bg-[var(--primary-500)] text-white text-sm font-semibold flex items-center gap-1 transition-all disabled:opacity-50"><Save size={14} /> {saving ? 'Saving...' : 'Save'}</button>
                        </div>
                    ) : (
                        <button onClick={() => setEditing(true)} className="px-3 py-2 rounded-xl border border-[var(--border)] text-sm text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all flex items-center gap-1"><Edit size={14} /> Edit</button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main info */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Card */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Lead Information</h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {editing ? (
                                <>
                                    {[
                                        { label: 'Full Name', key: 'name', type: 'text' },
                                        { label: 'Email', key: 'email', type: 'email' },
                                        { label: 'Phone', key: 'phone', type: 'tel' },
                                        { label: 'Company', key: 'company', type: 'text' },
                                        { label: 'Position', key: 'position', type: 'text' },
                                        { label: 'Industry', key: 'industry', type: 'text' },
                                    ].map(f => (
                                        <div key={f.key}>
                                            <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">{f.label}</label>
                                            <input type={f.type} className={cn(inputCls, 'mt-1')} value={form[f.key] || ''}
                                                onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))} />
                                        </div>
                                    ))}
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Status</label>
                                        <select className={cn(inputCls, 'mt-1')} value={form.status} onChange={e => setForm(p => ({ ...p, status: e.target.value }))}>
                                            {STATUS_OPTS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Source</label>
                                        <select className={cn(inputCls, 'mt-1')} value={form.source} onChange={e => setForm(p => ({ ...p, source: e.target.value }))}>
                                            {SOURCE_OPTS.map(s => <option key={s} value={s}>{s.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Deal Value ($)</label>
                                        <input type="number" className={cn(inputCls, 'mt-1')} value={form.value || 0}
                                            onChange={e => setForm(p => ({ ...p, value: +e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Lead Score (0–100)</label>
                                        <input type="number" min="0" max="100" className={cn(inputCls, 'mt-1')} value={form.score || 0}
                                            onChange={e => setForm(p => ({ ...p, score: +e.target.value }))} />
                                    </div>
                                    <div>
                                        <label className="text-xs font-semibold text-[var(--text-muted)] uppercase">Next Follow-up</label>
                                        <input type="date" className={cn(inputCls, 'mt-1')} value={form.nextFollowUp ? form.nextFollowUp.slice(0, 10) : ''}
                                            onChange={e => setForm(p => ({ ...p, nextFollowUp: e.target.value }))} />
                                    </div>
                                </>
                            ) : (
                                <>
                                    {[
                                        { label: 'Email', icon: Mail, value: lead.email },
                                        { label: 'Phone', icon: Phone, value: lead.phone },
                                        { label: 'Company', icon: Building2, value: lead.company },
                                        { label: 'Position', icon: User, value: lead.position },
                                        { label: 'Industry', icon: Tag, value: lead.industry },
                                        { label: 'Source', icon: TrendingUp, value: lead.source?.replace('_', ' ') },
                                    ].map(f => (
                                        <div key={f.label} className="flex items-start gap-3">
                                            <div className="p-2 rounded-lg bg-[var(--surface-overlay)] text-[var(--text-muted)] flex-shrink-0 mt-0.5"><f.icon size={14} /></div>
                                            <div>
                                                <p className="text-xs text-[var(--text-muted)]">{f.label}</p>
                                                <p className="text-sm font-semibold text-[var(--text-primary)]">{f.value || '—'}</p>
                                            </div>
                                        </div>
                                    ))}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Activities */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Activity Timeline</h2>
                            <div className="flex gap-1">
                                {['call', 'email', 'meeting', 'note'].map(t => (
                                    <button key={t} onClick={() => addActivity(t)}
                                        className="px-2 py-1 text-xs rounded-lg border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:border-[var(--primary-500)] transition-all capitalize">{t}</button>
                                ))}
                            </div>
                        </div>
                        {(!lead.activities || lead.activities.length === 0) ? (
                            <p className="text-sm text-[var(--text-muted)] text-center py-6">No activities yet. Log your first interaction above.</p>
                        ) : (
                            <div className="relative pl-6 space-y-4">
                                <div className="absolute left-2 top-2 bottom-2 w-px bg-[var(--border)]" />
                                {[...lead.activities].reverse().map((act, i) => (
                                    <div key={i} className="relative">
                                        <div className="absolute -left-4 top-1 w-2.5 h-2.5 rounded-full border-2 border-[var(--primary-500)] bg-[var(--card-bg)]" />
                                        <div className="bg-[var(--surface-overlay)] rounded-xl p-3">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-xs font-bold text-[var(--primary-500)] uppercase">{act.type}</span>
                                                <span className="text-xs text-[var(--text-muted)]">{formatRelativeTime(act.date)}</span>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)]">{act.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Notes */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                        <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-4">Notes</h2>
                        <div className="flex gap-2 mb-4">
                            <input value={noteText} onChange={e => setNoteText(e.target.value)}
                                placeholder="Add a note..." onKeyDown={e => e.key === 'Enter' && addNote()}
                                className="flex-1 px-3 py-2 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 transition-all" />
                            <button onClick={addNote} disabled={addingNote || !noteText.trim()}
                                className="px-3 py-2 rounded-xl bg-[var(--primary-500)] text-white text-sm font-semibold transition-all disabled:opacity-40 flex items-center gap-1"><Plus size={14} /></button>
                        </div>
                        <div className="space-y-3">
                            {(!lead.notes || lead.notes.length === 0) ? (
                                <p className="text-sm text-[var(--text-muted)] text-center py-4">No notes yet</p>
                            ) : [...lead.notes].reverse().map((note, i) => (
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
                    {/* Score card */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 text-center">
                        <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Lead Score</p>
                        <div className="relative w-24 h-24 mx-auto mb-3">
                            <svg viewBox="0 0 36 36" className="w-24 h-24 -rotate-90">
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--border)" strokeWidth="2" />
                                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="var(--primary-500)" strokeWidth="2"
                                    strokeDasharray={`${lead.score || 0}, 100`} strokeLinecap="round" />
                            </svg>
                            <span className="absolute inset-0 flex items-center justify-center text-2xl font-black text-[var(--text-primary)]">{lead.score || 0}</span>
                        </div>
                        <p className="text-xs text-[var(--text-muted)]">out of 100</p>
                    </div>

                    {/* Quick stats */}
                    <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 space-y-4">
                        <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">Quick Info</h2>
                        {[
                            { label: 'Deal Value', value: formatCurrency(lead.value || 0) },
                            { label: 'Status', value: lead.status },
                            { label: 'Source', value: lead.source?.replace('_', ' ') || '—' },
                            { label: 'Owner', value: lead.owner?.name || '—' },
                            { label: 'Created', value: formatDate(lead.createdAt) },
                            { label: 'Next Follow-up', value: lead.nextFollowUp ? formatDate(lead.nextFollowUp) : '—' },
                        ].map(s => (
                            <div key={s.label} className="flex items-center justify-between">
                                <span className="text-xs text-[var(--text-muted)]">{s.label}</span>
                                <span className="text-sm font-semibold text-[var(--text-primary)] capitalize">{s.value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Tags */}
                    {lead.tags?.length > 0 && (
                        <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6">
                            <h2 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Tags</h2>
                            <div className="flex flex-wrap gap-2">
                                {lead.tags.map(tag => (
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
