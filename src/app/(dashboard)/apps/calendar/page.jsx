'use client';

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, MapPin, Users, Clock, Settings, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';
import Modal, { FormField, FormActions, inputCls } from '@/components/ui/Modal';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const EMPTY_EVENT = { title: '', type: 'meeting', location: '', startTime: '09:00 AM', description: '' };

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDay, setSelectedDay] = useState(15);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [showAdd, setShowAdd] = useState(false);
    const [saving, setSaving] = useState(false);
    const [form, setForm] = useState(EMPTY_EVENT);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = Array.from({ length: 42 }, (_, i) => {
        const day = i - firstDay + 1;
        return day > 0 && day <= daysInMonth ? day : null;
    });

    const fetchEvents = async () => {
        try {
            const res = await fetch(`/api/events?search=${search}`);
            const data = await res.json();
            if (data.success) {
                setEvents(data.data);
            }
        } catch (err) {
            toast.error('Could not load events. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();
    }, [search]);

    const shiftMonth = (delta) => {
        setCurrentDate(new Date(year, month + delta, 1));
    };

    const handleCreateEvent = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...form,
                    startDate: new Date(year, month, selectedDay),
                    color: 'bg-[var(--primary-500)]',
                    shadow: 'shadow-purple-500/20'
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Event added!');
                setShowAdd(false);
                setForm(EMPTY_EVENT);
                fetchEvents();
            } else {
                toast.error(data.message || 'Failed to add event');
            }
        } catch { toast.error('Failed to add event'); }
        finally { setSaving(false); }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Add Event Modal */}
            <Modal isOpen={showAdd} onClose={() => setShowAdd(false)} title="Add New Event" size="md">
                <form onSubmit={handleCreateEvent} className="space-y-4">
                    <FormField label="Event Title" required>
                        <input required className={inputCls} placeholder="e.g. Q1 Business Review" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                    </FormField>
                    <div className="grid grid-cols-2 gap-4">
                        <FormField label="Type">
                            <select className={inputCls} value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                                {['meeting', 'social', 'launch', 'hr', 'other'].map(t => (
                                    <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                                ))}
                            </select>
                        </FormField>
                        <FormField label="Time">
                            <input className={inputCls} placeholder="09:00 AM" value={form.startTime} onChange={e => setForm(p => ({ ...p, startTime: e.target.value }))} />
                        </FormField>
                    </div>
                    <FormField label="Location">
                        <input className={inputCls} placeholder="Conference Room A or Virtual" value={form.location} onChange={e => setForm(p => ({ ...p, location: e.target.value }))} />
                    </FormField>
                    <FormField label="Description">
                        <textarea rows={2} className={inputCls + " resize-none"} placeholder="Event details..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </FormField>
                    <p className="text-xs text-[var(--text-muted)]">Date: <span className="font-semibold text-[var(--text-primary)]">{MONTHS[month]} {selectedDay}, {year}</span></p>
                    <FormActions onClose={() => setShowAdd(false)} loading={saving} submitLabel="Add Event" />
                </form>
            </Modal>

            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">

                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Calendar</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <CalendarIcon size={12} className="text-[var(--primary-500)]" />
                        View and manage your schedule and events
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => setShowAdd(true)}
                        className="h-14 px-8 rounded-2xl bg-[var(--primary-500)] text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-[var(--primary-500)]/20 hover:scale-105 transition-all flex items-center gap-3"
                    >
                        <Plus size={18} /> Add Event
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Temporal Grid */}
                <div className="xl:col-span-3 bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">{MONTHS[month]} <span className="text-[var(--text-muted)] not-italic ml-2">{year}</span></h2>
                            <div className="flex bg-[var(--surface-overlay)] border border-[var(--border)] p-1 rounded-xl">
                                <button onClick={() => shiftMonth(-1)} className="p-2.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><ChevronLeft size={20} /></button>
                                <button onClick={() => shiftMonth(1)} className="p-2.5 rounded-lg hover:bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-[var(--surface-overlay)]/50 border border-[var(--border)] rounded-2xl">
                            {['Month', 'Week', 'Day'].map(view => (
                                <button key={view} className={cn('px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', view === 'Month' ? 'bg-[var(--surface-raised)] text-[var(--text-primary)] border border-[var(--border)]' : 'text-[var(--text-muted)] hover:text-[var(--text-secondary)]')}>{view}</button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px rounded-3xl overflow-hidden bg-[var(--border)] p-px">
                        {DAYS.map(d => (
                            <div key={d} className="bg-[var(--surface-overlay)] py-6 text-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">{d}</div>
                        ))}
                        {cells.map((day, i) => {
                            const dayEvents = day && events.filter(e => {
                                const d = new Date(e.startDate);
                                return d.getDate() === day && d.getMonth() === month && d.getFullYear() === year;
                            });
                            const activeDay = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
                            const isSelected = day === selectedDay;

                            return (
                                <div
                                    key={i}
                                    onClick={() => day && setSelectedDay(day)}
                                    className={cn(
                                        'min-h-[140px] bg-[var(--card-bg)] p-4 transition-all relative group',
                                        day ? 'cursor-pointer hover:bg-[var(--surface-overlay)]' : 'bg-[var(--surface-overlay)]/20',
                                        isSelected && 'ring-2 ring-[var(--primary-500)]/50 bg-[var(--primary-500)]/5 inset-0 z-10'
                                    )}
                                >
                                    {day && (
                                        <>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={cn(
                                                    'text-xs font-black tracking-tight flex items-center justify-center w-8 h-8 rounded-xl transition-all',
                                                    activeDay ? 'bg-[var(--primary-500)] text-white shadow-xl shadow-[var(--primary-500)]/20' : isSelected ? 'bg-[var(--text-primary)] text-[var(--surface)]' : 'text-[var(--text-muted)] group-hover:text-[var(--text-secondary)]'
                                                )}>{day}</span>
                                                {dayEvents?.length > 0 && <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-[var(--primary-500)]"></div>}
                                            </div>
                                            {dayEvents?.map(event => (
                                                <div key={event._id} className={cn('p-2.5 rounded-xl text-[9px] font-black text-white uppercase tracking-wider leading-tight border transition-transform group-hover:scale-105 mb-1', event.color || 'bg-[var(--primary-500)]', event.shadow || 'shadow-[var(--primary-500)]/20', 'border-white/5')}>
                                                    {event.title}
                                                </div>
                                            ))}
                                        </>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Chronology Sidebar */}
                <div className="space-y-8">
                    {/* Event Pulse */}
                    <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--primary-500)]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            Upcoming Events
                        </h3>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-12 text-center text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] animate-pulse">Decrypting Flux...</div>
                            ) : events.length === 0 ? (
                                <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest text-center py-8 italic">No upcoming events found</p>
                            ) : events.slice(0, 5).map(e => (
                                <div key={e._id} className="flex items-center gap-5 p-5 rounded-[2rem] bg-[var(--surface-overlay)] border border-[var(--border)] hover:border-[var(--primary-500)]/40 transition-all cursor-pointer group/item">
                                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover/item:scale-110', e.color || 'bg-[var(--primary-500)]', e.shadow || 'shadow-[var(--primary-500)]/20')}>
                                        <span className="text-sm font-black text-white italic">{new Date(e.startDate).getDate()}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight truncate group-hover/item:text-[var(--primary-500)] transition-colors">{e.title}</p>
                                        <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">{e.startTime || 'All Day'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-5 border border-[var(--border)] rounded-[2rem] text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em] hover:bg-[var(--surface-overlay)] hover:text-[var(--text-primary)] transition-all">
                            View All Events
                        </button>
                    </div>

                    {/* Tactical Search */}
                    <div className="bg-[var(--surface-overlay)]/50 backdrop-blur-3xl rounded-[3rem] border border-[var(--border)] p-8 shadow-2xl">
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-6">Search Events</h3>
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] group-hover:text-[var(--primary-500)] transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[9px] font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary-500)]/20 transition-all placeholder:text-[var(--text-muted)]"
                                placeholder="Search events..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
