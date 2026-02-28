'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Truck, CheckCircle2, Clock, ArrowUpRight, BarChart3 } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import OrdersLedger from '@/components/erp/OrdersLedger';

export default function OrdersPage() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/orders')
            .then(res => res.json())
            .then(data => {
                if (data.success) setOrders(data.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    }, []);

    if (loading) return <div className="p-8 animate-pulse text-[var(--text-muted)] text-sm">Loading logistics data...</div>;

    const totalFlow = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    const deliveredCount = orders.filter(o => o.status === 'delivered').length;
    const fulfillmentRate = orders.length > 0 ? ((deliveredCount / orders.length) * 100).toFixed(1) : '0';

    const logisticsStats = [
        { label: 'Pending Orders', value: orders.filter(o => o.status !== 'delivered').length, icon: Truck, color: 'text-indigo-400' },
        { label: 'Completed Orders', value: `${fulfillmentRate}%`, icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'Delivery Time', value: '1.2d', icon: Clock, color: 'text-amber-400' },
        { label: 'Total Sales', value: formatCurrency(totalFlow), icon: ArrowUpRight, color: 'text-primary-400' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Context Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Order List</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <BarChart3 size={12} className="text-[var(--primary-500)]" />
                        Tracking Orders • Logistics Tracking
                    </p>
                </div>
            </div>

            {/* Logistics Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {logisticsStats.map((stat, i) => (
                    <div key={i} className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[2.5rem] border border-[var(--card-border)] p-8 shadow-2xl group flex flex-col justify-between h-40">
                        <div className={cn('p-3 rounded-2xl bg-[var(--surface-overlay)] border border-[var(--border)] w-fit', stat.color)}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-[var(--text-primary)] tracking-tighter">{stat.value}</p>
                            <p className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <OrdersLedger />
        </div>
    );
}
