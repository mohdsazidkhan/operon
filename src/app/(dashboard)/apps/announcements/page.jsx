'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Bell, Pin, AlertCircle, Calendar, PartyPopper, FileText, Edit, Trash2, Users } from 'lucide-react';
import { cn, formatDate, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const TYPE_CONFIG = {
    general: { label: 'General', icon: Bell, color: 'text-indigo-500 bg-indigo-500/10', border: 'border-l-indigo-500' },
    urgent: { label: 'Urgent', icon: AlertCircle, color: 'text-rose-500 bg-rose-500/10', border: 'border-l-rose-500' },
    event: { label: 'Event', icon: Calendar, color: 'text-amber-500 bg-amber-500/10', border: 'border-l-amber-500' },
    policy: { label: 'Policy', icon: FileText, color: 'text-purple-500 bg-purple-500/10', border: 'border-l-purple-500' },
    celebration: { label: 'Celebration', icon: PartyPopper, color: 'text-emerald-500 bg-emerald-500/10', border: 'border-l-emerald-500' },
};

const EMPTY_FORM = { title: '', content: '', type: 'general', audience: 'all', audienceValue: '', isPinned: false };

export default function AnnouncementsPage() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [filterType, setFilterType] = useState('all');
    const [showAdd, setShowAdd] = useState(false);
    const [editAnn, setEditAnn] = useState(null);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);

    const fetchAnnouncements = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/announcements?limit=50');
            const data = await res.json();
            if (data.success) setAnnouncements(data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchAnnouncements(); }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const method = editAnn ? 'PUT' : 'POST';
            const url = editAnn ? `/api/announcements/${editAnn._id}` : '/api/announcements';
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) });
            const data = await res.json();
            if (data.success) {
                toast.success(editAnn ? 'Announcement updated!' : 'Announcement posted!');
                setShowAdd(false); setEditAnn(null); setForm(EMPTY_FORM); fetchAnnouncements();
            } else toast.error(data.message);
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this announcement?')) return;
        await fetch(`/api/announcements/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchAnnouncements();
    };

    const togglePin = async (ann) => {
        await fetch(`/api/announcements/${ann._id}`, {
            method: 'PUT', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...ann, isPinned: !ann.isPinned })
        });
        fetchAnnouncements();
    };

    const filtered = announcements.filter(a => {
        const matchType = filterType === 'all' || a.type === filterType;
        const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase());
        return matchType && matchSearch;
    });

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <Modal isOpen={showAdd} onClose={() => { setShowAdd(false); setEditAnn(null); setForm(EMPTY_FORM); }}
                title={editAnn ? 'Edit Announcement' : 'New Announcement'} size="lg">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <FormField label="Title" required>
                        <input required className={inputCls} placeholder="Announcement title..." value={form.title}
                            onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Type">
                            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                {Object.keys(TYPE_CONFIG).map(t => <option key={t} value={t}>{TYPE_CONFIG[t].label}</option>)}
                            </select>
                        </FormField>
                        <FormField label="Audience">
                            <select className={inputCls} value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))}>
                                <option value="all">All Staff</option>
                                <option value="department">Department</option>
                                <option value="role">Role</option>
                            </select>
                        </FormField>
                    </div>
                    <FormField label="Content" required>
                        <textarea required className={inputCls} rows={5} placeholder="Write your announcement..." value={form.content}
                            onChange={e => setForm(p => ({ ...p, content: e.target.value }))} />
                    </FormField>
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input type="checkbox" checked={form.isPinned} onChange={e => setForm(p => ({ ...p, isPinned: e.target.checked }))}
                            className="w-4 h-4 accent-[var(--primary-500)]" />
                        <span className="text-sm text-[var(--text-secondary)]">Pin this announcement</span>
                    </label>
                    <FormActions onClose={() => { setShowAdd(false); setEditAnn(null); setForm(EMPTY_FORM); }}
                        loading={saving} submitLabel={editAnn ? 'Update' : 'Post Announcement'} />
                </form>
            </Modal>

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Announcements</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{announcements.length} announcements · {announcements.filter(a => a.isPinned).length} pinned</p>
                </div>
                <button onClick={() => { setForm(EMPTY_FORM); setEditAnn(null); setShowAdd(true); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> Post Announcement
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search announcements..."
                        className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
                </div>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                    {['all', ...Object.keys(TYPE_CONFIG)].map(t => (
                        <button key={t} onClick={() => setFilterType(t)}
                            className={cn('px-3 py-2 rounded-xl text-xs font-semibold whitespace-nowrap border transition-all',
                                filterType === t ? 'bg-[var(--primary-500)] text-white border-[var(--primary-500)]' : 'bg-[var(--surface-overlay)] text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/40')}>
                            {t === 'all' ? 'All' : TYPE_CONFIG[t]?.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Announcements list */}
            {loading ? (
                <div className="space-y-4">{[1, 2, 3].map(i => <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-6 animate-pulse h-28" />)}</div>
            ) : filtered.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-16 text-center">
                    <Bell size={40} className="mx-auto text-[var(--text-muted)] opacity-40 mb-4" />
                    <p className="text-[var(--text-muted)] font-medium">No announcements</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {filtered.map(ann => {
                        const cfg = TYPE_CONFIG[ann.type] || TYPE_CONFIG.general;
                        const Icon = cfg.icon;
                        return (
                            <div key={ann._id} className={cn('bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-sm border-l-4 transition-all hover:shadow-md group', cfg.border)}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1 min-w-0">
                                        <div className={cn('p-2 rounded-xl flex-shrink-0 mt-0.5', cfg.color)}>
                                            <Icon size={16} />
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2 mb-1">
                                                <h3 className="font-bold text-[var(--text-primary)] text-sm">{ann.title}</h3>
                                                {ann.isPinned && (
                                                    <span className="flex items-center gap-1 text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-full">
                                                        <Pin size={9} /> Pinned
                                                    </span>
                                                )}
                                                <span className={cn('text-[10px] font-bold uppercase px-2 py-0.5 rounded-full', cfg.color)}>{cfg.label}</span>
                                            </div>
                                            <p className="text-sm text-[var(--text-secondary)] leading-relaxed line-clamp-3">{ann.content}</p>
                                            <div className="flex flex-wrap items-center gap-3 mt-3 text-xs text-[var(--text-muted)]">
                                                {ann.authorName && <span className="flex items-center gap-1"><Users size={11} />{ann.authorName}</span>}
                                                <span>{formatRelativeTime(ann.createdAt)}</span>
                                                <span className="flex items-center gap-1"><Users size={11} />{ann.audience === 'all' ? 'All Staff' : ann.audienceValue || ann.audience}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-all">
                                        <button onClick={() => togglePin(ann)} className={cn('p-1.5 rounded-lg transition-all text-[var(--text-muted)]', ann.isPinned ? 'text-amber-500 bg-amber-500/10' : 'hover:text-amber-500 hover:bg-amber-500/10')}><Pin size={14} /></button>
                                        <button onClick={() => { setForm({ title: ann.title, content: ann.content, type: ann.type, audience: ann.audience, audienceValue: ann.audienceValue || '', isPinned: ann.isPinned }); setEditAnn(ann); setShowAdd(true); }}
                                            className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--surface-overlay)] transition-all"><Edit size={14} /></button>
                                        <button onClick={() => handleDelete(ann._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={14} /></button>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
