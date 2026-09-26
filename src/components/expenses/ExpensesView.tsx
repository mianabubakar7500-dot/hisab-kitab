import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Wallet,
  PlusCircle,
  Search,
  Trash2,
  Calendar,
} from 'lucide-react';
import { Expense } from '../../types';
import { ExpenseModal } from './ExpenseModal';
import { ConfirmDeleteModal } from '../common/ConfirmDeleteModal';

export const ExpensesView: React.FC = () => {
  const { expenses, deleteExpense, formatMoney } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const filteredExpenses = expenses.filter((exp) => {
    if (selectedCategory !== 'all' && exp.category !== selectedCategory) return false;

    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      const matchCat = exp.category.toLowerCase().includes(q);
      const matchNote = exp.note && exp.note.toLowerCase().includes(q);
      if (!matchCat && !matchNote) return false;
    }

    return true;
  });

  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);

  // Group by category
  const categoryTotals: Record<string, number> = {};
  expenses.forEach((e) => {
    categoryTotals[e.category] = (categoryTotals[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Wallet className="h-6 w-6 text-amber-600" />
            <span>Daily Business Expenses</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track overhead costs, rent, tea, salaries, and operational expenditure
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-semibold text-white shadow-md shadow-amber-600/30 hover:bg-amber-700 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ Add Expense</span>
        </button>
      </div>

      {/* KPI & Category Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl border border-amber-200 bg-amber-50/50 p-4 shadow-sm dark:border-amber-950 dark:bg-amber-950/20">
          <span className="text-xs font-bold text-amber-800 dark:text-amber-300">Total Expenses Recorded</span>
          <div className="mt-1 text-xl font-extrabold text-amber-700 dark:text-amber-400 font-mono">
            {formatMoney(totalExpense)}
          </div>
          <p className="text-[11px] text-amber-600/80 dark:text-amber-400/80">
            {expenses.length} expense vouchers
          </p>
        </div>

        <div className="md:col-span-2 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400 block mb-2">
            Category Breakdown
          </span>
          <div className="flex flex-wrap gap-2">
            {Object.entries(categoryTotals).map(([cat, amt]) => (
              <div
                key={cat}
                onClick={() => setSelectedCategory(selectedCategory === cat ? 'all' : cat)}
                className={`cursor-pointer rounded-xl px-2.5 py-1.5 text-xs border transition-colors ${
                  selectedCategory === cat
                    ? 'border-amber-600 bg-amber-50 text-amber-800 dark:bg-amber-950 dark:border-amber-500 dark:text-amber-300'
                    : 'border-slate-200 text-slate-700 dark:border-slate-700 dark:text-slate-300'
                }`}
              >
                <span className="font-semibold">{cat}: </span>
                <span className="font-mono font-bold">{formatMoney(amt)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Filter Category:</span>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="rounded-xl border border-slate-200 bg-white p-1.5 text-xs text-slate-900 dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          >
            <option value="all">All Categories</option>
            {Object.keys(categoryTotals).map((cat) => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search notes or category..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-8 pr-3 text-xs text-slate-900 focus:border-amber-500 focus:outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Notes</th>
                <th className="py-3 px-4 text-right">Amount</th>
                <th className="py-3 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredExpenses.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400 text-xs">
                    No expense records found.
                  </td>
                </tr>
              ) : (
                filteredExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-4 font-mono text-slate-500">{exp.date}</td>
                    <td className="py-3 px-4">
                      <span className="rounded-full bg-slate-100 dark:bg-slate-800 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                        {exp.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 capitalize text-slate-600 dark:text-slate-400">
                      {exp.mode.replace('_', ' ')}
                    </td>
                    <td className="py-3 px-4 text-slate-600 dark:text-slate-300 max-w-sm truncate">
                      {exp.note || '--'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-amber-700 dark:text-amber-400">
                      {formatMoney(exp.amount)}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <button
                        onClick={() => setExpenseToDelete(exp)}
                        className="rounded-lg p-1.5 text-slate-400 hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-slate-800 cursor-pointer"
                        title="Delete Expense"
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

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      {/* Confirm Delete Modal */}
      <ConfirmDeleteModal
        isOpen={Boolean(expenseToDelete)}
        title="Delete Expense Record?"
        message="Are you sure you want to delete this expense record?"
        itemName={expenseToDelete ? `${expenseToDelete.category} - ${formatMoney(expenseToDelete.amount)}` : undefined}
        onConfirm={() => {
          if (expenseToDelete) {
            deleteExpense(expenseToDelete.id);
            setExpenseToDelete(null);
          }
        }}
        onClose={() => setExpenseToDelete(null)}
      />
    </div>
  );
};
