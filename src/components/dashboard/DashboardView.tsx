import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  TrendingUp,
  ArrowDownLeft,
  ArrowUpRight,
  Package,
  AlertTriangle,
  PlusCircle,
  ShoppingBag,
  UserPlus,
  PackagePlus,
  Receipt,
  CreditCard,
  Wallet,
  Clock,
  ExternalLink,
  ChevronRight,
  FileText,
  Download,
} from 'lucide-react';
import { downloadInvoicePdf } from '../../services/pdfService';

export const DashboardView: React.FC = () => {
  const {
    totals,
    formatMoney,
    invoices,
    parties,
    items,
    setActiveTab,
    setIsNewInvoiceOpen,
    setNewInvoiceType,
    setViewingInvoice,
    profile,
  } = useApp();

  const handleNewSale = () => {
    setNewInvoiceType('sale');
    setIsNewInvoiceOpen(true);
  };

  const handleNewPurchase = () => {
    setNewInvoiceType('purchase');
    setIsNewInvoiceOpen(true);
  };

  const handleNewQuotation = () => {
    setNewInvoiceType('quotation');
    setIsNewInvoiceOpen(true);
  };

  // Recent transactions list
  const recentTransactions = [
    ...invoices.map((inv) => ({
      id: inv.id,
      date: inv.date,
      title: `${inv.type === 'sale' ? 'Sale' : inv.type === 'purchase' ? 'Purchase' : 'Quotation'}: ${inv.partyName}`,
      sub: inv.invoiceNumber,
      amount: inv.grandTotal,
      type: inv.type,
      status: inv.status,
      raw: inv,
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-700 rounded-2xl p-6 text-white shadow-md">
        <div>
          <span className="rounded-full bg-white/20 px-3 py-1 text-[11px] font-bold uppercase tracking-wider backdrop-blur-sm">
            Business Accounting Suite
          </span>
          <h1 className="text-xl sm:text-2xl font-extrabold mt-2 tracking-tight">
            Dashboard & Daily Books
          </h1>
          <p className="text-emerald-100 text-xs mt-1">
            Real-time sales, party receivables, stock valuation & quotations
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Quotation */}
          <button
            onClick={handleNewQuotation}
            className="flex items-center gap-2 rounded-xl bg-white/15 hover:bg-white/25 backdrop-blur-md px-3.5 py-2 text-xs font-semibold text-white border border-white/25 transition-colors cursor-pointer"
          >
            <FileText className="h-4 w-4 text-emerald-200" />
            <span>+ Create Quotation</span>
          </button>

          {/* Quick Invoice */}
          <button
            onClick={handleNewSale}
            className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-xs font-bold text-emerald-800 hover:bg-emerald-50 shadow-md transition-colors cursor-pointer"
          >
            <PlusCircle className="h-4 w-4 text-emerald-700" />
            <span>+ Create Sale Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Financial Overview Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Sales */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4.5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              Today's Sales
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatMoney(totals.todaySales)}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            This Month: <strong className="text-slate-600 dark:text-slate-300 font-mono">{formatMoney(totals.monthSales)}</strong>
          </p>
        </div>

        {/* You'll Get (Receivables) */}
        <div
          onClick={() => setActiveTab('parties')}
          className="rounded-2xl border border-teal-200 bg-teal-50/40 p-4.5 shadow-sm dark:border-teal-950 dark:bg-teal-950/20 cursor-pointer hover:border-teal-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-teal-800 dark:text-teal-300">
              You'll Get (To Collect)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-100 text-teal-600 dark:bg-teal-950 dark:text-teal-400">
              <ArrowDownLeft className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-teal-700 dark:text-teal-400 font-mono">
            {formatMoney(totals.toCollect)}
          </div>
          <p className="mt-1 text-[11px] text-teal-600/80 dark:text-teal-400/80">
            From {parties.filter((p) => p.currentBalance > 0).length} customers →
          </p>
        </div>

        {/* You'll Give (Payables) */}
        <div
          onClick={() => setActiveTab('parties')}
          className="rounded-2xl border border-rose-200 bg-rose-50/40 p-4.5 shadow-sm dark:border-rose-950 dark:bg-rose-950/20 cursor-pointer hover:border-rose-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-rose-800 dark:text-rose-300">
              You'll Give (To Pay)
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950 dark:text-rose-400">
              <ArrowUpRight className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-rose-700 dark:text-rose-400 font-mono">
            {formatMoney(totals.toPay)}
          </div>
          <p className="mt-1 text-[11px] text-rose-600/80 dark:text-rose-400/80">
            To {parties.filter((p) => p.currentBalance < 0).length} suppliers →
          </p>
        </div>

        {/* Stock Valuation */}
        <div
          onClick={() => setActiveTab('items')}
          className="rounded-2xl border border-indigo-200 bg-indigo-50/40 p-4.5 shadow-sm dark:border-indigo-950 dark:bg-indigo-950/20 cursor-pointer hover:border-indigo-400 transition-colors"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">
              Stock Valuation
            </span>
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400">
              <Package className="h-4 w-4" />
            </div>
          </div>
          <div className="mt-2 text-xl font-extrabold text-indigo-700 dark:text-indigo-400 font-mono">
            {formatMoney(totals.stockValue)}
          </div>
          <p className="mt-1 text-[11px] text-indigo-600/80 dark:text-indigo-400/80">
            Across {items.length} items catalog →
          </p>
        </div>
      </div>

      {/* Low Stock Banner Alert */}
      {totals.lowStockCount > 0 && (
        <div
          onClick={() => setActiveTab('items')}
          className="flex items-center justify-between rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-orange-50 p-4 shadow-xs dark:border-amber-900/60 dark:bg-amber-950/30 cursor-pointer hover:border-amber-300 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-200">
                Low Stock Alert: {totals.lowStockCount} items need reordering
              </h4>
              <p className="text-[11px] text-amber-700 dark:text-amber-400">
                Review items at or below your safety threshold to prevent stockouts
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-bold text-amber-800 dark:text-amber-300">
            <span>Check Stock</span>
            <ChevronRight className="h-4 w-4" />
          </div>
        </div>
      )}

      {/* Quick Action Buttons Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <button
          onClick={handleNewSale}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-emerald-500 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all text-left group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400 group-hover:scale-105 transition-transform">
            <Receipt className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              + New Sale
            </span>
            <span className="text-[10px] text-slate-400">Customer Bill</span>
          </div>
        </button>

        <button
          onClick={handleNewPurchase}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-slate-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all text-left group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 group-hover:scale-105 transition-transform">
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              + Purchase
            </span>
            <span className="text-[10px] text-slate-400">Supplier Bill</span>
          </div>
        </button>

        <button
          onClick={handleNewQuotation}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-indigo-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all text-left group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300 group-hover:scale-105 transition-transform">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              + Quotation
            </span>
            <span className="text-[10px] text-slate-400">Price Estimate</span>
          </div>
        </button>

        <button
          onClick={() => setActiveTab('parties')}
          className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-3.5 shadow-xs hover:border-teal-400 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 transition-all text-left group cursor-pointer"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-100 text-teal-700 dark:bg-teal-950 dark:text-teal-400 group-hover:scale-105 transition-transform">
            <UserPlus className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-800 dark:text-slate-100 block">
              + Add Party
            </span>
            <span className="text-[10px] text-slate-400">Customer/Vendor</span>
          </div>
        </button>
      </div>

      {/* Recent Transactions List */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-emerald-600" />
            <h3 className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
              Recent Transactions & Bills
            </h3>
          </div>
          <button
            onClick={() => setActiveTab('sales')}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-0.5"
          >
            <span>View All</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800 mt-2">
          {recentTransactions.length === 0 ? (
            <div className="py-8 text-center text-xs text-slate-400">
              No transactions recorded yet. Click "+ Create Sale Invoice" above.
            </div>
          ) : (
            recentTransactions.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between py-3 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 rounded-xl px-2 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold uppercase ${
                      tx.type === 'sale'
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : tx.type === 'purchase'
                        ? 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                    }`}
                  >
                    {tx.type === 'sale' ? 'INV' : tx.type === 'purchase' ? 'PUR' : 'QT'}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white text-xs block">
                      {tx.title}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {tx.sub} • {tx.date}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="font-mono font-bold text-xs sm:text-sm text-slate-900 dark:text-white block">
                      {formatMoney(tx.amount)}
                    </span>
                    <span
                      className={`inline-block rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider ${
                        tx.status === 'paid'
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : tx.status === 'partial'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                          : tx.status === 'pending'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                          : tx.status === 'cancelled'
                          ? 'bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => downloadInvoicePdf(tx.raw, profile)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 cursor-pointer"
                      title="Download PDF Document"
                    >
                      <Download className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewingInvoice(tx.raw)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-slate-100 rounded-lg dark:hover:bg-slate-800 cursor-pointer"
                      title="View & Print Document"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
