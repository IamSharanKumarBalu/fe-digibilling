'use client';

export default function QuotationTemplate({ quotation, shopSettings }) {
    // Brand color — falls back to indigo if not set
    const brand = shopSettings?.quotationBrandColor || '#4f46e5';

    // Subtle tint for table header: 12% opacity of brand color
    const brandTint = brand + '1F'; // hex alpha 0x1F ≈ 12%

    const statusColors = {
        DRAFT:    { bg: '#f3f4f6', text: '#374151' },
        SENT:     { bg: '#dbeafe', text: '#1d4ed8' },
        ACCEPTED: { bg: '#d1fae5', text: '#065f46' },
        REJECTED: { bg: '#fee2e2', text: '#991b1b' },
        EXPIRED:  { bg: '#ffedd5', text: '#9a3412' },
    };
    const statusStyle = statusColors[quotation.status] || statusColors.DRAFT;

    return (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden quotation-print">

            {/* ── Brand accent bar at the very top — thin, tasteful ── */}
            <div style={{ backgroundColor: brand, height: '4px' }} />

            <div className="p-8">
                {/* ── Header ─────────────────────────────────────────── */}
                <div className="flex justify-between items-start pb-6 mb-6"
                    style={{ borderBottom: `2px solid ${brand}22` }}>
                    {/* Left: Business info */}
                    <div>
                        {shopSettings?.logo && (
                            <div className="mb-3">
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={shopSettings.logo}
                                    alt={shopSettings.shopName || 'Logo'}
                                    className="h-16 object-contain" />
                            </div>
                        )}
                        <h1 className="text-3xl font-bold text-gray-900">
                            {shopSettings?.shopName || 'Business Name'}
                        </h1>
                        {shopSettings && (
                            <div className="mt-2 text-sm text-gray-500 space-y-0.5">
                                <p>{shopSettings.address}</p>
                                <p>{shopSettings.city}, {shopSettings.state} - {shopSettings.pincode}</p>
                                <p>Phone: {shopSettings.phone}</p>
                                {shopSettings.email && <p>Email: {shopSettings.email}</p>}
                                <p className="font-semibold text-gray-700">GSTIN: {shopSettings.gstin}</p>
                            </div>
                        )}
                    </div>

                    {/* Right: Quotation badge + number + dates */}
                    <div className="text-right">
                        {/* QUOTATION badge — brand color fill */}
                        <div className="inline-block px-5 py-2 rounded-lg"
                            style={{ backgroundColor: brand }}>
                            <p className="text-sm font-bold tracking-widest text-white uppercase">
                                Quotation
                            </p>
                        </div>

                        <p className="mt-3 text-2xl font-bold text-gray-900">
                            {quotation.quotationNumber}
                        </p>
                        <p className="text-sm text-gray-500 mt-1">
                            Date: {new Date(quotation.quotationDate).toLocaleDateString('en-IN')}
                        </p>
                        {quotation.validityDate && (
                            <p className="text-sm text-gray-500 mt-0.5">
                                Valid Until: {new Date(quotation.validityDate).toLocaleDateString('en-IN')}
                            </p>
                        )}
                        <div className="mt-2">
                            <span className="px-2.5 py-1 rounded-full text-xs font-semibold"
                                style={{ backgroundColor: statusStyle.bg, color: statusStyle.text }}>
                                {quotation.status}
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Customer Details ────────────────────────────────── */}
                <div className="mb-6">
                    {/* Small brand-colored left accent bar on the "Quotation For" label */}
                    <div className="flex items-center gap-2 mb-2">
                        <span className="inline-block w-1 h-4 rounded-full"
                            style={{ backgroundColor: brand }} />
                        <h2 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Quotation For
                        </h2>
                    </div>
                    <div className="text-gray-900 pl-3">
                        <p className="font-semibold text-lg">{quotation.customerName}</p>
                        {quotation.customerPhone && (
                            <p className="text-sm text-gray-600">Phone: {quotation.customerPhone}</p>
                        )}
                        {quotation.customerAddress && (
                            <p className="text-sm text-gray-600">{quotation.customerAddress}</p>
                        )}
                        {quotation.customerGstin && (
                            <p className="text-sm text-gray-600">GSTIN: {quotation.customerGstin}</p>
                        )}
                    </div>
                </div>

                {/* ── Items Table ──────────────────────────────────────── */}
                <div className="mb-6 rounded-lg overflow-hidden border border-gray-200">
                    <table className="w-full">
                        <thead>
                            <tr style={{ backgroundColor: brandTint }}>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">#</th>
                                <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase tracking-wide">Item</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">HSN / SAC</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">Qty</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wide">Price</th>
                                <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase tracking-wide">GST %</th>
                                <th className="px-4 py-3 text-right text-xs font-bold text-gray-700 uppercase tracking-wide">Total</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {quotation.items.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-4 py-3 text-sm text-gray-500">{index + 1}</td>
                                    <td className="px-4 py-3">
                                        <div className="text-sm font-semibold text-gray-900">
                                            {item.productName || item.serviceName}
                                        </div>
                                        {item.itemType === 'service' && (
                                            <div className="text-xs text-gray-400 mt-0.5">Service</div>
                                        )}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                        {item.hsnCode || item.sacCode || '—'}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-center">
                                        {item.quantity} {item.unit}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-900 text-right">
                                        ₹{Number(item.sellingPrice).toFixed(2)}
                                    </td>
                                    <td className="px-4 py-3 text-sm text-gray-600 text-center">
                                        {item.gstRate}%
                                    </td>
                                    <td className="px-4 py-3 text-sm font-semibold text-gray-900 text-right">
                                        ₹{Number(item.totalAmount).toFixed(2)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* ── Totals ───────────────────────────────────────────── */}
                <div className="flex justify-end mb-6">
                    <div className="w-72 space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Subtotal</span>
                            <span className="font-medium text-gray-900">₹{Number(quotation.subtotal).toFixed(2)}</span>
                        </div>

                        {quotation.taxType === 'CGST_SGST' ? (
                            <>
                                <div className="flex justify-between text-gray-500">
                                    <span>CGST</span>
                                    <span>₹{Number(quotation.totalCGST).toFixed(2)}</span>
                                </div>
                                <div className="flex justify-between text-gray-500">
                                    <span>SGST</span>
                                    <span>₹{Number(quotation.totalSGST).toFixed(2)}</span>
                                </div>
                            </>
                        ) : quotation.taxType === 'IGST' ? (
                            <div className="flex justify-between text-gray-500">
                                <span>IGST</span>
                                <span>₹{Number(quotation.totalIGST).toFixed(2)}</span>
                            </div>
                        ) : null}

                        {quotation.discount > 0 && (
                            <div className="flex justify-between text-gray-500">
                                <span>Discount</span>
                                <span className="text-red-500">-₹{Number(quotation.discount).toFixed(2)}</span>
                            </div>
                        )}

                        {quotation.roundOff !== 0 && (
                            <div className="flex justify-between text-gray-400 text-xs">
                                <span>Round Off</span>
                                <span>₹{Number(quotation.roundOff).toFixed(2)}</span>
                            </div>
                        )}

                        {/* Grand Total — brand color on the amount */}
                        <div className="pt-3" style={{ borderTop: `2px solid ${brand}` }}>
                            <div className="flex justify-between text-base font-bold">
                                <span className="text-gray-900">Grand Total</span>
                                <span style={{ color: brand }}>
                                    ₹{Number(quotation.grandTotal).toLocaleString('en-IN')}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Notes ────────────────────────────────────────────── */}
                {quotation.notes && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">Notes</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">{quotation.notes}</p>
                    </div>
                )}

                {/* ── Terms & Conditions ───────────────────────────────── */}
                {quotation.terms && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-1.5">
                            Terms &amp; Conditions
                        </h3>
                        <p className="text-xs text-gray-600 whitespace-pre-line leading-relaxed">
                            {quotation.terms}
                        </p>
                    </div>
                )}

                {/* ── Footer — brand color accent line ─────────────────── */}
                <div className="mt-8 pt-4 text-center"
                    style={{ borderTop: `2px solid ${brand}33` }}>
                    <p className="text-sm text-gray-500">This is a quotation and not a final invoice.</p>
                    <p className="text-xs text-gray-400 mt-1">Computer generated document.</p>
                </div>
            </div>
        </div>
    );
}
