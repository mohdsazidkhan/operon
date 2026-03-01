'use client';

import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Pagination({ page, pages, onPageChange, total }) {
    if (pages <= 1) return null;

    const renderButtons = () => {
        const buttons = [];
        const start = Math.max(1, page - 2);
        const end = Math.min(pages, page + 2);

        for (let i = start; i <= end; i++) {
            buttons.push(
                <button
                    key={i}
                    onClick={() => onPageChange(i)}
                    className={cn(
                        'w-10 h-10 rounded-xl font-black text-[10px] transition-all border-2',
                        page === i
                            ? 'bg-[var(--text-primary)] text-[var(--surface)] border-[var(--text-primary)] scale-110 shadow-xl z-10'
                            : 'bg-[var(--surface-raised)]/50 text-[var(--text-muted)] border-[var(--border)] hover:border-[var(--primary-500)]/50'
                    )}
                >
                    {String(i).padStart(2, '0')}
                </button>
            );
        }
        return buttons;
    };

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 pt-10 border-t border-[var(--border)]">
            <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.4em] italic opacity-50">
                DISPLAYING PAGE {page} OF {pages} • {total} TOTAL NODES
            </p>
            
            <div className="flex items-center gap-2">
                <button
                    onClick={() => onPageChange(1)}
                    disabled={page === 1}
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] disabled:opacity-20 transition-all active:scale-95"
                >
                    <ChevronsLeft size={16} />
                </button>
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] disabled:opacity-20 transition-all active:scale-95"
                >
                    <ChevronLeft size={16} />
                </button>

                <div className="flex items-center gap-2 mx-2">
                    {renderButtons()}
                </div>

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === pages}
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] disabled:opacity-20 transition-all active:scale-95"
                >
                    <ChevronRight size={16} />
                </button>
                <button
                    onClick={() => onPageChange(pages)}
                    disabled={page === pages}
                    className="p-2.5 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] disabled:opacity-20 transition-all active:scale-95"
                >
                    <ChevronsRight size={16} />
                </button>
            </div>
        </div>
    );
}
