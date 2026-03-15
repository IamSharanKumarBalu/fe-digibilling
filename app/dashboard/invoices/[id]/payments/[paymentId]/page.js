'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import DashboardLayout from '@/components/DashboardLayout';
import PageLoader from '@/components/PageLoader';
import { invoicesAPI, shopAPI } from '@/utils/api';
import { HiPencil, HiX } from 'react-icons/hi';
import Image from 'next/image';

export default function PaymentReceipt() {
    const { user, loading } = useAuth();
    const router = useRouter();
    const toast = useToast();
    const params = useParams();

    const [invoice, setInvoice] = useState(null);
    const [payment, setPayment] = useState(null);
    const [shopSettings, setShopSettings] = useState(null);
    const [loadingData, setLoadingData] = useState(true);

    // Edit payment modal state
    const [showEditModal, setShowEditModal] = useState(false);
    const [editAmount, setEditAmount] = useState(0);
    const [editMethod, setEditMethod] = useState('CASH');
    const [editDate, setEditDate] = useState('');
    const [editReference, setEditReference] = useState('');
    const [editNotes, setEditNotes] = useState('');
    const [savingEdit, setSavingEdit] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [invoiceData, shopData] = await Promise.all([
                invoicesAPI.getOne(params.id),
                shopAPI.get(),
            ]);

            setInvoice(invoiceData);
            setShopSettings(shopData);

            const found = invoiceData.payments?.find((p) => p._id === params.paymentId);
            if (!found) {
                toast.error('Payment not found');
                router.push(`/dashboard/invoices/${params.id}`);
                return;
            }
            setPayment(found);
        } catch (error) {
            console.error('Error loading receipt:', error);
            toast.error('Could not load payment receipt');
            router.push(`/dashboard/invoices/${params.id}`);
        } finally {
            setLoadingData(false);
        }
    }, [params.id, params.paymentId, router, toast]);

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (user && params.id && params.paymentId) {
            loadData();
        }
    }, [user, loading, router, loadData, params.id, params.paymentId]);

    const handleSavePDF = () => {
        const hasSeenTip = localStorage.getItem('pdfPrintTipSeen');
        if (!hasSeenTip) {
            toast.info('Tip: Turn OFF "Headers and footers" in print dialog for a clean PDF', 6000);
            localStorage.setItem('pdfPrintTipSeen', 'true');
        }
        window.print();
    };

    const handleWhatsApp = () => {
        const shopName = shopSettings?.shopName || 'Our Store';
        const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-IN');
        const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-IN');

        const message =
            `Hi ${invoice.customerName}! 👋\n\n` +
            `Here is your *Payment Receipt* from *${shopName}*:\n\n` +
            `🧾 *Invoice:* ${invoice.invoiceNumber}\n` +
            `📅 *Invoice Date:* ${invoiceDate}\n\n` +
            `💳 *Payment Details:*\n` +
            `  • Amount Paid: *₹${payment.amount.toLocaleString('en-IN')}*\n` +
            `  • Method: ${payment.paymentMethod}\n` +
            `  • Date: ${paymentDate}\n` +
            (payment.referenceNumber ? `  • Ref: ${payment.referenceNumber}\n` : '') +
            `\n💰 *Invoice Summary:*\n` +
            `  • Total: ₹${invoice.grandTotal.toLocaleString('en-IN')}\n` +
            `  • Paid: ₹${invoice.paidAmount.toLocaleString('en-IN')}\n` +
            (invoice.balanceAmount > 0
                ? `  • Balance Due: ₹${invoice.balanceAmount.toLocaleString('en-IN')}\n`
                : `  • Status: ✅ Fully Paid\n`) +
            `\nThank you for your payment! 🙏`;

        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    // --- Method badge colour helper ---
    const methodColor = (method) => {
        const map = {
            CASH: 'bg-green-100 text-green-800',
            UPI: 'bg-purple-100 text-purple-800',
            CARD: 'bg-blue-100 text-blue-800',
            CHEQUE: 'bg-yellow-100 text-yellow-800',
            BANK_TRANSFER: 'bg-indigo-100 text-indigo-800',
            CREDIT_NOTE: 'bg-orange-100 text-orange-800',
        };
        return map[method] || 'bg-gray-100 text-gray-700';
    };

    if (loading || !user || loadingData) {
        return <PageLoader text="Loading payment receipt..." />;
    }

    if (!invoice || !payment) return null;

    const paymentDate = new Date(payment.paymentDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    const invoiceDate = new Date(invoice.invoiceDate).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
    });

    // Open edit modal pre-filled with current payment data
    const openEditModal = () => {
        setEditAmount(payment.amount);
        setEditMethod(payment.paymentMethod);
        setEditDate(new Date(payment.paymentDate).toISOString().split('T')[0]);
        setEditReference(payment.referenceNumber || '');
        setEditNotes(payment.notes || '');
        setShowEditModal(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        setSavingEdit(true);
        try {
            await invoicesAPI.editPayment(params.id, params.paymentId, {
                amount: editAmount,
                paymentMethod: editMethod,
                paymentDate: editDate,
                referenceNumber: editReference,
                notes: editNotes,
            });
            toast.success('Payment updated successfully!');
            setShowEditModal(false);
            loadData(); // Refresh to show updated data on receipt
        } catch (error) {
            toast.error(error.message || 'Failed to update payment');
        } finally {
            setSavingEdit(false);
        }
    };

    // Generate receipt number
    const receiptNumber = `PR${invoice.payments?.findIndex(p => p._id === params.paymentId) + 1 || 1}`;

    // Convert number to words (INR)
    const amountInWords = (amount) => {
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
            'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
        const toWords = (n) => {
            if (n === 0) return '';
            if (n < 20) return ones[n] + ' ';
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '') + ' ';
            if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred ' + toWords(n % 100);
            if (n < 100000) return toWords(Math.floor(n / 1000)) + 'Thousand ' + toWords(n % 1000);
            if (n < 10000000) return toWords(Math.floor(n / 100000)) + 'Lakh ' + toWords(n % 100000);
            return toWords(Math.floor(n / 10000000)) + 'Crore ' + toWords(n % 10000000);
        };
        const n = Math.round(amount);
        return (toWords(n).trim() || 'Zero') + ' Rupees Only';
    };

    return (
        <DashboardLayout>
            {/* ── Top Action Bar ── */}
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center justify-between mb-6 no-print">
                    <button
                        onClick={() => router.back()}
                        className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                        ← Back
                    </button>

                    <div className="flex gap-2">
                        {/* Edit */}
                        <button
                            onClick={openEditModal}
                            className="flex items-center gap-1.5 px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                            title="Edit payment"
                        >
                            <HiPencil className="w-4 h-4" />
                            Edit
                        </button>

                        {/* WhatsApp */}
                        <button
                            onClick={handleWhatsApp}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium shadow-sm"
                        >
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                            </svg>
                            Share on WhatsApp
                        </button>

                        {/* Save as PDF */}
                        <button
                            onClick={handleSavePDF}
                            className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium shadow-sm"
                        >
                            📥 Save as PDF
                        </button>
                    </div>
                </div>

                {/* ── Receipt Card (formal document style) ── */}
                <div className="bg-white border border-gray-400 receipt-print" style={{ fontFamily: 'Arial, sans-serif' }}>

                    {/* Title */}
                    <div className="text-center py-3 border-b border-gray-400">
                        <h1 className="text-base font-bold tracking-widest text-gray-900 uppercase">Payment Receipt</h1>
                    </div>

                    {/* Company header */}
                    <div className="text-center py-3 border-b border-gray-400">
                        <p className="text-sm font-bold text-gray-900 uppercase">{shopSettings?.shopName || 'Business Name'}</p>
                        {shopSettings?.city && (
                            <p className="text-xs text-gray-700 mt-0.5">
                                {shopSettings.city}{shopSettings.state ? `, ${shopSettings.state} ` : ' '}
                            </p>
                        )}
                        {shopSettings?.gstin && (
                            <p className="text-xs text-gray-700 mt-0.5">GSTIN : {shopSettings.gstin}</p>
                        )}
                    </div>

                    {/* Key-value rows */}
                    <div className="border-b border-gray-400">
                        {[
                            ['Receipt No', receiptNumber],
                            ['Date', paymentDate],
                            ['Received From', invoice.customerName],
                            ['Payment Mode', payment.paymentMethod.charAt(0) + payment.paymentMethod.slice(1).toLowerCase().replace('_', ' ')],
                            ...(payment.referenceNumber ? [['Reference No', payment.referenceNumber]] : []),
                        ].map(([label, value]) => (
                            <div key={label} className="flex border-b border-gray-200 last:border-0">
                                <div className="w-44 px-4 py-2 text-xs text-gray-700">{label}</div>
                                <div className="w-6 px-1 py-2 text-xs text-gray-500">:</div>
                                <div className="flex-1 px-2 py-2 text-xs font-semibold text-gray-900">{value}</div>
                            </div>
                        ))}
                    </div>

                    {/* Invoice breakup table */}
                    <div className="border-b border-gray-400">
                        <div className="text-center py-1.5 border-b border-gray-300 bg-gray-50">
                            <p className="text-xs font-semibold text-gray-800">Invoice Payment Breakup</p>
                        </div>
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="border-b border-gray-300 bg-gray-50">
                                    <th className="px-4 py-2 text-left font-semibold text-gray-700 border-r border-gray-300">Invoice No</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-700 border-r border-gray-300">Total Amt</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-700 border-r border-gray-300">Paid Amt</th>
                                    <th className="px-4 py-2 text-right font-semibold text-gray-700">Due Amt</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="border-b border-gray-200">
                                    <td className="px-4 py-2 text-gray-800 border-r border-gray-300">{invoice.invoiceNumber}</td>
                                    <td className="px-4 py-2 text-right text-gray-800 border-r border-gray-300">₹ {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-2 text-right text-gray-800 border-r border-gray-300">₹ {payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-2 text-right text-gray-800">₹ {invoice.balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                                <tr className="bg-gray-50">
                                    <td className="px-4 py-2 font-semibold text-gray-800 border-r border-gray-300">Total</td>
                                    <td className="px-4 py-2 text-right font-semibold text-gray-800 border-r border-gray-300">₹ {invoice.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-2 text-right font-semibold text-gray-800 border-r border-gray-300">₹ {payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                    <td className="px-4 py-2 text-right font-semibold text-gray-800">₹ {invoice.balanceAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    {/* Payment summary rows */}
                    <div className="border-b border-gray-400">
                        {[
                            ['Paid Against Invoice', `₹ ${payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                            ['Excess Amount', '₹ 0'],
                            ['Total Amount Received', `₹ ${payment.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`],
                        ].map(([label, value], i) => (
                            <div key={label} className={`flex justify-between px-4 py-1.5 text-xs border-b border-gray-100 last:border-0 ${i === 2 ? 'font-semibold text-gray-900' : 'text-gray-700'}`}>
                                <span>{label}</span>
                                <span>{value}</span>
                            </div>
                        ))}
                    </div>

                    {/* Amount in words */}
                    <div className="px-4 py-2 border-b border-gray-400">
                        <p className="text-xs text-gray-800">
                            <span className="font-medium">Total amount in words : </span>
                            {amountInWords(payment.amount)}
                        </p>
                    </div>

                    {/* Notes */}
                    {payment.notes && (
                        <div className="px-4 py-2 border-b border-gray-400">
                            <p className="text-xs text-gray-700"><span className="font-medium">Notes : </span>{payment.notes}</p>
                        </div>
                    )}

                    {/* Authorised signatory */}
                    <div className="px-4 py-8 text-right">
                        <p className="text-xs text-blue-700 font-medium">Authorised Signatory</p>
                    </div>
                </div>
            </div>

            {/* ── Edit Payment Modal ── */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto no-print">
                    <div className="flex items-center justify-center min-h-screen px-4 text-center">
                        <div
                            className="fixed inset-0 bg-gray-900 bg-opacity-50 backdrop-blur-sm"
                            onClick={() => setShowEditModal(false)}
                        />
                        <div className="relative z-50 w-full max-w-lg text-left bg-white shadow-2xl rounded-2xl overflow-hidden">
                            {/* Modal header */}
                            <div className="px-6 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">Edit Payment</h3>
                                    <p className="text-sm text-green-100 mt-0.5">Update payment details</p>
                                </div>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                                >
                                    <HiX className="w-5 h-5" />
                                </button>
                            </div>

                            {/* Modal body */}
                            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
                                {/* Amount */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Payment Amount *
                                    </label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">₹</span>
                                        <input
                                            type="number"
                                            required
                                            step="0.01"
                                            min="0.01"
                                            value={editAmount}
                                            onChange={(e) => setEditAmount(Number(e.target.value))}
                                            className="w-full pl-8 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        />
                                    </div>
                                </div>

                                {/* Method */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Payment Method *
                                    </label>
                                    <select
                                        required
                                        value={editMethod}
                                        onChange={(e) => setEditMethod(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    >
                                        <option value="CASH">Cash</option>
                                        <option value="UPI">UPI</option>
                                        <option value="CARD">Card</option>
                                        <option value="CHEQUE">Cheque</option>
                                        <option value="BANK_TRANSFER">Bank Transfer</option>
                                        <option value="CREDIT_NOTE">Credit Note</option>
                                        <option value="OTHER">Other</option>
                                    </select>
                                </div>

                                {/* Date */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Payment Date *
                                    </label>
                                    <input
                                        type="date"
                                        required
                                        value={editDate}
                                        onChange={(e) => setEditDate(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                    />
                                </div>

                                {/* Reference */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Reference Number
                                    </label>
                                    <input
                                        type="text"
                                        value={editReference}
                                        onChange={(e) => setEditReference(e.target.value)}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                                        placeholder="Transaction ID, Cheque No., etc."
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Notes
                                    </label>
                                    <textarea
                                        value={editNotes}
                                        onChange={(e) => setEditNotes(e.target.value)}
                                        rows={2}
                                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none"
                                        placeholder="Additional notes (optional)"
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-3 pt-2 border-t border-gray-200">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 px-4 py-2.5 text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 transition-colors font-medium"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={savingEdit}
                                        className="flex-1 px-4 py-2.5 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all font-medium shadow-sm disabled:opacity-60"
                                    >
                                        {savingEdit ? 'Saving...' : 'Update Payment'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* ── Print styles ── */}
            <style jsx global>{`
        @page {
          size: A5 portrait;
          margin: 10mm;
        }

        @media print {
          * {
            visibility: hidden;
          }

          .receipt-print,
          .receipt-print * {
            visibility: visible;
          }

          html, body {
            width: 148mm;
            margin: 0;
            padding: 0;
            background: white;
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

          .no-print {
            display: none !important;
          }

          .receipt-print {
            position: absolute;
            left: 0;
            top: 0;
            width: 148mm;
            box-shadow: none !important;
            border: none !important;
            border-radius: 0 !important;
          }
        }
      `}</style>
        </DashboardLayout>
    );
}
