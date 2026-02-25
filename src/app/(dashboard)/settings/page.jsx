"use client";

import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center animate-in fade-in duration-500">
      <div className="bg-slate-900/50 rounded-2xl border border-slate-800 p-12 flex flex-col items-center">
        <Settings size={48} className="mx-auto text-slate-700 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Settings</h1>
        <p className="text-slate-500 max-w-md">Settings management coming soon. Here you will be able to update your account, preferences, and more.</p>
      </div>
    </div>
  );
}
