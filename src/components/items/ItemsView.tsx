import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Package,
  PackagePlus,
  Search,
  AlertTriangle,
  SlidersHorizontal,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Item } from '../../types';
import { ItemModal } from './ItemModal';
import { StockAdjustModal } from './StockAdjustModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const ItemsView: React.FC = () => {
  const { items, deleteItem, formatMoney, totals, profile, searchQuery } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'low_stock' | 'products' | 'services'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [adjustingItem, setAdjustingItem] = useState<Item | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Item | null>(null);

  const filteredItems = items.filter((item) => {
    if (item.archived) return false;

    // Search filter
    const q = (searchTerm || searchQuery).trim().toLowerCase();
    if (q) {
      const matchName = item.name.toLowerCase().includes(q);
      const matchSku = item.sku && item.sku.toLowerCase().includes(q);
      const matchBarcode = item.barcode && item.barcode.includes(q);
      const matchDesc = item.description && item.description.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchBarcode && !matchDesc) return false;
    }

    // Category filter
    if (activeFilter === 'low_stock') {
      return item.type === 'product' && item.currentStock <= item.lowStockThreshold;
    }
    if (activeFilter === 'products') return item.type === 'product';
    if (activeFilter === 'services') return item.type === 'service';

    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Package className="h-6 w-6 text-emerald-600" />
            <span>Items & Stock Inventory</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Real-time stock quantities, low stock reorder alerts, and prices
          </p>
        </div>

        <button
          onClick={() => {
            setEditingItem(null);
            setIsAddModalOpen(true);
          }}
          className="flex items-center gap-2 rounded-xl bg-theme px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <PackagePlus className="h-4 w-4" />
          <span>+ Add New Item</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Items in Catalog</span>
          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {items.length}
          </div>
          <p className="text-[11px] text-slate-400">
            {items.filter((i) => i.type === 'product').length} Products • {items.filter((i) => i.type === 'service').length} Services
          </p>
        </div>

        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Total Inventory Valuation</span>
          <div className="mt-1 text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
            {formatMoney(totals.stockValue)}
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">At current purchase cost basis</p>
        </div>

        <div
          onClick={() => setActiveFilter('low_stock')}
          className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm dark:border-amber-950 dark:bg-amber-950/20 cursor-pointer hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Low Stock Reorders</span>
            <AlertTriangle className="h-4 w-4 text-amber-600" />
          </div>
          <div className="mt-1 text-xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
            {totals.lowStockCount} Items
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">Click to filter critical stock →</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Items' },
            { id: 'low_stock', label: `Low Stock (${totals.lowStockCount})` },
            { id: 'products', label: 'Products' },
            { id: 'services', label: 'Services' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search by name, SKU, barcode..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Items Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Item Name / SKU</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4 text-right">Sale Price</th>
                <th className="py-3 px-4 text-right">Purchase Cost</th>
                {profile.isTaxEnabled && <th className="py-3 px-4 text-center">Tax Rate</th>}
                <th className="py-3 px-4 text-right">In Stock</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {items.length === 0 ? (
                <tr>
                  <td colSpan={profile.isTaxEnabled ? 7 : 6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center max-w-sm mx-auto">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
                        <Package className="w-6 h-6" />
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                        No products yet
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-4">
                        Add your inventory products or services with pricing to track stock levels and create invoices.
                      </p>
                      <button
                        onClick={() => {
                          setEditingItem(null);
                          setIsAddModalOpen(true);
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-all"
                      >
                        <PackagePlus className="w-4 h-4" />
                        <span>Add First Product / Item</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={profile.isTaxEnabled ? 7 : 6} className="py-8 text-center text-slate-400 text-xs">
                    No items found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isLow = item.type === 'product' && item.currentStock <= item.lowStockThreshold;
                  return (
                    <tr key={item.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4">
                        <span className="font-bold text-slate-900 dark:text-white block">
                          {item.name}
                        </span>
                        {item.sku && (
                          <span className="font-mono text-[10px] text-slate-400">
                            SKU: {item.sku}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatMoney(item.salePrice)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {formatMoney(item.purchasePrice)}
                      </td>
                      {profile.isTaxEnabled && (
                        <td className="py-3 px-4 text-center font-mono text-slate-600 dark:text-slate-300">
                          {item.taxRate || 0}%
                        </td>
                      )}
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        {item.type === 'service' ? (
                          <span className="text-slate-400 font-sans font-normal">--</span>
                        ) : (
                          <div>
                            <span className={isLow ? 'text-amber-600 dark:text-amber-400' : 'text-slate-800 dark:text-slate-200'}>
                              {item.currentStock} {item.unit}
                            </span>
                            {isLow && (
                              <span className="block text-[10px] font-sans font-bold text-amber-600 dark:text-amber-400">
                                Low Stock
                              </span>
                            )}
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {item.type === 'product' && (
                            <button
                              onClick={() => setAdjustingItem(item)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 cursor-pointer"
                              title="Adjust Stock (+ / -)"
                            >
                              <SlidersHorizontal className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setEditingItem(item);
                              setIsAddModalOpen(true);
                            }}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-800 dark:hover:bg-slate-800 cursor-pointer"
                            title="Edit Item"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>

                          {/* DELETE ITEM BUTTON WITH CONFIRMATION POPUP */}
                          <button
                            onClick={() => setItemToDelete(item)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="Delete Item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Item Modal */}
      <ItemModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingItem(null);
        }}
        itemToEdit={editingItem}
      />

      {/* Stock Adjust Modal */}
      <StockAdjustModal
        item={adjustingItem}
        onClose={() => setAdjustingItem(null)}
      />

      {/* Confirm Delete Item Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(itemToDelete)}
        title="Delete Item from Inventory?"
        message="Are you sure you want to permanently delete this item? Historical bills that reference this item will keep their records."
        itemName={itemToDelete?.name}
        onConfirm={() => {
          if (itemToDelete) {
            deleteItem(itemToDelete.id);
            setItemToDelete(null);
          }
        }}
        onClose={() => setItemToDelete(null)}
      />
    </div>
  );
};
