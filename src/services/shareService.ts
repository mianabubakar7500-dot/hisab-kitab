import { Invoice, BusinessProfile, Party } from '../types';
import { generateInvoicePdf, generateLedgerPdf, downloadInvoicePdf, downloadLedgerPdf } from './pdfService';

/**
 * Checks if the app is currently running inside the native Android APK environment
 * with the AndroidBridge interface injected.
 */
export function isNativeAndroid(): boolean {
  if (typeof window === 'undefined') return false;
  const bridge = (window as any).AndroidBridge;
  return Boolean(bridge && typeof bridge.sharePdfBase64 === 'function');
}

/**
 * Universal Android-ready PDF sharing service.
 * Supports:
 * 1. Native Android APK via AndroidBridge (FileProvider -> Intent.ACTION_SEND -> Native Share Sheet)
 * 2. Mobile Web / PWA / WebAPK via navigator.share({ files: [file] })
 * 3. Fallback: Automatic download to device storage + instructions
 */
export async function sharePdfInvoice(
  inv: Invoice,
  profile: BusinessProfile,
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<boolean> {
  const isQuotation = inv.type === 'quotation';
  const prefix = isQuotation ? 'Quotation' : inv.type === 'purchase' ? 'Purchase_Bill' : 'Invoice';
  const fileName = `${prefix}_${inv.invoiceNumber}.pdf`;
  const title = `${isQuotation ? 'Quotation' : 'Invoice'} ${inv.invoiceNumber} - ${profile.name}`;

  try {
    const doc = generateInvoicePdf(inv, profile);

    // 1. Try Native Android Bridge (APK environment)
    if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
      const bridge = (window as any).AndroidBridge;
      if (typeof bridge.sharePdfBase64 === 'function') {
        const dataUri = doc.output('datauristring');
        const base64Data = dataUri.split(',')[1];
        bridge.sharePdfBase64(base64Data, fileName, title);
        onFeedback?.('Opening Android Share Sheet...');
        return true;
      }
    }

    // 2. Try Standard Web Share API with File (Supported in Chrome Android & WebAPK)
    const blob = doc.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title,
        });
        onFeedback?.('Shared successfully!');
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          // User closed share sheet intentionally
          return true;
        }
        console.warn('navigator.share failed, trying fallback:', err);
      }
    }

    // 3. Fallback: Save/Download PDF file to device
    downloadInvoicePdf(inv, profile);
    onFeedback?.(`PDF downloaded as ${fileName}. You can share it directly.`);
    return true;
  } catch (error: any) {
    console.error('Failed to share PDF invoice:', error);
    onFeedback?.('Could not share PDF. Please try again.', true);
    return false;
  }
}

/**
 * Universal Android-ready PDF sharing service for Party Ledgers
 */
export async function sharePdfLedger(
  party: Party,
  ledgerRows: Array<any>,
  profile: BusinessProfile,
  onFeedback?: (msg: string, isError?: boolean) => void
): Promise<boolean> {
  const safeName = party.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, '_');
  const fileName = `Ledger_${safeName}.pdf`;
  const title = `Ledger Statement - ${party.name} (${profile.name})`;

  try {
    const doc = generateLedgerPdf(party, ledgerRows, profile);

    // 1. Try Native Android Bridge (APK environment)
    if (typeof window !== 'undefined' && (window as any).AndroidBridge) {
      const bridge = (window as any).AndroidBridge;
      if (typeof bridge.sharePdfBase64 === 'function') {
        const dataUri = doc.output('datauristring');
        const base64Data = dataUri.split(',')[1];
        bridge.sharePdfBase64(base64Data, fileName, title);
        onFeedback?.('Opening Android Share Sheet...');
        return true;
      }
    }

    // 2. Try Standard Web Share API with File
    const blob = doc.output('blob');
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title,
        });
        onFeedback?.('Shared successfully!');
        return true;
      } catch (err: any) {
        if (err.name === 'AbortError') {
          return true;
        }
        console.warn('navigator.share failed, trying fallback:', err);
      }
    }

    // 3. Fallback: Save/Download PDF to device
    downloadLedgerPdf(party, ledgerRows, profile);
    onFeedback?.(`Ledger PDF downloaded as ${fileName}`);
    return true;
  } catch (error: any) {
    console.error('Failed to share ledger PDF:', error);
    onFeedback?.('Could not share ledger PDF. Please try again.', true);
    return false;
  }
}
