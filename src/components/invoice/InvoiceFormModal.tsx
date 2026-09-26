import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Plus,
  Trash2,
  Calendar,
  Save,
  CheckCircle2,
  AlertCircle,
  AlertTriangle,
  UserPlus,
  RotateCcw,
} from 'lucide-react';
import { InvoiceLine, InvoiceType, PaymentMode, UnitType } from '../../types';
import { STORAGE_KEYS, saveDraft, loadDraft, clearDraft } from '../../services/db';
import { QuickPartyModal } from '../parties/QuickPartyModal';

export const InvoiceFormModal: React.FC = () => {
  const {
    isNewInvoiceOpen,
    setIsNewInvoiceOpen,
    newInvoiceType,
    editingInvoice,
    setEditingInvoice,
    parties,
    items,
    saveInvoice,
    setViewingInvoice,
    profile,
    formatMoney,
  } = useApp();

  const isSale = newInvoiceType === 'sale';
  const isPurchase = newInvoiceType === 'purchase';
  const isQuotation = newInvoiceType === 'quotation';

  // Form State
  const [selectedPartyId, setSelectedPartyId] = useState<string>('');
  const [partyName, setPartyName] = useState<string>('');
  const [partyPhone, setPartyPhone] = useState<string>('');
  const [partyAddress, setPartyAddress] = useState<string>('');
  const [partyNtn, setPartyNtn] = useState<string>('');
  const [invoiceNumber, setInvoiceNumber] = useState<string>('');
  const [invoiceDate, setInvoiceDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );
  const [dueDate, setDueDate] = useState<string>(
    new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]
  );
  const [lines, setLines] = useState<InvoiceLine[]>([]);
  const [additionalCharges, setAdditionalCharges] = useState<number>(0);
  const [roundOff, setRoundOff] = useState<number>(0);
  const [amountReceived, setAmountReceived] = useState<number>(0);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>('cash');
  const [manualPaymentDetails, setManualPaymentDetails] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [terms, setTerms] = useState<string>(profile.termsConditions || '');
  
  // Tax Information is Optional!
  const [enableTax, setEnableTax] = useState<boolean>(profile.isTaxEnabled || false);
  const [defaultTaxRate, setDefaultTaxRate] = useState<number>(profile.defaultTaxPercent || 18);

  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isQuickPartyOpen, setIsQuickPartyOpen] = useState(false);
  const [isDraftRestored, setIsDraftRestored] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const isDiscardingDraftRef = useRef(false);

  // Check if user has entered non-empty data
  const isFormDirty = useMemo(() => {
    if (editingInvoice) return false;
    const hasParty = Boolean(
      selectedPartyId ||
      (partyName && partyName !== 'Cash Customer' && partyName !== 'Quotation Client' && partyName.trim() !== '') ||
      partyPhone.trim() ||
      partyAddress.trim() ||
      partyNtn.trim()
    );
    const hasItems = lines.some((l) => (l.itemName && l.itemName.trim() !== '') || l.rate > 0 || l.itemId);
    const hasNotes = Boolean(notes.trim() || manualPaymentDetails.trim() || amountReceived > 0 || additionalCharges > 0);
    return hasParty || hasItems || hasNotes;
  }, [
    editingInvoice,
    selectedPartyId,
    partyName,
    partyPhone,
    partyAddress,
    partyNtn,
    lines,
    notes,
    manualPaymentDetails,
    amountReceived,
    additionalCharges,
  ]);

  // Initialize or restore draft
  useEffect(() => {
    if (!isNewInvoiceOpen) return;

    if (editingInvoice) {
      // Editing existing invoice
      setSelectedPartyId(editingInvoice.partyId || '');
      setPartyName(editingInvoice.partyName);
      setPartyPhone(editingInvoice.partyPhone || '');
      setPartyAddress(editingInvoice.partyAddress || '');
      setPartyNtn(editingInvoice.partyNtn || '');
      setInvoiceNumber(editingInvoice.invoiceNumber);
      setInvoiceDate(editingInvoice.date);
      if (editingInvoice.dueDate) setDueDate(editingInvoice.dueDate);
      setLines(editingInvoice.lines || []);
      setEnableTax(Boolean(editingInvoice.hasTax));
      setAdditionalCharges(editingInvoice.additionalCharges || 0);
      setRoundOff(editingInvoice.roundOff || 0);
      setAmountReceived(editingInvoice.amountReceived || 0);
      setPaymentMode(editingInvoice.paymentMode || 'cash');
      setManualPaymentDetails(editingInvoice.manualPaymentDetails || '');
      setNotes(editingInvoice.notes || '');
      setTerms(editingInvoice.terms || profile.termsConditions || '');
      return;
    }

    // Check for autosaved draft
    const savedDraft = loadDraft<any>(`${STORAGE_KEYS.DRAFT_INVOICE}_${newInvoiceType}`);
    if (savedDraft && savedDraft.lines && savedDraft.lines.length > 0) {
      setSelectedPartyId(savedDraft.selectedPartyId || '');
      setPartyName(savedDraft.partyName || (isSale ? 'Cash Customer' : ''));
      setPartyPhone(savedDraft.partyPhone || '');
      setPartyAddress(savedDraft.partyAddress || '');
      setPartyNtn(savedDraft.partyNtn || '');
      setInvoiceNumber(savedDraft.invoiceNumber || '');
      setInvoiceDate(savedDraft.invoiceDate || new Date().toISOString().split('T')[0]);
      setDueDate(savedDraft.dueDate || new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
      setLines(savedDraft.lines);
      setEnableTax(savedDraft.enableTax !== undefined ? savedDraft.enableTax : (profile.isTaxEnabled || false));
      setAdditionalCharges(savedDraft.additionalCharges || 0);
      setRoundOff(savedDraft.roundOff || 0);
      setAmountReceived(savedDraft.amountReceived || 0);
      setPaymentMode(savedDraft.paymentMode || 'cash');
      setManualPaymentDetails(savedDraft.manualPaymentDetails || '');
      setNotes(savedDraft.notes || '');
      setTerms(savedDraft.terms || profile.termsConditions || '');
      setIsDraftRestored(true);
      return;
    }

    // Default clean state
    setSelectedPartyId('');
    setPartyName(isSale ? 'Cash Customer' : isQuotation ? 'Quotation Client' : '');
    setPartyPhone('');
    setPartyAddress('');
    setPartyNtn('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
    setEnableTax(profile.isTaxEnabled || false);
    setLines([
      {
        id: `line_${Date.now()}_0`,
        itemId: '',
        itemName: '',
        unit: 'Pcs',
        quantity: 1,
        rate: 0,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: enableTax ? defaultTaxRate : 0,
        taxAmount: 0,
        totalAmount: 0,
      },
    ]);
    setAdditionalCharges(0);
    setRoundOff(0);
    setAmountReceived(0);
    setPaymentMode('cash');
    setManualPaymentDetails('');
    setNotes('');
    setTerms(profile.termsConditions || '');
    setErrorMsg('');
    setIsDraftRestored(false);
  }, [isNewInvoiceOpen, newInvoiceType, editingInvoice]);

  // AUTOSAVE: Continuous autosave to localStorage only when user entered content and not discarding
  useEffect(() => {
    if (!isNewInvoiceOpen || editingInvoice || isDiscardingDraftRef.current) return;
    if (!isFormDirty) {
      // Don't save an empty/blank form as a draft!
      return;
    }

    const draftData = {
      selectedPartyId,
      partyName,
      partyPhone,
      partyAddress,
      partyNtn,
      invoiceNumber,
      invoiceDate,
      dueDate,
      lines,
      enableTax,
      additionalCharges,
      roundOff,
      amountReceived,
      paymentMode,
      manualPaymentDetails,
      notes,
      terms,
    };
    saveDraft(`${STORAGE_KEYS.DRAFT_INVOICE}_${newInvoiceType}`, draftData);
  }, [
    isNewInvoiceOpen,
    editingInvoice,
    isFormDirty,
    newInvoiceType,
    selectedPartyId,
    partyName,
    partyPhone,
    partyAddress,
    partyNtn,
    invoiceNumber,
    invoiceDate,
    dueDate,
    lines,
    enableTax,
    additionalCharges,
    roundOff,
    amountReceived,
    paymentMode,
    manualPaymentDetails,
    notes,
    terms,
  ]);

  const handleConfirmDiscard = () => {
    isDiscardingDraftRef.current = true;
    clearDraft(`${STORAGE_KEYS.DRAFT_INVOICE}_${newInvoiceType}`);
    setIsDraftRestored(false);
    setSelectedPartyId('');
    setPartyName(isSale ? 'Cash Customer' : isQuotation ? 'Quotation Client' : '');
    setPartyPhone('');
    setPartyAddress('');
    setPartyNtn('');
    setInvoiceDate(new Date().toISOString().split('T')[0]);
    setDueDate(new Date(Date.now() + 15 * 86400000).toISOString().split('T')[0]);
    setLines([
      {
        id: `line_${Date.now()}_0`,
        itemId: '',
        itemName: '',
        unit: 'Pcs',
        quantity: 1,
        rate: 0,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: enableTax ? defaultTaxRate : 0,
        taxAmount: 0,
        totalAmount: 0,
      },
    ]);
    setAmountReceived(0);
    setAdditionalCharges(0);
    setRoundOff(0);
    setManualPaymentDetails('');
    setNotes('');
    setShowDiscardConfirm(false);
    setTimeout(() => {
      isDiscardingDraftRef.current = false;
    }, 400);
  };

  const handleDiscardAndClose = () => {
    isDiscardingDraftRef.current = true;
    clearDraft(`${STORAGE_KEYS.DRAFT_INVOICE}_${newInvoiceType}`);
    setIsDraftRestored(false);
    setShowDiscardConfirm(false);
    setIsNewInvoiceOpen(false);
    setEditingInvoice(null);
    setTimeout(() => {
      isDiscardingDraftRef.current = false;
    }, 400);
  };

  // Party selector
  const handlePartySelect = (partyId: string) => {
    setSelectedPartyId(partyId);
    if (!partyId) {
      setPartyName(isSale ? 'Cash Customer' : isQuotation ? 'Quotation Client' : '');
      setPartyPhone('');
      setPartyAddress('');
      setPartyNtn('');
      return;
    }
    const found = parties.find((p) => p.id === partyId);
    if (found) {
      setPartyName(found.name);
      setPartyPhone(found.phone || '');
      setPartyAddress(found.address || '');
      setPartyNtn(found.ntn || '');
    }
  };

  // Add line item
  const handleAddLine = () => {
    setLines((prev) => [
      ...prev,
      {
        id: `line_${Date.now()}_${prev.length}`,
        itemId: '',
        itemName: '',
        unit: 'Pcs',
        quantity: 1,
        rate: 0,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: enableTax ? defaultTaxRate : 0,
        taxAmount: 0,
        totalAmount: 0,
      },
    ]);
  };

  // Remove line item
  const handleRemoveLine = (idx: number) => {
    setLines((prev) => {
      const filtered = prev.filter((_, i) => i !== idx);
      if (filtered.length === 0) {
        return [
          {
            id: `line_${Date.now()}`,
            itemId: '',
            itemName: '',
            unit: 'Pcs',
            quantity: 1,
            rate: 0,
            discountPercent: 0,
            discountAmount: 0,
            taxPercent: enableTax ? defaultTaxRate : 0,
            taxAmount: 0,
            totalAmount: 0,
          },
        ];
      }
      return filtered;
    });
  };

  // Update line field with recalculations
  const handleUpdateLine = (idx: number, field: keyof InvoiceLine, val: any) => {
    setLines((prev) => {
      const copy = [...prev];
      const line = { ...copy[idx], [field]: val };

      // If user selected an item from inventory
      if (field === 'itemId' && val) {
        const itemObj = items.find((i) => i.id === val);
        if (itemObj) {
          line.itemName = itemObj.name;
          line.unit = itemObj.unit;
          line.rate = isPurchase ? itemObj.purchasePrice : itemObj.salePrice;
          if (enableTax) {
            line.taxPercent = itemObj.taxRate || defaultTaxRate;
          } else {
            line.taxPercent = 0;
          }
        }
      }

      // Calculations
      const qty = Number(line.quantity || 0);
      const rate = Number(line.rate || 0);
      const base = qty * rate;

      // Discount
      let discAmt = 0;
      if (field === 'discountPercent') {
        discAmt = (base * Number(val || 0)) / 100;
        line.discountAmount = discAmt;
      } else if (field === 'discountAmount') {
        discAmt = Number(val || 0);
        line.discountPercent = base > 0 ? (discAmt / base) * 100 : 0;
      } else {
        discAmt = Number(line.discountAmount || 0);
      }

      const taxable = Math.max(0, base - discAmt);

      // Tax calculation (only if tax enabled)
      let taxAmt = 0;
      if (enableTax) {
        const taxRate = Number(line.taxPercent || 0);
        taxAmt = (taxable * taxRate) / 100;
      } else {
        line.taxPercent = 0;
        taxAmt = 0;
      }
      line.taxAmount = taxAmt;

      line.totalAmount = taxable + taxAmt;
      copy[idx] = line;
      return copy;
    });
  };

  // Calculate totals
  const subtotal = lines.reduce((sum, l) => sum + (l.quantity * l.rate), 0);
  const discountTotal = lines.reduce((sum, l) => sum + (l.discountAmount || 0), 0);
  const taxTotal = enableTax ? lines.reduce((sum, l) => sum + (l.taxAmount || 0), 0) : 0;
  const rawGrandTotal = subtotal - discountTotal + taxTotal + Number(additionalCharges || 0);
  const grandTotal = Math.round(rawGrandTotal + Number(roundOff || 0));
  const balanceDue = Math.max(0, grandTotal - Number(amountReceived || 0));

  // Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!partyName.trim()) {
      setErrorMsg('Please specify a party / customer name.');
      return;
    }

    const validLines = lines.filter((l) => l.itemName.trim() && l.quantity > 0);
    if (validLines.length === 0) {
      setErrorMsg('Please add at least one item with a valid name and quantity.');
      return;
    }

    const invoicePayload = {
      ...(editingInvoice ? { id: editingInvoice.id, createdAt: editingInvoice.createdAt } : {}),
      invoiceNumber: invoiceNumber.trim() || undefined,
      type: newInvoiceType,
      partyId: selectedPartyId || undefined,
      partyName: partyName.trim(),
      partyPhone: partyPhone.trim(),
      partyAddress: partyAddress.trim(),
      partyNtn: partyNtn.trim(),
      date: invoiceDate,
      dueDate: dueDate || undefined,
      lines: validLines,
      subtotal,
      discountTotal,
      hasTax: enableTax,
      taxTotal,
      additionalCharges: Number(additionalCharges || 0),
      roundOff: Number(roundOff || 0),
      grandTotal,
      amountReceived: isQuotation ? 0 : Number(amountReceived || 0),
      paymentMode,
      manualPaymentDetails: manualPaymentDetails.trim(),
      notes: notes.trim(),
      terms: terms.trim(),
    };

    const saved = saveInvoice(invoicePayload);

    // Clear autosaved draft on successful save
    clearDraft(`${STORAGE_KEYS.DRAFT_INVOICE}_${newInvoiceType}`);

    setIsNewInvoiceOpen(false);
    setEditingInvoice(null);
    setViewingInvoice(saved);
  };

  if (!isNewInvoiceOpen) return null;

  const titleText = isQuotation
    ? 'New Quotation / Price Estimate'
    : isSale
    ? 'New Customer Sale Invoice'
    : isPurchase
    ? 'New Supplier Purchase Bill'
    : 'New Return Voucher';

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-2 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-4 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/80 rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-xl font-bold text-white ${
                isQuotation ? 'bg-indigo-600' : isSale ? 'bg-theme' : 'bg-slate-700'
              }`}
            >
              {isQuotation ? 'QT' : isSale ? 'INV' : 'BILL'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
                  {titleText}
                </h2>
                {/* Autosaved Badge */}
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  Autosaved
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isQuotation ? 'Estimate prices for client' : isSale ? 'Record sale & update party ledger' : 'Record vendor stock addition'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {!editingInvoice && (isDraftRestored || isFormDirty) && (
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/70 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                title="Discard draft and start fresh"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Discard Draft</span>
              </button>
            )}
            <button
              onClick={() => {
                setIsNewInvoiceOpen(false);
                setEditingInvoice(null);
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-4 sm:p-6 space-y-5 text-xs flex-1">
          {errorMsg && (
            <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Section 1: Party & Document Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            {/* Party Selection with Inline Quick-Add */}
            <div className="md:col-span-2 space-y-2">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 dark:text-slate-300">
                  {isSale ? 'Customer / Client *' : isPurchase ? 'Supplier / Vendor *' : 'Party / Client *'}
                </label>
                <button
                  type="button"
                  onClick={() => setIsQuickPartyOpen(true)}
                  className="flex items-center gap-1 font-bold text-theme hover:underline text-[11px] cursor-pointer"
                >
                  <UserPlus className="h-3 w-3" />
                  <span>+ New Party</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <select
                  value={selectedPartyId}
                  onChange={(e) => handlePartySelect(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                >
                  <option value="">-- Or Select Existing Party --</option>
                  {parties.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({formatMoney(p.currentBalance)})
                    </option>
                  ))}
                </select>

                <input
                  type="text"
                  placeholder="Party Name (e.g. Ali Mobiles / Walk-in Customer)"
                  value={partyName}
                  onChange={(e) => setPartyName(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Mobile / WhatsApp number"
                  value={partyPhone}
                  onChange={(e) => setPartyPhone(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <input
                  type="text"
                  placeholder="Address / Delivery location"
                  value={partyAddress}
                  onChange={(e) => setPartyAddress(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Document Date & Number */}
            <div className="space-y-2">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {isQuotation ? 'Quotation No.' : isSale ? 'Invoice No.' : 'Bill No.'}
                </label>
                <input
                  type="text"
                  placeholder="Auto-generated if blank"
                  value={invoiceNumber}
                  onChange={(e) => setInvoiceNumber(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    Due Date
                  </label>
                  <input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Optional Tax Toggle */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-2.5 border border-slate-200 dark:bg-slate-800/40 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="toggle-tax"
                checked={enableTax}
                onChange={(e) => {
                  const val = e.target.checked;
                  setEnableTax(val);
                  setLines((prev) =>
                    prev.map((l) => ({
                      ...l,
                      taxPercent: val ? defaultTaxRate : 0,
                      taxAmount: val ? (l.quantity * l.rate * defaultTaxRate) / 100 : 0,
                      totalAmount: val
                        ? (l.quantity * l.rate - (l.discountAmount || 0)) + (l.quantity * l.rate * defaultTaxRate) / 100
                        : (l.quantity * l.rate - (l.discountAmount || 0)),
                    }))
                  );
                }}
                className="h-4 w-4 rounded text-theme focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="toggle-tax" className="font-bold text-slate-800 dark:text-slate-200 cursor-pointer">
                Apply Sales Tax / STRN on this bill (Optional)
              </label>
            </div>

            {enableTax && (
              <div className="flex items-center gap-1.5">
                <span className="text-slate-500">Tax Rate:</span>
                <input
                  type="number"
                  value={defaultTaxRate}
                  onChange={(e) => setDefaultTaxRate(parseFloat(e.target.value) || 0)}
                  className="w-16 rounded-lg border border-slate-200 bg-white p-1 text-center font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
                <span className="font-bold">%</span>
              </div>
            )}
          </div>

          {/* Section 2: Items Table with Remove Option */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-800 dark:text-white">
                Items & Quantities
              </h3>
              <span className="text-[11px] text-slate-400">
                Pick from inventory or type directly
              </span>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3 w-8 text-center">#</th>
                    <th className="py-2.5 px-3 min-w-[200px]">Item Description</th>
                    <th className="py-2.5 px-2 w-20 text-center">Unit</th>
                    <th className="py-2.5 px-2 w-24 text-right">Qty</th>
                    <th className="py-2.5 px-2 w-28 text-right">Rate ({profile.currencySymbol})</th>
                    <th className="py-2.5 px-2 w-24 text-right">Discount</th>
                    {enableTax && <th className="py-2.5 px-2 w-20 text-center">Tax %</th>}
                    <th className="py-2.5 px-3 w-28 text-right">Total</th>
                    <th className="py-2.5 px-2 w-10 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {lines.map((line, idx) => (
                    <tr key={line.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 text-center text-slate-400 font-mono text-[11px]">
                        {idx + 1}
                      </td>

                      {/* Item Picker & Name Input */}
                      <td className="py-2 px-3 space-y-1">
                        <select
                          value={line.itemId}
                          onChange={(e) => handleUpdateLine(idx, 'itemId', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          <option value="">-- Choose from Catalog --</option>
                          {items.map((itm) => (
                            <option key={itm.id} value={itm.id}>
                              {itm.name} (Stock: {itm.currentStock} {itm.unit})
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Or type manual item name..."
                          value={line.itemName}
                          onChange={(e) => handleUpdateLine(idx, 'itemName', e.target.value)}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          required
                        />
                      </td>

                      {/* Unit */}
                      <td className="py-2 px-2">
                        <select
                          value={line.unit}
                          onChange={(e) => handleUpdateLine(idx, 'unit', e.target.value as UnitType)}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        >
                          {['Pcs', 'Kg', 'Ltr', 'Box', 'Packet', 'Meter', 'Hour', 'Set', 'Dozen', 'Bag', 'Carton'].map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>

                      {/* Quantity */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          step="any"
                          min="0.01"
                          value={line.quantity || ''}
                          onChange={(e) => handleUpdateLine(idx, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-right font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          required
                        />
                      </td>

                      {/* Rate */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          step="any"
                          min="0"
                          value={line.rate || ''}
                          onChange={(e) => handleUpdateLine(idx, 'rate', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-right font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          required
                        />
                      </td>

                      {/* Discount Amount */}
                      <td className="py-2 px-2 text-right">
                        <input
                          type="number"
                          step="any"
                          placeholder="0"
                          value={line.discountAmount || ''}
                          onChange={(e) => handleUpdateLine(idx, 'discountAmount', parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-right font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                        />
                      </td>

                      {/* Tax % (If enabled) */}
                      {enableTax && (
                        <td className="py-2 px-2 text-center">
                          <input
                            type="number"
                            step="any"
                            value={line.taxPercent}
                            onChange={(e) => handleUpdateLine(idx, 'taxPercent', parseFloat(e.target.value) || 0)}
                            className="w-full rounded-lg border border-slate-200 bg-white p-1.5 text-center font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                          />
                        </td>
                      )}

                      {/* Total */}
                      <td className="py-2 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatMoney(line.totalAmount)}
                      </td>

                      {/* REMOVE ITEM BUTTON */}
                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 cursor-pointer"
                          title="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              type="button"
              onClick={handleAddLine}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 text-theme" />
              <span>+ Add Another Item Row</span>
            </button>
          </div>

          {/* Section 3: Totals & Manual Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-slate-200 dark:border-slate-800">
            {/* Left: Manual Payment & Notes */}
            <div className="space-y-3">
              {!isQuotation && (
                <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 dark:border-slate-800 dark:bg-slate-800/40 space-y-3">
                  <div className="font-bold text-slate-800 dark:text-slate-200">
                    Payment Collection Method
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Payment Mode
                      </label>
                      <select
                        value={paymentMode}
                        onChange={(e) => setPaymentMode(e.target.value as PaymentMode)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-semibold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      >
                        <option value="cash">Cash in Hand</option>
                        <option value="easypaisa">EasyPaisa</option>
                        <option value="jazzcash">JazzCash</option>
                        <option value="raast">Raast P2P</option>
                        <option value="bank_transfer">Bank Transfer (IBFT)</option>
                        <option value="cheque">Cheque</option>
                        <option value="other">Other</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                        Amount Paid Now ({profile.currencySymbol})
                      </label>
                      <input
                        type="number"
                        step="any"
                        placeholder="0"
                        value={amountReceived || ''}
                        onChange={(e) => setAmountReceived(parseFloat(e.target.value) || 0)}
                        className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                      />
                    </div>
                  </div>

                  {/* Manual Payment Details / Reference */}
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 dark:text-slate-400 mb-1">
                      Manual Payment Details / Ref (TID, Account, Cheque #)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. EasyPaisa TID: 9481204812 / Meezan Bank Cheque #4912"
                      value={manualPaymentDetails}
                      onChange={(e) => setManualPaymentDetails(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Customer Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Notes or special delivery instructions..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>

            {/* Right: Calculations Summary */}
            <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-4 dark:border-slate-800 dark:bg-slate-800/40 space-y-2.5">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal Items:</span>
                <span className="font-mono font-bold">{formatMoney(subtotal)}</span>
              </div>

              {discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Total Discount:</span>
                  <span className="font-mono font-bold">-{formatMoney(discountTotal)}</span>
                </div>
              )}

              {enableTax && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Sales Tax:</span>
                  <span className="font-mono font-bold">+{formatMoney(taxTotal)}</span>
                </div>
              )}

              <div className="flex items-center justify-between">
                <span className="text-slate-600 dark:text-slate-400">Additional Charges (Delivery/Packing):</span>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={additionalCharges || ''}
                  onChange={(e) => setAdditionalCharges(parseFloat(e.target.value) || 0)}
                  className="w-24 rounded-lg border border-slate-200 bg-white p-1 text-right font-mono font-bold text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-slate-200 dark:border-slate-700 text-sm font-extrabold text-slate-900 dark:text-white">
                <span>Grand Total:</span>
                <span className="font-mono text-base text-theme">
                  {formatMoney(grandTotal)}
                </span>
              </div>

              {!isQuotation && (
                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-semibold text-slate-600 dark:text-slate-400">
                    Remaining Balance Due:
                  </span>
                  <span
                    className={`font-mono font-bold ${
                      balanceDue > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600'
                    }`}
                  >
                    {formatMoney(balanceDue)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div>
              {!editingInvoice && (isDraftRestored || isFormDirty) && (
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Discard Draft</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsNewInvoiceOpen(false);
                  setEditingInvoice(null);
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                Close
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-theme px-6 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{isQuotation ? 'Save Quotation' : isSale ? 'Save & Print Invoice' : 'Save Purchase Bill'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* In-app Discard Draft Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Discard Draft?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This will remove your autosaved changes and reset this invoice to a clean state.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="w-full rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-rose-700 shadow-sm cursor-pointer"
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

      {/* Inline Quick Party Modal */}
      <QuickPartyModal
        isOpen={isQuickPartyOpen}
        onClose={() => setIsQuickPartyOpen(false)}
        defaultType={isSale ? 'customer' : 'supplier'}
        onCreated={(newParty) => {
          setSelectedPartyId(newParty.id);
          setPartyName(newParty.name);
          setPartyPhone(newParty.phone || '');
          setPartyAddress(newParty.address || '');
          setPartyNtn(newParty.ntn || '');
        }}
      />
    </div>
  );
};
