import React, { useRef, useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  X,
  Printer,
  Share2,
  Send,
  Download,
  Check,
} from 'lucide-react';
import { Party } from '../../types';
import { printHtmlString } from '../../services/printService';
import { downloadLedgerPdf, getLedgerPdfFile } from '../../services/pdfService';

interface PartyLedgerModalProps {
  party: Party | null;
  onClose: () => void;
}

export const PartyLedgerModal: React.FC<PartyLedgerModalProps> = ({
  party,
  onClose,
}) => {
  const { invoices, payments, formatMoney, profile, setViewingInvoice } = useApp();

  if (!party) return null;

  // Filter transactions for this party
  const partyInvoices = invoices.filter((i) => i.partyId === party.id);
  const partyPayments = payments.filter((p) => p.partyId === party.id);

  // Combine and sort chronologically
  const txHistory = [
    ...partyInvoices.map((inv) => ({
      id: inv.id,
      date: inv.date,
      type: inv.type,
      ref: inv.invoiceNumber,
      debit: inv.type === 'sale' ? inv.grandTotal : 0,
      credit: inv.type === 'purchase' || inv.type === 'sale_return' ? inv.grandTotal : 0,
      note: inv.notes || '',
      status: inv.status,
      rawInvoice: inv,
    })),
    ...partyPayments.map((pay) => ({
      id: pay.id,
      date: pay.date,
      type: 'payment',
      ref: pay.mode.toUpperCase(),
      debit: pay.direction === 'out' ? pay.amount : 0, // When we pay supplier, debited
      credit: pay.direction === 'in' ? pay.amount : 0, // When customer pays us, credited
      note: pay.referenceNote || 'Payment received/paid',
      status: 'completed',
      rawInvoice: undefined,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Compute running balance starting from opening balance
  let runningBal = party.openingBalanceType === 'to_collect' ? party.openingBalance : -party.openingBalance;
  const ledgerRows = txHistory.map((item) => {
    if (item.status !== 'cancelled') {
      runningBal = runningBal + item.debit - item.credit;
    }
    return {
      ...item,
      balanceAfter: runningBal,
    };
  });

  const ledgerPrintRef = useRef<HTMLDivElement>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleDownloadPdf = () => {
    try {
      downloadLedgerPdf(party, ledgerRows, profile);
      showToast('📄 Party ledger PDF downloaded successfully!');
    } catch (e) {
      console.error('Error generating ledger PDF:', e);
    }
  };

  const handlePrint = () => {
    if (ledgerPrintRef.current) {
      const content = ledgerPrintRef.current.innerHTML;
      const html = `<!DOCTYPE html>
<html>
<head>
  <title>Party_Statement_${party.name}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; color: #0f172a; padding: 24px; font-size: 12px; }
    h1 { font-size: 20px; color: #064e3b; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-top: 16px; margin-bottom: 20px; }
    th { background: #059669; color: white; padding: 8px 10px; text-align: left; font-size: 11px; }
    td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    @media print { body { padding: 0; } @page { margin: 1.2cm; } }
  </style>
</head>
<body>
  ${content}
</body>
</html>`;
      printHtmlString(html);
    } else {
      window.print();
    }
  };

  const handleWhatsAppStatement = async (sendToPartyOnly = false) => {
    const bankDetails = profile.bankName
      ? `Bank: ${profile.bankName} | A/C: ${profile.bankAccountNumber || ''} | Title: ${profile.bankAccountTitle || ''}`
      : '';
    const mobileWallet = profile.easypaisaNumber || profile.jazzcashNumber
      ? `Mobile Account: ${profile.easypaisaNumber || profile.jazzcashNumber}`
      : '';

    const text = `📄 *PARTY STATEMENT: ${party.name}*
From: ${profile.name}
Opening Balance: ${formatMoney(party.openingBalance)} (${party.openingBalanceType === 'to_collect' ? 'To Collect' : 'To Pay'})
Current Outstanding Balance: ${formatMoney(party.currentBalance)} ${party.currentBalance > 0 ? '(Pending Collection)' : '(To Pay)'}
${bankDetails ? `\nBank Details: ${bankDetails}` : ''}${mobileWallet ? `\n${mobileWallet}` : ''}
\n📎 Full Ledger Statement PDF Attached.
Thank you!`;

    let phoneParam = '';
    if (sendToPartyOnly && party.phone) {
      let cleaned = party.phone.replace(/\D/g, '');
      if (cleaned.startsWith('03')) cleaned = '92' + cleaned.substring(1);
      phoneParam = `phone=${cleaned}`;
    }
    const cleanWhatsAppUrl = phoneParam ? `https://api.whatsapp.com/send?${phoneParam}` : `https://api.whatsapp.com/send`;

    // Try Web Share API with PDF file strictly without text details
    try {
      const pdfFile = getLedgerPdfFile(party, ledgerRows, profile);
      if (navigator.canShare && navigator.canShare({ files: [pdfFile] })) {
        await navigator.share({
          files: [pdfFile],
          title: `Statement ${party.name}`,
          // No text parameter: sends clean PDF only without text breakdown
        });
        showToast('📄 Shared ledger PDF successfully!');
        return;
      }
    } catch (shareErr: any) {
      if (shareErr.name === 'AbortError') {
        return;
      }
    }

    // Fallback: download PDF and open WhatsApp cleanly
    try {
      downloadLedgerPdf(party, ledgerRows, profile);
      showToast(`📄 PDF statement downloaded! Opening WhatsApp...`);
    } catch (e) {
      console.error(e);
    }

    setTimeout(() => {
      const a = document.createElement('a');
      a.href = cleanWhatsAppUrl;
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }, 400);
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

      <div className="relative w-full max-w-4xl rounded-2xl bg-white shadow-2xl dark:bg-slate-900 border border-slate-200 dark:border-slate-800 my-4 flex flex-col max-h-[92vh]">
        {/* Top Control Bar (Hidden in print) */}
        <div className="no-print flex items-center justify-between border-b border-slate-200 bg-slate-50/90 px-6 py-3.5 dark:border-slate-800 dark:bg-slate-800/90">
          <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {party.name} - Ledger Statement
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {party.phone ? `Ph: ${party.phone} • ` : ''}
                Balance:{' '}
                <strong
                  className={`font-mono ${
                    party.currentBalance > 0
                      ? 'text-emerald-600 dark:text-emerald-400'
                      : party.currentBalance < 0
                      ? 'text-rose-600 dark:text-rose-400'
                      : 'text-slate-600'
                  }`}
                >
                  {formatMoney(party.currentBalance)}{' '}
                  {party.currentBalance > 0 ? '(You will receive)' : party.currentBalance < 0 ? '(You will pay)' : '(Settled)'}
                </strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Download PDF Statement */}
            <button
              onClick={handleDownloadPdf}
              className="flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 cursor-pointer shadow-xs transition-all"
              title="Download ledger statement as a PDF file"
            >
              <Download className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              <span>Download PDF</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </button>

            <button
              onClick={() => handleWhatsAppStatement(false)}
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 shadow-sm cursor-pointer transition-all active:scale-95"
              title="Share PDF statement on WhatsApp with any contact or group"
            >
              <Share2 className="h-4 w-4" />
              <span>WhatsApp (PDF)</span>
            </button>

            {party.phone && (
              <button
                onClick={() => handleWhatsAppStatement(true)}
                className="hidden sm:flex items-center gap-1.5 rounded-xl border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-xs font-semibold text-emerald-800 hover:bg-emerald-100 dark:border-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 cursor-pointer"
                title={`Send PDF statement directly to ${party.phone}`}
              >
                <Send className="h-3.5 w-3.5" />
                <span>To {party.phone}</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-600 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Ledger Sheet */}
        <div ref={ledgerPrintRef} className="print-container flex-1 overflow-y-auto p-6 sm:p-8 bg-white text-slate-900 dark:bg-slate-900 dark:text-white font-sans">
          {/* Statement Header */}
          <div className="flex justify-between items-start border-b border-slate-200 dark:border-slate-800 pb-4 mb-4">
            <div>
              <h1 className="text-lg font-extrabold text-slate-900 dark:text-white">
                {profile.name}
              </h1>
              <p className="text-xs text-slate-500">{profile.address}</p>
              {profile.ntn && (
                <p className="text-xs text-slate-500">NTN: {profile.ntn}</p>
              )}
            </div>
            <div className="text-right">
              <span className="rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                PARTY LEDGER
              </span>
              <p className="mt-1 text-xs text-slate-500">Date: {new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Party Card */}
          <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4 mb-5 dark:border-slate-800 dark:bg-slate-800/40 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Party Name:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">{party.name}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Contact:</span>
              <span className="text-slate-700 dark:text-slate-300">{party.phone || 'N/A'}</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Opening Balance:</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                {formatMoney(party.openingBalance)} ({party.openingBalanceType})
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Closing Balance:</span>
              <span className="font-mono font-bold text-slate-900 dark:text-white">
                {formatMoney(party.currentBalance)}
              </span>
            </div>
          </div>

          {/* Ledger Table */}
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                <tr>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Type / Ref</th>
                  <th className="py-2.5 px-3">Particulars / Note</th>
                  <th className="py-2.5 px-3 text-right">Debit (+)</th>
                  <th className="py-2.5 px-3 text-right">Credit (-)</th>
                  <th className="py-2.5 px-3 text-right font-bold">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {/* Opening Balance Row */}
                <tr className="bg-slate-50/40 dark:bg-slate-800/20 font-semibold">
                  <td className="py-2.5 px-3 text-slate-400 font-mono">--</td>
                  <td className="py-2.5 px-3">Opening Balance</td>
                  <td className="py-2.5 px-3 text-slate-500">Initial ledger carry-forward</td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {party.openingBalanceType === 'to_collect' ? formatMoney(party.openingBalance) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono">
                    {party.openingBalanceType === 'to_pay' ? formatMoney(party.openingBalance) : '-'}
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-800 dark:text-slate-200">
                    {formatMoney(
                      party.openingBalanceType === 'to_collect' ? party.openingBalance : -party.openingBalance
                    )}
                  </td>
                </tr>

                {ledgerRows.map((row) => (
                  <tr
                    key={row.id}
                    className={`hover:bg-slate-50/60 dark:hover:bg-slate-800/40 ${
                      row.status === 'cancelled' ? 'opacity-40 line-through' : ''
                    }`}
                  >
                    <td className="py-2.5 px-3 font-mono text-slate-500">{row.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-800 dark:text-slate-200">
                      {row.rawInvoice ? (
                        <button
                          onClick={() => {
                            setViewingInvoice(row.rawInvoice!);
                            onClose();
                          }}
                          className="text-theme hover:underline cursor-pointer"
                        >
                          {row.ref}
                        </button>
                      ) : (
                        row.ref
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">{row.note}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white">
                      {row.debit > 0 ? formatMoney(row.debit) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-900 dark:text-white">
                      {row.credit > 0 ? formatMoney(row.credit) : '-'}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                      {formatMoney(row.balanceAfter)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
