import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  ShoppingBag,
  Package,
  Boxes,
  BarChart3,
  Wallet,
  CreditCard,
  Shield,
  Settings,
  Database,
  Monitor,
  ChevronRight,
  ExternalLink,
  X,
  Sparkles,
  CheckCircle2,
  FileText,
} from 'lucide-react';
import { HKIcon } from '../common/HKIcon';

export const MenuView: React.FC = () => {
  const { setActiveTab, totals, formatMoney, profile } = useApp();
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showDesktopModal, setShowDesktopModal] = useState(false);

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Menu Header Card */}
      <div className="rounded-3xl bg-gradient-to-r from-emerald-900 via-slate-900 to-slate-950 p-5 sm:p-6 text-white shadow-xl flex items-center justify-between border border-emerald-500/20">
        <div className="flex items-center gap-3.5">
          <HKIcon size={48} className="rounded-2xl shadow-lg shrink-0" />
          <div>
            <h1 className="text-lg sm:text-xl font-black tracking-tight text-white">
              {profile.name || 'Hisab Kitab'}
            </h1>
            <p className="text-xs text-emerald-300 font-medium">
              Business Suite & Accounting Menu
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('settings')}
          className="rounded-xl bg-white/10 hover:bg-white/20 p-2.5 text-white transition-colors cursor-pointer"
          title="Open Settings"
        >
          <Settings className="w-5 h-5" />
        </button>
      </div>

      {/* Category 1: Sales / Business */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Sales & Business
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* 1. Sales */}
          <button
            onClick={() => setActiveTab('sales')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Sales
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Sale Invoices & Quotations
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                {totals.totalInvoices}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* 2. Bills (Purchases) */}
          <button
            onClick={() => setActiveTab('purchases')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Bills
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Supplier Purchase Bills
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 3. Items */}
          <button
            onClick={() => setActiveTab('items')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Items
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Products, Rates & Barcodes
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-500">
                {totals.totalItems} Items
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* 4. Stocks */}
          <button
            onClick={() => setActiveTab('items')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400">
                <Boxes className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Stocks
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Inventory & Low Stock Alerts
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {totals.lowStockCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300">
                  {totals.lowStockCount} Low
                </span>
              )}
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>

          {/* 5. Reports */}
          <button
            onClick={() => setActiveTab('reports')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-teal-50 dark:bg-teal-950/60 text-teal-600 dark:text-teal-400">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Reports
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Profit & Loss, Sales & Tax Reports
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* 6. Expenses */}
          <button
            onClick={() => setActiveTab('expenses')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400">
                <Wallet className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Expenses
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Rent, Bills & Daily Shop Expenses
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-rose-600 dark:text-rose-400">
                {formatMoney(totals.totalExpenses)}
              </span>
              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Category 2: Cash & Bank */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Cash & Bank
        </h2>

        <div className="grid grid-cols-1 gap-2.5">
          <button
            onClick={() => setActiveTab('payments')}
            className="flex items-center justify-between p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <CreditCard className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Cash & Bank Ledger
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  Track in/out payments, EasyPaisa, JazzCash & Raast bank transfers
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Balance</span>
                <span className="text-sm font-black font-mono text-emerald-600 dark:text-emerald-400">
                  {formatMoney(totals.cashBalance)}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </div>
          </button>
        </div>
      </section>

      {/* Category 3: Others */}
      <section className="space-y-2.5">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 px-1">
          Other Utilities
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          {/* Privacy Policy */}
          <button
            onClick={() => setShowPrivacyModal(true)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Privacy Policy
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  100% On-device Data Privacy
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Business Profile & Settings */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Business Settings
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Profile, Tax, Thermal Printer & PIN Lock
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Backup & Data */}
          <button
            onClick={() => setActiveTab('settings')}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Backup & Restore
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Export & Import JSON Khata Database
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>

          {/* Get Desktop App (Placeholder as per User Requirement 10) */}
          <button
            onClick={() => setShowDesktopModal(true)}
            className="flex items-center justify-between p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-all text-left cursor-pointer group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                <Monitor className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Get Desktop App
                  </h3>
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-400">
                    Soon
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Windows & macOS Edition
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>
      </section>

      {/* Privacy Policy Modal */}
      {showPrivacyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-lg rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  Privacy Policy
                </h3>
              </div>
              <button
                onClick={() => setShowPrivacyModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300 leading-relaxed max-h-80 overflow-y-auto pr-1">
              <p>
                <strong>1. 100% On-Device Data Storage:</strong> All your customer records, invoices, item inventory, and financial reports are saved directly on your local device.
              </p>
              <p>
                <strong>2. Zero Cloud Tracking:</strong> Hisab Kitab does not transmit or upload your business accounting numbers or private customer phone numbers to any third-party servers.
              </p>
              <p>
                <strong>3. Complete User Control:</strong> You can export full JSON backups of your accounting ledger at any time from the Settings tab.
              </p>
              <p>
                <strong>4. Offline Functionality:</strong> You can create bills, manage parties, scan barcodes, and print receipts without an active internet connection.
              </p>
            </div>

            <button
              onClick={() => setShowPrivacyModal(false)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Get Desktop App Placeholder Modal (Requirement 10) */}
      {showDesktopModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-2xl space-y-4 text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Monitor className="w-7 h-7" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                Hisab Kitab for Desktop
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Windows & macOS Edition
              </p>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-600 dark:text-slate-300 text-left space-y-2">
              <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Desktop Edition in Development</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                The desktop app for PC & Mac with multi-counter POS support, keyboard shortcuts, and barcode scanner integration is currently under preparation.
              </p>
            </div>

            <button
              onClick={() => setShowDesktopModal(false)}
              className="w-full py-2.5 rounded-xl bg-slate-900 dark:bg-slate-800 text-white font-bold text-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Got It
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
