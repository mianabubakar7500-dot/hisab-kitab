import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  Printer,
  TrendingUp,
  Download,
  Package,
  Users,
  Clock,
} from 'lucide-react';

type ReportTab = 'daybook' | 'pnl' | 'receivables' | 'stock';

export const ReportsView: React.FC = () => {
  const {
    invoices,
    expenses,
    payments,
    parties,
    items,
    totals,
    formatMoney,
    profile,
  } = useApp();

  const [activeReport, setActiveReport] = useState<ReportTab>('daybook');
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  // 1. Day Book calculation for selectedDate
  const dayInvoices = invoices.filter((i) => i.date === selectedDate && i.status !== 'cancelled');
  const dayExpenses = expenses.filter((e) => e.date === selectedDate);
  const dayPayments = payments.filter((p) => p.date === selectedDate);

  const daySaleTotal = dayInvoices
    .filter((i) => i.type === 'sale')
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const dayPurchaseTotal = dayInvoices
    .filter((i) => i.type === 'purchase')
    .reduce((sum, i) => sum + i.grandTotal, 0);

  const dayExpenseTotal = dayExpenses.reduce((sum, e) => sum + e.amount, 0);

  const dayCashInflow = dayPayments
    .filter((p) => p.direction === 'in')
    .reduce((sum, p) => sum + p.amount, 0);

  // 2. Profit & Loss calculation
  const totalSales = invoices
    .filter((i) => i.type === 'sale' && i.status !== 'cancelled')
    .reduce((sum, i) => sum + i.grandTotal, 0);

  let estimatedCOGS = 0;
  invoices
    .filter((i) => i.type === 'sale' && i.status !== 'cancelled')
    .forEach((inv) => {
      inv.lines.forEach((l) => {
        const itemObj = items.find((itm) => itm.id === l.itemId || itm.name === l.itemName);
        const costPerUnit = itemObj?.purchasePrice || (l.rate * 0.7);
        estimatedCOGS += costPerUnit * l.quantity;
      });
    });

  const grossProfit = totalSales - estimatedCOGS;
  const totalOperatingExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = grossProfit - totalOperatingExpenses;

  // CSV Exporter helper
  const exportCSV = (filename: string, rows: (string | number)[][]) => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      rows.map((e) => e.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExport = () => {
    if (activeReport === 'daybook') {
      const header = ['Type', 'Ref/Party', 'Mode', 'Amount'];
      const data = [
        ...dayInvoices.map((i) => [i.type.toUpperCase(), `${i.invoiceNumber} - ${i.partyName}`, i.paymentMode, i.grandTotal]),
        ...dayExpenses.map((e) => ['EXPENSE', `${e.category} - ${e.note}`, e.mode, e.amount]),
        ...dayPayments.map((p) => [`PAYMENT_${p.direction.toUpperCase()}`, p.partyName, p.mode, p.amount]),
      ];
      exportCSV(`daybook_${selectedDate}`, [header, ...data]);
    } else if (activeReport === 'pnl') {
      const rows = [
        ['Metric', `Amount (${profile.currencySymbol})`],
        ['Total Revenue from Sales', totalSales],
        ['Estimated Cost of Goods Sold (COGS)', estimatedCOGS],
        ['Gross Profit', grossProfit],
        ['Operating Expenses', totalOperatingExpenses],
        ['Net Business Profit', netProfit],
      ];
      exportCSV('profit_and_loss_statement', rows);
    } else if (activeReport === 'receivables') {
      const header = ['Party Name', 'Type', 'Phone', `Balance (${profile.currencySymbol})`, 'Status'];
      const rows = parties.map((p) => [
        p.name,
        p.type,
        p.phone || 'N/A',
        p.currentBalance,
        p.currentBalance > 0 ? 'To Collect' : p.currentBalance < 0 ? 'To Pay' : 'Settled',
      ]);
      exportCSV('party_ledger_balances', [header, ...rows]);
    } else if (activeReport === 'stock') {
      const header = ['Item Name', 'Unit', 'Sale Price', 'Cost Price', 'Current Stock', 'Valuation'];
      const rows = items.map((i) => [
        i.name,
        i.unit,
        i.salePrice,
        i.purchasePrice,
        i.currentStock,
        i.currentStock * i.purchasePrice,
      ]);
      exportCSV('stock_inventory_summary', [header, ...rows]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-200 pb-5 dark:border-slate-800">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-emerald-600" />
            <span>Business Reports & Statements</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Day book, profit & loss statement, party balance sheet, and stock report
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 cursor-pointer"
          >
            <Printer className="h-4 w-4" />
            <span>Print Report</span>
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 rounded-xl bg-theme px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Report Switcher Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2 dark:border-slate-800">
        {[
          { id: 'daybook', label: 'Day Book (Daily Ledger)', icon: Clock },
          { id: 'pnl', label: 'Profit & Loss Statement', icon: TrendingUp },
          { id: 'receivables', label: 'Party Balances (Ledgers)', icon: Users },
          { id: 'stock', label: 'Stock & Inventory Valuation', icon: Package },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeReport === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveReport(tab.id as ReportTab)}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? 'bg-theme text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200 dark:bg-slate-900 dark:text-slate-400 dark:border-slate-800 dark:hover:bg-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* 1. DAY BOOK REPORT */}
      {activeReport === 'daybook' && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Select Date:</span>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white p-2 text-xs font-mono dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-sky-200 bg-sky-50/60 p-3 dark:border-sky-950 dark:bg-sky-950/20">
              <span className="text-[11px] font-bold text-sky-800 dark:text-sky-300">Sales</span>
              <div className="text-base font-mono font-bold text-sky-900 dark:text-sky-200">
                {formatMoney(daySaleTotal)}
              </div>
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3 dark:border-emerald-950 dark:bg-emerald-950/20">
              <span className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300">Purchases</span>
              <div className="text-base font-mono font-bold text-emerald-900 dark:text-emerald-200">
                {formatMoney(dayPurchaseTotal)}
              </div>
            </div>
            <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3 dark:border-amber-950 dark:bg-amber-950/20">
              <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300">Expenses</span>
              <div className="text-base font-mono font-bold text-amber-900 dark:text-amber-200">
                {formatMoney(dayExpenseTotal)}
              </div>
            </div>
            <div className="rounded-xl border border-purple-200 bg-purple-50/60 p-3 dark:border-purple-950 dark:bg-purple-950/20">
              <span className="text-[11px] font-bold text-purple-800 dark:text-purple-300">Cash Received</span>
              <div className="text-base font-mono font-bold text-purple-900 dark:text-purple-200">
                {formatMoney(dayCashInflow)}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 font-bold text-xs text-slate-900 dark:text-white">
              Transactions on {selectedDate}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="py-2.5 px-4">Type</th>
                    <th className="py-2.5 px-4">Ref / Entity</th>
                    <th className="py-2.5 px-4">Mode</th>
                    <th className="py-2.5 px-4 text-right">Debit (+)</th>
                    <th className="py-2.5 px-4 text-right">Credit (-)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dayInvoices.map((inv) => (
                    <tr key={inv.id}>
                      <td className="py-2.5 px-4 font-bold uppercase text-[10px] text-emerald-600">
                        {inv.type}
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="font-mono font-bold">{inv.invoiceNumber}</span> - {inv.partyName}
                      </td>
                      <td className="py-2.5 px-4 capitalize text-slate-500">{inv.paymentMode.replace('_', ' ')}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {inv.type === 'sale' ? formatMoney(inv.grandTotal) : '-'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-900 dark:text-white">
                        {inv.type === 'purchase' ? formatMoney(inv.grandTotal) : '-'}
                      </td>
                    </tr>
                  ))}
                  {dayExpenses.map((exp) => (
                    <tr key={exp.id}>
                      <td className="py-2.5 px-4 font-bold uppercase text-[10px] text-amber-600">
                        EXPENSE
                      </td>
                      <td className="py-2.5 px-4">{exp.category} - {exp.note}</td>
                      <td className="py-2.5 px-4 capitalize text-slate-500">{exp.mode.replace('_', ' ')}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-400">-</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-amber-700">
                        {formatMoney(exp.amount)}
                      </td>
                    </tr>
                  ))}
                  {dayInvoices.length === 0 && dayExpenses.length === 0 && (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400 text-xs">
                        No transactions recorded on this date.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. PROFIT & LOSS STATEMENT */}
      {activeReport === 'pnl' && (
        <div className="max-w-2xl mx-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-5">
          <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Income Statement (P&L Summary)
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For {profile.name} - All Time Operating Performance
            </p>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800 text-xs space-y-3 pt-2">
            <div className="flex justify-between py-2 text-slate-800 dark:text-slate-200 font-semibold">
              <span>Gross Sales Revenue:</span>
              <span className="font-mono text-sm font-bold text-slate-900 dark:text-white">
                {formatMoney(totalSales)}
              </span>
            </div>

            <div className="flex justify-between py-2 text-slate-600 dark:text-slate-400">
              <span>Less: Estimated Cost of Goods Sold (COGS):</span>
              <span className="font-mono font-bold text-rose-600 dark:text-rose-400">
                -{formatMoney(estimatedCOGS)}
              </span>
            </div>

            <div className="flex justify-between py-2 bg-slate-50 dark:bg-slate-800/40 px-3 rounded-xl font-bold text-slate-900 dark:text-white">
              <span>Gross Profit (Trading Profit):</span>
              <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">
                {formatMoney(grossProfit)}
              </span>
            </div>

            <div className="flex justify-between py-2 text-slate-600 dark:text-slate-400">
              <span>Less: Operating Expenses (Rent, Bills, Staff):</span>
              <span className="font-mono font-bold text-amber-600 dark:text-amber-400">
                -{formatMoney(totalOperatingExpenses)}
              </span>
            </div>

            <div className="flex justify-between py-3 border-t-2 border-slate-900 dark:border-slate-700 text-sm font-extrabold text-slate-900 dark:text-white">
              <span>Net Business Profit (Earnings):</span>
              <span
                className={`font-mono text-base ${
                  netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600'
                }`}
              >
                {formatMoney(netProfit)}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 3. PARTY BALANCES */}
      {activeReport === 'receivables' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              Party Outstanding Ledger Balance Sheet
            </span>
            <span className="text-slate-500">
              Receivables: <strong className="text-emerald-600 font-mono">{formatMoney(totals.toCollect)}</strong> | Payables: <strong className="text-rose-600 font-mono">{formatMoney(totals.toPay)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-4">Party Name</th>
                  <th className="py-2.5 px-4">Role</th>
                  <th className="py-2.5 px-4">Mobile</th>
                  <th className="py-2.5 px-4 text-right">Balance</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {parties.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{p.name}</td>
                    <td className="py-2.5 px-4 uppercase text-[10px] text-slate-500">{p.type}</td>
                    <td className="py-2.5 px-4 font-mono text-slate-500">{p.phone || '--'}</td>
                    <td className="py-2.5 px-4 text-right font-mono font-bold">
                      <span className={p.currentBalance > 0 ? 'text-emerald-600' : p.currentBalance < 0 ? 'text-rose-600' : 'text-slate-500'}>
                        {formatMoney(p.currentBalance)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {p.currentBalance > 0 ? 'To Collect' : p.currentBalance < 0 ? 'To Pay' : 'Settled'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. STOCK SUMMARY */}
      {activeReport === 'stock' && (
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900 overflow-hidden">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs">
            <span className="font-bold text-slate-900 dark:text-white">
              Inventory Stock Valuation Summary
            </span>
            <span className="text-slate-500">
              Total Stock Valuation: <strong className="text-emerald-600 font-mono">{formatMoney(totals.stockValue)}</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 dark:bg-slate-800/60 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-4">Item Name</th>
                  <th className="py-2.5 px-4 text-right">In Stock</th>
                  <th className="py-2.5 px-4 text-right">Purchase Cost</th>
                  <th className="py-2.5 px-4 text-right">Sale Price</th>
                  <th className="py-2.5 px-4 text-right">Asset Valuation</th>
                  <th className="py-2.5 px-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((i) => {
                  const val = i.currentStock * i.purchasePrice;
                  const isLow = i.type === 'product' && i.currentStock <= i.lowStockThreshold;
                  return (
                    <tr key={i.id}>
                      <td className="py-2.5 px-4 font-bold text-slate-900 dark:text-white">{i.name}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                        {i.type === 'product' ? `${i.currentStock} ${i.unit}` : '--'}
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-500">{formatMoney(i.purchasePrice)}</td>
                      <td className="py-2.5 px-4 text-right font-mono text-slate-700 dark:text-slate-300">{formatMoney(i.salePrice)}</td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-emerald-700 dark:text-emerald-400">
                        {formatMoney(val)}
                      </td>
                      <td className="py-2.5 px-4 text-center">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
                            isLow ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isLow ? 'Low Stock' : 'Optimal'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
