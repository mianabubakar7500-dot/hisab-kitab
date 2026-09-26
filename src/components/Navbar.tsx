import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Search,
  PlusCircle,
  Sun,
  Moon,
  Lock,
  ShoppingBag,
  FileText,
  X,
  Settings as SettingsIcon,
  Smartphone,
} from 'lucide-react';
import { GlobalSearchDropdown } from './common/GlobalSearchDropdown';
import { HKIcon } from './common/HKIcon';

export const Navbar: React.FC = () => {
  const {
    profile,
    updateProfile,
    searchQuery,
    setSearchQuery,
    setIsNewInvoiceOpen,
    setNewInvoiceType,
    lockApp,
    setActiveTab,
    setViewingLedgerParty,
    setIsDownloadModalOpen,
  } = useApp();

  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMobileSearchActive, setIsMobileSearchActive] = useState(false);

  const toggleTheme = () => {
    updateProfile({ theme: profile.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleQuickSale = () => {
    setNewInvoiceType('sale');
    setIsNewInvoiceOpen(true);
  };

  const handleQuickPurchase = () => {
    setNewInvoiceType('purchase');
    setIsNewInvoiceOpen(true);
  };

  const handleQuickQuotation = () => {
    setNewInvoiceType('quotation');
    setIsNewInvoiceOpen(true);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md dark:border-slate-800 dark:bg-slate-900/95 lg:px-6">
      {/* Left: Brand Identity -> Clicking opens Settings per User Requirement 1 */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setActiveTab('settings')}
          title="Open Business Settings"
          className="flex items-center gap-2.5 text-left focus:outline-none group cursor-pointer"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl overflow-hidden group-hover:scale-105 transition-transform relative">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="h-full w-full object-cover rounded-xl" />
            ) : (
              <HKIcon size={40} />
            )}
            <div className="absolute inset-0 rounded-xl bg-black/20 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <SettingsIcon className="h-4 w-4 text-white" />
            </div>
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                HISAB KITAB
              </span>
              <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                Business
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate max-w-[200px] flex items-center gap-1">
              <span>{profile.name}</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium group-hover:underline">
                (Settings)
              </span>
            </p>
          </div>
        </button>
      </div>

      {/* Center: Global Search (Desktop & Tablet) */}
      <div className="mx-4 flex-1 max-w-lg hidden md:block relative">
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search customer, buyer, sale, bill, supplier, item, party..."
            value={searchQuery}
            onFocus={() => setIsSearchFocused(true)}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setIsSearchFocused(true);
            }}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/90 py-2.5 pl-10 pr-9 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-500 focus:bg-white focus:outline-none dark:border-slate-700 dark:bg-slate-800 dark:text-white dark:placeholder-slate-500 transition-all shadow-xs"
          />
          {searchQuery && (
            <button
              onClick={() => {
                setSearchQuery('');
                setIsSearchFocused(false);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              ✕
            </button>
          )}
        </div>

        {/* Global Search Live Results Dropdown */}
        <GlobalSearchDropdown
          isOpen={isSearchFocused && Boolean(searchQuery.trim())}
          onClose={() => setIsSearchFocused(false)}
          onOpenPartyLedger={(party) => setViewingLedgerParty(party)}
        />
      </div>

      {/* Mobile Search Overlay when opened */}
      {isMobileSearchActive && (
        <div className="absolute inset-x-0 top-0 z-50 flex h-16 items-center gap-2 bg-white px-4 dark:bg-slate-900 md:hidden border-b border-slate-200 dark:border-slate-800">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              placeholder="Search customer, sale, bill, item..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-8 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white focus:outline-none focus:border-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400"
              >
                ✕
              </button>
            )}
            <GlobalSearchDropdown
              isOpen={Boolean(searchQuery.trim())}
              onClose={() => setIsMobileSearchActive(false)}
              onOpenPartyLedger={(party) => {
                setViewingLedgerParty(party);
                setIsMobileSearchActive(false);
              }}
            />
          </div>
          <button
            onClick={() => {
              setIsMobileSearchActive(false);
              setSearchQuery('');
            }}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-slate-400"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Right: Quick Action Controls */}
      <div className="flex items-center gap-1.5 sm:gap-2">
        {/* Mobile Search Button */}
        <button
          onClick={() => setIsMobileSearchActive(true)}
          aria-label="Open search"
          className="md:hidden rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          <Search className="h-4 w-4" />
        </button>

        {/* Quick Quotation */}
        <button
          onClick={handleQuickQuotation}
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/70 px-2.5 py-2 text-xs font-semibold text-indigo-700 hover:bg-indigo-100 dark:border-indigo-900 dark:bg-indigo-950/60 dark:text-indigo-300 transition-colors cursor-pointer"
          title="Create New Estimate / Quotation"
        >
          <FileText className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
          <span>+ Quotation</span>
        </button>

        {/* Quick Purchase */}
        <button
          onClick={handleQuickPurchase}
          className="hidden sm:flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
        >
          <ShoppingBag className="h-4 w-4 text-slate-500" />
          <span>+ Purchase</span>
        </button>

        {/* Quick Sale (Primary Theme) */}
        <button
          onClick={handleQuickSale}
          className="flex items-center gap-1.5 rounded-xl bg-theme px-3.5 py-2 text-xs font-semibold text-white shadow-sm hover:opacity-95 active:scale-95 transition-all cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          <span>+ New Sale</span>
        </button>

        {/* APK & Source Code Center */}
        <button
          onClick={() => setIsDownloadModalOpen(true)}
          className="flex items-center gap-1.5 rounded-xl border border-amber-300/80 bg-amber-50/80 px-2.5 sm:px-3 py-2 text-xs font-bold text-amber-900 hover:bg-amber-100 dark:border-amber-700/60 dark:bg-amber-950/40 dark:text-amber-300 transition-all cursor-pointer shadow-xs active:scale-95"
          title="Download APK, AAB Bundle and Complete Source Code"
        >
          <Smartphone className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="hidden xl:inline">APK & Source</span>
          <span className="xl:hidden">APK</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={toggleTheme}
          aria-label="Toggle theme"
          title={profile.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
        >
          {profile.theme === 'dark' ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-600" />}
        </button>

        {/* Lock button */}
        {profile.isAppLockEnabled && profile.appLockPin && (
          <button
            onClick={lockApp}
            aria-label="Lock app"
            title="Lock App"
            className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <Lock className="h-4 w-4" />
          </button>
        )}
      </div>
    </header>
  );
};
