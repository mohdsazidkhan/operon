"use client";

import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
      <div className="bg-[var(--surface-overlay)]/50 rounded-2xl border border-[var(--border)] p-12 flex flex-col items-center">
        <Bell size={48} className="mx-auto text-[var(--text-muted)] mb-4" />
        <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Notifications</h1>
        <p className="text-[var(--text-muted)] max-w-md">You have no notifications at the moment. Notifications about your account, activity, and updates will appear here.</p>
      </div>
    </div>
  );
}
