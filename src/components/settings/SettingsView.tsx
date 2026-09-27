import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building,
  Lock,
  Download,
  Upload,
  RotateCcw,
  Check,
  Save,
  Palette,
  Image,
  CreditCard,
  Percent,
  Trash2,
  BookOpen,
  Sparkles,
  Play,
} from 'lucide-react';
import { exportDatabaseAsJson, importDatabaseFromJson, resetToDefaultData } from '../../services/db';
import { ColorTheme } from '../../types';
import { HKIcon } from '../common/HKIcon';

export const SettingsView: React.FC = () => {
  const { profile, updateProfile, formatMoney, setActiveTab } = useApp();

  const [formData, setFormData] = useState({ ...profile });
  const [successMsg, setSuccessMsg] = useState('');
  const [pinInput, setPinInput] = useState(profile.appLockPin || '');
  const [isPinEnabled, setIsPinEnabled] = useState(profile.isAppLockEnabled);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleInputChange = (field: string, val: any) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('Logo file size must be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      handleInputChange('logoUrl', dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile({
      ...formData,
      isAppLockEnabled: isPinEnabled,
      appLockPin: isPinEnabled ? pinInput : '',
    });
    setSuccessMsg('Settings saved successfully!');
    setTimeout(() => setSuccessMsg(''), 4000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportDatabaseAsJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `hisab_kitab_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = importDatabaseFromJson(text);
        if (res.success) {
          alert('Backup restored successfully! The page will now reload.');
          window.location.reload();
        } else {
          alert('Failed to restore backup: ' + res.message);
        }
      } catch (err: any) {
        alert('Failed to restore backup: ' + err.message);
      }
    };
    reader.readAsText(file);
  };

  const handleResetDemoData = () => {
    if (window.confirm('Reset all data to default demo state? Any unsaved custom data will be cleared.')) {
      resetToDefaultData();
      window.location.reload();
    }
  };

  const themes: { id: ColorTheme; name: string; bg: string; ring: string }[] = [
    { id: 'emerald', name: 'Emerald Green', bg: 'bg-emerald-600', ring: 'ring-emerald-500' },
    { id: 'sky', name: 'Sky Blue', bg: 'bg-sky-600', ring: 'ring-sky-500' },
    { id: 'indigo', name: 'Classic Indigo', bg: 'bg-indigo-600', ring: 'ring-indigo-500' },
    { id: 'crimson', name: 'Crimson Red', bg: 'bg-rose-600', ring: 'ring-rose-500' },
    { id: 'slate', name: 'Graphite Slate', bg: 'bg-slate-700', ring: 'ring-slate-500' },
    { id: 'purple', name: 'Royal Purple', bg: 'bg-purple-600', ring: 'ring-purple-500' },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Top Banner */}
      <div className="border-b border-slate-200 pb-5 dark:border-slate-800">
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Settings className="h-6 w-6 text-emerald-600" />
          <span>Business Settings & Backup</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Customize your business profile, theme colors, company logo, manual bank accounts, currency, and data backup.
        </p>
      </div>

      {successMsg && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700 dark:border-emerald-900/60 dark:bg-emerald-950/40 dark:text-emerald-400 flex items-center gap-2 animate-in fade-in">
          <Check className="h-4 w-4" />
          <span>{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSaveProfile} className="space-y-6">
        {/* Multi-Theme Selection */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="h-4 w-4 text-emerald-600" />
            <span>Theme Colors</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Choose your preferred application color palette:
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 pt-1">
            {themes.map((t) => {
              const isSelected = (formData.colorTheme || 'emerald') === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    handleInputChange('colorTheme', t.id);
                    document.documentElement.setAttribute('data-color-theme', t.id);
                  }}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'border-emerald-500 bg-slate-50 ring-2 ring-emerald-500/20 dark:bg-slate-800'
                      : 'border-slate-200 hover:border-slate-300 dark:border-slate-700'
                  }`}
                >
                  <div className={`h-8 w-8 rounded-full ${t.bg} shadow-sm flex items-center justify-center text-white`}>
                    {isSelected && <Check className="h-4 w-4" />}
                  </div>
                  <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200">
                    {t.name}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Business Identity & Logo */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Building className="h-4 w-4 text-emerald-600" />
              <span>Business Profile & Company Logo</span>
            </h2>
          </div>

          {/* Logo upload control */}
          <div className="flex flex-col sm:flex-row items-center gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-800/40">
            <div className="relative flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800 overflow-hidden">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt="Business Logo"
                  className="h-full w-full object-contain p-1"
                />
              ) : (
                <HKIcon size={64} />
              )}
            </div>

            <div className="space-y-1.5 text-center sm:text-left flex-1">
              <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Company Brand Logo
              </h4>
              <p className="text-[11px] text-slate-500">
                Shown on printed sale invoices, quotation PDFs, and receipts (PNG, JPG under 2MB).
              </p>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-1">
                <input
                  type="file"
                  ref={logoInputRef}
                  onChange={handleLogoUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => logoInputRef.current?.click()}
                  className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
                >
                  Upload Logo
                </button>
                {formData.logoUrl && (
                  <button
                    type="button"
                    onClick={() => handleInputChange('logoUrl', '')}
                    className="flex items-center gap-1 rounded-xl border border-rose-200 px-2.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Remove</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Business / Firm Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone / Mobile Number *
              </label>
              <input
                type="text"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                required
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Address / Shop Location
              </label>
              <input
                type="text"
                value={formData.address || ''}
                onChange={(e) => handleInputChange('address', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Currency & Financial Preferences */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <span className="text-emerald-600 font-extrabold font-mono">Rs</span>
            <span>Currency & Numbering</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Currency Selection
              </label>
              <select
                value={`${formData.currencySymbol}|${formData.currencyCode}`}
                onChange={(e) => {
                  const [sym, code] = e.target.value.split('|');
                  handleInputChange('currencySymbol', sym);
                  handleInputChange('currencyCode', code);
                }}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-semibold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              >
                <option value="Rs.|PKR">Pakistani Rupee (Rs. / PKR) [Default]</option>
                <option value="$|USD">US Dollar ($ / USD)</option>
                <option value="AED|AED">UAE Dirham (AED)</option>
                <option value="SAR|SAR">Saudi Riyal (SAR)</option>
                <option value="€|EUR">Euro (€ / EUR)</option>
                <option value="£|GBP">British Pound (£ / GBP)</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Currency Symbol
              </label>
              <input
                type="text"
                value={formData.currencySymbol}
                onChange={(e) => handleInputChange('currencySymbol', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono font-bold text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Sale Invoice Prefix
              </label>
              <input
                type="text"
                value={formData.saleInvoicePrefix || 'INV-'}
                onChange={(e) => handleInputChange('saleInvoicePrefix', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Optional Sales Tax Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Percent className="h-4 w-4 text-emerald-600" />
              <span>Sales Tax Information (Optional)</span>
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="isTaxEnabled"
                checked={formData.isTaxEnabled || false}
                onChange={(e) => handleInputChange('isTaxEnabled', e.target.checked)}
                className="h-4 w-4 rounded text-theme focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="isTaxEnabled" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Enable Tax on Bills
              </label>
            </div>
          </div>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            If you are not registered for sales tax, keep this disabled. If enabled, your NTN/STRN will appear on invoices.
          </p>

          {formData.isTaxEnabled && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs pt-1">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  NTN (National Tax No.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 1234567-8"
                  value={formData.ntn || ''}
                  onChange={(e) => handleInputChange('ntn', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  STRN (Sales Tax Reg. No.)
                </label>
                <input
                  type="text"
                  placeholder="e.g. 170012345678"
                  value={formData.strn || ''}
                  onChange={(e) => handleInputChange('strn', e.target.value)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Default Tax Rate (%)
                </label>
                <input
                  type="number"
                  value={formData.defaultTaxPercent || 18}
                  onChange={(e) => handleInputChange('defaultTaxPercent', parseFloat(e.target.value) || 0)}
                  className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono dark:border-slate-700 dark:bg-slate-800 dark:text-white"
                />
              </div>
            </div>
          )}
        </div>

        {/* Manual Bank & Online Account Information */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <CreditCard className="h-4 w-4 text-emerald-600" />
            <span>Manual Bank & Digital Wallet Accounts</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Enter your manual bank details, EasyPaisa, or JazzCash for customers to transfer funds. Printed on invoices and shared via WhatsApp.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Bank Name
              </label>
              <input
                type="text"
                placeholder="e.g. Meezan Bank, HBL, Bank Alfalah"
                value={formData.bankName || ''}
                onChange={(e) => handleInputChange('bankName', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Title
              </label>
              <input
                type="text"
                placeholder="Account Holder / Business Name"
                value={formData.bankAccountTitle || ''}
                onChange={(e) => handleInputChange('bankAccountTitle', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Number
              </label>
              <input
                type="text"
                placeholder="Account number"
                value={formData.bankAccountNumber || ''}
                onChange={(e) => handleInputChange('bankAccountNumber', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                IBAN (24 digits)
              </label>
              <input
                type="text"
                placeholder="PK36MEZN..."
                value={formData.bankIban || ''}
                onChange={(e) => handleInputChange('bankIban', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono uppercase text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                EasyPaisa Mobile Number
              </label>
              <input
                type="text"
                placeholder="03001234567"
                value={formData.easypaisaNumber || ''}
                onChange={(e) => handleInputChange('easypaisaNumber', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                EasyPaisa Account Title
              </label>
              <input
                type="text"
                placeholder="Title on EasyPaisa app"
                value={formData.easypaisaTitle || ''}
                onChange={(e) => handleInputChange('easypaisaTitle', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                JazzCash Mobile Number
              </label>
              <input
                type="text"
                placeholder="03007654321"
                value={formData.jazzcashNumber || ''}
                onChange={(e) => handleInputChange('jazzcashNumber', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs font-mono text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                JazzCash Account Title
              </label>
              <input
                type="text"
                placeholder="Title on JazzCash app"
                value={formData.jazzcashTitle || ''}
                onChange={(e) => handleInputChange('jazzcashTitle', e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-xs text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {/* Security & PIN Lock */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-600" />
              <span>Security & App Lock PIN</span>
            </h2>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="pinToggle"
                checked={isPinEnabled}
                onChange={(e) => setIsPinEnabled(e.target.checked)}
                className="h-4 w-4 rounded text-theme focus:ring-emerald-500 cursor-pointer"
              />
              <label htmlFor="pinToggle" className="text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer">
                Enable Lock PIN
              </label>
            </div>
          </div>

          {isPinEnabled && (
            <div className="max-w-xs text-xs space-y-2">
              <label className="block font-bold text-slate-700 dark:text-slate-300">
                4-Digit Security PIN
              </label>
              <input
                type="password"
                maxLength={6}
                placeholder="e.g. 1234"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                className="w-full rounded-xl border border-slate-200 p-2.5 text-sm font-mono tracking-widest text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </div>
          )}
        </div>

        {/* Save Settings Button */}
        <div className="flex justify-end">
          <button
            type="submit"
            className="flex items-center gap-2 rounded-xl bg-theme px-6 py-2.5 text-xs font-bold text-white shadow-md hover:opacity-95 active:scale-95 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save All Settings</span>
          </button>
        </div>
      </form>

      {/* Database Backup & Restore Section */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Download className="h-4 w-4 text-emerald-600" />
            <span>Backup & Data Safety</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Download your entire company data to save on your device, or restore from a previously downloaded backup.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Download Backup Button (No JSON text shown) */}
          <button
            type="button"
            onClick={handleDownloadBackup}
            className="flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-emerald-700 active:scale-95 transition-all cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Download Backup</span>
          </button>

          {/* Restore Backup File */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleRestoreFile}
            accept=".json"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
          >
            <Upload className="h-4 w-4 text-slate-500" />
            <span>Restore Backup File</span>
          </button>

          {/* Reset Demo Data */}
          <button
            type="button"
            onClick={handleResetDemoData}
            className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 dark:border-rose-900/60 dark:bg-rose-950/40 dark:text-rose-400 ml-auto cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span>Reset to Demo Data</span>
          </button>
        </div>
      </div>

      {/* Guide & Beginner Tips Section below Settings & Backup */}
      <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-5 shadow-sm text-white space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="hidden sm:block">
              <HKIcon size={48} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  Beginner Help
                </span>
                <span className="text-xs text-slate-300">New to Hisab Kitab?</span>
              </div>
              <h3 className="text-base font-bold text-white mt-1">
                Guide & Tips Section
              </h3>
              <p className="text-xs text-slate-300 max-w-lg mt-0.5">
                Step-by-step guides with visual UI mockups covering Tax Invoicing rules, Doc No placement, WhatsApp PDF sharing, and customer khata management.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('guide')}
              className="flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 text-xs font-bold shadow-md shadow-emerald-700/30 transition-all cursor-pointer"
            >
              <BookOpen className="h-4 w-4" />
              <span>Open Guide & Tips</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
