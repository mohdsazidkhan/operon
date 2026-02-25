"use client";

import { Bell } from 'lucide-react';

export default function NotificationsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-12 flex flex-col items-center">
        <Bell size={48} className="mx-auto text-slate-700 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">No Notifications</h1>
        <p className="text-slate-500 max-w-md">You have no notifications at the moment. Notifications about your account, activity, and updates will appear here.</p>
      </div>
    </div>
  );
}
