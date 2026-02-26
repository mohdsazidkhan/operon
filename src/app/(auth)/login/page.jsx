'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, LogIn, Zap, Shield, Sparkles, Globe, Cpu } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [showPwd, setShowPwd] = useState(false);
    const { isDark } = useThemeStore();
    const { login, loading } = useAuthStore();
    const router = useRouter();
    const { register, handleSubmit, setValue, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        const result = await login(data.email, data.password);
        if (result.success) {
            toast.success('Welcome back!');
            router.push('/dashboard');
        }
        else toast.error(result.message || 'Login failed');
    };

    const fillDemo = () => {
        setValue('email', 'admin@operon.io');
        setValue('password', 'Admin@123');
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

                {/* Floating Decorative Elements */}
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
                            Infinite <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-200 to-white/50">Possibilities.</span>
                        </h1>
                        <p className="text-white/60 text-xl font-medium mt-4 max-w-md">
                            The enterprise-grade OS that unifies CRM, ERP, and HRMS into a singular visual experience.
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
                    className="relative z-10 text-white text-xs font-bold uppercase tracking-[0.4em]"
                >
                    © {new Date().getFullYear()} OPERON Protocol // V4.0.0
                </motion.p>
            </div>

            {/* Login Section */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative">
                {/* Mobile Logo Overlay */}
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
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-[var(--text-primary)]">
                            Authentication <br />
                            <span className="text-primary-500">Required</span>
                        </h2>
                        <p className="text-[var(--text-muted)] mt-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 justify-center lg:justify-start">
                            <Sparkles size={14} className="text-primary-500" />
                            Secure Sequence Initialized
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Access Identity</label>
                            <input
                                {...register('email', { required: 'Identity required' })}
                                type="email" placeholder="ADMIN@OPERON.IO"
                                className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-bold text-sm tracking-wide focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:opacity-30"
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)]">Encrypted Key</label>
                                <Link href="/forgot-password" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary-500 hover:text-primary-600">Recovery Hash?</Link>
                            </div>
                            <div className="relative group">
                                <input
                                    {...register('password', { required: 'Key required' })}
                                    type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                                    className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-bold text-sm tracking-wide focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:opacity-30 pr-14"
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-primary-500 transition-colors">
                                    {showPwd ? <EyeOff size={20} /> : <Eye size={20} />}
                                </button>
                            </div>
                        </div>

                        <div className="pt-2">
                            <button
                                type="submit" disabled={isSubmitting}
                                className="w-full h-16 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-3 group disabled:opacity-50"
                            >
                                {isSubmitting ? "Processing..." : (
                                    <>
                                        Authorize Sequence
                                        <LogIn size={18} className="transition-transform group-hover:translate-x-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="space-y-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[var(--border)] opacity-50"></div></div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-widest"><span className="bg-[var(--surface-raised)] px-4 text-[var(--text-muted)]">Administrative Override</span></div>
                        </div>

                        <button onClick={fillDemo} type="button" className="w-full h-14 flex items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[var(--surface-overlay)] transition-all">
                            <Zap size={14} className="text-amber-500" /> Use Demo Credentials
                        </button>

                        <p className="text-center text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            No credentials? <Link href="/register" className="text-primary-500 hover:text-primary-600 transition-colors">Request Access Identity</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
