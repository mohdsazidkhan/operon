'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Printer, Download, CheckCircle, Send, AlertCircle } from 'lucide-react';
import { cn, formatDate, formatCurrency } from '@/lib/utils';
import toast from 'react-hot-toast';

const STATUS_COLORS = {
    draft: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200',
    sent: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30 border-blue-200',
    paid: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30 border-emerald-200',
    overdue: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30 border-rose-200',
    cancelled: 'text-slate-500 bg-slate-100 dark:bg-slate-800 border-slate-200',
};

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [invoice, setInvoice] = useState(null);
    const [loading, setLoading] = useState(true);
    const printRef = useRef(null);

    useEffect(() => {
        (async () => {
            try {
                const res = await fetch(`/api/invoices/${id}`);
                const data = await res.json();
                if (data.success) setInvoice(data.data);
            } catch { toast.error('Failed to load invoice'); }
            finally { setLoading(false); }
        })();
    }, [id]);

    const updateStatus = async (status) => {
        try {
            const res = await fetch(`/api/invoices/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status }) });
            const data = await res.json();
            if (data.success) { setInvoice(p => ({ ...p, status })); toast.success(`Invoice marked as ${status}`); }
        } catch { toast.error('Failed'); }
    };

    const handlePrint = () => window.print();

    if (loading) return <div className="animate-pulse p-8"><div className="h-96 bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl" /></div>;
    if (!invoice) return <div className="flex flex-col items-center py-24 gap-4"><AlertCircle size={40} className="text-[var(--text-muted)]" /><p className="text-[var(--text-muted)]">Invoice not found</p></div>;

    const balance = (invoice.total || 0) - (invoice.amountPaid || 0);

    return (
        <>
            <style>{`@media print { .no-print { display: none !important; } .print-area { box-shadow: none !important; border: none !important; } body { background: white !important; } }`}</style>

            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Toolbar */}
                <div className="no-print flex flex-wrap items-center gap-3 justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:bg-[var(--surface-overlay)] transition-all"><ArrowLeft size={16} /></button>
                        <div>
                            <h1 className="text-xl font-bold text-[var(--text-primary)]">{invoice.invoiceNumber}</h1>
                            <p className="text-[var(--text-muted)] text-sm">Invoice Detail</p>
                        </div>
                    </div>
                    <div className="flex items-center flex-wrap gap-2">
                        <span className={cn('text-xs font-bold uppercase px-3 py-1.5 rounded-full border', STATUS_COLORS[invoice.status] || '')}>{invoice.status}</span>
                        {invoice.status === 'draft' && (
                            <button onClick={() => updateStatus('sent')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-blue-400 text-blue-500 hover:bg-blue-500/10 transition-all">
                                <Send size={14} /> Mark Sent
                            </button>
                        )}
                        {invoice.status === 'sent' && (
                            <button onClick={() => updateStatus('paid')} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold border border-emerald-400 text-emerald-500 hover:bg-emerald-500/10 transition-all">
                                <CheckCircle size={14} /> Mark Paid
                            </button>
                        )}
                        <button onClick={handlePrint} className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold bg-[var(--primary-500)] text-white hover:bg-[var(--primary-600)] transition-all shadow-lg shadow-[var(--primary-500)]/20">
                            <Printer size={14} /> Print / PDF
                        </button>
                    </div>
                </div>

                {/* Invoice Document */}
                <div ref={printRef} className="print-area bg-white dark:bg-[var(--card-bg)] border border-[var(--card-border)] rounded-2xl shadow-lg overflow-hidden">
                    {/* Header band */}
                    <div className="bg-[var(--primary-500)] px-8 py-8 text-white">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-black">INVOICE</h2>
                                <p className="text-white/70 mt-1">{invoice.invoiceNumber}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-white/70 text-sm">Issued</p>
                                <p className="font-semibold">{formatDate(invoice.issuedDate)}</p>
                                <p className="text-white/70 text-sm mt-2">Due Date</p>
                                <p className="font-semibold">{formatDate(invoice.dueDate)}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 space-y-8">
                        {/* From / To */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Billed By</p>
                                <p className="font-bold text-[var(--text-primary)]">{invoice.company?.name || 'Your Company'}</p>
                                <p className="text-sm text-[var(--text-muted)]">{invoice.createdBy?.name}</p>
                            </div>
                            <div>
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Billed To</p>
                                <p className="font-bold text-[var(--text-primary)]">{invoice.customer?.name || '—'}</p>
                                <p className="text-sm text-[var(--text-muted)]">{invoice.customer?.email}</p>
                                <p className="text-sm text-[var(--text-muted)]">{invoice.customer?.phone}</p>
                            </div>
                        </div>

                        {/* Line Items */}
                        <div>
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b-2 border-[var(--border)]">
                                        <th className="pb-3 text-left text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Description</th>
                                        <th className="pb-3 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-16">Qty</th>
                                        <th className="pb-3 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-28">Price</th>
                                        <th className="pb-3 text-right text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider w-28">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-[var(--border)]">
                                    {(invoice.items || []).map((item, i) => (
                                        <tr key={i}>
                                            <td className="py-3 text-[var(--text-secondary)]">{item.description}</td>
                                            <td className="py-3 text-right text-[var(--text-secondary)]">{item.quantity}</td>
                                            <td className="py-3 text-right text-[var(--text-secondary)]">{formatCurrency(item.price)}</td>
                                            <td className="py-3 text-right font-semibold text-[var(--text-primary)]">{formatCurrency(item.total)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Totals */}
                        <div className="flex justify-end">
                            <div className="w-full max-w-xs space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">Subtotal</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(invoice.subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-[var(--text-muted)]">Tax</span>
                                    <span className="font-semibold text-[var(--text-primary)]">{formatCurrency(invoice.tax || 0)}</span>
                                </div>
                                {invoice.amountPaid > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-[var(--text-muted)]">Amount Paid</span>
                                        <span className="font-semibold text-emerald-500">-{formatCurrency(invoice.amountPaid)}</span>
                                    </div>
                                )}
                                <div className="flex justify-between pt-3 border-t-2 border-[var(--primary-500)]">
                                    <span className="font-bold text-[var(--text-primary)]">{balance > 0 ? 'Balance Due' : 'Total'}</span>
                                    <span className="text-xl font-black text-[var(--primary-500)]">{formatCurrency(Math.abs(balance))}</span>
                                </div>
                            </div>
                        </div>

                        {/* Notes */}
                        {invoice.notes && (
                            <div className="border-t border-[var(--border)] pt-6">
                                <p className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider mb-2">Notes</p>
                                <p className="text-sm text-[var(--text-secondary)]">{invoice.notes}</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
