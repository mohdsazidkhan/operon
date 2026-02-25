'use client';

import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, MapPin, Users, Clock, Settings, Search } from 'lucide-react';
import { useState, useEffect } from 'react';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1));
    const [selectedDay, setSelectedDay] = useState(15);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

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
            toast.error('Temporal link failure: Could not retrieve event stream');
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

    const handleCreateEvent = async () => {
        const title = prompt('INITIALIZE NEW CHRONOLOGICAL CYCLE (Event Title):');
        if (!title) return;

        try {
            const res = await fetch('/api/events', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title,
                    startDate: new Date(year, month, selectedDay),
                    type: 'event',
                    color: 'bg-primary-500',
                    shadow: 'shadow-primary-500/20'
                })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Cycle recorded successfully');
                fetchEvents();
            }
        } catch (err) {
            toast.error('Failed to record new cycle');
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Temporal Sync Engine</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <CalendarIcon size={12} className="text-primary-500" />
                        Chronological Integrity Verified • Mars Standard Time
                    </p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={handleCreateEvent}
                        className="h-14 px-8 rounded-2xl bg-primary-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20 hover:scale-105 transition-all flex items-center gap-3"
                    >
                        <Plus size={18} /> Record New Cycle
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
                {/* Main Temporal Grid */}
                <div className="xl:col-span-3 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden p-8">
                    <div className="flex items-center justify-between mb-10">
                        <div className="flex items-center gap-6">
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic">{MONTHS[month]} <span className="text-slate-700 not-italic ml-2">{year}</span></h2>
                            <div className="flex bg-slate-950 border border-slate-800 p-1 rounded-xl">
                                <button onClick={() => shiftMonth(-1)} className="p-2.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-white transition-all"><ChevronLeft size={20} /></button>
                                <button onClick={() => shiftMonth(1)} className="p-2.5 rounded-lg hover:bg-slate-900 text-slate-500 hover:text-white transition-all"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 p-1 bg-slate-950/50 border border-slate-800 rounded-2xl">
                            {['Month', 'Week', 'Day'].map(view => (
                                <button key={view} className={cn('px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all', view === 'Month' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-600 hover:text-slate-400')}>{view}</button>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-7 gap-px rounded-3xl overflow-hidden bg-slate-800/50 p-px">
                        {DAYS.map(d => (
                            <div key={d} className="bg-slate-950 py-6 text-center text-[10px] font-black text-slate-600 uppercase tracking-[0.3em]">{d}</div>
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
                                        'min-h-[140px] bg-slate-900/40 p-4 transition-all relative group',
                                        day ? 'cursor-pointer hover:bg-slate-800/40' : 'bg-slate-950/20',
                                        isSelected && 'ring-2 ring-primary-500/50 bg-primary-500/5 inset-0 z-10'
                                    )}
                                >
                                    {day && (
                                        <>
                                            <div className="flex items-center justify-between mb-3">
                                                <span className={cn(
                                                    'text-xs font-black tracking-tight flex items-center justify-center w-8 h-8 rounded-xl transition-all',
                                                    activeDay ? 'bg-primary-500 text-white shadow-xl shadow-primary-500/20' : isSelected ? 'bg-white text-slate-950' : 'text-slate-600 group-hover:text-slate-400'
                                                )}>{day}</span>
                                                {dayEvents?.length > 0 && <div className="w-1.5 h-1.5 rounded-full animate-pulse bg-primary-500"></div>}
                                            </div>
                                            {dayEvents?.map(event => (
                                                <div key={event._id} className={cn('p-2.5 rounded-xl text-[9px] font-black text-white uppercase tracking-wider leading-tight border transition-transform group-hover:scale-105 mb-1', event.color || 'bg-primary-500', event.shadow || 'shadow-primary-500/20', 'border-white/5')}>
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
                    <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            Upcoming Flux
                        </h3>
                        <div className="space-y-4">
                            {loading ? (
                                <div className="py-12 text-center text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] animate-pulse">Decrypting Flux...</div>
                            ) : events.length === 0 ? (
                                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest text-center py-8 italic">No imminent events detected</p>
                            ) : events.slice(0, 5).map(e => (
                                <div key={e._id} className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group/item">
                                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover/item:scale-110', e.color || 'bg-primary-500', e.shadow || 'shadow-primary-500/20')}>
                                        <span className="text-sm font-black text-white italic">{new Date(e.startDate).getDate()}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover/item:text-primary-400 transition-colors">{e.title}</p>
                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic">{e.startTime || 'All Day'}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <button className="w-full mt-8 py-5 border border-slate-800 rounded-[2rem] text-[9px] font-black text-slate-700 uppercase tracking-[0.3em] hover:text-white hover:border-slate-600 transition-all">
                            View Vector Map
                        </button>
                    </div>

                    {/* Tactical Search */}
                    <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-6">Archive Query</h3>
                        <div className="relative group">
                            <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-primary-500 transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all"
                                placeholder="QUERY EVENT HASH..."
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
