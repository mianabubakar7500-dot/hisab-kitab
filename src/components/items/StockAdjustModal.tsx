import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Minus, Check, AlertCircle } from 'lucide-react';
import { Item } from '../../types';

interface StockAdjustModalProps {
  item: Item | null;
  onClose: () => void;
}

export const StockAdjustModal: React.FC<StockAdjustModalProps> = ({ item, onClose }) => {
  const { adjustStock } = useApp();

  const [direction, setDirection] = useState<'add' | 'reduce'>('add');
  const [quantity, setQuantity] = useState<number>(1);
  const [reason, setReason] = useState<string>('Physical Count Verification');

  if (!item) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (quantity <= 0) return;

    const delta = direction === 'add' ? quantity : -quantity;
    adjustStock(item.id, delta, reason);
    onClose();
  };

  const calculatedNewStock =
    direction === 'add'
      ? item.currentStock + Number(quantity || 0)
      : Math.max(0, item.currentStock - Number(quantity || 0));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/80">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white">Adjust Item Stock</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{item.name}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* Current Stock Banner */}
          <div className="flex justify-between items-center rounded-xl bg-slate-100 p-3 dark:bg-slate-800">
            <span className="text-slate-500 dark:text-slate-400 font-semibold">Current In Stock:</span>
            <span className="font-mono font-bold text-sm text-slate-900 dark:text-white">
              {item.currentStock} {item.unit}
            </span>
          </div>

          {/* Direction toggle */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Adjustment Type:
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('add')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold border transition-all ${
                  direction === 'add'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <Plus className="h-4 w-4" />
                <span>+ Add Stock</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection('reduce')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold border transition-all ${
                  direction === 'reduce'
                    ? 'border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-300'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <Minus className="h-4 w-4" />
                <span>- Reduce Stock</span>
              </button>
            </div>
          </div>

          {/* Quantity */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quantity ({item.unit}) *
            </label>
            <input
              type="number"
              min="0.01"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(parseFloat(e.target.value) || 0)}
              className="w-full rounded-xl border border-slate-200 p-2.5 font-mono font-bold text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            />
          </div>

          {/* Reason */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Reason for Adjustment
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="Physical Count Verification">Physical Count Verification</option>
              <option value="Damaged / Broken Goods">Damaged / Broken Goods</option>
              <option value="Direct Supplier Addition">Direct Supplier Addition</option>
              <option value="Theft or Loss">Theft or Loss</option>
              <option value="Customer Return (Unbilled)">Customer Return (Unbilled)</option>
              <option value="Expired Stock">Expired Stock</option>
            </select>
          </div>

          {/* Result preview */}
          <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-800">
            <span className="font-semibold text-slate-600 dark:text-slate-400">Resulting Stock:</span>
            <span className="font-mono font-extrabold text-sm text-sky-600 dark:text-sky-400">
              {calculatedNewStock} {item.unit}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-sky-600 px-5 py-2 font-semibold text-white shadow-md shadow-sky-600/30 hover:bg-sky-700"
            >
              Update Stock
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
