import {
  BusinessProfile,
  Party,
  Item,
  Invoice,
  Payment,
  Expense,
  StockMovement,
} from '../types';

export const STORAGE_KEYS = {
  PROFILE: 'hk_profile_pk_v2',
  PARTIES: 'hk_parties_pk_v2',
  ITEMS: 'hk_items_pk_v2',
  INVOICES: 'hk_invoices_pk_v2',
  PAYMENTS: 'hk_payments_pk_v2',
  EXPENSES: 'hk_expenses_pk_v2',
  MOVEMENTS: 'hk_movements_pk_v2',
  INITIALIZED: 'hk_initialized_pk_v2',
  // Autosave Draft Keys
  DRAFT_INVOICE: 'hk_draft_invoice_v2',
  DRAFT_PARTY: 'hk_draft_party_v2',
  DRAFT_ITEM: 'hk_draft_item_v2',
  DRAFT_PAYMENT: 'hk_draft_payment_v2',
  DRAFT_EXPENSE: 'hk_draft_expense_v2',
};

export const DEFAULT_PROFILE: BusinessProfile = {
  id: 'biz_01',
  name: 'My Business',
  phone: '',
  email: '',
  address: '',
  ntn: '',
  strn: '',
  isTaxEnabled: false, // Optional Tax: disabled by default!
  defaultTaxPercent: 18,
  currencySymbol: 'Rs.', // Auto selection is RS when app is opened newly!
  currencyCode: 'PKR',
  financialYearStart: '07-01',
  saleInvoicePrefix: 'INV-',
  purchaseBillPrefix: 'BILL-',
  quotationPrefix: 'QT-',
  logoUrl: '',
  // Manual Bank & Wallet Information (Pakistani)
  bankName: '',
  bankAccountTitle: '',
  bankAccountNumber: '',
  bankIban: '',
  easypaisaTitle: '',
  easypaisaNumber: '',
  jazzcashTitle: '',
  jazzcashNumber: '',
  termsConditions: '1. Goods once sold will be exchanged within 3 days with original bill.\n2. Warranty claims handled as per manufacturer terms.\n3. Thank you for your business.',
  appLockPin: '',
  isAppLockEnabled: false,
  theme: 'light',
  colorTheme: 'emerald', // Pakistani Emerald Green default
};

export const INITIAL_PARTIES: Party[] = [];

export const INITIAL_ITEMS: Item[] = [];

export const INITIAL_INVOICES: Invoice[] = [];

