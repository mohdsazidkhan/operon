'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { motion } from 'framer-motion';
import { Eye, EyeOff, UserPlus, Sparkles, Shield, Globe, Cpu } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import { useThemeStore } from '@/store/useThemeStore';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [showPwd, setShowPwd] = useState(false);
    const router = useRouter();
    const { isDark } = useThemeStore();
    const { login } = useAuthStore();
    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

    const onSubmit = async (data) => {
        try {
            await api.post('/auth/register', data);
            toast.success('Account created!');
            const result = await login(data.email, data.password);
            if (result.success) router.push('/dashboard');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Registration failed');
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
                            Join the <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-primary-200 to-white/50">Elite.</span>
                        </h1>
                        <p className="text-white/60 text-xl font-medium mt-4 max-w-md">
                            Begin your journey with the singular platform designed for hyper-growth and architectural elegance.
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
                    © {new Date().getFullYear()} OPERON Protocol // JOIN_REQ_V1
                </motion.p>
            </div>

            {/* Form Section */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 relative overflow-y-auto">
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
                    className="w-full max-w-md space-y-6 relative py-12"
                >
                    <div className="text-center lg:text-left">
                        <h2 className="text-4xl font-black tracking-tighter uppercase italic text-[var(--text-primary)]">
                            Request <br />
                            <span className="text-primary-500">Access Identity</span>
                        </h2>
                        <p className="text-[var(--text-muted)] mt-2 text-xs font-bold uppercase tracking-widest flex items-center gap-2 justify-center lg:justify-start">
                            <Sparkles size={14} className="text-primary-500" />
                            Provisioning Protocol 01
                        </p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Full Legal Alias</label>
                            <input
                                {...register('name', { required: 'Name required' })}
                                placeholder="JOHN DOE"
                                className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-bold text-sm tracking-wide focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:opacity-30"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Secure Relay Address</label>
                            <input
                                {...register('email', { required: 'Email required' })}
                                type="email" placeholder="YOU@COMPANY.IO"
                                className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-bold text-sm tracking-wide focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:opacity-30"
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-[var(--text-muted)] ml-1">Cryptographic Key</label>
                            <div className="relative group">
                                <input
                                    {...register('password', { required: 'Password required' })}
                                    type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                                    className="w-full px-5 py-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] font-bold text-sm tracking-wide focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all placeholder:opacity-30 pr-14"
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">{showPwd ? <EyeOff size={20} /> : <Eye size={20} />}</button>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit" disabled={isSubmitting}
                                className="w-full h-16 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-black text-xs uppercase tracking-[0.3em] transition-all shadow-xl shadow-primary-500/20 active:scale-[0.98] hover:scale-[1.02] flex items-center justify-center gap-3 group"
                            >
                                {isSubmitting ? "Provisioning..." : (
                                    <>
                                        Execute Provisioning
                                        <UserPlus size={18} className="transition-transform group-hover:translate-y-[-2px]" />
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="pt-6 border-t border-[var(--border)] text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--text-muted)]">
                            Existing Identity? <Link href="/login" className="text-primary-500 hover:text-primary-600 transition-colors">Resume Protocol</Link>
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
}
