import React, { createContext, useContext, useState, useEffect, useMemo, ReactNode } from 'react';
import {
  BusinessProfile,
  Party,
  Item,
  Invoice,
  Payment,
  Expense,
  StockMovement,
  ColorTheme,
} from '../types';
import {
  DEFAULT_PROFILE,
  INITIAL_PARTIES,
  INITIAL_ITEMS,
  INITIAL_INVOICES,
  INITIAL_PAYMENTS,
  INITIAL_EXPENSES,
  STORAGE_KEYS,
  loadFromStorage,
  saveToStorage,
  initializeDatabase,
  importDatabaseJson,
} from '../services/db';

export type ActiveTab =
  | 'dashboard'
  | 'parties'
  | 'items'
  | 'sales'
  | 'purchases'
  | 'quotations'
  | 'payments'
  | 'expenses'
  | 'reports'
  | 'settings'
  | 'guide';

interface AppContextType {
  profile: BusinessProfile;
  updateProfile: (updated: Partial<BusinessProfile>) => void;
  parties: Party[];
  saveParty: (partyData: Partial<Party>) => Party;
  deleteParty: (id: string) => void;
  archiveParty: (id: string) => void;
  items: Item[];
  saveItem: (itemData: Partial<Item>) => Item;
  deleteItem: (id: string) => void;
  adjustStock: (itemId: string, qtyDelta: number, reason: string) => void;
  invoices: Invoice[];
  saveInvoice: (invoiceData: Partial<Invoice>) => Invoice;
  cancelInvoice: (id: string) => boolean;
  deleteInvoice: (id: string) => boolean;
  payments: Payment[];
  savePayment: (paymentData: Partial<Payment>) => Payment;
  deletePayment: (id: string) => void;
  expenses: Expense[];
  saveExpense: (expenseData: Partial<Expense>) => Expense;
  deleteExpense: (id: string) => void;
  movements: StockMovement[];
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  // Modal states for global quick actions
  isNewInvoiceOpen: boolean;
  setIsNewInvoiceOpen: (open: boolean) => void;
  newInvoiceType: 'sale' | 'purchase' | 'quotation' | 'sale_return';
  setNewInvoiceType: (type: 'sale' | 'purchase' | 'quotation' | 'sale_return') => void;
  editingInvoice: Invoice | null;
  setEditingInvoice: (inv: Invoice | null) => void;
  viewingInvoice: Invoice | null;
  setViewingInvoice: (invoice: Invoice | null) => void;
  viewingLedgerParty: Party | null;
  setViewingLedgerParty: (party: Party | null) => void;
  // Quick Party Modal
  isQuickPartyModalOpen: boolean;
  setIsQuickPartyModalOpen: (open: boolean) => void;
  onPartyCreatedCallback: ((party: Party) => void) | null;
  setOnPartyCreatedCallback: (cb: ((party: Party) => void) | null) => void;
  // App Downloads, APK & Source Code Center
  isDownloadModalOpen: boolean;
  setIsDownloadModalOpen: (open: boolean) => void;
  // Security lock
  isAppLocked: boolean;
  unlockWithPin: (pin: string) => boolean;
  lockApp: () => void;
  // Financial metrics
  formatMoney: (amount: number) => string;
  totals: {
    todaySales: number;
    monthSales: number;
    toCollect: number; // Customer Receivables
    toPay: number;     // Supplier Payables
    stockValue: number;
    lowStockCount: number;
    totalQuotations: number;
  };
  resetDemoData: () => void;
  restoreData: (jsonStr: string) => { success: boolean; message: string; counts?: any };
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  useEffect(() => {
    initializeDatabase();
  }, []);

