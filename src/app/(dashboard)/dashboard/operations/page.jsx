import { Box, ShoppingCart, CheckCircle, AlertTriangle, TrendingUp, BarChart3, PieChart, Activity, ArrowRight } from 'lucide-react';
import { formatCurrency, cn } from '@/lib/utils';
import { getDashboardStats, getProducts } from '@/lib/data-access';
import { StockSaturationChart, DeliveryMatrixChart } from '@/components/dashboard/OperationsCharts';

export default async function OperationsDashboard() {
    const stats = await getDashboardStats();
    const products = await getProducts();
    const serializedProducts = JSON.parse(JSON.stringify(products));

    const lowStockItems = serializedProducts.filter(p => p.stock < 20).slice(0, 3);
    const lowStockCount = lowStockItems.length;

    const kpis = [
        { title: 'Total Products', value: stats.products, icon: Box, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { title: 'Total Orders', value: stats.orders, icon: ShoppingCart, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { title: 'Total Sales', value: formatCurrency(stats.revenue * 0.8), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        { title: 'Low Stock Items', value: lowStockItems.length, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-500/10' },
    ];

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Operations Overview</h1>
                    <p className="text-[var(--text-muted)] text-[11px] font-black uppercase tracking-[0.3em] mt-2 flex items-center gap-2">
                        <TrendingUp size={14} className="text-emerald-500" />
                        Delivery Speed • Inventory Monitoring
                    </p>
                </div>
            </div>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpis.map((k, i) => (
                    <div key={i} className="bg-[var(--card-bg)] backdrop-blur-xl rounded-[2.5rem] p-7 border border-[var(--card-border)] shadow-2xl relative overflow-hidden group hover:border-[var(--primary-500)]/30 transition-all">
                        <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 blur-2xl group-hover:bg-white/10 transition-all duration-700"></div>
                        <div className="flex items-center justify-between mb-4 relative z-10">
                            <div className={cn('p-3 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] transition-colors', k.color)}>
                                <k.icon size={20} />
                            </div>
                        </div>
                        <p className="text-3xl font-black text-[var(--text-primary)] tracking-tighter relative z-10">{k.value}</p>
                        <p className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1 relative z-10">{k.title}</p>
                    </div>
                ))}
            </div>

            {/* Main Operational Analysis */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl group relative overflow-hidden">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <BarChart3 size={16} className="text-[var(--primary-400)]" /> Inventory Levels
                    </h3>
                    <div className="h-[280px]">
                        <StockSaturationChart />
                    </div>
                </div>

                <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] p-8 shadow-2xl group relative overflow-hidden">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em] mb-8 flex items-center gap-2">
                        <PieChart size={16} className="text-emerald-400" /> Delivery Status
                    </h3>
                    <div className="h-[280px]">
                        <DeliveryMatrixChart />
                    </div>
                </div>
            </div>

            {/* Alerts Ledger */}
            {lowStockItems.length > 0 && (
                <div className="bg-rose-500/5 backdrop-blur-3xl border border-rose-500/20 rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-rose-500 flex items-center justify-center text-white shadow-xl shadow-rose-500/20">
                            <AlertTriangle size={20} />
                        </div>
                        <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em]">Low Stock Alert</h3>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {lowStockItems.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-5 rounded-[2rem] bg-[var(--surface-overlay)]/40 border border-[var(--border)] hover:border-rose-500/30 transition-all">
                                <div>
                                    <p className="text-xs font-black text-[var(--text-primary)] uppercase tracking-tight">{p.name}</p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></div>
                                        <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest">{p.stock} units remaining</p>
                                    </div>
                                </div>
                                <button className="p-2.5 rounded-xl bg-[var(--surface-raised)] text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all"><ArrowRight size={16} /></button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Operational Velocity Feed */}
            <div className="bg-[var(--card-bg)] backdrop-blur-3xl rounded-[3rem] border border-[var(--card-border)] shadow-2xl p-8 mb-12">
                <div className="flex items-center justify-between mb-8">
                    <h3 className="text-sm font-black text-[var(--text-primary)] uppercase tracking-[0.3em]">Order Status</h3>
                    <Activity size={16} className="text-[var(--text-muted)] opacity-50" />
                </div>
                <div className="space-y-4">
                    {[
                        { title: 'Order #A92 Shipping', status: 'In Transit', progress: 85, color: 'bg-emerald-500' },
                        { title: 'Incoming Shipments', status: 'Processing', progress: 45, color: 'bg-[var(--primary-500)]' },
                        { title: 'Warehouse Restock', status: 'Pending', progress: 12, color: 'bg-amber-500' },
                    ].map((v, i) => (
                        <div key={i} className="space-y-2 p-5 rounded-[2rem] bg-[var(--surface-overlay)]/40 border border-[var(--border)] group hover:border-[var(--primary-500)]/30 transition-all">
                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest">
                                <span className="text-[var(--text-primary)] group-hover:text-[var(--primary-500)] transition-colors">{v.title}</span>
                                <span className="text-[var(--text-muted)] italic">{v.status}</span>
                            </div>
                            <div className="relative w-full h-1.5 bg-[var(--surface-raised)] rounded-full overflow-hidden shadow-inner">
                                <div
                                    className={cn('h-full rounded-full transition-all duration-1000 ease-out shadow-[0_0_10px_currentColor]', v.color)}
                                    style={{ width: `${v.progress}%` }}
                                />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
