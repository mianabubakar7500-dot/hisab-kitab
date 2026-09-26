import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  PlusCircle,
  Search,
  ExternalLink,
  Trash2,
  FileSpreadsheet,
  FileCheck,
  Download,
} from 'lucide-react';
import { Invoice, InvoiceStatus } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';
import { downloadInvoicePdf } from '../../services/pdfService';

export const SalesView: React.FC = () => {
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

  const [activeTab, setActiveTab] = useState<'sales' | 'quotations'>('sales');
  const [filterStatus, setFilterStatus] = useState<'all' | InvoiceStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [invoiceToDelete, setInvoiceToDelete] = useState<Invoice | null>(null);

  const saleInvoices = invoices.filter(
    (inv) => inv.type === 'sale' || inv.type === 'sale_return'
  );

  const quotationInvoices = invoices.filter(
    (inv) => inv.type === 'quotation'
  );

  const currentList = activeTab === 'sales' ? saleInvoices : quotationInvoices;

  const filteredInvoices = currentList.filter((inv) => {
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

  const totalSaleAmount = saleInvoices
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const totalUnpaidAmount = saleInvoices
    .filter((i) => i.status !== 'cancelled')
    .reduce((sum, i) => sum + Math.max(0, i.grandTotal - i.amountReceived), 0);

  const handleCreateSale = () => {
    setNewInvoiceType('sale');
    setIsNewInvoiceOpen(true);
  };

  const handleCreateQuotation = () => {
    setNewInvoiceType('quotation');
    setIsNewInvoiceOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="h-6 w-6 text-emerald-600" />
            <span>Sales & Quotations</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create, track, print invoices, manage quotations, and share bills via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCreateQuotation}
            className="flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50 px-3.5 py-2.5 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900/60 dark:bg-indigo-950/40 dark:text-indigo-300 cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4" />
            <span>+ New Quotation</span>
          </button>

          <button
            onClick={handleCreateSale}
            className="flex items-center gap-2 rounded-xl bg-theme px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <PlusCircle className="h-4 w-4" />
            <span>+ Create Sale Invoice</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Total Sales Billed</span>
          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatMoney(totalSaleAmount)}
          </div>
          <p className="text-[11px] text-slate-400">{saleInvoices.length} total customer invoices</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm dark:border-amber-950 dark:bg-amber-950/20">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Uncollected Balance Due</span>
          <div className="mt-1 text-xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
            {formatMoney(totalUnpaidAmount)}
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">Pending payment from clients</p>
        </div>

        <div className="rounded-2xl border border-indigo-200 bg-indigo-50/50 p-4 shadow-sm dark:border-indigo-950 dark:bg-indigo-950/20">
          <span className="text-xs font-bold text-indigo-800 dark:text-indigo-300">Active Quotations</span>
          <div className="mt-1 text-xl font-extrabold text-indigo-700 dark:text-indigo-400 font-mono">
            {quotationInvoices.length} Quotes
          </div>
          <p className="text-[11px] text-indigo-600/80 dark:text-indigo-400/80">Pending customer approval</p>
        </div>
      </div>

      {/* Tab Switcher & Filters */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Main Sales vs Quotation Tabs */}
          <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-800">
            <button
              onClick={() => setActiveTab('sales')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'sales'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Sale Invoices ({saleInvoices.length})
            </button>
            <button
              onClick={() => setActiveTab('quotations')}
              className={`rounded-lg px-3 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'quotations'
                  ? 'bg-white text-slate-900 shadow-xs dark:bg-slate-700 dark:text-white'
                  : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              Quotations ({quotationInvoices.length})
            </button>
          </div>

          {activeTab === 'sales' && (
            <div className="hidden sm:flex gap-1">
              {[
                { id: 'all', label: 'All' },
                { id: 'paid', label: 'Paid' },
                { id: 'partial', label: 'Partial' },
                { id: 'unpaid', label: 'Unpaid' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setFilterStatus(tab.id as any)}
                  className={`rounded-xl px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                    filterStatus === tab.id
                      ? 'bg-slate-900 text-white dark:bg-emerald-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'sales' ? 'invoice' : 'quotation'} #, party...`}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">{activeTab === 'sales' ? 'Invoice No.' : 'Quote No.'}</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Customer Name</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Total Amount</th>
                {activeTab === 'sales' && <th className="py-3 px-4 text-right">Balance Due</th>}
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No {activeTab === 'sales' ? 'sale invoices' : 'quotations'} found.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
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
                      {activeTab === 'sales' && (
                        <td className="py-3 px-4 text-right font-mono font-bold">
                          <span className={bal > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}>
                            {formatMoney(bal)}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => downloadInvoicePdf(inv, profile)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="Download PDF Document"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="View / Print Document"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setInvoiceToDelete(inv)}
                            className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 cursor-pointer"
                            title="Delete Document"
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

      {/* Confirm Delete Invoice Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(invoiceToDelete)}
        title={invoiceToDelete?.type === 'quotation' ? 'Delete Quotation?' : 'Delete Sale Invoice?'}
        message="Are you sure you want to permanently delete this document? Stock and party balances will be adjusted accordingly."
        itemName={invoiceToDelete?.invoiceNumber}
        onConfirm={() => {
          if (invoiceToDelete) {
            deleteInvoice(invoiceToDelete.id);
            setInvoiceToDelete(null);
          }
        }}
        onClose={() => setInvoiceToDelete(null)}
      />
    </div>
  );
};
