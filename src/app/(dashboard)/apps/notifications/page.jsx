'use client';

import { useState, useEffect } from 'react';
import { Bell, CheckCircle2, AlertCircle, Info, XCircle, Trash2, CheckCircle } from 'lucide-react';
import { cn, formatDate } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      const data = await res.json();
      if (data.success) {
        setNotifications(data.data);
      }
    } catch (err) {
      toast.error('Failed to synchronize notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch('/api/notifications', { method: 'PATCH' });
      const data = await res.json();
      if (data.success) {
        toast.success('Matrix cleared. All alerts read.');
        fetchNotifications();
      }
    } catch (err) {
      toast.error('Link failure');
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-emerald-500" size={20} />;
      case 'warning': return <AlertCircle className="text-amber-500" size={20} />;
      case 'error': return <XCircle className="text-rose-500" size={20} />;
      default: return <Info className="text-blue-500" size={20} />;
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] animate-pulse italic">
      Scanning Neural Frequency...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Alert Center</h1>
          <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
            <Bell size={12} className="text-[var(--primary-500)]" />
            System Logs • Dynamic Event Stream
          </p>
        </div>
        <button
          onClick={handleMarkAllRead}
          className="h-12 px-8 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-black text-[10px] uppercase tracking-[0.2em] transition-all flex items-center gap-3"
        >
          <CheckCircle size={16} /> Mark All as Read
        </button>
      </div>

      <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl overflow-hidden">
        {notifications.length === 0 ? (
          <div className="p-20 text-center flex flex-col items-center">
            <div className="w-20 h-20 rounded-3xl bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center mb-6 text-[var(--text-muted)]">
              <Bell size={32} />
            </div>
            <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tight italic">Zero Entropy Detected</h3>
            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-2 max-w-xs leading-relaxed">System frequency is nominal. No pending alerts require attention at this time.</p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border)]">
            {notifications.map((n) => (
              <div key={n._id} className={cn(
                "p-8 transition-all flex items-start gap-6 group hover:bg-[var(--surface-overlay)]/40 relative",
                !n.isRead && "bg-[var(--primary-500)]/5"
              )}>
                {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-1 bg-[var(--primary-500)]" />}
                <div className="mt-1">
                  {getTypeIcon(n.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <h4 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-tight italic group-hover:text-[var(--primary-500)] transition-colors">{n.title}</h4>
                    <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest">{formatDate(n.createdAt)}</span>
                  </div>
                  <p className="text-[11px] font-bold text-[var(--text-secondary)] leading-relaxed uppercase tracking-tight max-w-4xl">{n.message}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
