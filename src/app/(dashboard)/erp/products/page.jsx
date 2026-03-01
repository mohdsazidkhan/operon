'use client';

import { useState, useEffect } from 'react';
import { BarChart3 } from 'lucide-react';
import ProductsLedger from '@/components/erp/ProductsLedger';

export default function ProductsPage() {
    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Context Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic underline decoration-[var(--primary-500)] decoration-4 underline-offset-8">Product Repository</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
                        <BarChart3 size={12} className="text-[var(--primary-500)]" />
                        Inventory Tracking • Stock Monitoring
                    </p>
                </div>
            </div>

            <ProductsLedger />
        </div>
    );
}
