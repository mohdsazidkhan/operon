'use client';

import { Mail, ArrowLeft, ShieldCheck, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
    const [sent, setSent] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            // Simulated API latency
            await new Promise(r => setTimeout(r, 1500));
            setSent(true);
            toast.success('Reset protocol initialized. Check your secure link.');
        } catch (err) {
            toast.error('Initialization failed. Check network integrity.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-6 selection:bg-primary-500/30 selection:text-primary-200 relative overflow-hidden font-sans">
            {/* Background Ambience */}
            <div className="absolute top-0 left-0 w-full h-full">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary-900/20 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-900/20 rounded-full blur-[120px] animate-pulse delay-700"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] pointer-events-none"></div>
            </div>

            <div className="w-full max-w-md relative z-10 animate-in fade-in zoom-in-95 duration-700">
                <div className="bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-slate-800 shadow-2xl p-10 space-y-8 relative overflow-hidden group">
                    {/* Glass Shine */}
                    <div className="absolute -top-24 -left-24 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-all duration-700"></div>

                    <div className="text-center relative">
                        <div className="w-20 h-20 rounded-[2rem] bg-slate-900 border border-slate-800 flex items-center justify-center mx-auto mb-6 shadow-2xl relative group/icon overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 to-transparent opacity-0 group-hover/icon:opacity-100 transition-opacity"></div>
                            {sent ? (
                                <ShieldCheck size={32} className="text-emerald-500 relative z-10 animate-in zoom-in duration-500" />
                            ) : (
                                <Mail size={32} className="text-primary-500 relative z-10" />
                            )}
                        </div>
                        <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                            {sent ? 'Secure Link Sent' : 'Reset Identity'}
                        </h2>
                        <p className="text-slate-500 mt-2 text-[10px] font-bold uppercase tracking-[0.3em] flex items-center justify-center gap-2">
                            <Sparkles size={12} className="text-primary-400" />
                            {sent ? 'Check your encrypted inbox' : 'Sequence password recovery'}
                        </p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 relative">
                            <div className="space-y-2">
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Email Vector</label>
                                <div className="relative group/input">
                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within/input:text-primary-500 transition-colors">
                                        <Mail size={18} />
                                    </div>
                                    <input
                                        {...register('email', {
                                            required: 'Vector required',
                                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid vector format' }
                                        })}
                                        type="email"
                                        placeholder="ENTITY@OPERON.IO"
                                        className={cn(
                                            "w-full pl-12 pr-4 py-5 rounded-2xl border bg-slate-950/50 text-white font-black text-xs tracking-widest placeholder:text-slate-900 focus:outline-none transition-all",
                                            errors.email ? "border-rose-500/50 ring-2 ring-rose-500/10" : "border-slate-800 focus:border-primary-500/50 focus:ring-4 focus:ring-primary-500/5"
                                        )}
                                    />
                                </div>
                                {errors.email && <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest mt-1 ml-1">{errors.email.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 rounded-2xl bg-primary-500 hover:bg-primary-600 disabled:opacity-50 text-white font-black text-xs uppercase tracking-[0.3em] transition-all shadow-[0_20px_40px_-15px_rgba(139,92,246,0.3)] hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                            >
                                {isSubmitting ? 'INITIALIZING...' : 'EXECUTE RECOVERY'}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center py-6 animate-in fade-in slide-in-from-bottom duration-700">
                            <div className="p-6 rounded-[2.5rem] bg-slate-950 border border-slate-800 inline-block relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-16 h-16 bg-emerald-500/10 rounded-full blur-2xl"></div>
                                <p className="text-xs font-black text-slate-300 uppercase tracking-tight leading-relaxed">
                                    A validation sequence has been dispatched to your registered relay. <br />
                                    <span className="text-emerald-500 text-[10px] tracking-widest">Integrity Hash: 0xA72...</span>
                                </p>
                            </div>
                        </div>
                    )}

                    <div className="pt-4 border-t border-slate-800/50">
                        <Link href="/login" className="flex items-center justify-center gap-3 text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.3em] transition-colors group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Login Protocol
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
