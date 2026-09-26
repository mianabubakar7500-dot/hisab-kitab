import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/dashboard/DashboardView';
import { PartiesView } from './components/parties/PartiesView';
import { ItemsView } from './components/items/ItemsView';
import { SalesView } from './components/sales/SalesView';
import { PurchasesView } from './components/purchases/PurchasesView';
import { PaymentsView } from './components/payments/PaymentsView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';
import { GuideTipsView } from './components/guide/GuideTipsView';
import { InvoiceFormModal } from './components/invoice/InvoiceFormModal';
import { InvoiceViewModal } from './components/invoice/InvoiceViewModal';
import { PinLockModal } from './components/PinLockModal';
import { PartyLedgerModal } from './components/parties/PartyLedgerModal';
import { QuickPartyModal } from './components/parties/QuickPartyModal';
import { OpeningSplash } from './components/common/OpeningSplash';
import { AppDownloadModal } from './components/common/AppDownloadModal';

const AppContent: React.FC = () => {
  const {
    activeTab,
    viewingLedgerParty,
    setViewingLedgerParty,
    isQuickPartyModalOpen,
    setIsQuickPartyModalOpen,
    isDownloadModalOpen,
    setIsDownloadModalOpen,
  } = useApp();

  // Smooth opening splash screen synced with HK Icon
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('hk_opening_splash_shown');
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    try {
      sessionStorage.setItem('hk_opening_splash_shown', 'true');
    } catch {
      // ignore storage errors
    }
    setShowSplash(false);
  };

  const handleReplaySplash = () => {
    setShowSplash(true);
  };

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView />;
      case 'parties':
        return <PartiesView />;
      case 'items':
        return <ItemsView />;
      case 'sales':
      case 'quotations':
        return <SalesView />;
      case 'purchases':
        return <PurchasesView />;
      case 'payments':
        return <PaymentsView />;
      case 'expenses':
        return <ExpensesView />;
      case 'reports':
        return <ReportsView />;
      case 'settings':
        return <SettingsView />;
      case 'guide':
        return <GuideTipsView onReplayAnimation={handleReplaySplash} />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white relative">
      {/* Smooth Opening Animation (Synced with HK icon) */}
      {showSplash && (
        <OpeningSplash onComplete={handleSplashComplete} />
      )}

      {/* Top Navigation */}
      <Navbar />

      {/* Main Body Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar (Desktop/Tablet) */}
        <Sidebar />

        {/* Scrollable Content Container */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 pb-24 md:pb-8">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation */}
      <BottomNav />

      {/* Global Modals */}
      <InvoiceFormModal />
      <InvoiceViewModal />
      {viewingLedgerParty && (
        <PartyLedgerModal
          party={viewingLedgerParty}
          onClose={() => setViewingLedgerParty(null)}
        />
      )}
      <QuickPartyModal
        isOpen={isQuickPartyModalOpen}
        onClose={() => setIsQuickPartyModalOpen(false)}
      />
      <PinLockModal />
      <AppDownloadModal
        isOpen={isDownloadModalOpen}
        onClose={() => setIsDownloadModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
