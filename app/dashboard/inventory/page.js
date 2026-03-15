'use client';

import { useEffect, useState, useMemo } from 'react';
import DashboardLayout from '@/components/DashboardLayout';
import PageLoader from '@/components/PageLoader';
import { inventoryAPI } from '@/utils/api';
import {
  HiSearch, HiExclamationCircle, HiClock, HiBan,
  HiChevronLeft, HiChevronRight,
} from 'react-icons/hi';

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function InventoryPage() {
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [allBatches, setAllBatches] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [nearExpiryBatches, setNearExpiryBatches] = useState([]);
  const [expiredBatches, setExpiredBatches] = useState([]);
  const [stats, setStats] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  useEffect(() => { loadData(); }, []);

  // Reset to page 1 on tab / search / pageSize change
  useEffect(() => { setCurrentPage(1); }, [activeTab, search, pageSize]);

  const loadData = async () => {
    try {
      const [statsData, lowStock, nearExpiry, expired, allBatchesData] = await Promise.all([
        inventoryAPI.getStats(),
        inventoryAPI.getLowStock(),
        inventoryAPI.getNearExpiry({ months: 3 }),
        inventoryAPI.getExpired(),
        inventoryAPI.getAllBatches(),
      ]);
      setStats(statsData);
      setLowStockItems(lowStock);
      setNearExpiryBatches(nearExpiry);
      setExpiredBatches(expired);
      setAllBatches(allBatchesData);
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filtered (all rows for active tab + search)
  const filteredData = useMemo(() => {
    let data = [];
    switch (activeTab) {
      case 'all': data = allBatches; break;
      case 'low-stock': data = lowStockItems; break;
      case 'near-expiry': data = nearExpiryBatches; break;
      case 'expired': data = expiredBatches; break;
      default: data = [];
    }
    if (!search.trim()) return data;
    const s = search.toLowerCase();
    if (activeTab === 'low-stock') {
      return data.filter(item => item.name?.toLowerCase().includes(s));
    }
    return data.filter(item =>
      item.productInfo?.name?.toLowerCase().includes(s) ||
      item.product?.name?.toLowerCase().includes(s) ||
      item.batchNo?.toLowerCase().includes(s)
    );
  }, [activeTab, search, allBatches, lowStockItems, nearExpiryBatches, expiredBatches]);

  // Pagination math
  const totalRows = filteredData.length;
  const totalPages = Math.max(1, Math.ceil(totalRows / pageSize));
  const safePage = Math.min(currentPage, totalPages);
  const startIdx = (safePage - 1) * pageSize;
  const pageRows = filteredData.slice(startIdx, startIdx + pageSize);

  // Windowed page numbers with ellipsis
  const pageNumbers = useMemo(() => {
    const pages = [];
    const delta = 2;
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= safePage - delta && i <= safePage + delta)) {
        pages.push(i);
      }
    }
    const result = [];
    let prev = null;
    for (const p of pages) {
      if (prev !== null && p - prev > 1) result.push('...');
      result.push(p);
      prev = p;
    }
    return result;
  }, [totalPages, safePage]);

  const getExpiryStatus = (expiryDate) => {
    if (!expiryDate) return { color: 'text-gray-400 bg-gray-100', label: 'No Date' };
    const today = new Date();
    const expiry = new Date(expiryDate);
    const daysToExpiry = Math.ceil((expiry - today) / (1000 * 60 * 60 * 24));
    if (daysToExpiry < 0) return { color: 'text-red-600 bg-red-100', label: 'Expired' };
    if (daysToExpiry <= 30) return { color: 'text-red-600 bg-red-50', label: `${daysToExpiry} days` };
    if (daysToExpiry <= 90) return { color: 'text-orange-600 bg-orange-50', label: `${daysToExpiry} days` };
    return { color: 'text-green-600 bg-green-50', label: `${daysToExpiry} days` };
  };

  if (loading) return <PageLoader text="Loading inventory..." />;

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Inventory Management</h1>
          <p className="text-gray-500 mt-1">Track stock levels, batches, and expiry dates</p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Products</div>
              <div className="text-3xl font-bold text-gray-900 mt-2">{stats.totalProducts}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="text-sm text-gray-500">Total Stock Value</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">₹{stats.totalValue?.toLocaleString('en-IN')}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-orange-500">
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <HiExclamationCircle className="w-4 h-4" /> Low Stock Items
              </div>
              <div className="text-3xl font-bold text-orange-600 mt-2">{stats.lowStockCount}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow border-l-4 border-red-500">
              <div className="flex items-center gap-2 text-sm text-red-600">
                <HiClock className="w-4 h-4" /> Near Expiry / Expired
              </div>
              <div className="text-3xl font-bold text-red-600 mt-2">{stats.nearExpiryCount + stats.expiredCount}</div>
            </div>
          </div>
        )}

        {/* Main card */}
        <div className="bg-white rounded-lg shadow">

          {/* Tab bar */}
          <div className="border-b border-gray-200">
            <nav className="flex -mb-px overflow-x-auto">
              {[
                { key: 'all', label: 'All Stock', icon: null, count: null },
                { key: 'low-stock', label: 'Low Stock', icon: HiExclamationCircle, count: lowStockItems.length },
                { key: 'near-expiry', label: 'Near Expiry', icon: HiClock, count: nearExpiryBatches.length },
                { key: 'expired', label: 'Expired', icon: HiBan, count: expiredBatches.length },
              ].map(({ key, label, icon: Icon, count }) => {
                const active = activeTab === key;
                const activeClass = key === 'expired'
                  ? 'border-red-500 text-red-600'
                  : key === 'all'
                    ? 'border-emerald-500 text-emerald-600'
                    : 'border-orange-500 text-orange-600';
                return (
                  <button key={key} onClick={() => setActiveTab(key)}
                    className={`px-6 py-4 text-sm font-medium border-b-2 flex items-center gap-2 whitespace-nowrap ${active ? activeClass : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    {Icon && <Icon className="w-4 h-4" />}
                    {label}{count !== null && ` (${count})`}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Search + Show entries */}
          <div className="p-4 border-b flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="relative w-full sm:max-w-md">
              <HiSearch className="absolute left-3 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by product name or batch number..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900"
              />
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 whitespace-nowrap">
              <span>Show</span>
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-gray-900 bg-white"
              >
                {PAGE_SIZE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <span>entries</span>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            {activeTab === 'low-stock' ? (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Current Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Minimum Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageRows.length === 0 ? (
                    <tr><td colSpan="5" className="px-6 py-12 text-center text-gray-500">No low stock items found.</td></tr>
                  ) : (
                    pageRows.map((item, idx) => (
                      <tr key={item._id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm text-gray-400">{startIdx + idx + 1}</td>
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{item.name}</div>
                          <div className="text-sm text-gray-500">{item.genericName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-lg font-semibold text-orange-600">{item.currentStock}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-900">{item.minStockLevel}</td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800">Low Stock</span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">#</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Batch No</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Stock</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Purchase Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Selling Price</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {pageRows.length === 0 ? (
                    <tr><td colSpan="8" className="px-6 py-12 text-center text-gray-500">No batches found.</td></tr>
                  ) : (
                    pageRows.map((batch, idx) => {
                      const expiryStatus = getExpiryStatus(batch.expiryDate);
                      const product = batch.productInfo || batch.product;
                      return (
                        <tr key={batch._id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 text-sm text-gray-400">{startIdx + idx + 1}</td>
                          <td className="px-6 py-4">
                            <div className="font-medium text-gray-900">{product?.name}</div>
                            <div className="text-sm text-gray-500">{product?.genericName}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap font-mono text-sm text-gray-900">{batch.batchNo}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString('en-IN') : '—'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`font-semibold ${batch.quantity <= 10 ? 'text-orange-600' : 'text-gray-900'}`}>
                              {batch.quantity}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{batch.purchasePrice?.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₹{batch.sellingPrice?.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${expiryStatus.color}`}>
                              {expiryStatus.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            {/* Info text */}
            <p className="text-sm text-gray-600">
              {totalRows === 0
                ? 'No entries found'
                : `Showing ${startIdx + 1}–${Math.min(startIdx + pageSize, totalRows)} of ${totalRows} entries`}
            </p>

            {/* Page buttons */}
            {totalPages > 1 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <HiChevronLeft className="w-4 h-4" />
                </button>

                {pageNumbers.map((p, idx) =>
                  p === '...'
                    ? <span key={`el-${idx}`} className="px-2 text-gray-400 select-none">…</span>
                    : (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors border ${safePage === p
                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                            : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                          }`}
                      >
                        {p}
                      </button>
                    )
                )}

                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="p-2 rounded-lg border border-gray-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50 text-gray-600 transition-colors"
                >
                  <HiChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

        </div>
      </div>
    </DashboardLayout>
  );
}
