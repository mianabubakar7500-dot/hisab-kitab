import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Save,
  Package,
  RotateCcw,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { Item, ItemType, UnitType } from '../../types';
import { STORAGE_KEYS, saveDraft, loadDraft, clearDraft } from '../../services/db';

interface ItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemToEdit?: Item | null;
}

export const ItemModal: React.FC<ItemModalProps> = ({
  isOpen,
  onClose,
  itemToEdit,
}) => {
  const { saveItem, profile } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<ItemType>('product');
  const [unit, setUnit] = useState<UnitType>('Pcs');
  const [salePrice, setSalePrice] = useState<number>(0);
  const [purchasePrice, setPurchasePrice] = useState<number>(0);
  const [taxRate, setTaxRate] = useState<number>(profile.isTaxEnabled ? profile.defaultTaxPercent || 18 : 0);
  const [openingStock, setOpeningStock] = useState<number>(0);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(5);
  const [sku, setSku] = useState('');
  const [barcode, setBarcode] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);
  const isDiscardingDraftRef = useRef(false);

  const isFormDirty = useMemo(() => {
    if (itemToEdit) return false;
    return Boolean(
      name.trim() ||
      salePrice > 0 ||
      purchasePrice > 0 ||
      openingStock > 0 ||
      sku.trim() ||
      barcode.trim() ||
      description.trim()
    );
  }, [itemToEdit, name, salePrice, purchasePrice, openingStock, sku, barcode, description]);

  // Restore draft or edit
  useEffect(() => {
    if (!isOpen) return;

    if (itemToEdit) {
      setName(itemToEdit.name);
      setType(itemToEdit.type);
      setUnit(itemToEdit.unit);
      setSalePrice(itemToEdit.salePrice || 0);
      setPurchasePrice(itemToEdit.purchasePrice || 0);
      setTaxRate(itemToEdit.taxRate || 0);
      setOpeningStock(itemToEdit.openingStock || 0);
      setLowStockThreshold(itemToEdit.lowStockThreshold || 5);
      setSku(itemToEdit.sku || '');
      setBarcode(itemToEdit.barcode || '');
      setDescription(itemToEdit.description || '');
    } else {
      const draft = loadDraft<any>(STORAGE_KEYS.DRAFT_ITEM);
      if (draft && draft.name) {
        setName(draft.name || '');
        setType(draft.type || 'product');
        setUnit(draft.unit || 'Pcs');
        setSalePrice(draft.salePrice || 0);
        setPurchasePrice(draft.purchasePrice || 0);
        setTaxRate(draft.taxRate !== undefined ? draft.taxRate : (profile.isTaxEnabled ? profile.defaultTaxPercent || 18 : 0));
        setOpeningStock(draft.openingStock || 0);
        setLowStockThreshold(draft.lowStockThreshold || 5);
        setSku(draft.sku || '');
        setBarcode(draft.barcode || '');
        setDescription(draft.description || '');
      } else {
        setName('');
        setType('product');
        setUnit('Pcs');
        setSalePrice(0);
        setPurchasePrice(0);
        setTaxRate(profile.isTaxEnabled ? profile.defaultTaxPercent || 18 : 0);
        setOpeningStock(0);
        setLowStockThreshold(5);
        setSku('');
        setBarcode('');
        setDescription('');
      }
    }
    setError('');
  }, [itemToEdit, isOpen]);

  // Continuous Autosave on draft only when user entered content
  useEffect(() => {
    if (!isOpen || itemToEdit || isDiscardingDraftRef.current) return;
    if (!isFormDirty) return;

    saveDraft(STORAGE_KEYS.DRAFT_ITEM, {
      name,
      type,
      unit,
      salePrice,
      purchasePrice,
      taxRate,
      openingStock,
      lowStockThreshold,
      sku,
      barcode,
      description,
    });
  }, [
    isOpen,
    itemToEdit,
    isFormDirty,
    name,
    type,
    unit,
    salePrice,
    purchasePrice,
    taxRate,
    openingStock,
    lowStockThreshold,
    sku,
    barcode,
    description,
  ]);

  const handleConfirmDiscard = () => {
    isDiscardingDraftRef.current = true;
    clearDraft(STORAGE_KEYS.DRAFT_ITEM);
    setName('');
    setType('product');
    setUnit('Pcs');
    setSalePrice(0);
    setPurchasePrice(0);
    setTaxRate(profile.isTaxEnabled ? profile.defaultTaxPercent || 18 : 0);
    setOpeningStock(0);
    setLowStockThreshold(5);
    setSku('');
    setBarcode('');
    setDescription('');
    setError('');
    setShowDiscardConfirm(false);
    setTimeout(() => {
      isDiscardingDraftRef.current = false;
    }, 400);
  };

  const handleDiscardAndClose = () => {
    isDiscardingDraftRef.current = true;
    clearDraft(STORAGE_KEYS.DRAFT_ITEM);
    setShowDiscardConfirm(false);
    onClose();
    setTimeout(() => {
      isDiscardingDraftRef.current = false;
    }, 400);
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Item name is required');
      return;
    }

    saveItem({
      id: itemToEdit?.id,
      name: name.trim(),
      type,
      unit,
      salePrice: Number(salePrice || 0),
      purchasePrice: Number(purchasePrice || 0),
      taxRate: Number(taxRate || 0),
      openingStock: Number(openingStock || 0),
      lowStockThreshold: Number(lowStockThreshold || 0),
      sku: sku.trim(),
      barcode: barcode.trim(),
      description: description.trim(),
    });

    clearDraft(STORAGE_KEYS.DRAFT_ITEM);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/80 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/80">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-theme text-white">
              <Package className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-white">
                  {itemToEdit ? 'Edit Item' : 'Add New Item'}
                </h3>
                {!itemToEdit && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-[9px] font-bold text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Autosaved
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Product inventory or billable service
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {!itemToEdit && isFormDirty && (
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(true)}
                className="flex items-center gap-1.5 text-xs font-semibold text-rose-600 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 dark:text-rose-400 dark:hover:bg-rose-950/70 px-2.5 py-1.5 rounded-xl border border-rose-200 dark:border-rose-900/60 transition-colors cursor-pointer"
                title="Discard item draft"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Discard Draft</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
          {error && (
            <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-700 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400">
              {error}
            </div>
          )}

          {/* Type Toggle */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Item Type
            </label>
            <div className="grid grid-cols-2 gap-2">
              {(['product', 'service'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setType(t)}
                  className={`rounded-xl py-2 font-semibold capitalize border transition-all cursor-pointer ${
                    type === t
                      ? 'border-emerald-600 bg-emerald-50 text-emerald-800 dark:border-emerald-500 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400'
                  }`}
                >
                  {t === 'product' ? '📦 Physical Product' : '🛠️ Service'}
                </button>
              ))}
            </div>
          </div>

          {/* Name & Unit */}
          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Item / Product Name *
              </label>
              <input
                type="text"
                placeholder="e.g. Havells 2.5mm Copper Cable"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Unit
              </label>
              <select
                value={unit}
                onChange={(e) => setUnit(e.target.value as UnitType)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                {['Pcs', 'Kg', 'Ltr', 'Box', 'Packet', 'Meter', 'Hour', 'Set', 'Dozen', 'Bag', 'Carton'].map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sale Price ({profile.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={salePrice || ''}
                onChange={(e) => setSalePrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Purchase Cost ({profile.currencySymbol})
              </label>
              <input
                type="number"
                step="any"
                placeholder="0"
                value={purchasePrice || ''}
                onChange={(e) => setPurchasePrice(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Stock Tracking (If product) */}
          {type === 'product' && (
            <div className="grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {itemToEdit ? 'Current Stock' : 'Opening Stock'}
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="0"
                  value={openingStock || ''}
                  onChange={(e) => setOpeningStock(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono font-bold dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Low Stock Alert At
                </label>
                <input
                  type="number"
                  step="any"
                  placeholder="5"
                  value={lowStockThreshold || ''}
                  onChange={(e) => setLowStockThreshold(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}

          {/* Tax Rate (Optional) */}
          {profile.isTaxEnabled && (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sales Tax Rate (%) (Optional)
              </label>
              <input
                type="number"
                step="any"
                placeholder="18"
                value={taxRate || ''}
                onChange={(e) => setTaxRate(parseFloat(e.target.value) || 0)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}

          {/* SKU & Barcode */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Item Code / SKU
              </label>
              <input
                type="text"
                placeholder="SKU-001"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Barcode
              </label>
              <input
                type="text"
                placeholder="Barcode number"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              Description / Specs
            </label>
            <textarea
              rows={2}
              placeholder="Brand, model, warranty notes..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-xl border border-slate-200 p-2.5 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
          </div>

          {/* Footer Submit */}
          <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-200 dark:border-slate-800">
            <div>
              {!itemToEdit && isFormDirty && (
                <button
                  type="button"
                  onClick={() => setShowDiscardConfirm(true)}
                  className="rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-300 flex items-center gap-1.5 cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Discard Draft</span>
                </button>
              )}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-xl bg-theme px-5 py-2 text-xs font-bold text-white shadow-md hover:opacity-95 cursor-pointer"
              >
                <Save className="h-4 w-4" />
                <span>{itemToEdit ? 'Update Item' : 'Save Item'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* In-app Discard Confirmation Modal */}
      {showDiscardConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600 dark:bg-rose-950/70 dark:text-rose-400">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Discard Product Draft?
                </h3>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  This will clear your autosaved product details and reset the form.
                </p>
              </div>
            </div>

            <div className="mt-5 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleConfirmDiscard}
                className="w-full rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 shadow-sm cursor-pointer"
              >
                Yes, Discard & Start Fresh
              </button>
              <button
                type="button"
                onClick={handleDiscardAndClose}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              >
                Discard & Close Form
              </button>
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="w-full rounded-xl py-1.5 text-xs font-medium text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
              >
                Keep Editing (Cancel)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
