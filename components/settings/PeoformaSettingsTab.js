'use client';

import { useState, useEffect } from 'react';
import { HiDocument, HiCollection, HiCurrencyRupee, HiUpload, HiSave, HiTruck, HiClipboardList, HiInformationCircle, HiHashtag, HiCalendar, HiDeviceMobile, HiFingerPrint } from 'react-icons/hi';
import { shopAPI } from '@/utils/api';
import { useToast } from '@/context/ToastContext';

export default function ProformaSettingsTab() {
    const toast = useToast();
    const [settings, setSettings] = useState({
        einvoice: false,
        batchNumber: false,
        expiryDate: false,
        imeiNumber: false,
        serialNumber: false,
        pfEnableTransport: false,
        pfEnablePurchaseOrders: false,
        pfEnableAdditionalDetails: false,
        accountHolder: '',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        branchName: '',
        qrCode: '',
        proformaTerms: '',
    });
    const [qrPreview, setQrPreview] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        shopAPI.get().then(data => {
            if (data) {
                setSettings(p => ({
                    ...p,
                    einvoice: data.proformaEinvoice ?? false,
                    batchNumber: data.pfBatchNumber ?? false,
                    expiryDate: data.pfExpiryDate ?? false,
                    imeiNumber: data.pfImeiNumber ?? false,
                    serialNumber: data.pfSerialNumber ?? false,
                    pfEnableTransport: data.pfEnableTransport ?? false,
                    pfEnablePurchaseOrders: data.pfEnablePurchaseOrders ?? false,
                    pfEnableAdditionalDetails: data.pfEnableAdditionalDetails ?? false,
                    accountHolder: data.pfAccountHolder || '',
                    bankName: data.pfBankName || '',
                    accountNumber: data.pfAccountNumber || '',
                    ifscCode: data.pfIfscCode || '',
                    branchName: data.pfBranchName || '',
                    qrCode: data.pfQrCode || '',
                    proformaTerms: data.proformaTerms || '',
                }));
                if (data.pfQrCode) setQrPreview(data.pfQrCode);
            }
        }).catch(console.error);
    }, []);

    const handleSave = async () => {
        setSaving(true);
        try {
            await shopAPI.update({
                proformaEinvoice: settings.einvoice,
                pfBatchNumber: settings.batchNumber,
                pfExpiryDate: settings.expiryDate,
                pfImeiNumber: settings.imeiNumber,
                pfSerialNumber: settings.serialNumber,
                pfEnableTransport: settings.pfEnableTransport,
                pfEnablePurchaseOrders: settings.pfEnablePurchaseOrders,
                pfEnableAdditionalDetails: settings.pfEnableAdditionalDetails,
                pfAccountHolder: settings.accountHolder,
                pfBankName: settings.bankName,
                pfAccountNumber: settings.accountNumber,
                pfIfscCode: settings.ifscCode,
                pfBranchName: settings.branchName,
                pfQrCode: settings.qrCode,
                proformaTerms: settings.proformaTerms,
            });
            toast.success('Proforma settings saved!');
        } catch (error) {
            toast.error(error.message || 'Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const toggle = (key) => setSettings(p => ({ ...p, [key]: !p[key] }));
    const handleChange = (e) => setSettings(p => ({ ...p, [e.target.name]: e.target.value }));
    const handleQrChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => { setQrPreview(reader.result); setSettings(p => ({ ...p, qrCode: reader.result })); };
        reader.readAsDataURL(file);
    };

    const TRACKING_FIELDS = [
        { key: 'batchNumber', label: 'Batch Number', desc: 'Track batch numbers on each line item', icon: <HiHashtag className="w-5 h-5 text-blue-500" /> },
        { key: 'expiryDate', label: 'Expiry Date', desc: 'Track expiry dates on each line item', icon: <HiCalendar className="w-5 h-5 text-red-400" /> },
        { key: 'imeiNumber', label: 'IMEI Number', desc: 'Track IMEI numbers for electronics', icon: <HiDeviceMobile className="w-5 h-5 text-purple-500" /> },
        { key: 'serialNumber', label: 'Serial Number', desc: 'Track serial numbers on each line item', icon: <HiFingerPrint className="w-5 h-5 text-gray-500" /> },
    ];

    const SECTION_FIELDS = [
        { key: 'pfEnableTransport', label: 'Transport Details', desc: 'Show transportation info section', icon: <HiTruck className="w-5 h-5 text-green-500" /> },
        { key: 'pfEnablePurchaseOrders', label: 'Purchase Orders', desc: 'Show PO number & date fields', icon: <HiClipboardList className="w-5 h-5 text-yellow-500" /> },
        { key: 'pfEnableAdditionalDetails', label: 'Additional Details', desc: 'Show extra reference fields (E-Way Bill, Delivery Note, etc.)', icon: <HiInformationCircle className="w-5 h-5 text-gray-500" /> },
    ];

    const BANK_FIELDS = [
        { name: 'accountHolder', label: 'Account Holder Name', placeholder: 'e.g. ABC Enterprises' },
        { name: 'bankName', label: 'Bank Name', placeholder: 'e.g. State Bank of India' },
        { name: 'accountNumber', label: 'Account Number', placeholder: 'e.g. 1234567890' },
        { name: 'ifscCode', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234' },
        { name: 'branchName', label: 'Branch Name', placeholder: 'e.g. MG Road, Bangalore' },
    ];

    return (
        <div className="space-y-6 text-black">

            {/* Compliance — E-Invoice only (no E-way Bill) */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-5">
                    <HiDocument className="w-5 h-5 text-indigo-600" />
                    <h2 className="text-lg font-bold text-gray-900">Compliance Settings</h2>
                </div>
                <div className="flex items-start justify-between gap-4 py-3">
                    <div>
                        <p className="text-sm font-semibold text-gray-800">E-Invoice</p>
                        <p className="text-xs text-gray-500 mt-0.5">Enable E-Invoice (IRN) generation for proforma invoices</p>
                    </div>
                    <button type="button" onClick={() => toggle('einvoice')}
                        className={`relative flex-shrink-0 w-11 h-6 rounded-full transition-colors ${settings.einvoice ? 'bg-orange-500' : 'bg-gray-200'}`}>
                        <span className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${settings.einvoice ? 'translate-x-5' : 'translate-x-0'}`} />
                    </button>
                </div>
            </div>

            {/* Item Tracking Fields */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-5">
                    <HiCollection className="w-5 h-5 text-purple-600" />
                    <h2 className="text-lg font-bold text-gray-900">In-Proforma Item Fields</h2>
                </div>
                <p className="text-xs text-gray-500 mb-5">Enable additional tracking fields that appear on each proforma line item.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {TRACKING_FIELDS.map(({ key, label, desc, icon }) => (
                        <label key={key}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings[key]
                                ? 'border-orange-400 bg-orange-50'
                                : 'border-gray-200 bg-gray-50 hover:border-orange-200'
                                }`}>
                            <input type="checkbox" checked={settings[key]} onChange={() => toggle(key)}
                                className="w-4 h-4 accent-orange-500 rounded mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    {icon}
                                    <span className={`text-sm font-semibold ${settings[key] ? 'text-orange-700' : 'text-gray-700'}`}>{label}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Section Toggles */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-5">
                    <HiCollection className="w-5 h-5 text-teal-600" />
                    <h2 className="text-lg font-bold text-gray-900">In-Proforma Sections</h2>
                </div>
                <p className="text-xs text-gray-500 mb-5">Control which sections appear when creating a proforma invoice.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {SECTION_FIELDS.map(({ key, label, desc, icon }) => (
                        <label key={key}
                            className={`flex items-start gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${settings[key]
                                ? 'border-orange-400 bg-orange-50'
                                : 'border-gray-200 bg-gray-50 hover:border-orange-200'
                                }`}>
                            <input type="checkbox" checked={settings[key]} onChange={() => toggle(key)}
                                className="w-4 h-4 accent-orange-500 rounded mt-0.5 flex-shrink-0" />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-1.5">
                                    {icon}
                                    <span className={`text-sm font-semibold ${settings[key] ? 'text-orange-700' : 'text-gray-700'}`}>{label}</span>
                                </div>
                                <p className="text-xs text-gray-400 mt-0.5">{desc}</p>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-5">
                    <HiCurrencyRupee className="w-5 h-5 text-green-600" />
                    <h2 className="text-lg font-bold text-gray-900">Bank Details</h2>
                </div>
                <p className="text-xs text-gray-500 mb-4">Bank details shown on proforma invoice for advance payment reference.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {BANK_FIELDS.map(({ name, label, placeholder }) => (
                        <div key={name} className="space-y-1.5">
                            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">{label}</label>
                            <input type="text" name={name} value={settings[name]} onChange={handleChange} placeholder={placeholder}
                                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all" />
                        </div>
                    ))}
                    {/* QR */}
                    <div className="space-y-1.5">
                        <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">QR Code (Payment)</label>
                        <div className="flex items-center gap-3">
                            <label className="cursor-pointer">
                                <input type="file" accept="image/*" onChange={handleQrChange} className="hidden" />
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-200 transition-all">
                                    <HiUpload className="w-4 h-4" />
                                    {qrPreview ? 'Change QR' : 'Upload QR'}
                                </div>
                            </label>
                            {qrPreview && (
                                <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img src={qrPreview} alt="QR" className="w-12 h-12 object-contain border border-gray-200 rounded-lg" />
                                    <button type="button" onClick={() => { setQrPreview(null); setSettings(p => ({ ...p, qrCode: '' })); }}
                                        className="text-xs text-red-500 hover:text-red-700">Remove</button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Terms */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
                <div className="flex items-center space-x-2 pb-4 border-b border-gray-200 mb-5">
                    <HiDocument className="w-5 h-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900">Proforma Terms & Conditions</h2>
                </div>
                <textarea name="proformaTerms" value={settings.proformaTerms} onChange={handleChange} rows={4}
                    placeholder="e.g. Payment is due before dispatch. Prices subject to change without notice..."
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all resize-none" />
            </div>

            {/* Save */}
            <div className="flex justify-end">
                <button type="button" disabled={saving} onClick={handleSave}
                    className="flex items-center px-8 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white font-semibold rounded-xl hover:from-orange-700 hover:to-red-700 shadow-lg shadow-orange-500/30 transition-all disabled:opacity-50">
                    <HiSave className="w-5 h-5 mr-2" />{saving ? 'Saving...' : 'Save Proforma Settings'}
                </button>
            </div>
        </div>
    );
}
