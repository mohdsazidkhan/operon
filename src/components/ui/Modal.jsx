'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isOpen]);

    useEffect(() => {
        const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [onClose]);

    if (!isOpen) return null;

    const sizes = {
        sm: 'max-w-md',
        md: 'max-w-lg',
        lg: 'max-w-2xl',
        xl: 'max-w-3xl',
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />
            {/* Modal panel */}
            <div className={cn(
                'relative w-full rounded-2xl shadow-2xl border overflow-hidden',
                'animate-in fade-in zoom-in-95 duration-200',
                'bg-[var(--card-bg)] border-[var(--card-border)]',
                sizes[size]
            )}>
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)]">
                    <h2 className="text-base font-bold text-[var(--text-primary)]">{title}</h2>
                    <button
                        onClick={onClose}
                        className="p-1.5 rounded-lg text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-overlay)] transition-all"
                    >
                        <X size={18} />
                    </button>
                </div>
                {/* Body */}
                <div className="px-6 py-5 max-h-[75vh] overflow-y-auto bg-[var(--card-bg)]">
                    {children}
                </div>
            </div>
        </div>
    );
}

/* ── Reusable form field label wrapper ────────────────── */
export function FormField({ label, required, children, error }) {
    return (
        <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-[var(--text-secondary)] uppercase tracking-wider">
                {label}{required && <span className="text-rose-500 ml-0.5">*</span>}
            </label>
            {children}
            {error && <p className="text-xs text-rose-500">{error}</p>}
        </div>
    );
}

/* ── Base class for all form inputs / selects / textareas ─ */
export const inputCls = [
    'w-full px-3 py-2.5 rounded-xl text-sm transition-all',
    'bg-[var(--surface-overlay)]',
    'border border-[var(--border)]',
    'text-[var(--text-primary)]',
    'placeholder:text-[var(--text-muted)]',
    'focus:outline-none focus:ring-2 focus:ring-[var(--primary-500)]/30 focus:border-[var(--primary-500)]',
].join(' ');

/* ── Cancel / Submit footer ───────────────────────────── */
export function FormActions({ onClose, loading, submitLabel = 'Save' }) {
    return (
        <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-[var(--border)]">
            <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-sm font-medium border transition-all text-[var(--text-muted)] hover:text-[var(--text-primary)] bg-transparent hover:bg-[var(--surface-overlay)] border-[var(--border)]"
            >
                Cancel
            </button>
            <button
                type="submit"
                disabled={loading}
                className="px-5 py-2 rounded-xl text-sm font-semibold transition-all text-white bg-[var(--primary-500)] hover:bg-[var(--primary-600)] shadow-lg shadow-[var(--primary-500)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {loading ? 'Saving…' : submitLabel}
            </button>
        </div>
    );
}
