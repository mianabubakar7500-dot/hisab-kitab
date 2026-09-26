import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, UserPlus } from 'lucide-react';
import { Party, PartyType } from '../../types';

interface QuickPartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: PartyType;
  onCreated?: (party: Party) => void;
  onPartyCreated?: (party: Party) => void;
}

export const QuickPartyModal: React.FC<QuickPartyModalProps> = ({
  isOpen,
  onClose,
  defaultType = 'customer',
  onCreated,
  onPartyCreated,
}) => {
  const { saveParty } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<PartyType>(defaultType);
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [openingBalance, setOpeningBalance] = useState<number>(0);
  const [balanceType, setBalanceType] = useState<'to_collect' | 'to_pay'>('to_collect');
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter a party name');
      return;
    }

    const saved = saveParty({
      name: name.trim(),
      type,
      phone: phone.trim(),
      address: address.trim(),
      openingBalance: Number(openingBalance) || 0,
      openingBalanceType: balanceType,
    });

    if (onPartyCreated) {
      onPartyCreated(saved);
    } else if (onCreated) {
      onCreated(saved);
    }

    // Reset and close
    setName('');
    setPhone('');
    setAddress('');
    setOpeningBalance(0);
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-theme text-white">
              <UserPlus className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Add New {type === 'customer' ? 'Customer' : type === 'supplier' ? 'Supplier' : 'Party'}
              </h3>
              <p className="text-[11px] text-slate-400">Quickly create and select for this transaction</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-2 text-rose-700 text-xs dark:bg-rose-950/40 dark:border-rose-900/60 dark:text-rose-400">
              {error}
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Party / Business Name *
            </label>
            <input
              type="text"
              autoFocus
              placeholder="e.g. Tariq Brothers Electronics"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:border-emerald-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Party Role
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PartyType)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="customer">Customer</option>
                <option value="supplier">Supplier</option>
                <option value="both">Both</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile / WhatsApp
              </label>
              <input
                type="text"
                placeholder="03001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Shop / Delivery Address
            </label>
            <input
              type="text"
              placeholder="Shop #, Market, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Opening Balance
              </label>
              <input
                type="number"
                placeholder="0"
                value={openingBalance || ''}
                onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Balance Direction
              </label>
              <select
                value={balanceType}
                onChange={(e) => setBalanceType(e.target.value as any)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="to_collect">To Receive (Debit)</option>
                <option value="to_pay">To Pay (Credit)</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-theme px-5 py-2 font-semibold text-white shadow-sm hover:opacity-95 cursor-pointer"
            >
              Save & Select
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
