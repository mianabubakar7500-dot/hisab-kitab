import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Save, ArrowDownLeft, ArrowUpRight, UserPlus } from 'lucide-react';
import { PaymentDirection, PaymentMode } from '../../types';
import { STORAGE_KEYS, saveDraft, loadDraft, clearDraft } from '../../services/db';
import { QuickPartyModal } from '../parties/QuickPartyModal';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultDirection?: PaymentDirection;
  defaultPartyId?: string;
}

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  defaultDirection = 'in',
  defaultPartyId,
}) => {
  const { parties, savePayment, profile, formatMoney } = useApp();

  const [direction, setDirection] = useState<PaymentDirection>(defaultDirection);
  const [partyId, setPartyId] = useState<string>(defaultPartyId || '');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [mode, setMode] = useState<PaymentMode>('cash');
  const [referenceNote, setReferenceNote] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isQuickPartyOpen, setIsQuickPartyOpen] = useState(false);

  // Restore draft or props
  useEffect(() => {
    if (!isOpen) return;

    if (defaultPartyId) {
      setPartyId(defaultPartyId);
      setDirection(defaultDirection);
    } else {
      const draft = loadDraft<any>(STORAGE_KEYS.DRAFT_PAYMENT);
      if (draft && draft.amount) {
        setDirection(draft.direction || defaultDirection);
        setPartyId(draft.partyId || '');
        setAmount(draft.amount || 0);
        setDate(draft.date || new Date().toISOString().split('T')[0]);
        setMode(draft.mode || 'cash');
        setReferenceNote(draft.referenceNote || '');
      } else {
        setDirection(defaultDirection);
        setPartyId('');
        setAmount(0);
        setDate(new Date().toISOString().split('T')[0]);
        setMode('cash');
        setReferenceNote('');
      }
    }
    setError('');
  }, [isOpen, defaultDirection, defaultPartyId]);

  // Continuous Autosave on draft
  useEffect(() => {
    if (!isOpen) return;
    saveDraft(STORAGE_KEYS.DRAFT_PAYMENT, {
      direction,
      partyId,
      amount,
      date,
      mode,
      referenceNote,
    });
  }, [isOpen, direction, partyId, amount, date, mode, referenceNote]);

  if (!isOpen) return null;

  const selectedParty = parties.find((p) => p.id === partyId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partyId) {
      setError('Please select a customer or supplier party');
      return;
    }
    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    savePayment({
      direction,
      partyId,
      partyName: selectedParty?.name || '',
      amount: Number(amount),
      date,
      mode,
      referenceNote: referenceNote.trim(),
    });

    clearDraft(STORAGE_KEYS.DRAFT_PAYMENT);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/80">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-slate-900 dark:text-white">
                {direction === 'in' ? 'Payment In (Received)' : 'Payment Out (Paid)'}
              </h3>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                Autosaved
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Update party ledger balance & cash/bank record
            </p>
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

          {/* Direction toggle */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Payment Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDirection('in')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                  direction === 'in'
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <ArrowDownLeft className="h-4 w-4" />
                <span>Payment In (Customer)</span>
              </button>
              <button
                type="button"
                onClick={() => setDirection('out')}
                className={`flex items-center justify-center gap-1.5 py-2 rounded-xl font-bold border transition-all cursor-pointer ${
                  direction === 'out'
                    ? 'border-rose-600 bg-rose-50 text-rose-700 dark:border-rose-500 dark:bg-rose-950 dark:text-rose-300'
                    : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                }`}
              >
                <ArrowUpRight className="h-4 w-4" />
                <span>Payment Out (Supplier)</span>
              </button>
            </div>
          </div>

          {/* Party select with quick add option */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                Select Party *
              </label>
              <button
                type="button"
                onClick={() => setIsQuickPartyOpen(true)}
                className="flex items-center gap-1 text-[11px] font-bold text-theme hover:underline cursor-pointer"
              >
                <UserPlus className="h-3 w-3" />
                <span>+ New Party</span>
              </button>
            </div>
            <select
              value={partyId}
              onChange={(e) => setPartyId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              required
            >
              <option value="">-- Choose Party / Customer / Supplier --</option>
              {parties.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.currentBalance > 0 ? `To Collect: ${formatMoney(p.currentBalance)}` : p.currentBalance < 0 ? `To Pay: ${formatMoney(Math.abs(p.currentBalance))}` : 'Settled'})
                </option>
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
                Payment Date
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
              Payment Method
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
              <option value="bank_transfer">Bank Transfer (IBFT)</option>
              <option value="cheque">Bank Cheque</option>
            </select>
          </div>

          {/* Manual Payment Details / Reference */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Manual Payment Details / Slip # / Note
            </label>
            <input
              type="text"
              placeholder="e.g. Transaction ID, Cheque #, or Settlement Notes"
              value={referenceNote}
              onChange={(e) => setReferenceNote(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Footer Actions */}
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
              className="flex items-center gap-1.5 rounded-xl bg-theme px-5 py-2 font-semibold text-white shadow-md hover:opacity-95 cursor-pointer"
            >
              <Save className="h-4 w-4" />
              <span>Record Payment</span>
            </button>
          </div>
        </form>
      </div>

      {/* Quick Party Add Modal */}
      <QuickPartyModal
        isOpen={isQuickPartyOpen}
        onClose={() => setIsQuickPartyOpen(false)}
        defaultType={direction === 'in' ? 'customer' : 'supplier'}
        onPartyCreated={(party) => {
          setPartyId(party.id);
        }}
      />
    </div>
  );
};
