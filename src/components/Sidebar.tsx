import React from 'react';
import { useApp, ActiveTab } from '../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  ShoppingBag,
  CreditCard,
  Wallet,
  BarChart3,
  Settings,
  AlertTriangle,
  FileText,
  BookOpen,
} from 'lucide-react';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
  badgeColor?: string;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, totals } = useApp();

  const coreBillingItems: NavItem[] = [
    { id: 'home', label: 'Home', icon: LayoutDashboard },
    { id: 'dashboard', label: 'Full Analytics', icon: BarChart3 },
    { id: 'sales', label: 'Sale Invoices', icon: Receipt },
    { id: 'purchases', label: 'Purchase Bills', icon: ShoppingBag },
    {
      id: 'quotations',
      label: 'Quotations / Estimates',
      icon: FileText,
      badge: totals.totalQuotations > 0 ? totals.totalQuotations : undefined,
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
    },
    { id: 'parties', label: 'Parties & Customers', icon: Users },
    {
      id: 'items',
      label: 'Items & Stock',
      icon: Package,
      badge: totals.lowStockCount > 0 ? totals.lowStockCount : undefined,
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
    },
  ];

  const accountingItems: NavItem[] = [
    { id: 'payments', label: 'Cash & Bank Ledger', icon: CreditCard },
    { id: 'expenses', label: 'Daily Expenses', icon: Wallet },
    { id: 'reports', label: 'Reports & Statements', icon: BarChart3 },
    { id: 'settings', label: 'Settings & Backup', icon: Settings },
    { id: 'guide', label: 'Guide & Tips', icon: BookOpen },
  ];

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-slate-200 bg-slate-50/70 p-3 dark:border-slate-800 dark:bg-slate-900/60 shrink-0">
      <div className="flex-1 space-y-1">
        <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Billing & Inventory
        </div>

        {coreBillingItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-theme text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${item.badgeColor || 'bg-slate-200 text-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        <div className="pt-4 px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Accounts & Administration
        </div>

        {accountingItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-theme text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-200/60 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Low stock alert badge */}
      {totals.lowStockCount > 0 && (
        <div
          onClick={() => setActiveTab('items')}
          className="mt-3 cursor-pointer rounded-xl border border-amber-200 bg-amber-50 p-2.5 text-xs dark:border-amber-900/60 dark:bg-amber-950/40 hover:border-amber-400 transition-colors"
        >
          <div className="flex items-center gap-1.5 font-bold text-amber-800 dark:text-amber-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            <span>Low Stock Alert</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
            {totals.lowStockCount} product(s) below reorder threshold.
          </p>
        </div>
      )}
    </aside>
  );
};