export const INITIAL_PAYMENTS: Payment[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

// Helper to safely read from local storage
export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Error loading key ${key}:`, err);
    return fallback;
  }
}

// Helper to safely save to local storage
export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.error(`Error saving key ${key}:`, err);
  }
}

// Purge legacy demo/dummy test records while strictly preserving real user-created data
export function cleanupDemoData(): void {
  try {
    const demoPartyIds = new Set(['pty_01', 'pty_02', 'pty_03', 'pty_04']);
    const demoItemIds = new Set(['itm_01', 'itm_02', 'itm_03', 'itm_04', 'itm_05', 'itm_06']);
    const demoInvIds = new Set(['inv_01', 'inv_02', 'inv_03', 'inv_04', 'inv_05', 'inv_06']);
    const demoPayIds = new Set(['pay_01', 'pay_02', 'pay_03', 'pay_04', 'pay_05']);
    const demoExpIds = new Set(['exp_01', 'exp_02', 'exp_03', 'exp_04']);

    const currentParties = loadFromStorage<Party[]>(STORAGE_KEYS.PARTIES, []);
    const cleanParties = currentParties.filter((p) => !demoPartyIds.has(p.id));
    if (cleanParties.length !== currentParties.length) {
      saveToStorage(STORAGE_KEYS.PARTIES, cleanParties);
    }

    const currentItems = loadFromStorage<Item[]>(STORAGE_KEYS.ITEMS, []);
    const cleanItems = currentItems.filter((i) => !demoItemIds.has(i.id));
    if (cleanItems.length !== currentItems.length) {
      saveToStorage(STORAGE_KEYS.ITEMS, cleanItems);
    }

    const currentInvoices = loadFromStorage<Invoice[]>(STORAGE_KEYS.INVOICES, []);
    const cleanInvoices = currentInvoices.filter((inv) => !demoInvIds.has(inv.id));
    if (cleanInvoices.length !== currentInvoices.length) {
      saveToStorage(STORAGE_KEYS.INVOICES, cleanInvoices);
    }

    const currentPayments = loadFromStorage<Payment[]>(STORAGE_KEYS.PAYMENTS, []);
    const cleanPayments = currentPayments.filter((p) => !demoPayIds.has(p.id));
    if (cleanPayments.length !== currentPayments.length) {
      saveToStorage(STORAGE_KEYS.PAYMENTS, cleanPayments);
    }

    const currentExpenses = loadFromStorage<Expense[]>(STORAGE_KEYS.EXPENSES, []);
    const cleanExpenses = currentExpenses.filter((e) => !demoExpIds.has(e.id));
    if (cleanExpenses.length !== currentExpenses.length) {
      saveToStorage(STORAGE_KEYS.EXPENSES, cleanExpenses);
    }

    const currentProfile = loadFromStorage<BusinessProfile>(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    if (currentProfile && currentProfile.name === 'Al-Rehman Traders & Electronics') {
      saveToStorage(STORAGE_KEYS.PROFILE, {
        ...currentProfile,
        name: 'My Business',
        phone: '',
        email: '',
        address: '',
        ntn: '',
        strn: '',
        bankName: '',
        bankAccountTitle: '',
        bankAccountNumber: '',
        bankIban: '',
        easypaisaTitle: '',
        easypaisaNumber: '',
        jazzcashTitle: '',
        jazzcashNumber: '',
      });
    }
  } catch (err) {
    console.error('Error cleaning demo data:', err);
  }
}

// Seed database on first run
export function initializeDatabase(forceReset = false): void {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized || forceReset) {
    saveToStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    saveToStorage(STORAGE_KEYS.PARTIES, []);
    saveToStorage(STORAGE_KEYS.ITEMS, []);
    saveToStorage(STORAGE_KEYS.INVOICES, []);
    saveToStorage(STORAGE_KEYS.PAYMENTS, []);
    saveToStorage(STORAGE_KEYS.EXPENSES, []);
    saveToStorage(STORAGE_KEYS.MOVEMENTS, []);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
  } else {
    cleanupDemoData();
  }
}

// Export database snapshot (without JSON text in UI button)
export function exportDatabaseJson(): string {
  const data = {
    app: 'HISAB KITAB',
    version: '2.0.0',
    exportDate: new Date().toISOString(),
    profile: loadFromStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE),
    parties: loadFromStorage(STORAGE_KEYS.PARTIES, []),
    items: loadFromStorage(STORAGE_KEYS.ITEMS, []),
    invoices: loadFromStorage(STORAGE_KEYS.INVOICES, []),
    payments: loadFromStorage(STORAGE_KEYS.PAYMENTS, []),
    expenses: loadFromStorage(STORAGE_KEYS.EXPENSES, []),
    movements: loadFromStorage(STORAGE_KEYS.MOVEMENTS, []),
  };
  return JSON.stringify(data, null, 2);
}

// Import database snapshot
export function importDatabaseJson(jsonString: string): { success: boolean; message: string; counts?: any } {
  try {
    const parsed = JSON.parse(jsonString);
    if (!parsed.profile || !Array.isArray(parsed.parties) || !Array.isArray(parsed.items)) {
      return { success: false, message: 'Invalid backup file format: Missing profile, parties, or items.' };
    }

    saveToStorage(STORAGE_KEYS.PROFILE, parsed.profile);
    saveToStorage(STORAGE_KEYS.PARTIES, parsed.parties);
    saveToStorage(STORAGE_KEYS.ITEMS, parsed.items);
    saveToStorage(STORAGE_KEYS.INVOICES, parsed.invoices || []);
    saveToStorage(STORAGE_KEYS.PAYMENTS, parsed.payments || []);
    saveToStorage(STORAGE_KEYS.EXPENSES, parsed.expenses || []);
    saveToStorage(STORAGE_KEYS.MOVEMENTS, parsed.movements || []);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');

    return {
      success: true,
      message: 'Database successfully restored!',
      counts: {
        parties: parsed.parties.length,
        items: parsed.items.length,
        invoices: (parsed.invoices || []).length,
        expenses: (parsed.expenses || []).length,
      },
    };
  } catch (err: any) {
    return { success: false, message: `Failed to parse backup: ${err.message}` };
  }
}

export const exportDatabaseAsJson = exportDatabaseJson;
export const importDatabaseFromJson = importDatabaseJson;
export function resetToDefaultData(): void {
  initializeDatabase(true);
}

// AUTOSAVE DRAFT HELPERS (Always on for everything!)
export function saveDraft<T>(key: string, data: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.error('Autosave error:', err);
  }
}

export function loadDraft<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function clearDraft(key: string): void {
  try {
    localStorage.removeItem(key);
  } catch (err) {
    console.error('Clear draft error:', err);
  }
}
