"use client";

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] text-center animate-in duration-700">
      <div className="bg-[var(--card-bg)] backdrop-blur-xl rounded-[2.5rem] border border-[var(--card-border)] p-16 flex flex-col items-center shadow-2xl relative group overflow-hidden max-w-2xl mx-auto">
        <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary-500)]/5 rounded-full blur-3xl group-hover:bg-[var(--primary-500)]/10 transition-all duration-1000"></div>

        <div className="w-24 h-24 rounded-3xl bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-center mb-8 shadow-inner group-hover:scale-110 transition-transform duration-500">
          <Settings size={40} className="text-[var(--primary-500)] animate-spin-slow" />
        </div>

        <h1 className="text-4xl font-black text-[var(--text-primary)] mb-4 tracking-tighter uppercase italic">
          Control Center
        </h1>

        <div className="w-16 h-1 bg-gradient-to-r from-transparent via-[var(--primary-500)] to-transparent mb-8 opacity-50"></div>

        <p className="text-[var(--text-secondary)] font-medium leading-relaxed max-w-md text-sm">
          The <span className="text-[var(--primary-500)] font-bold uppercase tracking-widest text-[10px]">Neural Configuration Interface</span> is currently being calibrated.
          Soon, you will be able to harmonize your account settings, UI preferences, and global security protocols.
        </p>

        <div className="mt-12 flex gap-4">
          <div className="px-6 py-3 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.2em]">
            System Offline
          </div>
        </div>
      </div>
    </div>
  );
}
