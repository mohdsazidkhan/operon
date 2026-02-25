'use client';

import { useState, useEffect } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Info, Paperclip, Smile, ShieldCheck, Activity } from 'lucide-react';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ChatPage() {
    const [chats, setChats] = useState([
        { id: 'general', name: 'Global Neural Channel', role: 'System-wide', online: true }
    ]);
    const [activeChat, setActiveChat] = useState(chats[0]);
    const [msgInput, setMsgInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchMessages = async () => {
        try {
            const res = await fetch(`/api/messages?channelId=${activeChat.id}`);
            const data = await res.json();
            if (data.success) {
                setMessages(data.data);
            }
        } catch (err) {
            toast.error('Neural uplink failure: Could not retrieve data packets');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 5000); // Polling for real-time feel
        return () => clearInterval(interval);
    }, [activeChat]);

    const handleSend = async () => {
        if (!msgInput.trim()) return;

        try {
            const res = await fetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: msgInput,
                    channelId: activeChat.id
                })
            });
            const data = await res.json();
            if (data.success) {
                setMsgInput('');
                fetchMessages();
            }
        } catch (err) {
            toast.error('Packet transmission failure');
        }
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col animate-in fade-in duration-700">
            {/* Context Header */}
            <div className="mb-6 flex items-center justify-between px-2">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Neural Communication</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-1 flex items-center gap-2">
                        <ShieldCheck size={12} className="text-primary-500" />
                        End-to-End Quantum Encryption Active
                    </p>
                </div>
            </div>

            <div className="flex-1 flex bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl overflow-hidden">
                {/* Sidebar - Contacts Ledger */}
                <div className="w-96 border-r border-slate-800 flex flex-col bg-slate-950/20">
                    <div className="p-8">
                        <div className="relative group">
                            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 group-hover:text-primary-500 transition-colors" />
                            <input
                                placeholder="SEARCH CHANNELS..."
                                className="w-full pl-12 pr-4 py-4 rounded-[1.5rem] bg-slate-900/50 border border-slate-800 text-[10px] font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-800"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto px-4 pb-8 space-y-2">
                        {chats.map(chat => (
                            <button
                                key={chat.id}
                                onClick={() => setActiveChat(chat)}
                                className={cn(
                                    'w-full flex items-center gap-4 p-5 rounded-[2rem] transition-all text-left relative group overflow-hidden',
                                    activeChat.id === chat.id ? 'bg-primary-500/10 border border-primary-500/20' : 'hover:bg-white/[0.03] border border-transparent'
                                )}
                            >
                                <div className="relative flex-shrink-0">
                                    <div className="w-14 h-14 rounded-2xl overflow-hidden ring-2 ring-slate-800 group-hover:ring-primary-500/50 transition-all duration-500 bg-slate-800 flex items-center justify-center text-primary-500 font-black">
                                        {chat.name[0]}
                                    </div>
                                    {chat.online && <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-4 border-slate-900 shadow-xl shadow-emerald-500/20" />}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-1">
                                        <p className="text-xs font-black text-white uppercase tracking-tight truncate">{chat.name}</p>
                                    </div>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider truncate leading-tight">{chat.role}</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main View - Transaction Stream */}
                <div className="flex-1 flex flex-col relative overflow-hidden">
                    {/* Active Context Header */}
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl overflow-hidden border border-primary-500/30 bg-slate-800 flex items-center justify-center text-white font-black">
                                {activeChat.name[0]}
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-white uppercase tracking-[0.2em]">{activeChat.name}</h2>
                                <div className="flex items-center gap-2 mt-1">
                                    <div className={cn('w-1.5 h-1.5 rounded-full', activeChat.online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-700')}></div>
                                    <span className="text-[9px] font-black text-slate-600 uppercase tracking-widest">{activeChat.online ? 'SYSTEM_ONLINE' : 'LINK_OFFLINE'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Chat Ledger */}
                    <div className="flex-1 overflow-y-auto p-10 space-y-8 scroll-smooth scrollbar-hide">
                        {loading && messages.length === 0 ? (
                            <div className="py-12 text-center text-[10px] font-black text-slate-800 uppercase tracking-[0.3em] animate-pulse">Decrypting Stream...</div>
                        ) : messages.map((m, idx) => (
                            <div key={m._id} className={cn('flex flex-col max-w-[70%] group', m.sender?._id === activeChat.id ? 'items-start' : 'ml-auto items-end')}>
                                <div className={cn(
                                    'p-6 rounded-[2.5rem] relative overflow-hidden',
                                    m.sender?._id !== activeChat.id
                                        ? 'bg-primary-500 text-white rounded-tr-none shadow-2xl shadow-primary-500/10'
                                        : 'bg-slate-900/60 border border-slate-800 text-slate-200 rounded-tl-none'
                                )}>
                                    <p className="text-sm font-black leading-relaxed tracking-tight">{m.text}</p>
                                    <div className={cn('absolute top-0 right-0 w-8 h-8 opacity-10', m.sender?._id !== activeChat.id ? 'bg-white' : 'bg-primary-500')}></div>
                                </div>
                                <div className="flex items-center gap-3 mt-3">
                                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{m.sender?.name || 'SYSTEM'}</span>
                                    <p className="text-[9px] font-black text-slate-700 uppercase tracking-[0.2em]">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Interface Input */}
                    <div className="p-8 border-t border-slate-800 bg-slate-900/20">
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                                <button className="p-2 rounded-xl text-slate-700 hover:text-primary-500 transition-all"><Paperclip size={18} /></button>
                                <button className="p-2 rounded-xl text-slate-700 hover:text-primary-500 transition-all"><Smile size={18} /></button>
                            </div>
                            <input
                                value={msgInput}
                                onChange={(e) => setMsgInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="SEQUENCE NEW DATA PACKET..."
                                className="w-full pl-28 pr-20 py-6 rounded-[2rem] bg-slate-950/50 border border-slate-800 text-xs font-black uppercase tracking-widest text-white focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all placeholder:text-slate-900"
                            />
                            <button
                                onClick={handleSend}
                                className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl bg-primary-500 flex items-center justify-center text-white shadow-xl shadow-primary-500/20 hover:scale-105 active:scale-95 transition-all"
                            >
                                <Send size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
