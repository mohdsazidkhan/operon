'use client';

import { useState, useEffect } from 'react';
import { Plus, DollarSign, MoreVertical, Star, Clock, AlertCircle } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';

const STAGES = [
    { key: 'prospecting', label: 'Prospecting', color: 'border-[var(--border)] bg-[var(--surface-overlay)]/40' },
    { key: 'qualification', label: 'Qualification', color: 'border-blue-500/20 bg-blue-500/5' },
    { key: 'proposal', label: 'Proposal', color: 'border-purple-500/20 bg-purple-500/5' },
    { key: 'negotiation', label: 'Negotiation', color: 'border-amber-500/20 bg-amber-500/5' },
    { key: 'closed_won', label: 'Closed Won', color: 'border-emerald-500/20 bg-emerald-500/5' },
    { key: 'closed_lost', label: 'Closed Lost', color: 'border-rose-500/20 bg-rose-500/5' },
];

function DealCard({ deal }) {
    return (
        <div className="bg-[var(--card-bg)] backdrop-blur-sm rounded-xl border border-[var(--card-border)] p-4 shadow-lg cursor-grab active:cursor-grabbing hover:border-[var(--primary-500)]/50 transition-all group">
            <div className="flex items-start justify-between mb-3">
                <p className="text-sm font-bold text-[var(--text-primary)] leading-tight pr-2 group-hover:text-[var(--primary-500)] transition-colors">{deal.title}</p>
                <button className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"><MoreVertical size={14} /></button>
            </div>

            <div className="flex items-center gap-2 mb-4 text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)]">
                <span className="truncate max-w-[120px]">{deal.company?.name || 'N/A'}</span>
                <span>•</span>
                <span className="flex items-center gap-1 text-[var(--primary-500)]">
                    <Star size={10} className="fill-current" /> {deal.probability}%
                </span>
            </div>

            <div className="flex items-center justify-between mt-auto">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-500 text-xs font-bold border border-emerald-500/20">
                    {formatCurrency(deal.value)}
                </span>
                <div className="flex -space-x-2">
                    <div className="w-7 h-7 rounded-full bg-[var(--surface-overlay)] border-2 border-[var(--surface)] flex items-center justify-center text-[10px] font-bold text-[var(--text-primary)]">
                        {deal.createdBy?.name?.[0] || 'U'}
                    </div>
                </div>
            </div>

            {deal.probability > 70 && (
                <div className="mt-3 flex items-center gap-1.5 text-[10px] text-emerald-400 font-bold uppercase tracking-wide">
                    <AlertCircle size={12} /> High Probability
                </div>
            )}
        </div>
    );
}

export default function PipelinePage() {
    const [pipeline, setPipeline] = useState({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPipeline = async () => {
            try {
                const res = await fetch('/api/deals/pipeline');
                const data = await res.json();
                if (data.success) {
                    setPipeline(data.data);
                }
            } catch (err) {
                console.error('Failed to fetch pipeline:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchPipeline();
    }, []);

    const totalValue = Object.values(pipeline).flat().reduce((s, d) => s + (d.value || 0), 0);
    const wonValue = (pipeline.closed_won || []).reduce((s, d) => s + (d.value || 0), 0);

    return (
        <div className="h-full flex flex-col space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[var(--text-primary)] tracking-tight">Sales Pipeline</h1>
                    <div className="flex items-center gap-3 mt-1 text-sm font-medium">
                        <span className="text-[var(--text-muted)] flex items-center gap-1">
                            Total: <span className="text-[var(--text-primary)] font-bold">{formatCurrency(totalValue)}</span>
                        </span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--border)]"></span>
                        <span className="text-[var(--text-muted)] flex items-center gap-1">
                            Won: <span className="text-emerald-500 font-bold">{formatCurrency(wonValue)}</span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--surface-overlay)] hover:bg-[var(--surface-overlay)]/80 text-[var(--text-primary)] rounded-xl font-medium text-sm transition-all border border-[var(--border)]">
                        <Clock size={16} /> History
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-[var(--primary-500)] hover:bg-[var(--primary-600)] text-white rounded-xl font-medium text-sm transition-all shadow-lg shadow-[var(--primary-500)]/20">
                        <Plus size={16} /> New Deal
                    </button>
                </div>
            </div>

            {/* Kanban columns */}
            <div className="flex-1 flex gap-6 overflow-x-auto pb-6 -mx-2 px-2 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
                {STAGES.map(stage => {
                    const deals = pipeline[stage.key] || [];
                    const stageValue = deals.reduce((s, d) => s + (d.value || 0), 0);
                    return (
                        <div key={stage.key} className="flex-shrink-0 w-80 flex flex-col">
                            <div className={cn('flex-1 rounded-2xl p-4 border flex flex-col transition-all duration-300', stage.color)}>
                                <div className="flex items-center justify-between mb-5">
                                    <div>
                                        <h3 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2">
                                            {stage.label}
                                            <span className="px-1.5 py-0.5 rounded-md bg-[var(--surface-overlay)] text-[var(--text-muted)] text-[10px]">{deals.length}</span>
                                        </h3>
                                        <p className="text-xs font-bold text-[var(--text-muted)] mt-1">{formatCurrency(stageValue)}</p>
                                    </div>
                                    <button className="w-8 h-8 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:border-[var(--primary-500)]/50 transition-all group/add">
                                        <Plus size={16} className="group-hover/add:rotate-90 transition-transform" />
                                    </button>
                                </div>

                                <div className="space-y-4 flex-1 overflow-y-auto pr-1 scrollbar-none">
                                    {loading ? (
                                        [1, 2].map(i => <div key={i} className="h-32 bg-[var(--surface-overlay)] rounded-xl animate-pulse"></div>)
                                    ) : deals.length > 0 ? (
                                        deals.map(deal => <DealCard key={deal._id} deal={deal} />)
                                    ) : (
                                        <div className="h-32 flex flex-col items-center justify-center gap-2 border-2 border-dashed border-[var(--border)] rounded-xl group/drop">
                                            <div className="w-10 h-10 rounded-full bg-[var(--surface-overlay)] flex items-center justify-center text-[var(--text-muted)] group-hover/drop:text-[var(--text-secondary)] transition-colors">
                                                <DollarSign size={20} />
                                            </div>
                                            <p className="text-[10px] font-bold text-[var(--text-muted)] uppercase tracking-widest group-hover/drop:text-[var(--text-secondary)] transition-colors">No active deals</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