  const [profile, setProfile] = useState<BusinessProfile>(() =>
    loadFromStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE)
  );
  const [parties, setParties] = useState<Party[]>(() =>
    loadFromStorage(STORAGE_KEYS.PARTIES, INITIAL_PARTIES)
  );
  const [items, setItems] = useState<Item[]>(() =>
    loadFromStorage(STORAGE_KEYS.ITEMS, INITIAL_ITEMS)
  );
  const [invoices, setInvoices] = useState<Invoice[]>(() =>
    loadFromStorage(STORAGE_KEYS.INVOICES, INITIAL_INVOICES)
  );
  const [payments, setPayments] = useState<Payment[]>(() =>
    loadFromStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS)
  );
  const [expenses, setExpenses] = useState<Expense[]>(() =>
    loadFromStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES)
  );
  const [movements, setMovements] = useState<StockMovement[]>(() =>
    loadFromStorage(STORAGE_KEYS.MOVEMENTS, [])
  );

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewInvoiceOpen, setIsNewInvoiceOpen] = useState(false);
  const [newInvoiceType, setNewInvoiceType] = useState<'sale' | 'purchase' | 'quotation' | 'sale_return'>('sale');
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [viewingLedgerParty, setViewingLedgerParty] = useState<Party | null>(null);

  // Quick Party Creation Modal triggerable inside invoice creation
  const [isQuickPartyModalOpen, setIsQuickPartyModalOpen] = useState(false);
  const [onPartyCreatedCallback, setOnPartyCreatedCallback] = useState<((party: Party) => void) | null>(null);

  // App Downloads, APK & Source Code Center Modal
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState(false);

  // App Lock
  const [isAppLocked, setIsAppLocked] = useState<boolean>(() => {
    return Boolean(profile.isAppLockEnabled && profile.appLockPin);
  });

  // Apply dark mode & color theme to document element
  useEffect(() => {
    if (profile.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    document.documentElement.setAttribute('data-color-theme', profile.colorTheme || 'emerald');
  }, [profile.theme, profile.colorTheme]);

  // Persist handlers
  const updateProfile = (updated: Partial<BusinessProfile>) => {
    setProfile((prev) => {
      const next = { ...prev, ...updated };
      saveToStorage(STORAGE_KEYS.PROFILE, next);
      return next;
    });
  };

  const unlockWithPin = (pin: string): boolean => {
    if (!profile.appLockPin || pin === profile.appLockPin) {
      setIsAppLocked(false);
      return true;
    }
    return false;
  };

  const lockApp = () => {
    if (profile.isAppLockEnabled && profile.appLockPin) {
      setIsAppLocked(true);
    }
  };

  // Save or update party
  const saveParty = (partyData: Partial<Party>): Party => {
    let result: Party;
    if (partyData.id) {
      result = {
        ...parties.find((p) => p.id === partyData.id)!,
        ...partyData,
        updatedAt: new Date().toISOString(),
      };
      const next = parties.map((p) => (p.id === result.id ? result : p));
      setParties(next);
      saveToStorage(STORAGE_KEYS.PARTIES, next);
    } else {
      const openingBal = Number(partyData.openingBalance || 0);
      const openingType = partyData.openingBalanceType || 'to_collect';
      const initialBal = openingType === 'to_collect' ? openingBal : -openingBal;
      result = {
        id: `pty_${Date.now()}`,
        name: partyData.name || 'Unnamed Party',
        type: partyData.type || 'customer',
        phone: partyData.phone || '',
        email: partyData.email || '',
        address: partyData.address || '',
        ntn: partyData.ntn || '',
        openingBalance: openingBal,
        openingBalanceType: openingType,
        currentBalance: initialBal,
        creditLimit: partyData.creditLimit || 0,
        notes: partyData.notes || '',
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const next = [result, ...parties];
      setParties(next);
      saveToStorage(STORAGE_KEYS.PARTIES, next);
    }

    if (onPartyCreatedCallback) {
      onPartyCreatedCallback(result);
      setOnPartyCreatedCallback(null);
    }

    return result;
  };

  const deleteParty = (id: string) => {
    const next = parties.filter((p) => p.id !== id);
    setParties(next);
    saveToStorage(STORAGE_KEYS.PARTIES, next);
  };

  const archiveParty = (id: string) => {
    const next = parties.map((p) => (p.id === id ? { ...p, archived: true } : p));
    setParties(next);
    saveToStorage(STORAGE_KEYS.PARTIES, next);
  };

  // Save or update item
  const saveItem = (itemData: Partial<Item>): Item => {
    let result: Item;
    if (itemData.id) {
      result = {
        ...items.find((i) => i.id === itemData.id)!,
        ...itemData,
        updatedAt: new Date().toISOString(),
      };
      const next = items.map((i) => (i.id === result.id ? result : i));
      setItems(next);
      saveToStorage(STORAGE_KEYS.ITEMS, next);
    } else {
      const openingStock = Number(itemData.openingStock || 0);
      result = {
        id: `itm_${Date.now()}`,
        name: itemData.name || 'New Item',
        type: itemData.type || 'product',
        unit: itemData.unit || 'Pcs',
        salePrice: Number(itemData.salePrice || 0),
        purchasePrice: Number(itemData.purchasePrice || 0),
        taxRate: Number(itemData.taxRate || 0),
        openingStock,
        currentStock: openingStock,
        lowStockThreshold: Number(itemData.lowStockThreshold || 5),
        sku: itemData.sku || '',
        barcode: itemData.barcode || '',
        description: itemData.description || '',
        imageUrl: itemData.imageUrl || '',
        archived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      const next = [result, ...items];
      setItems(next);
      saveToStorage(STORAGE_KEYS.ITEMS, next);
    }
    return result;
  };

  const deleteItem = (id: string) => {
    const next = items.filter((i) => i.id !== id);
    setItems(next);
    saveToStorage(STORAGE_KEYS.ITEMS, next);
  };

  // Adjust stock manually with audit movement
  const adjustStock = (itemId: string, qtyDelta: number, reason: string) => {
    const itm = items.find((i) => i.id === itemId);
    if (!itm) return;

    const newStock = Math.max(0, itm.currentStock + qtyDelta);
    const updatedItems = items.map((i) => (i.id === itemId ? { ...i, currentStock: newStock } : i));
    setItems(updatedItems);
    saveToStorage(STORAGE_KEYS.ITEMS, updatedItems);

    const movement: StockMovement = {
      id: `mov_${Date.now()}`,
      itemId,
      itemName: itm.name,
      date: new Date().toISOString().split('T')[0],
      type: 'manual_adjustment',
      quantityDelta: qtyDelta,
      remainingStock: newStock,
      reason,
    };
    const nextMovements = [movement, ...movements];
    setMovements(nextMovements);
    saveToStorage(STORAGE_KEYS.MOVEMENTS, nextMovements);
  };

  // Save invoice (Atomic Stock & Party Balance update)
  const saveInvoice = (invoiceData: Partial<Invoice>): Invoice => {
    const isNew = !invoiceData.id;
    const invId = invoiceData.id || `inv_${Date.now()}`;
    const invType = invoiceData.type || 'sale';

    // Auto generate invoice number if missing
    let invNumber = invoiceData.invoiceNumber;
    if (!invNumber) {
      let prefix = profile.saleInvoicePrefix || 'INV-';
      if (invType === 'purchase') prefix = profile.purchaseBillPrefix || 'BILL-';
      if (invType === 'quotation') prefix = profile.quotationPrefix || 'QT-';
      const count = invoices.filter((i) => i.type === invType).length + 1;
      invNumber = `${prefix}${String(count).padStart(3, '0')}`;
    }

    const grandTotal = Number(invoiceData.grandTotal || 0);
    const amountReceived = Number(invoiceData.amountReceived || 0);

    let status: Invoice['status'] = 'unpaid';
    if (invType === 'quotation') {
      status = 'pending';
    } else if (amountReceived >= grandTotal && grandTotal > 0) {
      status = 'paid';
    } else if (amountReceived > 0 && amountReceived < grandTotal) {
      status = 'partial';
    }

    const savedInvoice: Invoice = {
      id: invId,
      invoiceNumber: invNumber,
      type: invType,
      partyId: invoiceData.partyId,
      partyName: invoiceData.partyName || (invType === 'sale' ? 'Cash Customer' : invType === 'purchase' ? 'Cash Supplier' : 'Customer Estimate'),
      partyPhone: invoiceData.partyPhone || '',
      partyAddress: invoiceData.partyAddress || '',
      partyNtn: invoiceData.partyNtn || '',
      date: invoiceData.date || new Date().toISOString().split('T')[0],
      dueDate: invoiceData.dueDate,
      status,
      lines: invoiceData.lines || [],
      subtotal: Number(invoiceData.subtotal || 0),
      discountTotal: Number(invoiceData.discountTotal || 0),
      hasTax: Boolean(invoiceData.hasTax),
      taxTotal: Number(invoiceData.taxTotal || 0),
      additionalCharges: Number(invoiceData.additionalCharges || 0),
      roundOff: Number(invoiceData.roundOff || 0),
      grandTotal,
      amountReceived,
      paymentMode: invoiceData.paymentMode || 'cash',
      manualPaymentDetails: invoiceData.manualPaymentDetails || '',
      notes: invoiceData.notes || '',
      terms: invoiceData.terms || profile.termsConditions,
      originalInvoiceId: invoiceData.originalInvoiceId,
      createdAt: isNew ? new Date().toISOString() : (invoiceData.createdAt || new Date().toISOString()),
      updatedAt: new Date().toISOString(),
    };

    // Update invoices list
    let nextInvoices: Invoice[];
    if (isNew) {
      nextInvoices = [savedInvoice, ...invoices];
    } else {
      nextInvoices = invoices.map((inv) => (inv.id === invId ? savedInvoice : inv));
    }
    setInvoices(nextInvoices);
    saveToStorage(STORAGE_KEYS.INVOICES, nextInvoices);

    // Stock & Ledger logic: Quotations do not impact stock or ledger balances!
    if (invType !== 'quotation') {
      // 1. Update Stock inventory for every line item
      let updatedItems = [...items];
      const newMovements: StockMovement[] = [];

      savedInvoice.lines.forEach((line) => {
        const itm = updatedItems.find((i) => i.id === line.itemId);
        if (!itm || itm.type === 'service') return;

        let delta = 0;
        if (invType === 'sale') {
          delta = -line.quantity; // Deduct for sales
        } else if (invType === 'purchase') {
          delta = line.quantity; // Add for purchases
        } else if (invType === 'sale_return') {
          delta = line.quantity; // Return back to stock
        }

        const updatedStock = Math.max(0, itm.currentStock + delta);
        updatedItems = updatedItems.map((i) => (i.id === itm.id ? { ...i, currentStock: updatedStock } : i));

        newMovements.push({
          id: `mov_${Date.now()}_${line.id}`,
          itemId: itm.id,
          itemName: itm.name,
          date: savedInvoice.date,
          type: invType,
          quantityDelta: delta,
          remainingStock: updatedStock,
          reason: `${invType.toUpperCase()} ${savedInvoice.invoiceNumber}`,
          referenceId: savedInvoice.id,
        });
      });

      setItems(updatedItems);
      saveToStorage(STORAGE_KEYS.ITEMS, updatedItems);

      if (newMovements.length > 0) {
        const nextMovs = [...newMovements, ...movements];
        setMovements(nextMovs);
        saveToStorage(STORAGE_KEYS.MOVEMENTS, nextMovs);
      }

      // 2. Update Party Ledger Balance
      if (savedInvoice.partyId) {
        const party = parties.find((p) => p.id === savedInvoice.partyId);
        if (party) {
          let balanceDelta = 0;
          if (invType === 'sale') {
            balanceDelta = grandTotal - amountReceived;
          } else if (invType === 'purchase') {
            balanceDelta = -(grandTotal - amountReceived);
          } else if (invType === 'sale_return') {
            balanceDelta = -(grandTotal - amountReceived);
          }

          const newPartyBal = party.currentBalance + balanceDelta;
          const updatedParties = parties.map((p) =>
            p.id === party.id ? { ...p, currentBalance: newPartyBal } : p
          );
          setParties(updatedParties);
          saveToStorage(STORAGE_KEYS.PARTIES, updatedParties);
        }
      }

      // 3. Record Payment if initial payment made
      if (amountReceived > 0 && isNew) {
        const newPayment: Payment = {
          id: `pay_${Date.now()}`,
          direction: invType === 'sale' ? 'in' : 'out',
          partyId: savedInvoice.partyId,
          partyName: savedInvoice.partyName,
          amount: amountReceived,
          date: savedInvoice.date,
          mode: savedInvoice.paymentMode,
          manualPaymentDetails: savedInvoice.manualPaymentDetails,
          referenceNote: `Payment against ${savedInvoice.invoiceNumber}`,
          allocatedInvoiceId: savedInvoice.id,
          createdAt: new Date().toISOString(),
        };
        const nextPayments = [newPayment, ...payments];
        setPayments(nextPayments);
        saveToStorage(STORAGE_KEYS.PAYMENTS, nextPayments);
      }
    }

    return savedInvoice;
  };

  // Cancel an invoice (reverses inventory and party ledger changes)
  const cancelInvoice = (id: string): boolean => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv || inv.status === 'cancelled') return false;

    // 1. Mark as cancelled
    const updatedInvoices = invoices.map((i) =>
      i.id === id ? { ...i, status: 'cancelled' as const } : i
    );
    setInvoices(updatedInvoices);
    saveToStorage(STORAGE_KEYS.INVOICES, updatedInvoices);

    if (inv.type === 'quotation') return true;

    // 2. Reverse stock changes
    let updatedItems = [...items];
    const newMovements: StockMovement[] = [];

    inv.lines.forEach((line) => {
      const itm = updatedItems.find((i) => i.id === line.itemId);
      if (!itm || itm.type === 'service') return;

      let reversalDelta = 0;
      if (inv.type === 'sale') {
        reversalDelta = line.quantity;
      } else if (inv.type === 'purchase') {
        reversalDelta = -line.quantity;
      }

      const restoredStock = Math.max(0, itm.currentStock + reversalDelta);
      updatedItems = updatedItems.map((i) =>
        i.id === itm.id ? { ...i, currentStock: restoredStock } : i
      );

      newMovements.push({
        id: `mov_rev_${Date.now()}_${line.id}`,
        itemId: itm.id,
        itemName: itm.name,
        date: new Date().toISOString().split('T')[0],
        type: 'manual_adjustment',
        quantityDelta: reversalDelta,
        remainingStock: restoredStock,
        reason: `CANCELLED ${inv.invoiceNumber}`,
        referenceId: inv.id,
      });
    });

    setItems(updatedItems);
    saveToStorage(STORAGE_KEYS.ITEMS, updatedItems);

    if (newMovements.length > 0) {
      const nextMovs = [...newMovements, ...movements];
      setMovements(nextMovs);
      saveToStorage(STORAGE_KEYS.MOVEMENTS, nextMovs);
    }

    // 3. Reverse party balance
    if (inv.partyId) {
      const party = parties.find((p) => p.id === inv.partyId);
      if (party) {
        const unpaidPortion = inv.grandTotal - inv.amountReceived;
        let reversalBal = 0;
        if (inv.type === 'sale') {
          reversalBal = -unpaidPortion;
        } else if (inv.type === 'purchase') {
          reversalBal = unpaidPortion;
        }

        const newBal = party.currentBalance + reversalBal;
        const updatedParties = parties.map((p) =>
          p.id === party.id ? { ...p, currentBalance: newBal } : p
        );
        setParties(updatedParties);
        saveToStorage(STORAGE_KEYS.PARTIES, updatedParties);
      }
    }

    return true;
  };

  // Permanently delete invoice
  const deleteInvoice = (id: string): boolean => {
    const inv = invoices.find((i) => i.id === id);
    if (!inv) return false;

    // If not already cancelled, reverse stock and ledger
    if (inv.status !== 'cancelled' && inv.type !== 'quotation') {
      cancelInvoice(id);
    }

    const nextInvoices = invoices.filter((i) => i.id !== id);
    setInvoices(nextInvoices);
    saveToStorage(STORAGE_KEYS.INVOICES, nextInvoices);
    return true;
  };

  // Save payment
  const savePayment = (paymentData: Partial<Payment>): Payment => {
    const isNew = !paymentData.id;
    const paymentId = paymentData.id || `pay_${Date.now()}`;
    const amount = Number(paymentData.amount || 0);
    const direction = paymentData.direction || 'in';

    const savedPayment: Payment = {
      id: paymentId,
      direction,
      partyId: paymentData.partyId,
      partyName: paymentData.partyName || 'Cash Account',
      amount,
      date: paymentData.date || new Date().toISOString().split('T')[0],
      mode: paymentData.mode || 'cash',
      manualPaymentDetails: paymentData.manualPaymentDetails || '',
      referenceNote: paymentData.referenceNote || '',
      allocatedInvoiceId: paymentData.allocatedInvoiceId,
      createdAt: isNew ? new Date().toISOString() : paymentData.createdAt!,
    };

    let nextPayments: Payment[];
    if (isNew) {
      nextPayments = [savedPayment, ...payments];
    } else {
      nextPayments = payments.map((p) => (p.id === paymentId ? savedPayment : p));
    }
    setPayments(nextPayments);
    saveToStorage(STORAGE_KEYS.PAYMENTS, nextPayments);

    // Update Party Balance
    if (savedPayment.partyId && isNew) {
      const party = parties.find((p) => p.id === savedPayment.partyId);
      if (party) {
        let delta = 0;
        if (direction === 'in') {
          delta = -amount; // Customer paid us -> their balance (what they owe) decreases
        } else {
          delta = amount;  // We paid supplier -> our debt decreases
        }
        const updatedParties = parties.map((p) =>
          p.id === party.id ? { ...p, currentBalance: p.currentBalance + delta } : p
        );
        setParties(updatedParties);
        saveToStorage(STORAGE_KEYS.PARTIES, updatedParties);
      }
    }

    return savedPayment;
  };

  const deletePayment = (id: string) => {
    const pay = payments.find((p) => p.id === id);
    if (!pay) return;

    if (pay.partyId) {
      const party = parties.find((p) => p.id === pay.partyId);
      if (party) {
        const delta = pay.direction === 'in' ? pay.amount : -pay.amount;
        const updatedParties = parties.map((p) =>
          p.id === party.id ? { ...p, currentBalance: p.currentBalance + delta } : p
        );
        setParties(updatedParties);
        saveToStorage(STORAGE_KEYS.PARTIES, updatedParties);
      }
    }

    const next = payments.filter((p) => p.id !== id);
    setPayments(next);
    saveToStorage(STORAGE_KEYS.PAYMENTS, next);
  };

  // Save expense
  const saveExpense = (expenseData: Partial<Expense>): Expense => {
    const isNew = !expenseData.id;
    const expId = expenseData.id || `exp_${Date.now()}`;
    const savedExpense: Expense = {
      id: expId,
      category: expenseData.category || 'General',
      amount: Number(expenseData.amount || 0),
      date: expenseData.date || new Date().toISOString().split('T')[0],
      mode: expenseData.mode || 'cash',
      note: expenseData.note || '',
      receiptUrl: expenseData.receiptUrl,
      createdAt: isNew ? new Date().toISOString() : expenseData.createdAt!,
    };

    let nextExpenses: Expense[];
    if (isNew) {
      nextExpenses = [savedExpense, ...expenses];
    } else {
      nextExpenses = expenses.map((e) => (e.id === expId ? savedExpense : e));
    }
    setExpenses(nextExpenses);
    saveToStorage(STORAGE_KEYS.EXPENSES, nextExpenses);
    return savedExpense;
  };

  const deleteExpense = (id: string) => {
    const next = expenses.filter((e) => e.id !== id);
    setExpenses(next);
    saveToStorage(STORAGE_KEYS.EXPENSES, next);
  };

  // Currency Formatter
  const formatMoney = (amount: number): string => {
    const sym = profile.currencySymbol || 'Rs.';
    const formatted = Math.abs(amount).toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    });
    return amount < 0 ? `-${sym} ${formatted}` : `${sym} ${formatted}`;
  };

  // Financial aggregates
  const totals = useMemo(() => {
    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonth = new Date().toISOString().slice(0, 7);

    let todaySales = 0;
    let monthSales = 0;
    let quotationsCount = 0;

    invoices.forEach((inv) => {
      if (inv.type === 'quotation') {
        quotationsCount++;
        return;
      }
      if (inv.status === 'cancelled') return;

      if (inv.type === 'sale') {
        if (inv.date === todayStr) todaySales += inv.grandTotal;
        if (inv.date.startsWith(currentMonth)) monthSales += inv.grandTotal;
      }
    });

    let toCollect = 0;
    let toPay = 0;
    parties.forEach((p) => {
      if (p.currentBalance > 0) toCollect += p.currentBalance;
      else if (p.currentBalance < 0) toPay += Math.abs(p.currentBalance);
    });

    let stockValue = 0;
    let lowStockCount = 0;
    items.forEach((item) => {
      if (item.type === 'product') {
        stockValue += item.currentStock * item.purchasePrice;
        if (item.currentStock <= item.lowStockThreshold) lowStockCount++;
      }
    });

    return {
      todaySales,
      monthSales,
      toCollect,
      toPay,
      stockValue,
      lowStockCount,
      totalQuotations: quotationsCount,
    };
  }, [invoices, parties, items]);

  const resetDemoData = () => {
    initializeDatabase(true);
    setProfile(loadFromStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE));
    setParties(loadFromStorage(STORAGE_KEYS.PARTIES, INITIAL_PARTIES));
    setItems(loadFromStorage(STORAGE_KEYS.ITEMS, INITIAL_ITEMS));
    setInvoices(loadFromStorage(STORAGE_KEYS.INVOICES, INITIAL_INVOICES));
    setPayments(loadFromStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS));
    setExpenses(loadFromStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES));
    setMovements([]);
  };

  const restoreData = (jsonStr: string) => {
    const res = importDatabaseJson(jsonStr);
    if (res.success) {
      setProfile(loadFromStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE));
      setParties(loadFromStorage(STORAGE_KEYS.PARTIES, []));
      setItems(loadFromStorage(STORAGE_KEYS.ITEMS, []));
      setInvoices(loadFromStorage(STORAGE_KEYS.INVOICES, []));
      setPayments(loadFromStorage(STORAGE_KEYS.PAYMENTS, []));
      setExpenses(loadFromStorage(STORAGE_KEYS.EXPENSES, []));
      setMovements(loadFromStorage(STORAGE_KEYS.MOVEMENTS, []));
    }
    return res;
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        updateProfile,
        parties,
        saveParty,
        deleteParty,
        archiveParty,
        items,
        saveItem,
        deleteItem,
        adjustStock,
        invoices,
        saveInvoice,
        cancelInvoice,
        deleteInvoice,
        payments,
        savePayment,
        deletePayment,
        expenses,
        saveExpense,
        deleteExpense,
        movements,
        activeTab,
        setActiveTab,
        searchQuery,
        setSearchQuery,
        isNewInvoiceOpen,
        setIsNewInvoiceOpen,
        newInvoiceType,
        setNewInvoiceType,
        editingInvoice,
        setEditingInvoice,
        viewingInvoice,
        setViewingInvoice,
        viewingLedgerParty,
        setViewingLedgerParty,
        isQuickPartyModalOpen,
        setIsQuickPartyModalOpen,
        onPartyCreatedCallback,
        setOnPartyCreatedCallback,
        isDownloadModalOpen,
        setIsDownloadModalOpen,
        isAppLocked,
        unlockWithPin,
        lockApp,
        formatMoney,
        totals,
        resetDemoData,
        restoreData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
