export type PartyType = 'customer' | 'supplier' | 'both';

export interface Party {
  id: string;
  name: string;
  type: PartyType;
  phone: string;
  email?: string;
  address?: string;
  ntn?: string; // National Tax Number / CNIC
  openingBalance: number;
  openingBalanceType: 'to_collect' | 'to_pay';
  currentBalance: number; // positive = to collect, negative = to pay
  creditLimit?: number;
  notes?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type ItemType = 'product' | 'service';
export type UnitType = 'Pcs' | 'Kg' | 'Ltr' | 'Box' | 'Packet' | 'Meter' | 'Hour' | 'Set' | 'Dozen' | 'Bag' | 'Carton';

export interface Item {
  id: string;
  name: string;
  type: ItemType;
  unit: UnitType;
  salePrice: number;
  purchasePrice: number;
  taxRate: number; // 0 if tax disabled
  openingStock: number;
  currentStock: number;
  lowStockThreshold: number;
  sku?: string;
  barcode?: string;
  description?: string;
  imageUrl?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
}

export type MovementType = 'sale' | 'purchase' | 'quotation' | 'sale_return' | 'purchase_return' | 'manual_adjustment';

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  date: string;
  type: MovementType;
  quantityDelta: number;
  remainingStock: number;
  reason?: string;
  referenceId?: string;
}

export interface InvoiceLine {
  id: string;
  itemId: string;
  itemName: string;
  unit: UnitType;
  quantity: number;
  rate: number;
  discountPercent: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  totalAmount: number;
}

export type InvoiceType = 'sale' | 'purchase' | 'quotation' | 'sale_return' | 'purchase_return';
export type InvoiceStatus = 'paid' | 'partial' | 'unpaid' | 'cancelled' | 'pending';
export type PaymentMode = 'cash' | 'easypaisa' | 'jazzcash' | 'raast' | 'bank_transfer' | 'cheque' | 'other';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  type: InvoiceType;
  partyId?: string;
  partyName: string;
  partyPhone?: string;
  partyAddress?: string;
  partyNtn?: string;
  date: string;
  dueDate?: string;
  status: InvoiceStatus;
  lines: InvoiceLine[];
  subtotal: number;
  discountTotal: number;
  hasTax?: boolean; // Optional Tax toggle
  taxTotal: number;
  additionalCharges: number;
  roundOff: number;
  grandTotal: number;
  amountReceived: number; // or amountPaid for purchases
  paymentMode: PaymentMode;
  manualPaymentDetails?: string; // Manual customer payment details
  notes?: string;
  terms?: string;
  originalInvoiceId?: string; // For returns
  createdAt: string;
  updatedAt: string;
}

export type PaymentDirection = 'in' | 'out';

export type ExpenseCategory =
  | 'Rent'
  | 'Electricity & Utilities'
  | 'Salaries & Wages'
  | 'Tea & Refreshments'
  | 'Logistics & Delivery'
  | 'Packaging'
  | 'Shop Maintenance'
  | 'Marketing'
  | 'General'
  | string;

export interface Payment {
  id: string;
  direction: PaymentDirection; // in = from customer, out = to supplier
  partyId?: string;
  partyName: string;
  amount: number;
  date: string;
  mode: PaymentMode;
  manualPaymentDetails?: string;
  referenceNote?: string;
  allocatedInvoiceId?: string;
  createdAt: string;
}

export interface Expense {
  id: string;
  category: ExpenseCategory;
  amount: number;
  date: string;
  mode: PaymentMode;
  note?: string;
  receiptUrl?: string;
  createdAt: string;
}

export type ColorTheme = 'emerald' | 'sky' | 'indigo' | 'crimson' | 'slate' | 'purple';

export interface BusinessProfile {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address?: string;
  ntn?: string; // Pakistani National Tax Number
  strn?: string; // Sales Tax Registration Number
  isTaxEnabled: boolean; // Optional tax toggle
  defaultTaxPercent: number;
  currencySymbol: string; // Default "Rs."
  currencyCode: string; // Default "PKR"
  financialYearStart: string;
  saleInvoicePrefix: string;
  purchaseBillPrefix: string;
  quotationPrefix: string;
  logoUrl?: string;
  // Manual Bank & Wallet Information
  bankName?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  easypaisaTitle?: string;
  easypaisaNumber?: string;
  jazzcashTitle?: string;
  jazzcashNumber?: string;
  termsConditions?: string;
  appLockPin?: string;
  isAppLockEnabled: boolean;
  theme: 'light' | 'dark';
  colorTheme: ColorTheme;
}

export interface FilterDateRange {
  startDate: string;
  endDate: string;
  preset: 'today' | 'this_week' | 'this_month' | 'this_quarter' | 'this_year' | 'all' | 'custom';
}
