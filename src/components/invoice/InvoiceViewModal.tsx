import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  Share2,
  Copy,
  Ban,
  Download,
  FileText,
  Check,
  Building2,
  Phone,
  Calendar,
  Send,
  MessageSquare,
} from 'lucide-react';
import { Invoice } from '../../types';
import { printInvoiceDocument, downloadInvoiceHtmlFile } from '../../services/printService';
import { downloadInvoicePdf, getInvoicePdfFile } from '../../services/pdfService';

export const InvoiceViewModal: React.FC = () => {
  const {
    viewingInvoice,
    setViewingInvoice,
    cancelInvoice,
    profile,
    formatMoney,
  } = useApp();

  const [copied, setCopied] = useState(false);
  const [showShareOptions, setShowShareOptions] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  if (!viewingInvoice) return null;

  const inv = viewingInvoice;
  const isCancelled = inv.status === 'cancelled';
  const isPaid = inv.status === 'paid';
  const isQuotation = inv.type === 'quotation';
  const isPurchase = inv.type === 'purchase';
  const balanceDue = Math.max(0, inv.grandTotal - inv.amountReceived);

  const hasTaxDetails = Boolean(
    inv.hasTax ||
    (inv.taxTotal && inv.taxTotal > 0) ||
    (profile.ntn && inv.hasTax) ||
    inv.lines?.some(l => (l.taxPercent && l.taxPercent > 0) || (l.taxAmount && l.taxAmount > 0))
  );

  const docBadgeTitle = isQuotation
    ? 'QUOTATION / ESTIMATE'
    : isPurchase
    ? (hasTaxDetails ? 'TAX PURCHASE BILL' : 'PURCHASE BILL')
    : (hasTaxDetails ? 'TAX INVOICE' : 'INVOICE');

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Print to PDF using isolated print engine
  const handlePrint = () => {
    printInvoiceDocument(inv, profile);
  };

  // Generate downloadable standalone PDF file
  const handleDownloadPdf = () => {
    try {
      downloadInvoicePdf(inv, profile);
      showToast('📄 PDF invoice downloaded successfully!');
    } catch (err) {
      console.error('Error generating PDF:', err);
      // Fallback to HTML if PDF fails
      downloadInvoiceHtmlFile(inv, profile);
    }
  };

  // WhatsApp Share Formatter
  const getWhatsAppMessage = () => {
    let msg = `📄 *${docBadgeTitle}: ${inv.invoiceNumber}*\n`;
    msg += `*From:* ${profile.name}\n`;
    if (profile.phone) msg += `*Contact:* ${profile.phone}\n`;
    msg += `*To:* ${inv.partyName}\n`;
    msg += `*Date:* ${inv.date}\n\n`;

    msg += `*ITEMS BREAKDOWN:*\n`;
    inv.lines.forEach((l, i) => {
      msg += `${i + 1}. ${l.itemName} (Qty: ${l.quantity} ${l.unit}) = ${profile.currencySymbol} ${l.totalAmount.toLocaleString()}\n`;
    });

    msg += `\n*Grand Total:* ${profile.currencySymbol} ${inv.grandTotal.toLocaleString()}\n`;
    if (!isQuotation) {
      msg += `*Amount Paid:* ${profile.currencySymbol} ${inv.amountReceived.toLocaleString()}\n`;
      msg += `*Balance Due:* ${profile.currencySymbol} ${balanceDue.toLocaleString()}\n`;
      if (inv.manualPaymentDetails) {
        msg += `*Payment Note:* ${inv.manualPaymentDetails}\n`;
      }
    }

    if (inv.hasTax && profile.ntn) {
      msg += `*NTN:* ${profile.ntn}\n`;
    }

    // Manual Bank / EasyPaisa / JazzCash details
    if (profile.bankName || profile.easypaisaNumber || profile.jazzcashNumber) {
      msg += `\n*PAYMENT DETAILS:*\n`;
      if (profile.bankName && profile.bankAccountNumber) {
        msg += `🏦 *${profile.bankName}*\nTitle: ${profile.bankAccountTitle || profile.name}\nA/C: ${profile.bankAccountNumber}\n`;
        if (profile.bankIban) msg += `IBAN: ${profile.bankIban}\n`;
      }
      if (profile.easypaisaNumber) {
        msg += `📱 *EasyPaisa:* ${profile.easypaisaNumber} (${profile.easypaisaTitle || profile.name})\n`;
      }
      if (profile.jazzcashNumber) {
        msg += `📱 *JazzCash:* ${profile.jazzcashNumber} (${profile.jazzcashTitle || profile.name})\n`;
      }
    }

    msg += `\n📎 Complete PDF Document Attached.\nThank you for choosing ${profile.name}!`;
    return msg;
  };

  // Shares strictly the PDF file on WhatsApp without any detail in text
  const handleShareWhatsAppPdf = async (sendToCustomerOnly = false) => {
    let phoneParam = '';
    if (sendToCustomerOnly && inv.partyPhone) {
      let phone = inv.partyPhone.replace(/\D/g, '');
      if (phone.startsWith('03')) {
        phone = '92' + phone.substring(1);
      }
      phoneParam = `phone=${phone}`;
    }

    const whatsappBaseUrl = phoneParam 
      ? `https://api.whatsapp.com/send?${phoneParam}` 
      : `https://api.whatsapp.com/send`;

    // 1. Try Web Share API with genuine PDF file (strictly without any text message attached)
    try {
      const pdfFile = getInvoicePdfFile(inv, profile);
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `${isQuotation ? 'Quotation' : 'Invoice'} ${inv.invoiceNumber}`,
          // Strictly NO text parameter here: ensures NO text detail is sent along with PDF
        });
        showToast('📄 Shared PDF to WhatsApp successfully!');
        return;
      }
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') {
        return; // User dismissed share sheet
      }
    }

    // 2. Fallback: Automatically download PDF to device and open WhatsApp cleanly without dumping text
    try {
      downloadInvoicePdf(inv, profile);
      showToast(`📄 PDF downloaded! Opening WhatsApp to attach and send...`);
    } catch (e) {
      console.error('PDF generation error:', e);
    }

    // Direct anchor click ensures links open cleanly even inside iframe/sandboxes
    setTimeout(() => {
      const a = document.createElement('a');
      a.href = whatsappBaseUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 400);
  };

  // Share text message breakdown only (when user explicitly requests text summary)
  const handleShareWhatsAppText = (sendToCustomerOnly = false) => {
    const text = getWhatsAppMessage();
    const encoded = encodeURIComponent(text);
    
    let phoneParam = '';
    if (sendToCustomerOnly && inv.partyPhone) {
      let phone = inv.partyPhone.replace(/\D/g, '');
      if (phone.startsWith('03')) {
        phone = '92' + phone.substring(1);
      }
      phoneParam = `phone=${phone}&`;
    }

    const whatsappUrl = `https://api.whatsapp.com/send?${phoneParam}text=${encoded}`;
    const a = document.createElement('a');
    a.href = whatsappUrl;
    a.target = '_blank';
    a.rel = 'noopener noreferrer';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleCopyText = () => {
    const text = getWhatsAppMessage();
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleCancel = () => {
    if (window.confirm(`Are you sure you want to cancel ${inv.invoiceNumber}? Stock and party balances will be restored automatically.`)) {
      cancelInvoice(inv.id);
      setViewingInvoice(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto">
      {/* Toast notification popup */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[70] bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-2xl border border-slate-700 text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Check className="h-4 w-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      <div className="relative w-full max-w-3xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-4 flex flex-col max-h-[94vh]">
        {/* Top Control Bar (Hidden in print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50/95 px-4 sm:px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/95 rounded-t-2xl">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-sm text-slate-800 dark:text-white">
              {inv.invoiceNumber}
            </span>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                isCancelled
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                  : isPaid
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                  : isQuotation
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300'
                  : 'bg-amber-100 text-amber-700 dark:bg-amber-950 dark:text-amber-300'
              }`}
            >
              {inv.status}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Direct Download PDF File */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 sm:px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 cursor-pointer shadow-xs transition-all"
              title="Download sale invoice as a PDF file"
            >
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Download PDF</span>
            </button>

            {/* Print or Save as PDF */}
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 sm:px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
              title="Save as PDF or Print"
            >
              <Printer className="h-4 w-4 text-slate-600 dark:text-slate-300" />
              <span className="hidden sm:inline">Save PDF / Print</span>
              <span className="sm:hidden">Print</span>
            </button>

            {/* Direct WhatsApp Share to Anyone / Any Contact with PDF ONLY (no text details) */}
            <button
              onClick={() => handleShareWhatsAppPdf(false)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer transition-all active:scale-95"
              title="Share clean PDF invoice on WhatsApp (strictly no text details attached)"
            >
              <Share2 className="h-4 w-4" />
              <span>WhatsApp (PDF)</span>
            </button>

            {/* If party phone exists, provide secondary quick action to send PDF to that phone */}
            {inv.partyPhone && (
              <button
                onClick={() => handleShareWhatsAppPdf(true)}
                className="hidden lg:flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-white px-2.5 py-1.5 text-[11px] font-semibold text-emerald-800 hover:bg-emerald-50 dark:border-emerald-700 dark:bg-slate-800 dark:text-emerald-300 cursor-pointer"
                title={`Send clean PDF invoice directly to ${inv.partyName} (${inv.partyPhone})`}
              >
                <Send className="h-3.5 w-3.5 text-emerald-600" />
                <span>To {inv.partyPhone}</span>
              </button>
            )}

            {/* Optional WhatsApp Text Summary (only if user explicitly wants text instead of PDF) */}
            <button
              onClick={() => handleShareWhatsAppText(false)}
              className="hidden sm:flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 cursor-pointer"
              title="Send bill breakdown as WhatsApp text message"
            >
              <MessageSquare className="h-3.5 w-3.5 text-emerald-600" />
              <span>Text Only</span>
            </button>

            {/* Copy bill text */}
            <button
              onClick={handleCopyText}
              className="rounded-xl border border-slate-200 p-2 text-slate-600 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 cursor-pointer"
              title="Copy bill details text"
            >
              {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            </button>

            {!isCancelled && (
              <button
                onClick={handleCancel}
                title="Cancel Invoice & Restore Stock"
                className="rounded-xl border border-rose-200 p-2 text-rose-600 hover:bg-rose-50 dark:border-rose-900/60 dark:hover:bg-rose-950/40 cursor-pointer"
              >
                <Ban className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => setViewingInvoice(null)}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Invoice Printable Document Sheet */}
        <div className="print-container flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 font-sans">
          {/* Cancelled watermark banner */}
          {isCancelled && (
            <div className="mb-4 rounded-xl border border-rose-300 bg-rose-50 p-3 text-center text-xs font-bold text-rose-700 uppercase tracking-widest">
              *** VOID / CANCELLED BILL (Stock & Balances Restored) ***
            </div>
          )}

          {/* Business Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-5 gap-4">
            <div className="flex items-start gap-3.5">
              {profile.logoUrl ? (
                <img
                  src={profile.logoUrl}
                  alt="Business Logo"
                  className="h-14 w-14 object-contain rounded-xl border border-slate-200"
                />
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-900 text-white font-extrabold text-lg">
                  {profile.name.substring(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                  {profile.name}
                </h1>
                <p className="text-xs text-slate-600 max-w-sm mt-0.5">{profile.address}</p>
                <div className="mt-1 flex flex-wrap gap-x-3 text-[11px] text-slate-500">
                  {profile.phone && <span>Ph: {profile.phone}</span>}
                  {inv.hasTax && profile.ntn && (
                    <span>NTN: <strong className="text-slate-800">{profile.ntn}</strong></span>
                  )}
                  {inv.hasTax && profile.strn && (
                    <span>STRN: <strong className="text-slate-800">{profile.strn}</strong></span>
                  )}
                </div>
              </div>
            </div>

            <div className="sm:text-right">
              <span
                className={`inline-block rounded-md px-2.5 py-1 text-xs font-extrabold tracking-wider uppercase ${
                  isQuotation
                    ? 'bg-indigo-100 text-indigo-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {docBadgeTitle}
              </span>
              <p className="mt-2 text-xs font-bold text-slate-500 uppercase">
                {isQuotation ? 'Quote No:' : 'Invoice No:'}
              </p>
              <p className="font-mono font-extrabold text-sm sm:text-base text-slate-900">
                {inv.invoiceNumber}
              </p>
              <p className="text-xs text-slate-500 mt-1">Date: <strong>{inv.date}</strong></p>
              {inv.dueDate && (
                <p className="text-xs text-slate-500">Due: <strong>{inv.dueDate}</strong></p>
              )}
            </div>
          </div>

          {/* Party Billed To */}
          <div className="my-5 rounded-xl bg-slate-50 p-4 border border-slate-200/80 flex flex-col sm:flex-row justify-between gap-4 text-xs">
            <div>
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                Billed To / Customer:
              </span>
              <h3 className="font-extrabold text-slate-900 text-sm mt-0.5">{inv.partyName}</h3>
              {inv.partyAddress && <p className="text-slate-600 mt-0.5">{inv.partyAddress}</p>}
              {inv.partyPhone && <p className="text-slate-600 mt-0.5">Phone: {inv.partyPhone}</p>}
              {inv.hasTax && inv.partyNtn && (
                <p className="text-slate-600 font-mono mt-0.5">NTN/CNIC: {inv.partyNtn}</p>
              )}
            </div>

            <div className="sm:text-right">
              <span className="font-bold text-slate-400 uppercase text-[10px] tracking-wider block">
                Payment Mode:
              </span>
              <span className="font-bold text-slate-800 uppercase mt-0.5 block">
                {inv.paymentMode.replace('_', ' ')}
              </span>
              {inv.manualPaymentDetails && (
                <p className="text-slate-600 mt-0.5 max-w-xs font-mono text-[11px]">
                  Ref: {inv.manualPaymentDetails}
                </p>
              )}
            </div>
          </div>

          {/* Items Table */}
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-200 text-slate-500 uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-2 w-8 text-center">#</th>
                <th className="py-2.5 px-3">Item Description</th>
                <th className="py-2.5 px-2 text-right">Qty</th>
                <th className="py-2.5 px-2 text-right">Rate</th>
                {inv.hasTax && <th className="py-2.5 px-2 text-center">Tax %</th>}
                <th className="py-2.5 px-3 text-right">Amount ({profile.currencySymbol})</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {inv.lines.map((l, i) => (
                <tr key={l.id}>
                  <td className="py-2.5 px-2 text-center text-slate-400 font-mono">{i + 1}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-bold text-slate-800 block">{l.itemName}</span>
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono">
                    {l.quantity} {l.unit}
                  </td>
                  <td className="py-2.5 px-2 text-right font-mono font-medium">
                    {formatMoney(l.rate)}
                  </td>
                  {inv.hasTax && (
                    <td className="py-2.5 px-2 text-center font-mono">
                      {l.taxPercent}%
                    </td>
                  )}
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                    {formatMoney(l.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Summary Totals & Manual Bank Info */}
          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start gap-6 border-t border-slate-200 pt-5">
            {/* Left: Manual Bank & Easypaisa Details */}
            <div className="w-full sm:max-w-xs space-y-3">
              {(profile.bankName || profile.easypaisaNumber || profile.jazzcashNumber) && (
                <div className="rounded-xl bg-emerald-50/60 p-3.5 border border-emerald-100 text-xs">
                  <h4 className="font-bold text-emerald-900 mb-1.5">
                    Bank & Online Payment Details:
                  </h4>
                  {profile.bankName && (
                    <div className="text-[11px] text-emerald-800 space-y-0.5">
                      <p><strong>Bank:</strong> {profile.bankName}</p>
                      {profile.bankAccountTitle && <p><strong>Title:</strong> {profile.bankAccountTitle}</p>}
                      {profile.bankAccountNumber && <p><strong>A/C:</strong> {profile.bankAccountNumber}</p>}
                      {profile.bankIban && <p><strong>IBAN:</strong> {profile.bankIban}</p>}
                    </div>
                  )}
                  {(profile.easypaisaNumber || profile.jazzcashNumber) && (
                    <div className="mt-2 pt-2 border-t border-emerald-200 text-[11px] text-emerald-800 space-y-0.5">
                      {profile.easypaisaNumber && (
                        <p><strong>EasyPaisa:</strong> {profile.easypaisaNumber} ({profile.easypaisaTitle || profile.name})</p>
                      )}
                      {profile.jazzcashNumber && (
                        <p><strong>JazzCash:</strong> {profile.jazzcashNumber} ({profile.jazzcashTitle || profile.name})</p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {inv.terms && (
                <div className="text-[11px] text-slate-500">
                  <h5 className="font-bold uppercase tracking-wider text-[10px] text-slate-400 mb-1">
                    Terms & Conditions:
                  </h5>
                  <p className="whitespace-pre-line leading-relaxed">{inv.terms}</p>
                </div>
              )}
            </div>

            {/* Right: Calculated Totals */}
            <div className="w-full sm:w-64 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span className="font-mono font-bold">{formatMoney(inv.subtotal)}</span>
              </div>

              {inv.discountTotal > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <span>Discount:</span>
                  <span className="font-mono font-bold">-{formatMoney(inv.discountTotal)}</span>
                </div>
              )}

              {inv.hasTax && inv.taxTotal > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Sales Tax:</span>
                  <span className="font-mono font-bold">+{formatMoney(inv.taxTotal)}</span>
                </div>
              )}

              {inv.additionalCharges > 0 && (
                <div className="flex justify-between text-slate-600">
                  <span>Additional Charges:</span>
                  <span className="font-mono font-bold">+{formatMoney(inv.additionalCharges)}</span>
                </div>
              )}

              <div className="flex justify-between pt-2 border-t-2 border-slate-200 font-extrabold text-sm sm:text-base text-slate-900">
                <span>Grand Total:</span>
                <span className="font-mono text-emerald-700">
                  {formatMoney(inv.grandTotal)}
                </span>
              </div>

              {!isQuotation && (
                <>
                  <div className="flex justify-between text-slate-600 pt-1">
                    <span>Amount Paid:</span>
                    <span className="font-mono font-bold">{formatMoney(inv.amountReceived)}</span>
                  </div>

                  <div className="flex justify-between text-xs font-bold pt-1 border-t border-slate-100">
                    <span className="text-slate-700">Balance Due:</span>
                    <span
                      className={`font-mono ${
                        balanceDue > 0 ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {formatMoney(balanceDue)}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Footer signature note */}
          <div className="mt-8 pt-4 border-t border-slate-100 flex justify-between items-end text-[11px] text-slate-400">
            <div>
              <p>Thank you for your business!</p>
              <p className="text-[9px]">HISAB KITAB Accounting Suite</p>
            </div>
            <div className="text-center w-36">
              <div className="border-b border-slate-300 pb-8"></div>
              <span className="text-[10px] mt-1 block">Authorized Signature</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
