import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShoppingBag,
  PlusCircle,
  Search,
  ExternalLink,
  Trash2,
  Download,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { downloadInvoicePdf } from '../../services/pdfService';

export const PurchasesView: React.FC = () => {
  const {
    invoices,
    deleteInvoice,
    formatMoney,
    setIsNewInvoiceOpen,
    setNewInvoiceType,
    setViewingInvoice,
    searchQuery,
    profile,
  } = useApp();

  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [billToDelete, setBillToDelete] = useState<Invoice | null>(null);

  const purchaseBills = invoices.filter(
    (inv) => inv.type === 'purchase' || inv.type === 'purchase_return'
  );

  const filteredBills = purchaseBills.filter((inv) => {
    if (filterStatus !== 'all' && inv.status !== filterStatus) return false;

    const q = (searchTerm || searchQuery).trim().toLowerCase();
    if (q) {
      const matchNo = inv.invoiceNumber.toLowerCase().includes(q);
      const matchParty = inv.partyName.toLowerCase().includes(q);
      const matchPhone = inv.partyPhone && inv.partyPhone.toLowerCase().includes(q);
      const matchItems = inv.lines && inv.lines.some((l) => l.itemName.toLowerCase().includes(q));
      if (!matchNo && !matchParty && !matchPhone && !matchItems) return false;
    }

    return true;
  });

  const totalPurchaseAmount = purchaseBills
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const totalPayableAmount = purchaseBills
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + Math.max(0, i.grandTotal - i.amountReceived), 0);

  const handleCreatePurchase = () => {
    setNewInvoiceType('purchase');
    setIsNewInvoiceOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="h-6 w-6 text-emerald-600" />
            <span>Purchase Bills & Supplier Orders</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record supplier raw materials, inventory additions, and track payables
          </p>
        </div>

        <button
          onClick={handleCreatePurchase}
          className="flex items-center gap-2 rounded-xl bg-theme px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ New Purchase Bill</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Purchases</span>
          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatMoney(totalPurchaseAmount)}
          </div>
          <p className="text-[11px] text-slate-400">{purchaseBills.length} total supplier invoices</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm dark:border-rose-950 dark:bg-rose-950/20">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Supplier Payables Due</span>
          <div className="mt-1 text-xl font-extrabold text-rose-700 dark:text-rose-400 font-mono">
            {formatMoney(totalPayableAmount)}
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">Pending payment to suppliers</p>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Bills' },
            { id: 'paid', label: 'Paid' },
            { id: 'partial', label: 'Partial' },
            { id: 'unpaid', label: 'Unpaid' },
            { id: 'cancelled', label: 'Cancelled' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterStatus(tab.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                filterStatus === tab.id
                  ? 'bg-slate-900 text-white dark:bg-emerald-700'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search bill #, supplier..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Bill No.</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Supplier Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                <th className="py-3 px-4 text-right">Balance Due</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No purchase bills found.
                  </td>
                </tr>
              ) : (
                filteredBills.map((inv) => {
                  const bal = Math.max(0, inv.grandTotal - inv.amountReceived);
                  return (
                    <tr key={inv.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                      <td className="py-3 px-4 font-mono font-bold text-theme">
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="hover:underline cursor-pointer"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-500">{inv.date}</td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white">
                        {inv.partyName}
                      </td>
                      <td className="py-3 px-4">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.status === 'partial'
                              ? 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              : inv.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {formatMoney(inv.grandTotal)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold">
                        <span className={bal > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                          {formatMoney(bal)}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => downloadInvoicePdf(inv, profile)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="Download PDF Bill"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="View / Print Bill"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setBillToDelete(inv)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="Delete Bill"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Purchase Bill Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(billToDelete)}
        title="Delete Purchase Bill?"
        message="Are you sure you want to permanently delete this bill? Stock levels and party ledger balance will be reverted."
        itemName={billToDelete?.invoiceNumber}
        onConfirm={() => {
          if (billToDelete) {
            deleteInvoice(billToDelete.id);
            setBillToDelete(null);
          }
        }}
        onClose={() => setBillToDelete(null)}
      />
    </div>
  );
};
