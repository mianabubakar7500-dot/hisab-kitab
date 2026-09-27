import React, { useState, useEffect, useRef } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { BottomNav } from './components/BottomNav';
import { HomeView } from './components/home/HomeView';
import { MenuView } from './components/menu/MenuView';
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

const AppContent: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    viewingLedgerParty,
    setViewingLedgerParty,
    isQuickPartyModalOpen,
    setIsQuickPartyModalOpen,
    isNewInvoiceOpen,
    setIsNewInvoiceOpen,
    viewingInvoice,
    setViewingInvoice,
  } = useApp();

  // Smooth opening splash screen synced with HK Icon
  const [showSplash, setShowSplash] = useState<boolean>(() => {
    try {
      return !sessionStorage.getItem('hk_opening_splash_shown');
    } catch {
      return true;
    }
  });

  // Native Android Phone Navigation Bar Back Button Handler:
  // 1. If any modal is open -> Close modal
  // 2. If not on Home section ('home') -> Go to Home section ('home')
  // 3. If on Home section -> Double tap on back button within 2 seconds closes the app
  const [exitToast, setExitToast] = useState(false);
  const lastBackPressRef = useRef<number>(0);

  useEffect(() => {
    // Keep an initial history entry to catch Android back button
    window.history.pushState({ page: 'hisab-kitab' }, '');

    const handlePopState = () => {
      // 1. If any modal is open, close the modal first
      if (isNewInvoiceOpen) {
        setIsNewInvoiceOpen(false);
        window.history.pushState({ page: 'hisab-kitab' }, '');
        return;
      }
      if (viewingInvoice) {
        setViewingInvoice(null);
        window.history.pushState({ page: 'hisab-kitab' }, '');
        return;
      }
      if (viewingLedgerParty) {
        setViewingLedgerParty(null);
        window.history.pushState({ page: 'hisab-kitab' }, '');
        return;
      }
      if (isQuickPartyModalOpen) {
        setIsQuickPartyModalOpen(false);
        window.history.pushState({ page: 'hisab-kitab' }, '');
        return;
      }

      // 2. If NOT on Home section, go to Home section ('home')
      if (activeTab !== 'home') {
        setActiveTab('home');
        window.history.pushState({ page: 'hisab-kitab' }, '');
        return;
      }

      // 3. If on Home section ('home'):
      const now = Date.now();
      const timeDiff = now - lastBackPressRef.current;

      if (timeDiff < 2000) {
        // User double tapped back button -> exit app
        try {
          window.close();
        } catch {
          // browser may restrict window.close()
        }
        window.history.back();
      } else {
        // First tap: show Android exit toast
        lastBackPressRef.current = now;
        setExitToast(true);
        window.history.pushState({ page: 'hisab-kitab' }, '');

        setTimeout(() => {
          setExitToast(false);
        }, 2000);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [
    activeTab,
    isNewInvoiceOpen,
    viewingInvoice,
    viewingLedgerParty,
    isQuickPartyModalOpen,
    setActiveTab,
    setIsNewInvoiceOpen,
    setViewingInvoice,
    setViewingLedgerParty,
    setIsQuickPartyModalOpen,
  ]);

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
      case 'home':
        return <HomeView />;
      case 'menu':
        return <MenuView />;
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
        return <HomeView />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white relative overflow-x-hidden w-full app-container">
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
        <main className="flex-1 overflow-y-auto p-3.5 sm:p-6 lg:p-8 pb-28 md:pb-8">
          {renderActiveTab()}
        </main>
      </div>

      {/* Mobile Bottom Navigation (Home, Menu, Dashboard, Settings) */}
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

      {/* Android Back Button Double-Tap Exit Toast */}
      {exitToast && (
        <div className="fixed bottom-22 md:bottom-8 left-1/2 -translate-x-1/2 z-[200] flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-900/95 text-white border border-slate-700/80 shadow-2xl backdrop-blur-md text-xs font-semibold pointer-events-none transition-all">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>Press back again to exit</span>
        </div>
      )}
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
