'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Menu, Sun, Moon, Bell, Search, ChevronDown, LogOut, User, Settings, X } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { useAuthStore } from '@/store/useAuthStore';
import { cn } from '@/lib/utils';
import toast from 'react-hot-toast';
// Note: formatRelativeTime and demoData need to be migrated/imported correctly
// For now, using placeholders or simple implementations

const formatRelativeTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = now - new Date(date);
    const seconds = Math.floor(diff / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return new Date(date).toLocaleDateString();
};

const demoNotifications = [
    { _id: '1', title: 'New Lead Assigned', message: 'A new lead from Google has been assigned to you.', type: 'assignment', read: false, createdAt: new Date() },
    { _id: '2', title: 'Invoice Paid', message: `Invoice #INV-${new Date().getFullYear()}-001 has been paid by Acme Corp.`, type: 'success', read: true, createdAt: new Date(Date.now() - 3600000) },
];

export default function Navbar({ onToggleSidebar, onOpenCustomizer }) {
    const { isDark, toggleDark, isRTL, toggleRTL } = useThemeStore();
    const { user, logout } = useAuthStore();
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showProfile, setShowProfile] = useState(false);
    const [showNotifs, setShowNotifs] = useState(false);
    const [showSearch, setShowSearch] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const profileRef = useRef(null);
    const notifsRef = useRef(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            const data = await res.json();
            if (data.success) {
                setNotifications(data.data.slice(0, 5));
                setUnreadCount(data.data.filter(n => !n.isRead).length);
            }
        } catch (err) { console.error('Failed to fetch notifications:', err); }
    };

    const handleMarkAllRead = async () => {
        try {
            const res = await fetch('/api/notifications', { method: 'PATCH' });
            const data = await res.json();
            if (data.success) {
                toast.success('All marked as read');
                fetchNotifications();
            }
        } catch (err) { toast.error('Failed to update notifications'); }
    };

    useEffect(() => {
        fetchNotifications();
        // Poll every 30s for demo
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        const handler = (e) => {
            if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
            if (notifsRef.current && !notifsRef.current.contains(e.target)) setShowNotifs(false);
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        const handleKey = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') { e.preventDefault(); setShowSearch(true); }
            if (e.key === 'Escape') { setShowSearch(false); }
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, []);

    const handleLogout = () => { logout(); router.push('/login'); };

    const notifTypeColor = { info: 'text-blue-500', success: 'text-green-500', warning: 'text-amber-500', error: 'text-red-500', assignment: 'text-purple-500' };

    return (
        <>
            <header className="h-16 bg-[var(--navbar-bg)] border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
                {/* Left */}
                <div className="flex items-center gap-3">
                    <button onClick={onToggleSidebar} className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors text-[var(--text-secondary)]">
                        <Menu size={20} />
                    </button>
                    <button
                        onClick={() => setShowSearch(true)}
                        className="hidden md:flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--surface-overlay)] text-[var(--muted)] text-sm hover:bg-[var(--border)] transition-colors"
                    >
                        <Search size={15} />
                        <span>Search...</span>
                        <kbd className="ms-4 text-xs bg-[var(--border)] px-1.5 py-0.5 rounded">⌘K</kbd>
                    </button>
                </div>

                {/* Right */}
                <div className="flex items-center gap-2">
                    {/* Dark mode */}
                    <button onClick={toggleDark} title="Toggle Dark/Light Mode" className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors text-[var(--text-secondary)]">
                        {isDark ? <Sun size={18} /> : <Moon size={18} />}
                    </button>

                    {/* RTL/LTR toggle */}
                    <button onClick={toggleRTL} title={`Switch to ${isRTL ? 'LTR' : 'RTL'}`} className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors text-[var(--text-secondary)]">
                        <span className="text-xs font-bold w-7 text-left">{isRTL ? 'RTL' : 'LTR'}</span>
                    </button>

                    {/* Customizer */}
                    <button onClick={onOpenCustomizer} title="Theme Settings" className="p-2 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors text-[var(--text-secondary)]">
                        <Settings size={18} />
                    </button>

                    {/* Notifications */}
                    <div className="relative" ref={notifsRef}>
                        <button onClick={() => { setShowNotifs(!showNotifs); setShowProfile(false); }} className="relative p-2 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors text-[var(--text-secondary)]">
                            <Bell size={18} />
                            {unreadCount > 0 && (
                                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center font-bold">{unreadCount}</span>
                            )}
                        </button>
                        {showNotifs && (
                            <div className="absolute end-0 mt-2 w-80 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-soft z-50 animate-fade-in overflow-hidden">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)]">
                                    <span className="font-semibold text-[var(--text-primary)]">Notifications</span>
                                    <button onClick={handleMarkAllRead} className="text-xs text-[var(--primary-500)] font-medium cursor-pointer hover:underline">Mark all read</button>
                                </div>
                                <div className="divide-y divide-[var(--border)] max-h-72 overflow-y-auto">
                                    {notifications.length === 0 ? (
                                        <div className="px-4 py-8 text-center text-xs text-[var(--muted)] underline-offset-4 italic">Sequential integrity verified. No pending alerts.</div>
                                    ) : (
                                        notifications.map(n => (
                                            <div key={n._id} className={cn('px-4 py-3 hover:bg-[var(--surface-overlay)] cursor-pointer transition-colors', !n.isRead && 'bg-[var(--primary-500)]/5 dark:bg-[var(--primary-500)]/10')}>
                                                <div className="flex items-start gap-3">
                                                    <div className={cn('w-2 h-2 rounded-full mt-1.5 shrink-0',
                                                        n.type === 'success' ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' :
                                                            n.type === 'error' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]' :
                                                                n.type === 'warning' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                                                    'bg-[var(--primary-500)] shadow-[0_0_8px_rgba(124,58,237,0.5)]'
                                                    )} />
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-sm font-black text-[var(--text-primary)] truncate uppercase tracking-tight italic">{n.title}</p>
                                                        <p className="text-[10px] font-bold text-[var(--text-muted)] mt-0.5 line-clamp-2 leading-relaxed">{n.message}</p>
                                                        <p className="text-[9px] font-black text-[var(--text-muted)] mt-1 opacity-50 uppercase tracking-widest">{formatRelativeTime(n.createdAt)}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="px-4 py-2 border-t border-[var(--border)]">
                                    <Link href="/apps/notifications" onClick={() => setShowNotifs(false)} className="text-xs text-[var(--primary-500)] hover:text-[var(--primary-600)] font-medium">View all notifications →</Link>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Profile */}
                    <div className="relative" ref={profileRef}>
                        <button onClick={() => { setShowProfile(!showProfile); setShowNotifs(false); }} className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[var(--surface-overlay)] transition-colors">
                            <img
                                src={user?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=7c3aed&color=fff`}
                                alt={user?.name}
                                className="w-8 h-8 rounded-full object-cover ring-2 ring-[var(--primary-500)]/30"
                            />
                            <div className="hidden sm:block text-left">
                                <p className="text-sm font-medium text-[var(--text-primary)] leading-none">{user?.name || 'Admin User'}</p>
                                <p className="text-xs text-[var(--muted)] capitalize">{user?.role?.replace('_', ' ') || 'Admin'}</p>
                            </div>
                            <ChevronDown size={14} className="text-[var(--muted)] hidden sm:block" />
                        </button>
                        {showProfile && (
                            <div className="absolute end-0 mt-2 w-52 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-soft z-50 animate-fade-in overflow-hidden">
                                <div className="px-4 py-3 border-b border-[var(--border)]">
                                    <p className="text-sm font-semibold text-[var(--text-primary)]">{user?.name}</p>
                                    <p className="text-xs text-[var(--muted)]">{user?.email}</p>
                                </div>
                                <div className="p-2">
                                    <Link href="/profile" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] transition-colors">
                                        <User size={15} /> Profile
                                    </Link>
                                    <Link href="/settings" onClick={() => setShowProfile(false)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-overlay)] transition-colors">
                                        <Settings size={15} /> Settings
                                    </Link>
                                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                        <LogOut size={15} /> Logout
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            {/* Search Modal */}
            {showSearch && (
                <div className="fixed inset-0 z-50 flex items-start justify-center pt-24 px-4" onClick={() => setShowSearch(false)}>
                    <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
                    <div className="relative w-full max-w-xl bg-[var(--surface)] rounded-2xl shadow-2xl border border-[var(--border)] animate-scale-in" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center border-b border-[var(--border)] px-4">
                            <Search size={18} className="text-[var(--muted)]" />
                            <input
                                autoFocus
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                placeholder="Search leads, employees, invoices..."
                                className="flex-1 px-4 py-4 bg-transparent text-[var(--text-primary)] outline-none text-sm placeholder:text-[var(--muted)]"
                            />
                            <button onClick={() => setShowSearch(false)} className="p-1 rounded-lg hover:bg-[var(--surface-overlay)]">
                                <X size={16} className="text-[var(--muted)]" />
                            </button>
                        </div>
                        <div className="p-4 text-center text-sm text-[var(--muted)]">
                            {searchQuery ? `Searching for "${searchQuery}"...` : 'Start typing to search across all modules'}
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
