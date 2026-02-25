import { ShoppingCart, Truck, CheckCircle2, Clock, ArrowUpRight } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { getOrders } from '@/lib/data-access';
import OrdersLedger from '@/components/erp/OrdersLedger';

export default async function OrdersPage() {
    const orders = await getOrders();
    const serializedOrders = JSON.parse(JSON.stringify(orders));

    const totalFlow = serializedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
    const deliveredCount = serializedOrders.filter(o => o.status === 'delivered').length;
    const fulfillmentRate = serializedOrders.length > 0 ? ((deliveredCount / serializedOrders.length) * 100).toFixed(1) : '0';

    const logisticsStats = [
        { label: 'Active Streams', value: serializedOrders.filter(o => o.status !== 'delivered').length, icon: Truck, color: 'text-indigo-400' },
        { label: 'Fulfilled Cycle', value: `${fulfillmentRate}%`, icon: CheckCircle2, color: 'text-emerald-400' },
        { label: 'Avg Velocity', value: '1.2d', icon: Clock, color: 'text-amber-400' },
        { label: 'Net Flow', value: formatCurrency(totalFlow), icon: ArrowUpRight, color: 'text-primary-400' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Context Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">Lifecycle Transaction Ledger</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <ShoppingCart size={12} className="text-primary-500" />
                        Real-time Order Vectoring • Logistics Stream Active
                    </p>
                </div>
            </div>

            {/* Logistics Status Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {logisticsStats.map((stat, i) => (
                    <div key={i} className="bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 p-8 shadow-2xl group flex flex-col justify-between h-40">
                        <div className={cn('p-3 rounded-2xl bg-slate-950 border border-slate-800 w-fit', stat.color)}>
                            <stat.icon size={20} />
                        </div>
                        <div>
                            <p className="text-2xl font-black text-white tracking-tighter">{stat.value}</p>
                            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            <OrdersLedger initialOrders={serializedOrders} />
        </div>
    );
}
