'use client';

import { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, MapPin, Users, Clock, Settings, Search } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const eventLog = [
    { id: 1, title: 'Neural Pipeline Audit', date: 15, time: '10:00 AM', color: 'bg-primary-500', shadow: 'shadow-primary-500/20' },
    { id: 2, title: 'Q1 Strategy Vectoring', date: 18, time: '02:00 PM', color: 'bg-indigo-500', shadow: 'shadow-indigo-500/20' },
    { id: 3, title: 'Personnel Sync Protocol', date: 20, time: '11:30 AM', color: 'bg-emerald-500', shadow: 'shadow-emerald-500/20' },
    { id: 4, title: 'Capital Alloc. Review', date: 22, time: '09:00 AM', color: 'bg-amber-500', shadow: 'shadow-amber-500/20' },
    { id: 5, title: 'Asset Scaling Demo', date: 25, time: '04:30 PM', color: 'bg-rose-500', shadow: 'shadow-rose-500/20' },
];

export default function CalendarPage() {
    const [currentDate, setCurrentDate] = useState(new Date(2024, 2, 1));
    const [selectedDay, setSelectedDay] = useState(15);

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = Array.from({ length: 42 }, (_, i) => {
        const day = i - firstDay + 1;
        return day > 0 && day <= daysInMonth ? day : null;
    });

    const shiftMonth = (delta) => {
        setCurrentDate(new Date(year, month + delta, 1));
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
                    <button className="h-14 px-8 rounded-2xl bg-primary-500 text-white font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-primary-500/20 hover:scale-105 transition-all flex items-center gap-3">
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
                            const event = day && eventLog.find(e => e.date === day);
                            const activeDay = day === 15;
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
                                                {event && <div className={cn('w-1.5 h-1.5 rounded-full animate-pulse', event.color)}></div>}
                                            </div>
                                            {event && (
                                                <div className={cn('p-2.5 rounded-xl text-[9px] font-black text-white uppercase tracking-wider leading-tight border transition-transform group-hover:scale-105', event.color, event.shadow, 'border-white/5')}>
                                                    {event.title}
                                                </div>
                                            )}
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
                            {eventLog.map(e => (
                                <div key={e.id} className="flex items-center gap-5 p-5 rounded-[2rem] bg-slate-950 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer group/item">
                                    <div className={cn('w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-2xl transition-transform group-hover/item:scale-110', e.color, e.shadow)}>
                                        <span className="text-sm font-black text-white italic">{e.date}</span>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight truncate group-hover/item:text-primary-400 transition-colors">{e.title}</p>
                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic">{e.time}</p>
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
                                className="w-full pl-12 pr-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-1 focus:ring-primary-500/20 transition-all"
                                placeholder="QUERY EVENT HASH..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-3 mt-6">
                            {['Audit', 'Recruit', 'Sales', 'Fiscal'].map(tag => (
                                <button key={tag} className="py-3 px-4 rounded-xl bg-slate-900 border border-slate-800 text-[9px] font-black text-slate-600 uppercase tracking-widest hover:text-white transition-all ring-primary-500/10 hover:ring-2">#{tag}</button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
