import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Save, User, Phone, MapPin, Building, CreditCard, RotateCcw, Trash2, AlertTriangle } from 'lucide-react';
import { Party, PartyType } from '../../types';
import { STORAGE_KEYS, saveDraft, loadDraft, clearDraft } from '../../services/db';

interface PartyModalProps {
  isOpen: boolean;
  onClose: () => void;
  partyToEdit?: Party | null;
}

export const PartyModal: React.FC<PartyModalProps> = ({
  isOpen,
  onClose,
  partyToEdit,
}) => {
  const { saveParty, profile } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<PartyType>('customer');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [ntn, setNtn] = useState('');
  const [openingBalance, setOpeningBalance] = useState(0);
  const [openingBalanceType, setOpeningBalanceType] = useState<'to_collect' | 'to_pay'>('to_collect');
  const [creditLimit, setCreditLimit] = useState(0);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const isDiscardingDraftRef = useRef(false);

  const isFormDirty = useMemo(() => {
    if (partyToEdit) return false;
    return Boolean(
      name.trim() ||
      phone.trim() ||
      email.trim() ||
      address.trim() ||
      ntn.trim() ||
      openingBalance > 0 ||
      creditLimit > 0 ||
      notes.trim()
    );
  }, [partyToEdit, name, phone, email, address, ntn, openingBalance, creditLimit, notes]);

  // Restore draft or edit party
  useEffect(() => {
    if (!isOpen) return;

    if (partyToEdit) {
      setName(partyToEdit.name);
      setType(partyToEdit.type);
      setPhone(partyToEdit.phone || '');
      setEmail(partyToEdit.email || '');
      setAddress(partyToEdit.address || '');
      setNtn(partyToEdit.ntn || '');
      setOpeningBalance(partyToEdit.openingBalance || 0);
      setOpeningBalanceType(partyToEdit.openingBalanceType || 'to_collect');
      setCreditLimit(partyToEdit.creditLimit || 0);
      setNotes(partyToEdit.notes || '');
    } else {
      // Check autosaved draft
      const draft = loadDraft<any>(STORAGE_KEYS.DRAFT_PARTY);
      if (draft && draft.name) {
        setName(draft.name || '');
        setType(draft.type || 'customer');
        setPhone(draft.phone || '');
        setEmail(draft.email || '');
        setAddress(draft.address || '');
        setNtn(draft.ntn || '');
        setOpeningBalance(draft.openingBalance || 0);
        setOpeningBalanceType(draft.openingBalanceType || 'to_collect');
        setCreditLimit(draft.creditLimit || 0);
        setNotes(draft.notes || '');
      } else {
        setName('');
        setType('customer');
        setPhone('');
        setEmail('');
        setAddress('');
        setNtn('');
        setOpeningBalance(0);
        setOpeningBalanceType('to_collect');
        setCreditLimit(0);
        setNotes('');
      }
    }
    setError('');
  }, [partyToEdit, isOpen]);

  // Continuous Autosave on draft only when user entered content
  useEffect(() => {
    if (!isOpen || partyToEdit || isDiscardingDraftRef.current) return;
    if (!isFormDirty) return;

    saveDraft(STORAGE_KEYS.DRAFT_PARTY, {
      name,
      type,
      phone,
      email,
      address,
      ntn,
      openingBalance,
      openingBalanceType,
      creditLimit,
      notes,
    });
  }, [
    isOpen,
    partyToEdit,
    isFormDirty,
    name,
    type,
    phone,
    email,
    address,
    ntn,
    openingBalance,
    openingBalanceType,
    creditLimit,
    notes,
  ]);

  const handleConfirmDiscard = () => {
    isDiscardingDraftRef.current = true;
    clearDraft(STORAGE_KEYS.DRAFT_PARTY);
    setName('');
    setType('customer');
    setPhone('');
    setEmail('');
    setAddress('');
    setNtn('');
    setOpeningBalance(0);
    setOpeningBalanceType('to_collect');
    setCreditLimit(0);
    setNotes('');
    setError('');
    setShowDiscardConfirm(false);
    setTimeout(() => {
      isDiscardingDraftRef.current = false;
    }, 400);
  };

  const handleDiscardAndClose = () => {
    isDiscardingDraftRef.current = true;
    clearDraft(STORAGE_KEYS.DRAFT_PARTY);
    setShowDiscardConfirm(false);
    onClose();
    setTimeout(() => {
      isDiscardingDraftRef.current = false;
    }, 400);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Party name is required');
      return;
    }

    saveParty({
      id: partyToEdit?.id,
      name: name.trim(),
      type,
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      ntn: ntn.trim(),
      openingBalance: Number(openingBalance || 0),
      openingBalanceType,
      creditLimit: Number(creditLimit || 0),
      notes: notes.trim(),
    });

    clearDraft(STORAGE_KEYS.DRAFT_PARTY);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-theme text-white">
              <User className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {partyToEdit ? 'Edit Party' : 'Add New Party'}
                </h3>
                {!partyToEdit && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Autosaved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Customer or supplier ledger account
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!partyToEdit && isFormDirty && (
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/70 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                title="Discard party draft"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Discard Draft</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Party Type */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Party Role *
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['customer', 'supplier', 'both'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-xl py-2 text-xs font-semibold capitalize border transition-all cursor-pointer ${
                    type === t
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Party / Business Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Tariq Brothers Electronics"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Mobile / WhatsApp
              </label>
              <input
                type="text"
                placeholder="03001234567"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* NTN & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                NTN / CNIC No. (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 35201-1234567-1"
                value={ntn}
                onChange={(e) => setNtn(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                placeholder="party@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Shop / Delivery Address
            </label>
            <input
              type="text"
              placeholder="Shop #, Market, Area, City"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Opening Balance */}
          {!partyToEdit && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Opening Balance ({profile.currencySymbol})
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={openingBalance || ''}
                  onChange={(e) => setOpeningBalance(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Balance Type
                </label>
                <select
                  value={openingBalanceType}
                  onChange={(e) => setOpeningBalanceType(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="to_collect">To Receive (Debit)</option>
                  <option value="to_pay">To Pay (Credit)</option>
                </select>
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Internal Ledger Notes
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Regular wholesale buyer, credit terms 15 days..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div>
              {!partyToEdit && isFormDirty && (
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Discard Draft</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-theme px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{partyToEdit ? 'Update Party' : 'Save Party'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* In-app Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Discard Party Draft?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This will clear your autosaved party details and reset the form.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="w-full rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Yes, Discard & Start Fresh
              </button>
              <button
                type="button"
                onClick={handleDiscardAndClose}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                Discard & Close Form
              </button>
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="w-full rounded-xl py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Keep Editing (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
