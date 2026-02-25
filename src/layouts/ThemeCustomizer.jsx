'use client';

import { X, Check } from 'lucide-react';
import { useThemeStore } from '@/store/useThemeStore';
import { cn } from '@/lib/utils';

const themes = [
    { key: 'violet', label: 'Violet', color: '#8b5cf6' },
    { key: 'blue', label: 'Blue', color: '#3b82f6' },
    { key: 'rose', label: 'Rose', color: '#f43f5e' },
    { key: 'orange', label: 'Orange', color: '#f97316' },
    { key: 'green', label: 'Green', color: '#22c55e' },
    { key: 'slate', label: 'Slate', color: '#64748b' },
];

export default function ThemeCustomizer({ open, onClose }) {
    const { isDark, colorTheme, toggleDark, setColorTheme } = useThemeStore();

    if (!open) return null;

    return (
        <div className="fixed right-0 top-0 bottom-0 w-72 bg-[var(--surface)] border-l border-[var(--border)] shadow-2xl z-50 animate-slide-in flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
                <div>
                    <h3 className="font-semibold text-[var(--text-primary)]">Theme Customizer</h3>
                    <p className="text-xs text-[var(--muted)] mt-0.5">Personalize your dashboard</p>
                </div>
                <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--surface-overlay)] transition-colors">
                    <X size={18} className="text-[var(--muted)]" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Mode */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Mode</p>
                    <div className="grid grid-cols-2 gap-2">
                        {[{ label: 'Light', dark: false }, { label: 'Dark', dark: true }].map(({ label, dark }) => (
                            <button
                                key={label}
                                onClick={() => { if (isDark !== dark) toggleDark(); }}
                                className={cn(
                                    'flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium',
                                    isDark === dark
                                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
                                        : 'border-[var(--border)] text-[var(--text-secondary)] hover:border-primary-300'
                                )}
                            >
                                <div className={cn('w-10 h-7 rounded-md border', dark ? 'bg-slate-800 border-slate-600' : 'bg-white border-slate-200')} />
                                {label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Colors */}
                <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--muted)] mb-3">Primary Color</p>
                    <div className="grid grid-cols-3 gap-2">
                        {themes.map(({ key, label, color }) => (
                            <button
                                key={key}
                                onClick={() => setColorTheme(key)}
                                className={cn(
                                    'flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 transition-all',
                                    colorTheme === key ? 'border-current' : 'border-[var(--border)] hover:border-slate-300'
                                )}
                                style={{ borderColor: colorTheme === key ? color : undefined }}
                            >
                                <div className="relative w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: color }}>
                                    {colorTheme === key && <Check size={14} className="text-white" strokeWidth={3} />}
                                </div>
                                <span className="text-xs text-[var(--text-secondary)]">{label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Info */}
                <div className="rounded-xl bg-primary-50 dark:bg-primary-900/20 p-3">
                    <p className="text-xs text-primary-700 dark:text-primary-400 font-medium">💡 Theme is saved automatically to your browser preferences.</p>
                </div>
            </div>
        </div>
    );
}
