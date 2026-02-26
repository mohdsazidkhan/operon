import { BarChart3 } from 'lucide-react';
import { getProducts } from '@/lib/data-access';
import ProductsLedger from '@/components/erp/ProductsLedger';

export default async function ProductsPage() {
    const products = await getProducts();
    const serializedProducts = JSON.parse(JSON.stringify(products));

    return (
        <div className="space-y-8 animate-in fade-in duration-700 pb-12">
            {/* Context Header */}
            <div className="flex flex-wrap items-end justify-between gap-6 px-2">
                <div>
                    <h1 className="text-3xl font-black text-[var(--text-primary)] tracking-tighter uppercase italic">Product Catalog Architecture</h1>
                    <p className="text-[var(--text-muted)] text-[10px] font-black uppercase tracking-[0.4em] mt-2 flex items-center gap-2">
                        <BarChart3 size={12} className="text-[var(--primary-500)]" />
                        Asset Inventory Ledger • Valuation Tracking Active
                    </p>
                </div>
            </div>

            <ProductsLedger initialProducts={serializedProducts} />
        </div>
    );
}
