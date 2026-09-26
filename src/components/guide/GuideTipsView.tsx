import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BookOpen,
  Receipt,
  Users,
  Package,
  Share2,
  Download,
  ShieldCheck,
  Wallet,
  FileText,
  Search,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  HelpCircle,
  Play,
  Phone,
  Printer,
  Sliders,
  DollarSign,
  AlertTriangle,
  Smartphone,
  Code2,
} from 'lucide-react';
import { HKIcon } from '../common/HKIcon';

interface TipCard {
  id: string;
  category: 'invoicing' | 'khata' | 'inventory' | 'whatsapp' | 'expenses' | 'backup' | 'downloads';
  title: string;
  badge: string;
  badgeColor: string;
  summary: string;
  steps: string[];
  illustrationType: 'tax_invoice' | 'whatsapp_pdf' | 'khata_ledger' | 'stock_alert' | 'quotation_convert' | 'backup_pin' | 'apk_download';
  proTip: string;
  actionText?: string;
  actionHandler?: () => void;
}

interface GuideTipsViewProps {
  onReplayAnimation?: () => void;
}

export const GuideTipsView: React.FC<GuideTipsViewProps> = ({ onReplayAnimation }) => {
  const {
    profile,
    setIsNewInvoiceOpen,
    setNewInvoiceType,
    setActiveTab,
    setIsDownloadModalOpen,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedTip, setExpandedTip] = useState<string | null>('tax-invoice-tip');

  const categories = [
    { id: 'all', label: 'All Guides & Tips', icon: BookOpen },
    { id: 'downloads', label: 'APK & Source Code', icon: Smartphone },
    { id: 'invoicing', label: 'Invoices & Tax', icon: Receipt },
    { id: 'whatsapp', label: 'WhatsApp & PDF', icon: Share2 },
    { id: 'khata', label: 'Customer Khata', icon: Users },
    { id: 'inventory', label: 'Stock & Items', icon: Package },
    { id: 'expenses', label: 'Expenses & Profit', icon: Wallet },
    { id: 'backup', label: 'Backup & Security', icon: ShieldCheck },
  ];

  const tips: TipCard[] = [
    {
      id: 'tax-invoice-tip',
      category: 'invoicing',
      title: 'Tax Invoice vs Regular Invoice & Document Number Placement',
      badge: 'Critical Rule',
      badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300',
      summary:
        'Learn how Hisab Kitab automatically decides whether to label your bill as a "TAX INVOICE" or "INVOICE", and how document numbers are placed without any overlap.',
      steps: [
        'If an invoice has Tax Details (tax toggle enabled, tax amount > 0, or any item has a Tax Rate/STRN), the upper right corner displays "TAX INVOICE" in bold emerald green.',
        'If the bill does NOT have tax, the upper right corner cleanly displays "INVOICE" (or "QUOTATION" / "PURCHASE BILL").',
        'The Document Number (Doc No) is placed cleanly on its own line below the title with proper spacing so text never overlaps.',
        'NTN and STRN tax numbers are pulled automatically from your Business Profile in Settings whenever tax is active.',
      ],
      illustrationType: 'tax_invoice',
      proTip:
        'You can enable or disable Tax globally in Settings -> "Tax / GST Enabled", or turn it on/off on any individual bill with one click.',
      actionText: 'Configure Tax in Settings',
      actionHandler: () => setActiveTab('settings'),
    },
    {
      id: 'apk-download-tip',
      category: 'downloads',
      title: 'Download Source Code, Android APK & AAB Bundle',
      badge: 'App Package',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      summary:
        'Download the complete application source code (.ZIP), Android Studio project files, and learn how to generate APK for direct mobile install or AAB for Google Play Store.',
      steps: [
        'Method 1 (Instant Phone Install): Open in Google Chrome on your Android phone and tap "Install app" to generate a genuine WebAPK with offline support.',
        'Method 2 (Cloud APK/AAB Builder): Use PWABuilder to package the live app URL into signed APK and Play Store AAB in 60 seconds.',
        'Method 3 (Android Studio): Extract the downloaded source or android project ZIP, run "npm run build && ./gradlew assembleRelease" to get app-release.apk, or "./gradlew bundleRelease" for Google Play Store .aab bundle.',
        'Click the button below to download the complete source code and project archive immediately.',
      ],
      illustrationType: 'apk_download',
      proTip:
        'The source code is completely self-contained with React 19, TypeScript, Express, and native Android Studio Gradle files.',
      actionText: 'Open Downloads & APK Hub',
      actionHandler: () => setIsDownloadModalOpen(true),
    },
    {
      id: 'whatsapp-pdf-tip',
      category: 'whatsapp',
      title: 'Sending Professional PDF Invoices Directly on WhatsApp (Clean PDF Only)',
      badge: 'Updated & Fixed',
      badgeColor: 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
      summary:
        'Hisab Kitab generates genuine high-resolution PDF documents that you can share directly to WhatsApp. When sharing the PDF, only the clean PDF document is attached without dumping detailed message text.',
      steps: [
        'Click "WhatsApp (PDF)" to share the clean PDF invoice without text clutter.',
        'No detailed text is sent along with the PDF attachment, keeping your chat clean and professional.',
        'If you specifically wish to send an itemized text breakdown instead, you can click "Text Only" or "Copy Text".',
        'On mobile devices with Web Share support, the genuine PDF file attaches directly in WhatsApp.',
      ],
      illustrationType: 'whatsapp_pdf',
      proTip:
        'Always save the customer’s WhatsApp phone number (e.g. 03001234567). Hisab Kitab automatically converts it to international format (92300...) for direct 1-click messaging.',
      actionText: 'View Sales & Try PDF',
      actionHandler: () => setActiveTab('sales'),
    },
    {
      id: 'khata-ledger-tip',
      category: 'khata',
      title: 'Managing Customer Khata & Balances (Udhar / Receivables)',
      badge: 'Khata Management',
      badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
      summary:
        'Track every rupee owed to your business with real-time party ledgers, payment receipts, and WhatsApp ledger statements.',
      steps: [
        'When creating a sale, if the customer pays less than the grand total, the remaining balance is automatically added to their Khata.',
        'Green balance means "To Collect" (Customer owes you money). Red balance means "To Pay" (You owe a supplier).',
        'Record incoming payments via Cash & Bank -> "+ Payment In" (Cash, EasyPaisa, JazzCash, Raast, Bank Transfer).',
        'Open any party and click "Statement / Ledger" to download or WhatsApp their complete PDF ledger statement.',
      ],
      illustrationType: 'khata_ledger',
      proTip:
        'You can set a Credit Limit for each customer in their profile to prevent excessive unpaid balances.',
      actionText: 'Open Parties & Khata',
      actionHandler: () => setActiveTab('parties'),
    },
    {
      id: 'inventory-stock-tip',
      category: 'inventory',
      title: 'Inventory & Low Stock Alerts (Automatic Stock Deduction)',
      badge: 'Inventory Control',
      badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
      summary:
        'Keep track of your products, wholesale rates, retail prices, and automatic stock alerts so you never run out of inventory.',
      steps: [
        'Add items with Units (Pcs, Kg, Ltr, Box, Packet, Bags, etc.), Sale Price, and Purchase Price.',
        'Set a "Low Stock Threshold" (e.g., 5 pcs). When stock drops to or below this number, an amber badge appears on the sidebar.',
        'Every Sale Invoice automatically deducts quantity from inventory. Every Purchase Bill adds quantity.',
        'If you cancel an invoice, stock and balances are automatically restored immediately!',
      ],
      illustrationType: 'stock_alert',
      proTip:
        'Use "Stock Adjust" in the Items tab for damaged goods, physical count reconciliation, or opening stock corrections without creating fake invoices.',
      actionText: 'Manage Stock & Items',
      actionHandler: () => setActiveTab('items'),
    },
    {
      id: 'quotation-convert-tip',
      category: 'invoicing',
      title: 'Quotations / Estimates (Kacha Bill to Pakka Bill)',
      badge: 'Sales Growth',
      badgeColor: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-300',
      summary:
        'Send professional price estimates to clients without affecting stock or ledger balances until the order is confirmed.',
      steps: [
        'Select "Quotation / Estimate" when creating a new bill. The PDF displays "QUOTATION / ESTIMATE".',
        'Quotations do NOT deduct item stock and do NOT add to customer ledger balance.',
        'Once the customer approves the quote, click "Convert to Sale" to instantly turn it into an official Sale Invoice in 1 click.',
      ],
      illustrationType: 'quotation_convert',
      proTip:
        'Quotations have their own prefix (EST-0001) separate from sale invoices (INV-0001) for clean accounting audit trails.',
      actionText: 'Create New Quotation',
      actionHandler: () => {
        setNewInvoiceType('quotation');
        setIsNewInvoiceOpen(true);
      },
    },
    {
      id: 'backup-security-tip',
      category: 'backup',
      title: '100% Offline Storage, JSON Database Backup & PIN Protection',
      badge: 'Data Safety',
      badgeColor: 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200',
      summary:
        'Your financial records are stored securely in your browser and work 100% offline. Learn how to export and protect your data.',
      steps: [
        'Hisab Kitab works without internet: all invoices, stock movements, and party ledgers save locally in real-time.',
        'Go to Settings & Backup -> "Export Backup (.json)" weekly to download a complete backup file to your phone, Google Drive, or PC.',
        'If you ever switch phones or computers, use "Restore Backup" to import your entire business data in 2 seconds.',
        'Enable "4-Digit PIN Lock" in Settings to prevent unauthorized staff or visitors from viewing your business revenue.',
      ],
      illustrationType: 'backup_pin',
      proTip:
        'Always keep a copy of your exported JSON backup file on your WhatsApp or email for disaster recovery.',
      actionText: 'Open Settings & Backup',
      actionHandler: () => setActiveTab('settings'),
    },
  ];

  const filteredTips = tips.filter((t) => {
    const matchCat = activeCategory === 'all' || t.category === activeCategory;
    const matchSearch =
      t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.proTip.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Hero Banner with HK Icon & Replay Animation */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-6 sm:p-8 text-white shadow-xl border border-slate-700/80">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="hidden sm:block">
              <HKIcon size={64} className="hover:scale-105 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="rounded-full bg-emerald-500/20 px-2.5 py-0.5 text-[11px] font-bold tracking-wider uppercase text-emerald-300 border border-emerald-500/30">
                  Beginner Documentation
                </span>
                <span className="text-xs text-amber-300 font-semibold flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Step-by-Step
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                Hisab Kitab User Guide & Tips
              </h1>
              <p className="mt-1.5 text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
                Everything you need to master fast billing, tax invoices, customer khata, stock management,
                and direct WhatsApp PDF sharing for your business.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto shrink-0">
            {onReplayAnimation && (
              <button
                onClick={onReplayAnimation}
                className="flex items-center gap-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-3 py-2 text-xs font-bold transition-all cursor-pointer"
                title="Watch the smooth opening animation again"
              >
                <Play className="h-3.5 w-3.5 fill-current" />
                <span>Replay Opening Animation</span>
              </button>
            )}

            <button
              onClick={() => {
                setNewInvoiceType('sale');
                setIsNewInvoiceOpen(true);
              }}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 text-xs font-bold shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
            >
              <Receipt className="h-3.5 w-3.5" />
              <span>Create First Bill</span>
            </button>
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Category Pills & Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? 'bg-theme text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides (e.g. tax, pdf, stock)..."
            className="w-full pl-8 pr-3 py-2 rounded-xl text-xs bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tips Cards Grid */}
      <div className="space-y-4">
        {filteredTips.map((tip) => {
          const isExpanded = expandedTip === tip.id;
          return (
            <div
              key={tip.id}
              className="rounded-2xl bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
            >
              {/* Card Header */}
              <div
                onClick={() => setExpandedTip(isExpanded ? null : tip.id)}
                className="p-5 sm:p-6 cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 select-none"
              >
                <div className="flex items-start gap-3.5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-700 text-theme font-bold">
                    {tip.category === 'invoicing' && <Receipt className="h-5 w-5 text-emerald-600" />}
                    {tip.category === 'whatsapp' && <Share2 className="h-5 w-5 text-green-600" />}
                    {tip.category === 'khata' && <Users className="h-5 w-5 text-blue-600" />}
                    {tip.category === 'inventory' && <Package className="h-5 w-5 text-amber-600" />}
                    {tip.category === 'expenses' && <Wallet className="h-5 w-5 text-purple-600" />}
                    {tip.category === 'backup' && <ShieldCheck className="h-5 w-5 text-slate-600 dark:text-slate-300" />}
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${tip.badgeColor}`}>
                        {tip.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {tip.title}
                    </h3>
                    <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-2xl">
                      {tip.summary}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                  <button
                    className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
                      isExpanded
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                    }`}
                  >
                    {isExpanded ? 'Hide Visual Guide' : 'View Visual Guide'}
                  </button>
                </div>
              </div>

              {/* Expanded Visual Guide & Diagram */}
              {isExpanded && (
                <div className="border-t border-slate-100 dark:border-slate-700/60 p-5 sm:p-6 bg-slate-50/70 dark:bg-slate-800/40 space-y-6 animate-fadeIn">
                  {/* Visual Illustration Mockup */}
                  <div className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 p-4 sm:p-6 shadow-xs">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                          UI Visual Diagram & Layout Placement
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Reference Mockup</span>
                    </div>

                    {/* RENDER SPECIFIC VISUAL DIAGRAM BASED ON ILLUSTRATION TYPE */}
                    {tip.illustrationType === 'tax_invoice' && (
                      <div className="space-y-4 font-sans">
                        <div className="rounded-lg border-2 border-dashed border-emerald-300 dark:border-emerald-800 bg-emerald-50/40 dark:bg-emerald-950/20 p-4">
                          <div className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 uppercase mb-2">
                            PDF Upper Right Corner Architecture (No Overlap)
                          </div>
                          
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Scenario A: Has Tax */}
                            <div className="rounded-xl bg-white dark:bg-slate-800 p-4 border border-emerald-200 dark:border-emerald-800/60 shadow-xs">
                              <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                  Case A: With Tax Details
                                </span>
                                <span className="text-[10px] bg-emerald-100 dark:bg-emerald-900 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded font-bold">
                                  Tax &gt; 0%
                                </span>
                              </div>
                              <div className="text-right space-y-1 font-sans">
                                <div className="inline-block bg-emerald-600 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-xs">
                                  TAX INVOICE
                                </div>
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
                                  Doc No: <span className="font-mono text-emerald-600">INV-0001</span>
                                </div>
                                <div className="text-[11px] text-slate-500">Date: 26/09/2026</div>
                                <div className="text-[10px] font-extrabold text-emerald-600 uppercase">
                                  Status: PAID
                                </div>
                              </div>
                              <p className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-2">
                                ✅ Upper right shows <strong>TAX INVOICE</strong>. Doc No is placed on its own line below, with zero overlapping!
                              </p>
                            </div>

                            {/* Scenario B: No Tax */}
                            <div className="rounded-xl bg-white dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 shadow-xs">
                              <div className="flex items-center justify-between mb-3 border-b border-slate-100 dark:border-slate-700 pb-2">
                                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                                  Case B: Without Tax Details
                                </span>
                                <span className="text-[10px] bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-1.5 py-0.5 rounded font-bold">
                                  Tax 0%
                                </span>
                              </div>
                              <div className="text-right space-y-1 font-sans">
                                <div className="inline-block bg-slate-800 dark:bg-slate-700 text-white font-extrabold text-xs px-2.5 py-1 rounded shadow-xs">
                                  INVOICE
                                </div>
                                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 pt-1">
                                  Doc No: <span className="font-mono text-slate-700 dark:text-slate-300">INV-0002</span>
                                </div>
                                <div className="text-[11px] text-slate-500">Date: 26/09/2026</div>
                                <div className="text-[10px] font-extrabold text-amber-600 uppercase">
                                  Status: UNPAID
                                </div>
                              </div>
                              <p className="mt-3 text-[11px] text-slate-500 border-t border-slate-100 dark:border-slate-700 pt-2">
                                ✅ Upper right shows <strong>INVOICE</strong>. Clean, simple, and complies with standard retail billing.
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {tip.illustrationType === 'whatsapp_pdf' && (
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700 text-center">
                            <Download className="h-6 w-6 text-emerald-500 mx-auto mb-1.5" />
                            <div className="text-xs font-bold text-slate-800 dark:text-white">1. Vector PDF</div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Crystal clear vector PDF generated on-the-fly with company branding.
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700 text-center">
                            <Share2 className="h-6 w-6 text-green-500 mx-auto mb-1.5" />
                            <div className="text-xs font-bold text-slate-800 dark:text-white">2. Direct Customer Link</div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Targets customer phone directly with formatted bill receipt text.
                            </p>
                          </div>
                          <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-3.5 border border-slate-200 dark:border-slate-700 text-center">
                            <DollarSign className="h-6 w-6 text-indigo-500 mx-auto mb-1.5" />
                            <div className="text-xs font-bold text-slate-800 dark:text-white">3. Payment Info Included</div>
                            <p className="text-[11px] text-slate-500 mt-1">
                              Bank A/C, EasyPaisa & JazzCash automatically appended for faster recovery.
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    {tip.illustrationType === 'khata_ledger' && (
                      <div className="rounded-xl bg-slate-50 dark:bg-slate-800 p-4 border border-slate-200 dark:border-slate-700 space-y-3">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-700 pb-3">
                          <div>
                            <span className="text-xs font-bold text-slate-800 dark:text-white">Customer Khata Rules</span>
                            <p className="text-[11px] text-slate-500">How balances change automatically</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 px-2 py-0.5 text-xs font-extrabold">
                              To Collect (Receivable)
                            </span>
                            <span className="rounded bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 px-2 py-0.5 text-xs font-extrabold">
                              To Pay (Payable)
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <strong className="text-slate-800 dark:text-white block mb-1">Sale on Credit:</strong>
                            <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                              Grand Total - Amount Paid = Added to Customer Balance ("To Collect").
                            </span>
                          </div>
                          <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700">
                            <strong className="text-slate-800 dark:text-white block mb-1">Customer Payment Received:</strong>
                            <span className="text-slate-600 dark:text-slate-400 text-[11px]">
                              Reduces "To Collect" balance. Customer gets an instant receipt.
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {tip.illustrationType === 'stock_alert' && (
                      <div className="rounded-xl bg-amber-50/50 dark:bg-amber-950/20 p-4 border border-amber-200 dark:border-amber-900 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                            <span className="text-xs font-bold text-amber-900 dark:text-amber-200">
                              Automated Low Stock Engine
                            </span>
                          </div>
                          <span className="text-[11px] text-amber-700 dark:text-amber-300 font-mono">
                            Auto-Audited on Every Sale
                          </span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-700 h-2.5 rounded-full overflow-hidden">
                          <div className="bg-amber-500 h-full w-[25%]" />
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-slate-400">
                          When Current Stock ≤ Low Stock Threshold, a notification badge lights up on the sidebar and item view, ensuring you never run out of critical inventory.
                        </p>
                      </div>
                    )}

                    {tip.illustrationType === 'quotation_convert' && (
                      <div className="rounded-xl bg-indigo-50/50 dark:bg-indigo-950/20 p-4 border border-indigo-200 dark:border-indigo-900 flex items-center justify-between flex-wrap gap-3">
                        <div className="space-y-1">
                          <div className="text-xs font-bold text-indigo-900 dark:text-indigo-200">
                            Quotation Pipeline: Quote &rarr; Approve &rarr; Sale
                          </div>
                          <p className="text-[11px] text-slate-600 dark:text-slate-400">
                            Convert any quotation to an official tax or standard invoice without re-typing line items.
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 rounded bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-mono font-bold">
                            EST-0001
                          </span>
                          <ArrowRight className="h-4 w-4 text-indigo-600" />
                          <span className="px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200 text-xs font-mono font-bold">
                            INV-0001
                          </span>
                        </div>
                      </div>
                    )}

                    {tip.illustrationType === 'apk_download' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-300 dark:border-amber-800 text-center">
                          <Code2 className="h-5 w-5 text-amber-600 dark:text-amber-400 mx-auto mb-1.5" />
                          <div className="font-bold text-slate-800 dark:text-white">1. Source Code (.ZIP)</div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Clean React 19 + TypeScript + Express project. Fully modular & ready to run.
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-300 dark:border-emerald-800 text-center">
                          <Smartphone className="h-5 w-5 text-emerald-600 dark:text-emerald-400 mx-auto mb-1.5" />
                          <div className="font-bold text-slate-800 dark:text-white">2. Android Studio</div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Complete Gradle project to compile debug/release APK & Play Store AAB.
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-300 dark:border-indigo-800 text-center">
                          <Download className="h-5 w-5 text-indigo-600 dark:text-indigo-400 mx-auto mb-1.5" />
                          <div className="font-bold text-slate-800 dark:text-white">3. 1-Click Install</div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Install directly as a standalone WebAPK from Chrome on your phone.
                          </p>
                        </div>
                      </div>
                    )}

                    {tip.illustrationType === 'backup_pin' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <ShieldCheck className="h-5 w-5 text-emerald-600 mb-1" />
                          <div className="font-bold text-slate-800 dark:text-white">Export & Restore</div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Save full JSON backups with 1 click. Zero data loss when switching devices or clearing cache.
                          </p>
                        </div>
                        <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                          <HelpCircle className="h-5 w-5 text-indigo-600 mb-1" />
                          <div className="font-bold text-slate-800 dark:text-white">PIN Lock Security</div>
                          <p className="text-[11px] text-slate-500 mt-1">
                            Lock your dashboard with a 4-digit PIN to prevent staff or passersby from viewing sales totals.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Step by Step Checklist */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                      Step-by-Step Instructions:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                      {tip.steps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 rounded-xl bg-white dark:bg-slate-800/80 p-3 border border-slate-200/80 dark:border-slate-700/80 text-xs text-slate-700 dark:text-slate-300"
                        >
                          <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-relaxed">{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Pro Tip Callout & Action */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 p-3.5 border border-amber-200 dark:border-amber-800/60">
                    <div className="flex items-start gap-2.5 text-xs text-amber-900 dark:text-amber-200">
                      <Sparkles className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <strong>Pro Tip:</strong> {tip.proTip}
                      </div>
                    </div>

                    {tip.actionText && tip.actionHandler && (
                      <button
                        onClick={tip.actionHandler}
                        className="flex items-center gap-1.5 shrink-0 rounded-lg bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                      >
                        <span>{tip.actionText}</span>
                        <ArrowRight className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Beginner FAQ Accordion */}
      <div className="rounded-2xl bg-white dark:bg-slate-800 p-6 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-theme" />
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Frequently Asked Questions for Beginners
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white">
              Q: Does Hisab Kitab work if internet is disconnected?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Yes! Hisab Kitab uses local browser storage. You can make sales, add items, record payments, and download PDFs even with zero internet.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white">
              Q: What happens if I make a mistake on an invoice?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              You can cancel the invoice at any time. When cancelled, all item stocks and customer balances are automatically restored to their previous states.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white">
              Q: How do I add my custom store logo?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Go to Settings & Backup, and paste your logo image URL or base64 image data into the "Business Logo" field. It will appear on all your printed bills and PDF files.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/60 space-y-1">
            <h4 className="font-bold text-slate-800 dark:text-white">
              Q: How do I change the currency symbol?
            </h4>
            <p className="text-slate-600 dark:text-slate-400 leading-relaxed">
              Open Settings & Backup to set your currency (Rs., PKR, $, AED, SAR, etc.). It applies immediately across all invoices, totals, and ledgers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
