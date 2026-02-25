'use client';

import { useState, useEffect } from 'react';
import { User, Mail, Shield, Key, Bell, Camera, ChevronRight, CheckCircle2, Globe, Github, Twitter, Linkedin, Briefcase, MapPin, Calendar, Edit3, Save, X, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function ProfilePage() {
    const [mounted, setMounted] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [profile, setProfile] = useState({
        name: 'Sazid Ahmed',
        position: 'System Architect & Founder',
        bio: 'Designing high-velocity neural architectures and decentralized operational frameworks for the next generation of SASS ecosystems.',
        email: 'sazid.operon@neural.io',
        location: 'Dhaka, Sector 9',
        joined: 'Jan 2024',
        dept: 'Core Engineering',
        rank: 'Elite-S'
    });

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return <div className="p-10 text-slate-800 uppercase tracking-widest text-[10px] font-black">Decrypting Identity Profile...</div>;

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-20">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Entity Profile Management</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <User size={12} className="text-primary-500" />
                        Identity Verification Status: Level 5
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className={cn(
                            'h-12 px-8 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3',
                            isEditing ? 'bg-slate-900 border border-slate-800 text-slate-500 hover:text-white' : 'bg-primary-500 text-white shadow-2xl shadow-primary-500/20 hover:scale-105'
                        )}
                    >
                        {isEditing ? <><X size={16} /> Discard Delta</> : <><Edit3 size={16} /> Modify Identity</>}
                    </button>
                    {isEditing && (
                        <button className="h-12 px-8 rounded-2xl bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-3">
                            <Save size={16} /> Save Changes
                        </button>
                    )}
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col - Identity Card */}
                <div className="lg:col-span-1 space-y-8">
                    <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-10 shadow-2xl relative overflow-hidden group text-center">
                        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-primary-500/20 to-transparent"></div>
                        <div className="relative z-10">
                            <div className="relative inline-block mb-8">
                                <div className="w-40 h-40 rounded-[2.5rem] bg-slate-900 p-1 border border-primary-500/30 overflow-hidden shadow-2xl">
                                    <div className="w-full h-full rounded-[2.2rem] bg-slate-950 flex items-center justify-center overflow-hidden">
                                        <img src="https://i.pravatar.cc/300?u=sazid" alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                    </div>
                                </div>
                                <button className="absolute bottom-2 right-2 p-3 rounded-2xl bg-primary-500 text-white shadow-xl shadow-primary-500/20 hover:scale-110 active:scale-95 transition-all">
                                    <Camera size={18} />
                                </button>
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-1">{profile.name}</h2>
                            <p className="text-[10px] font-bold text-primary-400 uppercase tracking-[0.4em] mb-6">{profile.position}</p>

                            <div className="flex justify-center gap-3 pt-6 border-t border-slate-800">
                                {[Twitter, Github, Linkedin, Globe].map((Icon, idx) => (
                                    <button key={idx} className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-slate-700 hover:text-white hover:border-slate-700 transition-all">
                                        <Icon size={18} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-8 shadow-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8">Tactical Stats</h3>
                        <div className="space-y-6">
                            {[
                                { label: 'Neural Sector', val: 'Engineering', icon: Briefcase, color: 'text-indigo-400' },
                                { label: 'Operational Hub', val: 'Dhaka Sync Point', icon: MapPin, color: 'text-rose-400' },
                                { label: 'Commission Date', val: 'Cycle 01-2024', icon: Calendar, color: 'text-emerald-400' },
                            ].map((stat, i) => (
                                <div key={i} className="flex items-center gap-4 p-5 rounded-2xl bg-slate-950 border border-slate-800 group hover:bg-white/[0.02] transition-all">
                                    <div className={cn('p-3 rounded-xl bg-slate-900 shrink-0 group-hover:scale-110 transition-transform', stat.color)}>
                                        <stat.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{stat.label}</p>
                                        <p className="text-xs font-black text-white uppercase tracking-tight mt-0.5">{stat.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Col - Data Forms/Settings */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Identity Bio */}
                    <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-10 shadow-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                            <Shield size={18} className="text-primary-400" /> Identity Narrative
                        </h3>
                        <div className="p-8 rounded-[2rem] bg-slate-950 border border-slate-800 relative group">
                            {isEditing ? (
                                <textarea
                                    defaultValue={profile.bio}
                                    className="w-full bg-transparent text-sm font-black text-slate-400 uppercase tracking-tight leading-relaxed focus:outline-none min-h-[120px]"
                                />
                            ) : (
                                <p className="text-sm font-black text-slate-400 uppercase tracking-tight leading-relaxed">
                                    {profile.bio}
                                </p>
                            )}
                            <div className="absolute top-4 right-4 text-[8px] font-black text-slate-800 uppercase tracking-widest group-hover:text-primary-500 transition-colors">DECRYPTED</div>
                        </div>
                    </div>

                    {/* Configuration Grid */}
                    <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 p-10 shadow-2xl">
                        <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] mb-10 flex items-center gap-3">
                            <Settings size={18} className="text-emerald-400" /> System Protocols
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {[
                                { label: 'Communication Channel', val: profile.email, icon: Mail },
                                { label: 'Neural Sector', val: profile.dept, icon: Briefcase },
                                { label: 'Operational Hub', val: profile.location, icon: MapPin },
                                { label: 'System Rank', val: profile.rank, icon: Shield },
                            ].map((field, i) => (
                                <div key={i} className="space-y-3">
                                    <label className="text-[9px] font-black text-slate-600 uppercase tracking-[0.4em] ml-2">{field.label}</label>
                                    <div className="relative group">
                                        <div className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-hover:text-primary-500 transition-colors">
                                            <field.icon size={16} />
                                        </div>
                                        <input
                                            disabled={!isEditing}
                                            defaultValue={field.val}
                                            className="w-full pl-14 pr-4 py-5 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:border-primary-500/50 transition-all disabled:opacity-50"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Security Section */}
                    <div className="bg-rose-500/5 backdrop-blur-3xl rounded-[3rem] border border-rose-500/20 p-10 shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-sm font-black text-white uppercase tracking-[0.3em] flex items-center gap-3 text-rose-400">
                                <Key size={18} /> High-Security Overrides
                            </h3>
                            <button className="px-5 py-2.5 rounded-xl bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest shadow-xl shadow-rose-500/20 hover:scale-105 transition-all">Cycle Keys</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { title: 'Neural Authorization (2FA)', status: 'Active', desc: 'Quantum authentication active across all vectors.' },
                                { title: 'Session Integrity', status: 'Verifying', desc: 'Localized at Dhaka Sync Point Sector 9.' }
                            ].map((s, idx) => (
                                <div key={idx} className="flex items-center justify-between p-6 rounded-[2rem] bg-slate-950 border border-slate-800 hover:border-rose-500/30 transition-all group">
                                    <div>
                                        <p className="text-[11px] font-black text-white uppercase tracking-tight">{s.title}</p>
                                        <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 italic">{s.desc}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg uppercase tracking-widest">{s.status}</span>
                                        <ChevronRight size={16} className="text-slate-800 group-hover:text-white transition-colors" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
