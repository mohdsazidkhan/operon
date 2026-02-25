'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, LogIn, Zap } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import toast from 'react-hot-toast';

export default function LoginPage() {
    const [showPwd, setShowPwd] = useState(false);
    const { login, loading } = useAuthStore();
    const router = useRouter();
    const { register, handleSubmit, setValue, formState: { errors } } = useForm();

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

    return (
        <div className="min-h-screen flex">
            {/* Brand panel */}
            <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-primary-900 via-primary-800 to-slate-900 p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '40px 40px' }} />
                <div className="relative">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white font-bold text-xl">O</div>
                        <span className="text-white font-bold text-2xl">OPERON</span>
                    </div>
                </div>
                <div className="relative space-y-6">
                    <h1 className="text-4xl font-bold text-white leading-tight">Your Business.<br />One Platform.</h1>
                    <p className="text-primary-200 text-lg">CRM + ERP + HRMS combined into a single, powerful business operating system.</p>
                    <div className="grid grid-cols-3 gap-4">
                        {['120+ Leads', '$2.4M Revenue', '8 Active Employees'].map((stat) => (
                            <div key={stat} className="bg-white/10 rounded-xl p-3 text-center backdrop-blur-sm">
                                <p className="text-white text-sm font-semibold">{stat}</p>
                            </div>
                        ))}
                    </div>
                </div>
                <p className="relative text-primary-300 text-sm">© 2024 OPERON. All rights reserved.</p>
            </div>

            {/* Form panel */}
            <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-[var(--surface-raised)]">
                <div className="w-full max-w-md space-y-8">
                    <div>
                        <div className="flex items-center gap-2 lg:hidden mb-6">
                            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold">O</div>
                            <span className="font-bold text-xl text-[var(--text-primary)]">OPERON</span>
                        </div>
                        <h2 className="text-2xl font-bold text-[var(--text-primary)]">Sign in to your account</h2>
                        <p className="text-[var(--muted)] mt-1">Welcome back! Please enter your credentials.</p>
                    </div>

                    <button onClick={fillDemo} type="button" className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 border-dashed border-primary-300 dark:border-primary-700 text-primary-600 dark:text-primary-400 text-sm font-medium hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors">
                        <Zap size={15} /> Fill Demo Credentials
                    </button>

                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--text-primary)] mb-1.5">Email address</label>
                            <input
                                {...register('email', { required: 'Email is required', pattern: { value: /^\S+@\S+$/i, message: 'Invalid email' } })}
                                type="email" placeholder="admin@operon.io"
                                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                            />
                            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1.5">
                                <label className="block text-sm font-medium text-[var(--text-primary)]">Password</label>
                                <Link href="/forgot-password" size="sm" className="text-xs text-primary-500 hover:text-primary-600">Forgot password?</Link>
                            </div>
                            <div className="relative">
                                <input
                                    {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })}
                                    type={showPwd ? 'text' : 'password'} placeholder="••••••••"
                                    className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--muted)] focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all pr-12"
                                />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text-secondary)]">
                                    {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
                        </div>
                        <button
                            type="submit" disabled={loading}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-primary-500/30"
                        >
                            {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn size={18} /> Sign In</>}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--muted)]">
                        Don't have an account? <Link href="/register" className="text-primary-500 font-medium hover:text-primary-600">Sign up</Link>
                    </p>
                </div>
            </div>
        </div>
    );
}
