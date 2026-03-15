'use client';

import { useState, useEffect } from 'react';
import { HiDocument, HiCollection, HiSave, HiTruck, HiClipboardList, HiInformationCircle, HiColorSwatch, HiCheck } from 'react-icons/hi';
import { shopAPI } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export default function QuotationSettingsTab() {
    const toast = useToast();
    const [settings, setSettings] = useState({
        validityDays: '30',
        qtEnableTransport: false,
        qtEnablePurchaseOrders: false,
        qtEnableAdditionalDetails: false,
        quotationTerms: '',
    });
    const [brandColor, setBrandColor] = useState('#f97316'); // default orange
    const [saving, setSaving] = useState(false);

    const PRESET_COLORS = [
        { hex: '#f97316', name: 'Orange' },
        { hex: '#ef4444', name: 'Red' },
        { hex: '#8b5cf6', name: 'Violet' },
        { hex: '#3b82f6', name: 'Blue' },
        { hex: '#10b981', name: 'Emerald' },
        { hex: '#14b8a6', name: 'Teal' },
        { hex: '#f59e0b', name: 'Amber' },
        { hex: '#ec4899', name: 'Pink' },
        { hex: '#6366f1', name: 'Indigo' },
        { hex: '#64748b', name: 'Slate' },
        { hex: '#1f2937', name: 'Charcoal' },
        { hex: '#78350f', name: 'Brown' },
    ];

    useEffect(() => {
        shopAPI.get().then(data => {
            if (data) {
                setSettings(p => ({
                    ...p,
                    validityDays: data.quotationValidityDays || '30',
                    qtEnableTransport: data.qtEnableTransport ?? false,
                    qtEnablePurchaseOrders: data.qtEnablePurchaseOrders ?? false,
                    qtEnableAdditionalDetails: data.qtEnableAdditionalDetails ?? false,
                    quotationTerms: data.quotationTerms || '',
                }));
                if (data.quotationBrandColor) setBrandColor(data.quotationBrandColor);
            }
        }).catch(console.error);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await shopAPI.update({
                quotationValidityDays: settings.validityDays,
                qtEnableTransport: settings.qtEnableTransport,
                qtEnablePurchaseOrders: settings.qtEnablePurchaseOrders,
                qtEnableAdditionalDetails: settings.qtEnableAdditionalDetails,
                quotationTerms: settings.quotationTerms,
                quotationBrandColor: brandColor,
            });
            toast.success('Quotation settings saved!');
        } catch (error) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));

    const handleChange = (e) => setSettings(p => ({ ...p, [e.target.name]: e.target.value }));

    const ITEM_FIELDS = [
        {
            key: 'qtEnableTransport',
            label: 'Transport Details',
            desc: 'Show transportation info section',
            icon: <HiTruck className="w-5 h-5 text-green-500" />,
        },
        {
            key: 'qtEnablePurchaseOrders',
            label: 'Purchase Orders',
            desc: 'Show PO number & date fields',
            icon: <HiClipboardList className="w-5 h-5 text-yellow-500" />,
        },
        {
            key: 'qtEnableAdditionalDetails',
            label: 'Additional Details',
            desc: 'Show extra reference fields (E-Way Bill, Delivery Note, etc.)',
            icon: <HiInformationCircle className="w-5 h-5 text-gray-500" />,
        },
    ];

    return (
        <div className="space-y-6 text-black">

            {/* Quotation Defaults */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-5">
                    <HiDocument className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-bold text-gray-900">Quotation Defaults</h2>
                </div>
                <div className="max-w-xs space-y-1.5">
                    <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Default Validity (Days)</label>
                    <input type="number" name="validityDays" value={settings.validityDays} onChange={handleChange} min="1" max="365"
                        placeholder="e.g. 30"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                    <p className="text-xs text-gray-400">Number of days the quotation remains valid after issue date.</p>
                </div>
            </div>

            {/* Item Fields */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-2">
                    <HiCollection className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">In-Quotation Sections</h2>
                </div>
                <p className="text-xs text-gray-500 mb-5">
                    Control which sections appear when creating a quotation.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {ITEM_FIELDS.map(({ key, label, desc, icon }) => (
                        <label key={key}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings[key]
                                ? 'border-orange-400 bg-orange-50'
                                : 'border-gray-200 bg-gray-50 hover:border-orange-200'
                                }`}>
                            <input
                                type="checkbox"
                                checked={settings[key]}
                                onChange={() => toggle(key)}
                                className="w-4 h-4 accent-orange-500 rounded mt-0.5 flex-shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    {icon}
                                    <span className={`text-sm font-semibold ${settings[key] ? 'text-orange-700' : 'text-gray-700'}`}>
                                        {label}
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Design */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-5">
                    <HiColorSwatch className="w-5 h-5 text-pink-500" />
                    <h2 className="text-lg font-bold text-gray-900">Design</h2>
                </div>
                <p className="text-xs text-gray-500 mb-5">Choose your brand colour — it will appear on the quotation header and accents.</p>

                {/* Preset swatches */}
                <div className="flex flex-wrap gap-3 mb-5">
                    {PRESET_COLORS.map(({ hex, name }) => (
                        <button key={hex} type="button" title={name}
                            onClick={() => setBrandColor(hex)}
                            className="relative w-9 h-9 rounded-full border-2 transition-all hover:scale-110 focus:outline-none"
                            style={{
                                backgroundColor: hex,
                                borderColor: brandColor === hex ? '#111' : 'transparent',
                                boxShadow: brandColor === hex ? `0 0 0 2px white, 0 0 0 4px ${hex}` : 'none',
                            }}>
                            {brandColor === hex && (
                                <HiCheck className="w-4 h-4 text-white absolute inset-0 m-auto drop-shadow" />
                            )}
                        </button>
                    ))}
                </div>

                {/* Custom hex input */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                        <input type="color" value={brandColor} onChange={e => setBrandColor(e.target.value)}
                            className="w-10 h-10 rounded-xl border border-gray-300 cursor-pointer p-0.5" />
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-xl bg-gray-50">
                        <span className="text-xs font-semibold text-gray-400 uppercase">Hex</span>
                        <input type="text" value={brandColor}
                            onChange={e => { if (/^#[0-9A-Fa-f]{0,6}$/.test(e.target.value)) setBrandColor(e.target.value); }}
                            className="w-24 text-sm font-mono font-bold text-gray-800 bg-transparent border-none outline-none" />
                    </div>
                    <span className="text-xs text-gray-400">or pick any custom colour</span>
                </div>

                {/* Live preview */}
                <div className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                    <div className="px-5 py-4 flex items-center justify-between" style={{ backgroundColor: brandColor }}>
                        <div>
                            <p className="text-white font-bold text-lg tracking-tight">Your Business Name</p>
                            <p className="text-white/70 text-xs mt-0.5">GSTIN: 29XXXXX1234Z1ZX</p>
                        </div>
                        <div className="text-right">
                            <p className="text-white/80 text-xs uppercase tracking-widest font-semibold">Quotation</p>
                            <p className="text-white font-bold text-sm">#QT-2026-001</p>
                        </div>
                    </div>
                    <div className="bg-white px-5 py-3">
                        <div className="flex justify-between text-xs text-gray-400 border-b pb-2 mb-2">
                            <span>Item</span><span>Qty</span><span>Price</span><span>Total</span>
                        </div>
                        <div className="flex justify-between text-xs text-gray-600">
                            <span>Sample Product</span><span>2</span><span>₹500</span><span>₹1,180</span>
                        </div>
                        <div className="mt-3 pt-2 border-t flex justify-end">
                            <span className="text-sm font-bold" style={{ color: brandColor }}>Grand Total: ₹1,180</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-5">
                    <HiDocument className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900">Quotation Terms &amp; Conditions</h2>
                </div>
                <textarea name="quotationTerms" value={settings.quotationTerms} onChange={handleChange} rows={4}
                    placeholder="e.g. This quotation is valid for 30 days. Prices are subject to change..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none" />
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button type="button" disabled={saving} onClick={handleSave}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50">
                    <HiSave className="w-5 h-5 mr-2" />{saving ? 'Saving...' : 'Save Quotation Settings'}
                </button>
            </div>
        </div>
    );
}
