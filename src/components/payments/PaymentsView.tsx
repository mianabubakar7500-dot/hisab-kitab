import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  CreditCard,
  PlusCircle,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import { PaymentModal } from './PaymentModal';
import { Payment, PaymentDirection } from '../../types';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const PaymentsView: React.FC = () => {
  const { payments, deletePayment, formatMoney } = useApp();

  const [activeFilter, setActiveFilter] = useState<'all' | 'in' | 'out'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalDirection, setModalDirection] = useState<PaymentDirection>('in');
  const [paymentToDelete, setPaymentToDelete] = useState<Payment | null>(null);

  const filteredPayments = payments.filter((pay) => {
    if (activeFilter !== 'all' && pay.direction !== activeFilter) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchParty = pay.partyName.toLowerCase().includes(q);
      const matchNote = pay.referenceNote && pay.referenceNote.toLowerCase().includes(q);
      if (!matchParty && !matchNote) return false;
    }

    return true;
  });

  const totalIn = payments
    .filter((p) => p.direction === 'in')
    .reduce((sum, p) => sum + p.amount, 0);

  const totalOut = payments
    .filter((p) => p.direction === 'out')
    .reduce((sum, p) => sum + p.amount, 0);

  const handleOpenModal = (direction: PaymentDirection) => {
    setModalDirection(direction);
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            <span>Cash & Bank Register</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Record customer collections, supplier payouts, and manual bank/wallet transfers
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleOpenModal('in')}
            className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowDownLeft className="h-4 w-4" />
            <span>+ Payment In</span>
          </button>
          <button
            onClick={() => handleOpenModal('out')}
            className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md hover:bg-rose-700 active:scale-95 transition-all cursor-pointer"
          >
            <ArrowUpRight className="h-4 w-4" />
            <span>- Payment Out</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-emerald-200 bg-emerald-50/50 p-4 shadow-sm dark:border-emerald-950 dark:bg-emerald-950/20">
          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300">Total Money Received (In)</span>
          <div className="mt-1 text-xl font-extrabold text-emerald-700 dark:text-emerald-400 font-mono">
            {formatMoney(totalIn)}
          </div>
          <p className="text-[11px] text-emerald-600/80 dark:text-emerald-400/80">From customer payments</p>
        </div>

        <div className="rounded-2xl border border-rose-200 bg-rose-50/50 p-4 shadow-sm dark:border-rose-950 dark:bg-rose-950/20">
          <span className="text-xs font-bold text-rose-800 dark:text-rose-300">Total Money Paid Out</span>
          <div className="mt-1 text-xl font-extrabold text-rose-700 dark:text-rose-400 font-mono">
            {formatMoney(totalOut)}
          </div>
          <p className="text-[11px] text-rose-600/80 dark:text-rose-400/80">To suppliers and vendors</p>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">Net Flow</span>
          <div className="mt-1 text-xl font-extrabold text-slate-900 dark:text-white font-mono">
            {formatMoney(totalIn - totalOut)}
          </div>
          <p className="text-[11px] text-slate-400">Cash & Bank Net Balance</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Payments' },
            { id: 'in', label: 'Received (In)' },
            { id: 'out', label: 'Paid (Out)' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveFilter(tab.id as any)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                activeFilter === tab.id
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
            placeholder="Search party or note..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 focus:border-emerald-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Payments Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Party Name</th>
                <th className="py-3 px-4">Direction</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4">Reference / Slip #</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredPayments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 text-xs">
                    No payment records found.
                  </td>
                </tr>
              ) : (
                filteredPayments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-500">{pay.date}</td>
                    <td className="py-3 px-4 font-bold text-slate-900 dark:text-white">
                      {pay.partyName}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                          pay.direction === 'in'
                            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                            : 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                        }`}
                      >
                        {pay.direction === 'in' ? <ArrowDownLeft className="h-3 w-3" /> : <ArrowUpRight className="h-3 w-3" />}
                        {pay.direction === 'in' ? 'Payment In' : 'Payment Out'}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-300">
                      {pay.mode.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-500 dark:text-slate-400 max-w-xs truncate">
                      {pay.referenceNote || '--'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span className={pay.direction === 'in' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                        {formatMoney(pay.amount)}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setPaymentToDelete(pay)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 cursor-pointer"
                        title="Delete Payment Entry"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        defaultDirection={modalDirection}
      />

      {/* Confirm Delete Payment Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(paymentToDelete)}
        title="Delete Payment Entry?"
        message="Are you sure you want to delete this payment transaction? The party's running balance will be adjusted accordingly."
        itemName={paymentToDelete ? `${paymentToDelete.partyName} - ${formatMoney(paymentToDelete.amount)}` : undefined}
        onConfirm={() => {
          if (paymentToDelete) {
            deletePayment(paymentToDelete.id);
            setPaymentToDelete(null);
          }
        }}
        onClose={() => setPaymentToDelete(null)}
      />
    </div>
  );
};
