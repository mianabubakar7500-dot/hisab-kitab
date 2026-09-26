import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Save, Wallet } from 'lucide-react';
import { ExpenseCategory, PaymentMode } from '../../types';
import { STORAGE_KEYS, saveDraft, loadDraft, clearDraft } from '../../services/db';

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose }) => {
  const { saveExpense, profile } = useApp();

  const [category, setCategory] = useState<ExpenseCategory>('General');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [note, setNote] = useState<string>('');
  const [error, setError] = useState<string>('');

  // Restore draft
  useEffect(() => {
    if (!isOpen) return;

    const draft = loadDraft<any>(STORAGE_KEYS.DRAFT_EXPENSE);
    if (draft && draft.amount) {
      setCategory(draft.category || 'General');
      setAmount(draft.amount || 0);
      setDate(draft.date || new Date().toISOString().split('T')[0]);
      setMode(draft.mode || 'cash');
      setNote(draft.note || '');
    } else {
      setCategory('General');
      setAmount(0);
      setDate(new Date().toISOString().split('T')[0]);
      setMode('cash');
      setNote('');
    }
    setError('');
  }, [isOpen]);

  // Continuous Autosave on draft
  useEffect(() => {
    if (!isOpen) return;
    saveDraft(STORAGE_KEYS.DRAFT_EXPENSE, {
      category,
      amount,
      date,
      mode,
      note,
    });
  }, [isOpen, category, amount, date, mode, note]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    saveExpense({
      category,
      amount: Number(amount),
      date,
      mode,
      note: note.trim(),
    });

    clearDraft(STORAGE_KEYS.DRAFT_EXPENSE);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-100 text-amber-600 dark:bg-amber-950 dark:text-amber-400">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">Record Daily Expense</h3>
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Autosaved
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">Rent, chai, travel, electricity</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Category */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Expense Category *
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              {[
                'Rent',
                'Electricity & Bills',
                'Salaries & Wages',
                'Tea & Snacks',
                'Logistics & Courier',
                'Packaging',
                'Maintenance',
                'Marketing & Ads',
                'General',
              ].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Amount & Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Amount ({profile.currencySymbol}) *
              </label>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount || ''}
                onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Payment Mode */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Payment Mode
            </label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as PaymentMode)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            >
              <option value="cash">Cash in Hand</option>
              <option value="easypaisa">EasyPaisa</option>
              <option value="jazzcash">JazzCash</option>
              <option value="raast">Raast P2P</option>
              <option value="bank_transfer">Bank Account (IBFT)</option>
              <option value="cheque">Cheque</option>
            </select>
          </div>

          {/* Note */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Paid shop rent for this month / office refreshments"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-theme px-4 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Save Expense</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
