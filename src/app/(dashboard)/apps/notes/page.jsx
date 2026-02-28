'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, StickyNote, Pin, Archive, Trash2, Edit2, Check } from 'lucide-react';
import { cn, formatRelativeTime } from '@/lib/utils';
import toast from 'react-hot-toast';

const NOTE_COLORS = {
    default: { bg: 'bg-[var(--card-bg)]', border: 'border-[var(--card-border)]', dot: 'bg-slate-400' },
    yellow: { bg: 'bg-amber-50 dark:bg-amber-950/30', border: 'border-amber-200 dark:border-amber-800', dot: 'bg-amber-400' },
    green: { bg: 'bg-emerald-50 dark:bg-emerald-950/30', border: 'border-emerald-200 dark:border-emerald-800', dot: 'bg-emerald-400' },
    blue: { bg: 'bg-blue-50 dark:bg-blue-950/30', border: 'border-blue-200 dark:border-blue-800', dot: 'bg-blue-400' },
    purple: { bg: 'bg-purple-50 dark:bg-purple-950/30', border: 'border-purple-200 dark:border-purple-800', dot: 'bg-purple-400' },
    red: { bg: 'bg-rose-50 dark:bg-rose-950/30', border: 'border-rose-200 dark:border-rose-800', dot: 'bg-rose-400' },
};

const DUMMY_OWNER = '000000000000000000000001';

export default function NotesPage() {
    const [notes, setNotes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editNote, setEditNote] = useState(null);
    const [newTitle, setNewTitle] = useState('');
    const [newContent, setNewContent] = useState('');
    const [newColor, setNewColor] = useState('default');
    const [showCompose, setShowCompose] = useState(false);
    const [saving, setSaving] = useState(false);

    const fetchNotes = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/notes?search=${search}`);
            const data = await res.json();
            if (data.success) setNotes(data.data || []);
        } catch { }
        finally { setLoading(false); }
    };

    useEffect(() => { fetchNotes(); }, [search]);

    const handleSave = async () => {
        if (!newTitle.trim()) { toast.error('Title required'); return; }
        setSaving(true);
        try {
            const method = editNote ? 'PUT' : 'POST';
            const url = editNote ? `/api/notes/${editNote._id}` : '/api/notes';
            const body = { title: newTitle, content: newContent, color: newColor, owner: DUMMY_OWNER };
            const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
            const data = await res.json();
            if (data.success) {
                toast.success(editNote ? 'Note updated!' : 'Note saved!');
                setShowCompose(false); setEditNote(null); setNewTitle(''); setNewContent(''); setNewColor('default');
                fetchNotes();
            }
        } catch { toast.error('Failed'); }
        finally { setSaving(false); }
    };

    const handleDelete = async (id) => {
        if (!confirm('Delete this note?')) return;
        await fetch(`/api/notes/${id}`, { method: 'DELETE' });
        toast.success('Deleted'); fetchNotes();
    };

    const togglePin = async (note) => {
        await fetch(`/api/notes/${note._id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...note, isPinned: !note.isPinned }) });
        fetchNotes();
    };

    const startEdit = (note) => {
        setNewTitle(note.title); setNewContent(note.content || ''); setNewColor(note.color || 'default');
        setEditNote(note); setShowCompose(true);
    };

    const pinned = notes.filter(n => n.isPinned);
    const regular = notes.filter(n => !n.isPinned);

    const NoteCard = ({ note }) => {
        const cfg = NOTE_COLORS[note.color] || NOTE_COLORS.default;
        return (
            <div className={cn('rounded-2xl border p-4 shadow-sm hover:shadow-md transition-all group relative', cfg.bg, cfg.border)}>
                <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => togglePin(note)} className={cn('p-1.5 rounded-lg transition-all', note.isPinned ? 'text-amber-500 bg-amber-500/20' : 'text-[var(--text-muted)] hover:text-amber-500 hover:bg-amber-500/10')}><Pin size={13} /></button>
                    <button onClick={() => startEdit(note)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--primary-500)] hover:bg-[var(--primary-500)]/10 transition-all"><Edit2 size={13} /></button>
                    <button onClick={() => handleDelete(note._id)} className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-rose-500 hover:bg-rose-500/10 transition-all"><Trash2 size={13} /></button>
                </div>
                <h3 className="font-semibold text-[var(--text-primary)] text-sm pr-20 mb-2">{note.title}</h3>
                {note.content && <p className="text-xs text-[var(--text-secondary)] leading-relaxed line-clamp-6">{note.content}</p>}
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-black/5 dark:border-white/5">
                    <div className={cn('w-2 h-2 rounded-full', cfg.dot)} />
                    <span className="text-[10px] text-[var(--text-muted)]">{formatRelativeTime(note.updatedAt)}</span>
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Compose panel */}
            {showCompose && (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-5 shadow-xl">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-[var(--text-primary)]">{editNote ? 'Edit Note' : 'New Note'}</h2>
                        <div className="flex gap-1.5">
                            {Object.keys(NOTE_COLORS).map(c => (
                                <button key={c} onClick={() => setNewColor(c)}
                                    className={cn('w-5 h-5 rounded-full border-2 transition-all', NOTE_COLORS[c].dot, newColor === c ? 'border-[var(--text-primary)] scale-110' : 'border-transparent')} />
                            ))}
                        </div>
                    </div>
                    <input placeholder="Note title..." value={newTitle} onChange={e => setNewTitle(e.target.value)}
                        className="w-full px-3 py-2 mb-2 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 transition-all font-semibold" />
                    <textarea placeholder="Write your note..." value={newContent} onChange={e => setNewContent(e.target.value)} rows={5}
                        className="w-full px-3 py-2 mb-3 rounded-xl text-sm bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 transition-all resize-none" />
                    <div className="flex gap-2 justify-end">
                        <button onClick={() => { setShowCompose(false); setEditNote(null); setNewTitle(''); setNewContent(''); setNewColor('default'); }}
                            className="px-3 py-2 rounded-xl text-sm border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all">Cancel</button>
                        <button onClick={handleSave} disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white transition-all disabled:opacity-50">
                            <Check size={14} /> {saving ? 'Saving...' : 'Save Note'}
                        </button>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)]">Notes</h1>
                    <p className="text-[var(--text-muted)] text-sm mt-0.5">{notes.length} notes · {pinned.length} pinned</p>
                </div>
                <button onClick={() => { setShowCompose(true); setEditNote(null); setNewTitle(''); setNewContent(''); setNewColor('default'); }}
                    className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                    <Plus size={16} /> New Note
                </button>
            </div>

            {/* Search */}
            <div className="relative max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search notes..."
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm bg-[var(--card-bg)] border border-[var(--border)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)] transition-all" />
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-4 animate-pulse h-32" />)}
                </div>
            ) : notes.length === 0 ? (
                <div className="bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl p-16 text-center">
                    <StickyNote size={40} className="mx-auto text-[var(--text-muted)] opacity-40 mb-4" />
                    <p className="text-[var(--text-muted)] font-medium">No notes yet</p>
                    <p className="text-[var(--text-muted)] text-sm mt-1">Create your first note above</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {pinned.length > 0 && (
                        <div>
                            <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider flex items-center gap-1.5 mb-3"><Pin size={12} /> Pinned</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {pinned.map(note => <NoteCard key={note._id} note={note} />)}
                            </div>
                        </div>
                    )}
                    {regular.length > 0 && (
                        <div>
                            {pinned.length > 0 && <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-3">Other Notes</p>}
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {regular.map(note => <NoteCard key={note._id} note={note} />)}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
