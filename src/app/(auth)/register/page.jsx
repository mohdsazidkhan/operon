'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { Eye, EyeOff, UserPlus } from 'lucide-react';
import { useAuthStore } from '@/store/useAuthStore';
import api from '@/services/api';
import toast from 'react-hot-toast';

export default function RegisterPage() {
    const [showPwd, setShowPwd] = useState(false);
    const router = useRouter();
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

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--surface-raised)] p-6 text-[var(--text-primary)]">
            <div className="w-full max-w-md">
                <div className="bg-[var(--surface)] rounded-2xl border border-[var(--border)] shadow-soft p-8 space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-6">
                            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white font-bold">O</div>
                            <span className="font-bold text-xl">OPERON</span>
                        </div>
                        <h2 className="text-2xl font-bold">Create your account</h2>
                        <p className="text-[var(--muted)] mt-1 text-sm">Start your 14-day free trial today.</p>
                    </div>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Full Name</label>
                            <input {...register('name', { required: 'Name required' })} placeholder="John Doe" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-overlay)] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Email</label>
                            <input {...register('email', { required: 'Email required' })} type="email" placeholder="you@company.com" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-overlay)] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all font-sans" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1.5">Password</label>
                            <div className="relative">
                                <input {...register('password', { required: 'Password required' })} type={showPwd ? 'text' : 'password'} placeholder="••••••••" className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface-overlay)] focus:outline-none focus:ring-2 focus:ring-primary-500 transition-all pr-12 font-sans" />
                                <button type="button" onClick={() => setShowPwd(!showPwd)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)]">{showPwd ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                            </div>
                        </div>
                        <button type="submit" disabled={isSubmitting} className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-semibold transition-all shadow-lg shadow-primary-500/30 disabled:opacity-70">
                            {isSubmitting ? "..." : "Create Account"}
                        </button>
                    </form>
                    <p className="text-center text-sm text-[var(--muted)]">Already have an account? <Link href="/login" className="text-primary-500 font-medium">Sign in</Link></p>
                </div>
            </div>
        </div>
    );
}
