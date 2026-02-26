'use client';

import { Mail, ArrowLeft, ShieldCheck, Sparkles, Globe, Cpu, Shield } from 'lucide-react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils';

export default function ForgotPasswordPage() {
    const { isDark } = useThemeStore();
    const [sent, setSent] = useState(false);
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            await new Promise(r => setTimeout(r, 1500));
            setSent(true);
            toast.success('Reset protocol initialized. Check your secure link.');
        } catch (err) {
            toast.error('Initialization failed. Check network integrity.');
        }
    };

    const FloatingIcon = ({ icon: Icon, delay, className }) => (
        <motion.div
            initial={{ y: 0, opacity: 0 }}
            animate={{ y: [-20, 20, -20], opacity: [0.1, 0.3, 0.1] }}
            transition={{ duration: 6, repeat: Infinity, delay }}
            className={`absolute pointer-events-none ${className}`}
        >
            <Icon size={120} />
        </motion.div>
    );

    return (
        <div className="min-h-screen flex text-[var(--text-primary)] transition-colors duration-500 overflow-hidden bg-[var(--surface-raised)]">
            {/* Branding Panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-mesh p-12 relative overflow-hidden transition-colors duration-500">
                <div className="absolute inset-0 bg-black/10 dark:bg-black/40 backdrop-blur-[2px]" />

                <FloatingIcon icon={Globe} delay={0} className="top-[-20px] left-[10%] text-white" />
                <FloatingIcon icon={Cpu} delay={2} className="bottom-[10%] right-[5%] text-white" />
                <FloatingIcon icon={Shield} delay={1} className="top-[40%] right-[-40px] text-white" />

                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                    className="relative z-10"
                >
                    <div className="flex items-center gap-3">
                        <motion.img
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 1 }}
                            src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                            alt="OPERON Logo"
                            className="h-12 w-auto object-contain"
                        />
                    </div>
                </motion.div>

                <div className="relative z-10 space-y-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.8 }}
                    >
                        <h1 className="text-6xl font-black text-white leading-tight tracking-tighter uppercase italic">
                            Security <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-200 to-white/50">Restoration.</span>
                        </h1>
                        <p className="text-white/60 text-xl font-medium mt-4 max-w-md">
                            The decentralized recovery protocol ensuring your identity remains under your absolute control.
                        </p>
                    </motion.div>

                    <div className="flex gap-4 pt-8">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="w-12 h-1.5 rounded-full bg-white/20" />
                        ))}
                    </div>
                </div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.5 }}
                    className="relative z-10 text-white text-xs font-black uppercase tracking-[0.4em]"
                >
                    © {new Date().getFullYear()} OPERON Protocol // SEC_REC_V2
                </motion.p>
            </div>

            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                <div className="absolute top-8 left-8 lg:hidden">
                    <img
                        src={isDark ? "/logo-dark.png" : "/logo-light.png"}
                        alt="OPERON Logo"
                        className="h-8 w-auto object-contain"
                    />
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="w-full max-w-md space-y-8 relative"
                >
                    <div className="text-center lg:text-left">
                        <div className="inline-flex p-3 rounded-2xl bg-primary-500/10 text-primary-500 mb-4 items-center justify-center">
                            {sent ? <ShieldCheck size={32} className="animate-pulse" /> : <Mail size={32} />}
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-[var(--text-primary)]">
                            {sent ? 'Sequence' : 'Identity'} <br />
                            <span className="text-primary-500">{sent ? 'Dispatched' : 'Recovery'}</span>
                        </h2>
                        <p className="text-[var(--text-muted)] mt-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 justify-center lg:justify-start">
                            <Sparkles size={14} className="text-primary-500" />
                            {sent ? 'Check your encrypted relay' : 'Initialize recovery protocol'}
                        </p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Secure Relay Address</label>
                                <div className="relative group/input">
                                    <input
                                        {...register('email', {
                                            required: 'Vector required',
                                            pattern: { value: /^\S+@\S+$/i, message: 'Invalid vector format' }
                                        })}
                                        type="email"
                                        placeholder="ENTITY@OPERON.IO"
                                        className={cn(
                                            "w-full px-5 py-4 rounded-2xl border bg-[var(--surface)] text-[var(--text-primary)] font-bold text-sm tracking-wide focus:outline-none focus:ring-4 transition-all placeholder:opacity-30",
                                            errors.email ? "border-rose-500/50 ring-rose-500/10" : "border-[var(--border)] focus:border-primary-500 focus:ring-primary-500/10"
                                        )}
                                    />
                                </div>
                                {errors.email && <p className="text-rose-500 text-[9px] font-black uppercase tracking-widest mt-1 ml-1">{errors.email.message}</p>}
                            </div>

                            <button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-16 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50"
                            >
                                {isSubmitting ? 'Initializing...' : 'Execute Recovery'}
                            </button>
                        </form>
                    ) : (
                        <div className="p-8 rounded-[2.5rem] bg-[var(--surface)] border border-[var(--border)] relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/5 rounded-full blur-3xl animate-pulse"></div>
                            <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight leading-relaxed">
                                A validation sequence has been dispatched to your registered relay. Please check your inbox for further instructions.
                                <br /><br />
                                <span className="text-emerald-500 text-[10px] tracking-widest">INTEGRITY HASH: 0xA72-B91-XFC</span>
                            </p>
                        </div>
                    )}

                    <div className="pt-4 border-t border-[var(--border)] text-center">
                        <Link href="/login" className="inline-flex items-center gap-3 text-[10px] font-black text-[var(--text-muted)] hover:text-primary-500 uppercase tracking-[0.3em] transition-all group">
                            <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                            Return to Access Module
                        </Link>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
