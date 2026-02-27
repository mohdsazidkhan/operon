'use client';

import { useState, useEffect } from 'react';
import {
  Settings, Building2, Globe, Shield, CreditCard,
  Bell, Mail, Lock, CheckCircle2, Save, X, Key,
  ChevronRight, MapPin, Briefcase, Clock, Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

const TABS = [
  { id: 'company', label: 'Company Profile', icon: Building2 },
  { id: 'localization', label: 'Localization', icon: Globe },
  { id: 'security', label: 'Security & Access', icon: Shield },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [orgData, setOrgData] = useState(null);

  const fetchOrgData = async () => {
    try {
      const res = await fetch('/api/organization');
      const data = await res.json();
      if (data.success) {
        setOrgData(data.data);
      } else {
        toast.error('Failed to load settings');
      }
    } catch (error) {
      toast.error('Connection error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrgData();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/organization', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orgData)
      });
      const data = await res.json();
      if (data.success) {
        toast.success('Settings synchronized!');
        setOrgData(data.data);
      } else {
        toast.error(data.message || 'Verification failed');
      }
    } catch (error) {
      toast.error('Matrix uplink failure');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-[10px] font-black uppercase tracking-[0.5em] text-[var(--text-muted)] animate-pulse">
      Establishing Neural Uplink...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      {/* Header */}
      <div className="flex flex-wrap items-end justify-between gap-6 px-2">
        <div>
          <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">System Configuration</h1>
          <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
            <Settings size={12} className="text-[var(--primary-500)] animate-spin-slow" />
            Infrastructure Management • Global Parameters
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="h-12 px-8 rounded-2xl bg-[var(--primary-500)] text-white font-black text-[10px] uppercase tracking-[0.2em] shadow-2xl shadow-[var(--primary-500)]/20 hover:scale-105 active:scale-95 transition-all flex items-center gap-3 disabled:opacity-50 disabled:scale-100"
        >
          {saving ? 'Synchronizing...' : <><Save size={16} /> Save Changes</>}
        </button>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-8">
        {/* Sidebar Nav */}
        <div className="xl:col-span-1">
          <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-4 shadow-2xl space-y-2 sticky top-8">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "w-full flex items-center gap-4 px-6 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all relative overflow-hidden group",
                  activeTab === tab.id
                    ? "text-[var(--primary-500)] bg-[var(--primary-500)]/5 border border-[var(--primary-500)]/20"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] border border-transparent"
                )}
              >
                <tab.icon size={18} className={cn("transition-transform group-hover:scale-110", activeTab === tab.id ? "text-[var(--primary-500)]" : "text-[var(--text-muted)]")} />
                <span className="relative z-10">{tab.label}</span>
                {activeTab === tab.id && (
                  <motion.div
                    layoutId="active-tab-glow"
                    className="absolute inset-0 bg-gradient-to-r from-[var(--primary-500)]/10 to-transparent pointer-events-none"
                  />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        <div className="xl:col-span-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
              className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-10 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute -top-24 -right-24 w-64 h-64 bg-[var(--primary-500)]/5 rounded-full blur-3xl pointer-events-none"></div>

              {activeTab === 'company' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                      <Building2 size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Entity Identity</h3>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">General Organization Data</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">Organization Name</label>
                      <input
                        value={orgData.name || ''}
                        onChange={e => setOrgData({ ...orgData, name: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">Official Website</label>
                      <input
                        value={orgData.website || ''}
                        onChange={e => setOrgData({ ...orgData, website: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">Industry Sector</label>
                      <input
                        value={orgData.industry || ''}
                        onChange={e => setOrgData({ ...orgData, industry: e.target.value })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">Street Address</label>
                      <input
                        value={orgData.address?.street || ''}
                        onChange={e => setOrgData({ ...orgData, address: { ...orgData.address, street: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">City / Metropolis</label>
                      <input
                        value={orgData.address?.city || ''}
                        onChange={e => setOrgData({ ...orgData, address: { ...orgData.address, city: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">Country / Region</label>
                      <input
                        value={orgData.address?.country || ''}
                        onChange={e => setOrgData({ ...orgData, address: { ...orgData.address, country: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'localization' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                      <Globe size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Localization</h3>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Regional & Chronological Settings</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">Default Currency</label>
                      <select
                        value={orgData.settings?.currency || 'USD'}
                        onChange={e => setOrgData({ ...orgData, settings: { ...orgData.settings, currency: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      >
                        <option value="USD">USD - US Dollar</option>
                        <option value="EUR">EUR - Euro</option>
                        <option value="INR">INR - Indian Rupee</option>
                        <option value="GBP">GBP - British Pound</option>
                        <option value="JPY">JPY - Japanese Yen</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">System Timezone</label>
                      <select
                        value={orgData.settings?.timezone || 'UTC'}
                        onChange={e => setOrgData({ ...orgData, settings: { ...orgData.settings, timezone: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      >
                        <option value="UTC">UTC - Coordinated Universal Time</option>
                        <option value="IST">IST - India Standard Time</option>
                        <option value="EST">EST - Eastern Standard Time</option>
                        <option value="PST">PST - Pacific Standard Time</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">Date Display Format</label>
                      <select
                        value={orgData.settings?.dateFormat || 'MM/DD/YYYY'}
                        onChange={e => setOrgData({ ...orgData, settings: { ...orgData.settings, dateFormat: e.target.value } })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      >
                        <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                        <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                        <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                        <option value="MMM DD, YYYY">MMM DD, YYYY</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] ml-2">Fiscal Year Segment Start</label>
                      <select
                        value={orgData.settings?.fiscalYearStart || 1}
                        onChange={e => setOrgData({ ...orgData, settings: { ...orgData.settings, fiscalYearStart: parseInt(e.target.value) } })}
                        className="w-full px-6 py-4 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] text-xs font-black uppercase tracking-widest text-[var(--text-primary)] focus:outline-none focus:border-[var(--primary-500)]/50 transition-all"
                      >
                        <option value="1">January</option>
                        <option value="4">April</option>
                        <option value="7">July</option>
                        <option value="10">October</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'security' && (
                <div className="space-y-8">
                  <div className="flex items-center gap-4 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-rose-500/10 flex items-center justify-center text-rose-400">
                      <Shield size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-[var(--text-primary)] uppercase tracking-tighter italic">Security Shield</h3>
                      <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest">Access Control • Data Encryption</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div className="p-8 rounded-[2rem] bg-[var(--surface-overlay)] border border-[var(--border)] flex items-center justify-between group hover:border-rose-500/30 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 rounded-xl bg-orange-500/10 text-orange-400 group-hover:scale-110 transition-transform">
                          <Lock size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight">Two-Factor Authentication (2FA)</p>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1">Add an extra layer of security to your account.</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[9px] font-black text-rose-500 bg-rose-500/10 px-3 py-1 rounded-lg uppercase tracking-widest border border-rose-500/20">Inactive</span>
                        <div className="w-11 h-6 rounded-full bg-[var(--card-border)] relative cursor-pointer opacity-50">
                          <div className="absolute left-1 top-1 w-4 h-4 rounded-full bg-white shadow-sm"></div>
                        </div>
                      </div>
                    </div>

                    <div className="p-8 rounded-[2rem] bg-indigo-500/5 border border-indigo-500/20 flex items-center justify-between group hover:bg-indigo-500/10 transition-all">
                      <div className="flex items-center gap-5">
                        <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400">
                          <Clock size={20} />
                        </div>
                        <div>
                          <p className="text-[11px] font-black text-[var(--text-primary)] uppercase tracking-tight">Session Monitoring</p>
                          <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest mt-1 italic">Last synchronized: 2 mins ago from [::1]</p>
                        </div>
                      </div>
                      <button className="text-[9px] font-black text-indigo-400 uppercase tracking-widest hover:text-indigo-300 transition-colors">Terminate All</button>
                    </div>

                    <div className="bg-[var(--surface-overlay)] border border-[var(--border)] rounded-[2.5rem] p-8 mt-4">
                      <h4 className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Key size={14} className="text-rose-400" /> Administrative Access
                      </h4>
                      <div className="flex items-center justify-between p-5 rounded-2xl bg-[var(--card-bg)] border border-[var(--border)]">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-[10px] font-black text-slate-400 border border-slate-600 uppercase italic">Admin</div>
                          <div>
                            <p className="text-[10px] font-black text-[var(--text-primary)] uppercase tracking-tight">{orgData.owner?.name}</p>
                            <p className="text-[9px] font-bold text-[var(--text-muted)] uppercase tracking-widest">{orgData.owner?.email}</p>
                          </div>
                        </div>
                        <span className="text-[8px] font-black text-emerald-500 border border-emerald-500/30 px-2 py-1 rounded-md uppercase tracking-widest bg-emerald-500/5">Primary Node</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
