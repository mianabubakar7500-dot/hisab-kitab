import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Package,
  Receipt,
  ShoppingBag,
  FileText,
  ArrowRight,
  PlusCircle,
  ExternalLink,
  X,
  CreditCard,
  Building2,
} from 'lucide-react';
import { Party, Item, Invoice } from '../../types';

interface GlobalSearchDropdownProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPartyLedger?: (party: Party) => void;
}

export const GlobalSearchDropdown: React.FC<GlobalSearchDropdownProps> = ({
  isOpen,
  onClose,
  onOpenPartyLedger,
}) => {
  const {
    searchQuery,
    setSearchQuery,
    parties,
    items,
    invoices,
    formatMoney,
    setViewingInvoice,
    setActiveTab,
    setIsNewInvoiceOpen,
    setNewInvoiceType,
    setIsQuickPartyModalOpen,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'parties' | 'sales' | 'purchases' | 'items'>('all');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  const query = searchQuery.trim().toLowerCase();

  const matchingParties = useMemo(() => {
    if (!query) return [];
    return parties.filter((p) => {
      if (p.archived) return false;
      return (
        p.name.toLowerCase().includes(query) ||
        (p.phone && p.phone.toLowerCase().includes(query)) ||
        (p.address && p.address.toLowerCase().includes(query)) ||
        (p.email && p.email.toLowerCase().includes(query)) ||
        (p.ntn && p.ntn.toLowerCase().includes(query)) ||
        (p.type && p.type.toLowerCase().includes(query))
      );
    });
  }, [parties, query]);

  const matchingSales = useMemo(() => {
    if (!query) return [];
    return invoices.filter((inv) => {
      if (inv.type !== 'sale' && inv.type !== 'quotation' && inv.type !== 'sale_return') return false;
      const matchInvNo = inv.invoiceNumber.toLowerCase().includes(query);
      const matchParty = inv.partyName.toLowerCase().includes(query);
      const matchPhone = inv.partyPhone && inv.partyPhone.toLowerCase().includes(query);
      const matchItems = inv.lines.some((l) => l.itemName.toLowerCase().includes(query));
      return matchInvNo || matchParty || matchPhone || matchItems;
    });
  }, [invoices, query]);

  const matchingPurchases = useMemo(() => {
    if (!query) return [];
    return invoices.filter((inv) => {
      if (inv.type !== 'purchase') return false;
      const matchInvNo = inv.invoiceNumber.toLowerCase().includes(query);
      const matchParty = inv.partyName.toLowerCase().includes(query);
      const matchPhone = inv.partyPhone && inv.partyPhone.toLowerCase().includes(query);
      const matchItems = inv.lines.some((l) => l.itemName.toLowerCase().includes(query));
      return matchInvNo || matchParty || matchPhone || matchItems;
    });
  }, [invoices, query]);

  const matchingItems = useMemo(() => {
    if (!query) return [];
    return items.filter((itm) => {
      return (
        itm.name.toLowerCase().includes(query) ||
        (itm.sku && itm.sku.toLowerCase().includes(query)) ||
        (itm.barcode && itm.barcode.toLowerCase().includes(query)) ||
        (itm.description && itm.description.toLowerCase().includes(query))
      );
    });
  }, [items, query]);

  const totalResults =
    matchingParties.length +
    matchingSales.length +
    matchingPurchases.length +
    matchingItems.length;

  if (!isOpen || !query) return null;

  const handleSelectInvoice = (inv: Invoice) => {
    setViewingInvoice(inv);
    onClose();
  };

  const handleSelectParty = (party: Party) => {
    if (onOpenPartyLedger) {
      onOpenPartyLedger(party);
    } else {
      setActiveTab('parties');
    }
    onClose();
  };

  const handleSelectNewSaleForParty = (party: Party, e: React.MouseEvent) => {
    e.stopPropagation();
    setNewInvoiceType('sale');
    setIsNewInvoiceOpen(true);
    onClose();
  };

  const handleSelectItem = (_item: Item) => {
    setActiveTab('items');
    onClose();
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full left-0 right-0 mt-2 z-50 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs max-h-[80vh] flex flex-col animate-in fade-in slide-in-from-top-2 duration-150"
      style={{ minWidth: '340px' }}
    >
      {/* Category Tabs Header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/90 dark:border-slate-800 dark:bg-slate-800/90 px-3 py-2">
        <div className="flex items-center gap-1 overflow-x-auto py-0.5">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            All ({totalResults})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('parties')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              activeCategory === 'parties'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Parties ({matchingParties.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('sales')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              activeCategory === 'sales'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Sales ({matchingSales.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('purchases')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              activeCategory === 'purchases'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Bills ({matchingPurchases.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('items')}
            className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
              activeCategory === 'items'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Items ({matchingItems.length})
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Results Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        {totalResults === 0 ? (
          <div className="text-center py-8 px-4">
            <p className="text-slate-500 dark:text-slate-400 font-medium">
              No matching records found for "{searchQuery}"
            </p>
            <div className="mt-4 flex flex-wrap justify-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsQuickPartyModalOpen(true);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5 text-emerald-600" />
                <span>+ Create Party</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab('items');
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              >
                <Package className="h-3.5 w-3.5 text-emerald-600" />
                <span>+ Add Item</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setNewInvoiceType('sale');
                  setIsNewInvoiceOpen(true);
                  onClose();
                }}
                className="inline-flex items-center gap-1.5 rounded-xl bg-theme px-3 py-1.5 text-xs font-bold text-white shadow-xs cursor-pointer"
              >
                <PlusCircle className="h-3.5 w-3.5" />
                <span>+ New Sale</span>
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* PARTIES SECTION */}
            {(activeCategory === 'all' || activeCategory === 'parties') && matchingParties.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                    <Users className="h-3.5 w-3.5" />
                    <span>Customers & Suppliers ({matchingParties.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('parties');
                      onClose();
                    }}
                    className="text-[10px] lowercase text-slate-400 hover:text-emerald-600 flex items-center gap-0.5"
                  >
                    view all <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {matchingParties.slice(0, 6).map((p) => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectParty(p)}
                      className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-300 font-bold text-xs">
                          {p.name.substring(0, 2).toUpperCase()}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                              {p.name}
                            </span>
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                                p.type === 'customer'
                                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300'
                                  : p.type === 'supplier'
                                  ? 'bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300'
                                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
                              }`}
                            >
                              {p.type}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 truncate">
                            {p.phone ? `Ph: ${p.phone} • ` : ''}
                            {p.address || 'No address'}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0 text-right">
                        <div>
                          <div
                            className={`font-mono font-bold text-xs ${
                              p.currentBalance > 0
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : p.currentBalance < 0
                                ? 'text-rose-600 dark:text-rose-400'
                                : 'text-slate-400'
                            }`}
                          >
                            {formatMoney(Math.abs(p.currentBalance))}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {p.currentBalance > 0 ? 'To Collect' : p.currentBalance < 0 ? 'To Pay' : 'Settled'}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => handleSelectNewSaleForParty(p, e)}
                          title="Create Sale for this party"
                          className="opacity-0 group-hover:opacity-100 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 p-1.5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 transition-opacity"
                        >
                          <PlusCircle className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* SALES & QUOTATIONS SECTION */}
            {(activeCategory === 'all' || activeCategory === 'sales') && matchingSales.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  <span className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400">
                    <Receipt className="h-3.5 w-3.5" />
                    <span>Sales & Quotations ({matchingSales.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('sales');
                      onClose();
                    }}
                    className="text-[10px] lowercase text-slate-400 hover:text-indigo-600 flex items-center gap-0.5"
                  >
                    view all <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {matchingSales.slice(0, 6).map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv)}
                      className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300">
                          {inv.type === 'quotation' ? <FileText className="h-4 w-4" /> : <Receipt className="h-4 w-4" />}
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {inv.partyName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {inv.date} • {inv.lines.length} items
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {formatMoney(inv.grandTotal)}
                        </div>
                        <span
                          className={`inline-block rounded px-1.5 py-0.2 text-[9px] font-bold uppercase ${
                            inv.status === 'paid'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : inv.status === 'cancelled'
                              ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          }`}
                        >
                          {inv.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* PURCHASES & BILLS SECTION */}
            {(activeCategory === 'all' || activeCategory === 'purchases') && matchingPurchases.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                    <ShoppingBag className="h-3.5 w-3.5" />
                    <span>Purchase Bills ({matchingPurchases.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('purchases');
                      onClose();
                    }}
                    className="text-[10px] lowercase text-slate-400 hover:text-amber-600 flex items-center gap-0.5"
                  >
                    view all <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {matchingPurchases.slice(0, 6).map((inv) => (
                    <div
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv)}
                      className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-300">
                          <ShoppingBag className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono font-bold text-slate-900 dark:text-white">
                              {inv.invoiceNumber}
                            </span>
                            <span className="text-slate-400">•</span>
                            <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                              {inv.partyName}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {inv.date} • {inv.lines.length} items
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {formatMoney(inv.grandTotal)}
                        </div>
                        <span className="text-[10px] text-slate-400 capitalize">{inv.status}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ITEMS & STOCK SECTION */}
            {(activeCategory === 'all' || activeCategory === 'items') && matchingItems.length > 0 && (
              <div>
                <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 px-1">
                  <span className="flex items-center gap-1.5 text-sky-600 dark:text-sky-400">
                    <Package className="h-3.5 w-3.5" />
                    <span>Items & Products ({matchingItems.length})</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('items');
                      onClose();
                    }}
                    className="text-[10px] lowercase text-slate-400 hover:text-sky-600 flex items-center gap-0.5"
                  >
                    view all <ArrowRight className="h-3 w-3" />
                  </button>
                </div>
                <div className="space-y-1">
                  {matchingItems.slice(0, 6).map((itm) => (
                    <div
                      key={itm.id}
                      onClick={() => handleSelectItem(itm)}
                      className="group flex items-center justify-between rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-slate-800/80 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sky-100 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300">
                          <Package className="h-4 w-4" />
                        </div>
                        <div className="truncate">
                          <div className="font-bold text-slate-900 dark:text-white truncate">
                            {itm.name}
                          </div>
                          <p className="text-[11px] text-slate-400">
                            {itm.sku ? `SKU: ${itm.sku} • ` : ''}
                            Unit: {itm.unit || 'Pcs'}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div className="font-mono font-bold text-slate-900 dark:text-white text-xs">
                          {formatMoney(itm.salePrice)}
                        </div>
                        <span
                          className={`text-[10px] font-semibold ${
                            itm.currentStock <= itm.lowStockThreshold
                              ? 'text-rose-600 dark:text-rose-400'
                              : 'text-slate-500 dark:text-slate-400'
                          }`}
                        >
                          Stock: {itm.currentStock} {itm.unit}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer info */}
      <div className="border-t border-slate-100 bg-slate-50 dark:border-slate-800 dark:bg-slate-800/60 px-3 py-2 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Click any result to view details or generate statement</span>
        <button
          type="button"
          onClick={() => {
            setSearchQuery('');
            onClose();
          }}
          className="font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          Clear search
        </button>
      </div>
    </div>
  );
};
