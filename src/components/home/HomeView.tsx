import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Receipt,
  FilePlus2,
  Package,
  Users,
  ChevronRight,
  BookOpen,
  Sparkles,
  Printer,
  Share2,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { HKIcon } from '../common/HKIcon';

export const HomeView: React.FC = () => {
  const {
    totals,
    formatMoney,
    setActiveTab,
    setIsNewInvoiceOpen,
    setNewInvoiceType,
    invoices,
    setViewingInvoice,
  } = useApp();

  // Filter real sales invoices
  const salesInvoices = invoices
    .filter((inv) => inv.type === 'sale')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Recent 5 sales
  const recentSales = salesInvoices.slice(0, 5);

  const handleOpenNewSale = () => {
    setNewInvoiceType('sale');
    setIsNewInvoiceOpen(true);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-6">
      {/* 1. Mini Dashboard Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <HKIcon size={24} className="rounded-lg shadow-xs" glow={false} />
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Business Overview
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>Full Dashboard</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 4 Compact Cards Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Sales */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border border-emerald-500/20 dark:border-emerald-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Total Sales
              </span>
              <div className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-lg sm:text-xl font-black font-mono tracking-tight text-slate-900 dark:text-white">
                {formatMoney(totals.totalSales)}
              </p>
              <p className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium mt-0.5">
                {totals.totalInvoices} Invoices Issued
              </p>
            </div>
          </div>

          {/* Card 2: To Collect */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-transparent border border-amber-500/20 dark:border-amber-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                To Collect
              </span>
              <div className="p-1.5 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400">
                <ArrowDownLeft className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-lg sm:text-xl font-black font-mono tracking-tight text-amber-600 dark:text-amber-400">
                {formatMoney(totals.toCollect)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Customer Balances
              </p>
            </div>
          </div>

          {/* Card 3: To Pay */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-rose-500/10 via-rose-500/5 to-transparent border border-rose-500/20 dark:border-rose-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                To Pay
              </span>
              <div className="p-1.5 rounded-lg bg-rose-500/15 text-rose-600 dark:text-rose-400">
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-lg sm:text-xl font-black font-mono tracking-tight text-rose-600 dark:text-rose-400">
                {formatMoney(totals.toPay)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Supplier Dues
              </p>
            </div>
          </div>

          {/* Card 4: Net Cash in Hand */}
          <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-br from-teal-500/10 via-teal-500/5 to-transparent border border-teal-500/20 dark:border-teal-500/30 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-600 dark:text-slate-300">
                Cash in Hand
              </span>
              <div className="p-1.5 rounded-lg bg-teal-500/15 text-teal-600 dark:text-teal-400">
                <Wallet className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-2">
              <p className="text-lg sm:text-xl font-black font-mono tracking-tight text-teal-600 dark:text-teal-400">
                {formatMoney(totals.cashBalance)}
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">
                Total Cash Flow
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Quick Links Section */}
      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Quick Actions
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Quick Link 1: Sales */}
          <button
            onClick={() => setActiveTab('sales')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left cursor-pointer group active:scale-98"
          >
            <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 group-hover:scale-105 transition-transform">
              <Receipt className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Sales
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Invoices & Bills
              </p>
            </div>
          </button>

          {/* Quick Link 2: Invoice (Create New) */}
          <button
            onClick={handleOpenNewSale}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-emerald-600 text-white shadow-md shadow-emerald-600/20 hover:bg-emerald-700 transition-all text-left cursor-pointer group active:scale-98"
          >
            <div className="p-2.5 rounded-xl bg-white/20 text-white group-hover:scale-105 transition-transform">
              <FilePlus2 className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-white truncate">
                + New Invoice
              </h3>
              <p className="text-[11px] text-emerald-100 truncate">
                Quick Bill Maker
              </p>
            </div>
          </button>

          {/* Quick Link 3: Items */}
          <button
            onClick={() => setActiveTab('items')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left cursor-pointer group active:scale-98"
          >
            <div className="p-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 group-hover:scale-105 transition-transform">
              <Package className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Items & Stock
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Products & Inventory
              </p>
            </div>
          </button>

          {/* Quick Link 4: Parties */}
          <button
            onClick={() => setActiveTab('parties')}
            className="flex items-center gap-3 p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 dark:hover:border-emerald-500 hover:shadow-md transition-all text-left cursor-pointer group active:scale-98"
          >
            <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                Parties
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                Customers & Khata
              </p>
            </div>
          </button>
        </div>
      </section>

      {/* 3. Recent Sales Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Recent Sales
            </h2>
            {recentSales.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                {recentSales.length}
              </span>
            )}
          </div>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentSales.length === 0 ? (
          /* Clean Empty State */
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 p-8 text-center bg-white/50 dark:bg-slate-900/50">
            <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-3">
              <Receipt className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              No sales recorded yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              Create your first sale invoice or bill to start tracking transactions, customer balances, and inventory.
            </p>
            <button
              onClick={handleOpenNewSale}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Create First Sale</span>
            </button>
          </div>
        ) : (
          /* Mobile-friendly Sales Cards List */
          <div className="divide-y divide-slate-100 dark:divide-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden shadow-xs">
            {recentSales.map((sale) => {
              const isPaid = sale.status === 'paid';
              const isPartial = sale.status === 'partial';

              return (
                <div
                  key={sale.id}
                  onClick={() => setViewingInvoice(sale)}
                  className="p-3.5 sm:p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 font-mono text-xs font-bold">
                      #{sale.invoiceNumber.slice(-3)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white truncate">
                          {sale.partyName}
                        </h4>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                            isPaid
                              ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300'
                              : isPartial
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300'
                              : 'bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300'
                          }`}
                        >
                          {sale.status.toUpperCase()}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                        <span>Inv #{sale.invoiceNumber}</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {sale.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs sm:text-sm font-black font-mono text-slate-900 dark:text-white">
                      {formatMoney(sale.grandTotal)}
                    </p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 capitalize">
                      {sale.paymentMode.replace('_', ' ')}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. Guides & Tips Section */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Guides & Tips
          </h2>
          <button
            onClick={() => setActiveTab('guide')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <span>All Tips</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Tip 1: WhatsApp PDF Share */}
          <div
            onClick={() => setActiveTab('guide')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1.5 text-emerald-600 dark:text-emerald-400">
              <Share2 className="w-4 h-4" />
              <h4 className="text-xs font-bold">WhatsApp PDF Bills</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Share clean high-resolution invoices directly via Android Share Sheet to any contact on WhatsApp.
            </p>
          </div>

          {/* Tip 2: Thermal Printing */}
          <div
            onClick={() => setActiveTab('guide')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1.5 text-teal-600 dark:text-teal-400">
              <Printer className="w-4 h-4" />
              <h4 className="text-xs font-bold">POS Thermal Printing</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              Supports 80mm and 58mm Bluetooth/USB thermal receipt printers directly from your phone.
            </p>
          </div>

          {/* Tip 3: Offline & Safe Khata */}
          <div
            onClick={() => setActiveTab('guide')}
            className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-500 transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-2 mb-1.5 text-indigo-600 dark:text-indigo-400">
              <ShieldCheck className="w-4 h-4" />
              <h4 className="text-xs font-bold">100% Offline & Private</h4>
            </div>
            <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
              All data is stored securely on your device. Works seamlessly without an active internet connection.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};
