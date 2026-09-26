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
  name: 'Al-Rehman Traders & Electronics',
  phone: '+92 300 1234567',
  email: 'alrehman.traders@gmail.com',
  address: 'Shop #12, Hall Road Electronic Market, Lahore, Pakistan',
  ntn: '3277876-1',
  strn: '1700327787612',
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
  bankName: 'Meezan Bank Ltd',
  bankAccountTitle: 'Al-Rehman Traders',
  bankAccountNumber: '01010102030405',
  bankIban: 'PK36MEZN0001010102030405',
  easypaisaTitle: 'Muhammad Rehman',
  easypaisaNumber: '03001234567',
  jazzcashTitle: 'Muhammad Rehman',
  jazzcashNumber: '03001234567',
  termsConditions: '1. Goods once sold will be exchanged within 3 days with original bill.\n2. Warranty claims handled as per manufacturer terms.\n3. Thank you for your business.',
  appLockPin: '',
  isAppLockEnabled: false,
  theme: 'light',
  colorTheme: 'emerald', // Pakistani Emerald Green default
};

export const INITIAL_PARTIES: Party[] = [
  {
    id: 'pty_01',
    name: 'Khan Electronics & Mobiles',
    type: 'customer',
    phone: '03019876543',
    email: 'khan.mobiles@gmail.com',
    address: 'Shop #42, Hafeez Centre, Main Boulevard, Gulberg III, Lahore',
    ntn: '4123456-7',
    openingBalance: 25000,
    openingBalanceType: 'to_collect',
    currentBalance: 25000,
    creditLimit: 100000,
    notes: 'Regular wholesale buyer for smartphone cables and chargers',
    createdAt: new Date(Date.now() - 15 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
  },
  {
    id: 'pty_02',
    name: 'Ahmed Hardware & Electrical',
    type: 'customer',
    phone: '03214567890',
    email: 'ahmedhardware@yahoo.com',
    address: 'Bano Bazaar, Rawalpindi',
    ntn: '',
    openingBalance: 12500,
    openingBalanceType: 'to_collect',
    currentBalance: 12500,
    creditLimit: 50000,
    notes: 'Settles weekly via Bank Transfer or Cash',
    createdAt: new Date(Date.now() - 12 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 86400000).toISOString(),
  },
  {
    id: 'pty_03',
    name: 'Crown Distribution Co.',
    type: 'supplier',
    phone: '03337654321',
    email: 'orders@crowndist.pk',
    address: 'Plot 45, Industrial Estate, Kot Lakhpat, Lahore',
    ntn: '1098765-2',
    openingBalance: 50000,
    openingBalanceType: 'to_pay',
    currentBalance: -50000,
    notes: 'Authorized wholesale importer of power banks and accessories',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
  {
    id: 'pty_04',
    name: 'Ali & Sons Logistics & Trade',
    type: 'both',
    phone: '03125556677',
    email: 'ali.trade@gmail.com',
    address: 'Jodia Bazaar, Karachi',
    ntn: '2876543-1',
    openingBalance: 0,
    openingBalanceType: 'to_collect',
    currentBalance: 8400,
    notes: 'Both buyer of packaging materials and supplier of cartons',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const INITIAL_ITEMS: Item[] = [
  {
    id: 'itm_01',
    name: 'Fast Charging USB-C Braided Cable (65W)',
    type: 'product',
    unit: 'Pcs',
    salePrice: 750,
    purchasePrice: 420,
    taxRate: 0,
    openingStock: 80,
    currentStock: 64,
    lowStockThreshold: 15,
    sku: 'CBL-USBC-65W',
    barcode: '8901234001',
    description: 'Durable nylon braided Type-C cable with fast data sync',
    createdAt: new Date(Date.now() - 40 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 40 * 86400000).toISOString(),
  },
  {
    id: 'itm_02',
    name: 'Wireless Bluetooth Earbuds Pro (Active Noise Canceling)',
    type: 'product',
    unit: 'Pcs',
    salePrice: 3800,
    purchasePrice: 2450,
    taxRate: 0,
    openingStock: 25,
    currentStock: 4,
    lowStockThreshold: 8,
    sku: 'AUD-TWS-PRO',
    barcode: '8901234002',
    description: 'Touch control stereo earbuds with deep bass and ENC',
    createdAt: new Date(Date.now() - 35 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 35 * 86400000).toISOString(),
  },
  {
    id: 'itm_03',
    name: '20,000mAh Dual Port Power Bank',
    type: 'product',
    unit: 'Pcs',
    salePrice: 4200,
    purchasePrice: 2900,
    taxRate: 0,
    openingStock: 30,
    currentStock: 18,
    lowStockThreshold: 6,
    sku: 'PWR-20K-PD',
    barcode: '8901234003',
    description: 'High capacity slim power bank with digital battery LED',
    createdAt: new Date(Date.now() - 25 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 25 * 86400000).toISOString(),
  },
  {
    id: 'itm_04',
    name: 'Tempered Glass Screen Protector 9D',
    type: 'product',
    unit: 'Pcs',
    salePrice: 350,
    purchasePrice: 110,
    taxRate: 0,
    openingStock: 150,
    currentStock: 92,
    lowStockThreshold: 25,
    sku: 'SCR-9D-UNIV',
    barcode: '8901234004',
    description: 'Scratch-resistant edge-to-edge curved tempered glass',
    createdAt: new Date(Date.now() - 30 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
  },
  {
    id: 'itm_05',
    name: 'Mobile Phone Hardware Diagnostics & Repair',
    type: 'service',
    unit: 'Hour',
    salePrice: 1500,
    purchasePrice: 0,
    taxRate: 0,
    openingStock: 0,
    currentStock: 0,
    lowStockThreshold: 0,
    sku: 'SRV-REPAIR',
    description: 'Professional motherboard and charging port repair service',
    createdAt: new Date(Date.now() - 20 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 20 * 86400000).toISOString(),
  },
];

export const INITIAL_INVOICES: Invoice[] = [
  {
    id: 'inv_01',
    invoiceNumber: 'INV-1001',
    type: 'sale',
    partyId: 'pty_01',
    partyName: 'Khan Electronics & Mobiles',
    partyPhone: '03019876543',
    partyAddress: 'Hafeez Centre, Lahore',
    partyNtn: '4123456-7',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    status: 'partial',
    hasTax: false,
    lines: [
      {
        id: 'line_01',
        itemId: 'itm_01',
        itemName: 'Fast Charging USB-C Braided Cable (65W)',
        unit: 'Pcs',
        quantity: 10,
        rate: 750,
        discountPercent: 5,
        discountAmount: 375,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 7125,
      },
      {
        id: 'line_02',
        itemId: 'itm_03',
        itemName: '20,000mAh Dual Port Power Bank',
        unit: 'Pcs',
        quantity: 3,
        rate: 4200,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 12600,
      },
    ],
    subtotal: 20100,
    discountTotal: 375,
    taxTotal: 0,
    additionalCharges: 0,
    roundOff: 0,
    grandTotal: 19725,
    amountReceived: 10000,
    paymentMode: 'easypaisa',
    manualPaymentDetails: 'EasyPaisa Txn ID: 9482716301 - Deposited to Muhammad Rehman',
    notes: 'Wholesale order delivered via rider',
    terms: '1. Exchange within 3 days.\n2. Warranty as per manufacturer policy.',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'inv_02',
    invoiceNumber: 'BILL-501',
    type: 'purchase',
    partyId: 'pty_03',
    partyName: 'Crown Distribution Co.',
    partyPhone: '03337654321',
    partyAddress: 'Kot Lakhpat Industrial Estate, Lahore',
    partyNtn: '1098765-2',
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 10 * 86400000).toISOString().split('T')[0],
    status: 'paid',
    hasTax: false,
    lines: [
      {
        id: 'line_03',
        itemId: 'itm_02',
        itemName: 'Wireless Bluetooth Earbuds Pro (Active Noise Canceling)',
        unit: 'Pcs',
        quantity: 10,
        rate: 2450,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 24500,
      },
    ],
    subtotal: 24500,
    discountTotal: 0,
    taxTotal: 0,
    additionalCharges: 0,
    roundOff: 0,
    grandTotal: 24500,
    amountReceived: 24500,
    paymentMode: 'bank_transfer',
    manualPaymentDetails: 'Meezan Bank Online Transfer Ref: 202609200482',
    notes: 'Stock received in good condition',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
  {
    id: 'inv_03',
    invoiceNumber: 'QT-201',
    type: 'quotation',
    partyId: 'pty_02',
    partyName: 'Ahmed Hardware & Electrical',
    partyPhone: '03214567890',
    partyAddress: 'Bano Bazaar, Rawalpindi',
    date: new Date().toISOString().split('T')[0],
    dueDate: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
    status: 'pending',
    hasTax: false,
    lines: [
      {
        id: 'line_04',
        itemId: 'itm_01',
        itemName: 'Fast Charging USB-C Braided Cable (65W)',
        unit: 'Pcs',
        quantity: 25,
        rate: 700,
        discountPercent: 0,
        discountAmount: 0,
        taxPercent: 0,
        taxAmount: 0,
        totalAmount: 17500,
      },
    ],
    subtotal: 17500,
    discountTotal: 0,
    taxTotal: 0,
    additionalCharges: 200,
    roundOff: 0,
    grandTotal: 17700,
    amountReceived: 0,
    paymentMode: 'cash',
    notes: 'Quotation valid for 7 days. Free delivery for orders above Rs. 20,000.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const INITIAL_PAYMENTS: Payment[] = [
  {
    id: 'pay_01',
    direction: 'in',
    partyId: 'pty_01',
    partyName: 'Khan Electronics & Mobiles',
    amount: 10000,
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    mode: 'easypaisa',
    manualPaymentDetails: 'EasyPaisa TID #9482716301',
    referenceNote: 'Advance against INV-1001',
    allocatedInvoiceId: 'inv_01',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'pay_02',
    direction: 'out',
    partyId: 'pty_03',
    partyName: 'Crown Distribution Co.',
    amount: 24500,
    date: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
    mode: 'bank_transfer',
    manualPaymentDetails: 'Meezan Bank Raast transfer',
    referenceNote: 'Paid for BILL-501 in full',
    allocatedInvoiceId: 'inv_02',
    createdAt: new Date(Date.now() - 5 * 86400000).toISOString(),
  },
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'exp_01',
    category: 'Rent',
    amount: 35000,
    date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    mode: 'bank_transfer',
    note: 'Hall Road Shop monthly advance rent',
    createdAt: new Date(Date.now() - 10 * 86400000).toISOString(),
  },
  {
    id: 'exp_02',
    category: 'Electricity & Utilities',
    amount: 6850,
    date: new Date(Date.now() - 8 * 86400000).toISOString().split('T')[0],
    mode: 'easypaisa',
    note: 'LESCO Electricity bill paid via EasyPaisa',
    createdAt: new Date(Date.now() - 8 * 86400000).toISOString(),
  },
  {
    id: 'exp_03',
    category: 'Tea & Refreshments',
    amount: 1200,
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    mode: 'cash',
    note: 'Weekly guest chai and snacks for customers',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

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

// Seed database on first run
export function initializeDatabase(forceReset = false): void {
  const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
  if (!isInitialized || forceReset) {
    saveToStorage(STORAGE_KEYS.PROFILE, DEFAULT_PROFILE);
    saveToStorage(STORAGE_KEYS.PARTIES, INITIAL_PARTIES);
    saveToStorage(STORAGE_KEYS.ITEMS, INITIAL_ITEMS);
    saveToStorage(STORAGE_KEYS.INVOICES, INITIAL_INVOICES);
    saveToStorage(STORAGE_KEYS.PAYMENTS, INITIAL_PAYMENTS);
    saveToStorage(STORAGE_KEYS.EXPENSES, INITIAL_EXPENSES);
    saveToStorage(STORAGE_KEYS.MOVEMENTS, []);
    localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
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
