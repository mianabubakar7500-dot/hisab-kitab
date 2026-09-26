import { Invoice, BusinessProfile, Party, StockMovement } from '../types';

export function generateInvoiceHtml(inv: Invoice, profile: BusinessProfile): string {
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
  const docTitle = `${isQuotation ? 'Quotation' : isPurchase ? 'Purchase_Bill' : (hasTaxDetails ? 'Tax_Invoice' : 'Invoice')}_${inv.invoiceNumber}`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>${docTitle}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #0f172a;
      background: #ffffff;
      padding: 24px;
      font-size: 13px;
      line-height: 1.5;
    }
    .invoice-card {
      max-width: 800px;
      margin: 0 auto;
      background: #ffffff;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #059669;
      padding-bottom: 18px;
      margin-bottom: 18px;
    }
    .biz-brand {
      display: flex;
      gap: 14px;
      align-items: center;
    }
    .biz-logo {
      width: 60px;
      height: 60px;
      border-radius: 10px;
      object-fit: cover;
      border: 1px solid #e2e8f0;
    }
    .biz-logo-placeholder {
      width: 54px;
      height: 54px;
      border-radius: 10px;
      background: #059669;
      color: #ffffff;
      font-size: 20px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .biz-name {
      font-size: 22px;
      font-weight: 800;
      color: #064e3b;
      line-height: 1.2;
    }
    .biz-details {
      font-size: 11px;
      color: #475569;
      margin-top: 3px;
      line-height: 1.4;
    }
    .doc-badge-container {
      text-align: right;
    }
    .doc-badge {
      display: inline-block;
      background: #ecfdf5;
      color: #047857;
      border: 1px solid #a7f3d0;
      padding: 4px 10px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 800;
      letter-spacing: 0.5px;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .doc-meta {
      font-size: 12px;
      color: #334155;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 12px 16px;
      margin-bottom: 20px;
    }
    .meta-title {
      font-size: 10px;
      text-transform: uppercase;
      font-weight: 700;
      color: #64748b;
      margin-bottom: 3px;
    }
    .meta-val {
      font-size: 13px;
      font-weight: 700;
      color: #1e293b;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 20px;
    }
    th {
      background: #059669;
      color: #ffffff;
      font-weight: 700;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      padding: 8px 10px;
      text-align: left;
    }
    td {
      padding: 8px 10px;
      border-bottom: 1px solid #e2e8f0;
      font-size: 12px;
    }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .summary-section {
      display: flex;
      justify-content: flex-end;
      margin-bottom: 20px;
    }
    .summary-table {
      width: 300px;
    }
    .summary-row {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      font-size: 12px;
      color: #475569;
    }
    .summary-row.grand-total {
      border-top: 2px solid #059669;
      margin-top: 6px;
      padding-top: 6px;
      font-size: 16px;
      font-weight: 800;
      color: #064e3b;
    }
    .summary-row.due {
      color: #dc2626;
      font-weight: 700;
      font-size: 13px;
    }
    .bank-box {
      background: #f0fdf4;
      border: 1px dashed #86efac;
      border-radius: 8px;
      padding: 12px 14px;
      margin-bottom: 16px;
      font-size: 11px;
      color: #166534;
      line-height: 1.5;
    }
    .bank-box strong {
      color: #14532d;
    }
    .terms-box {
      border-top: 1px solid #e2e8f0;
      padding-top: 12px;
      font-size: 11px;
      color: #64748b;
      line-height: 1.4;
    }
    .terms-box h4 {
      font-size: 11px;
      font-weight: 700;
      color: #334155;
      margin-bottom: 4px;
    }
    .footer-note {
      text-align: center;
      margin-top: 20px;
      font-size: 11px;
      color: #94a3b8;
    }
    @media print {
      body {
        padding: 0;
        background: transparent;
      }
      .invoice-card {
        max-width: 100%;
        margin: 0;
      }
      @page {
        margin: 1.2cm;
        size: auto;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-card">
    <div class="header">
      <div class="biz-brand">
        ${profile.logoUrl ? `<img src="${profile.logoUrl}" class="biz-logo" alt="Logo" />` : `<div class="biz-logo-placeholder">${profile.name.substring(0, 2).toUpperCase()}</div>`}
        <div>
          <h1 class="biz-name">${profile.name}</h1>
          <div class="biz-details">
            ${profile.address ? `<div>${profile.address}</div>` : ''}
            <div>Phone: <strong>${profile.phone}</strong> ${profile.email ? `| Email: ${profile.email}` : ''}</div>
            ${inv.hasTax && profile.ntn ? `<div>NTN: <strong>${profile.ntn}</strong> ${profile.strn ? `| STRN: <strong>${profile.strn}</strong>` : ''}</div>` : ''}
          </div>
        </div>
      </div>
      <div class="doc-badge-container">
        <div class="doc-badge">${docBadgeTitle}</div>
        <div class="doc-meta">
          <div><strong>Bill No:</strong> ${inv.invoiceNumber}</div>
          <div><strong>Date:</strong> ${inv.date}</div>
          ${inv.dueDate ? `<div><strong>Due Date:</strong> ${inv.dueDate}</div>` : ''}
        </div>
      </div>
    </div>

    <div class="meta-grid">
      <div>
        <div class="meta-title">Billed To (Customer / Party)</div>
        <div class="meta-val">${inv.partyName}</div>
        <div class="biz-details">
          ${inv.partyPhone ? `<div>Ph: ${inv.partyPhone}</div>` : ''}
          ${inv.partyAddress ? `<div>${inv.partyAddress}</div>` : ''}
          ${inv.hasTax && inv.partyNtn ? `<div>NTN: ${inv.partyNtn}</div>` : ''}
        </div>
      </div>
      <div style="text-align: right;">
        <div class="meta-title">Payment Status</div>
        <div class="meta-val" style="color: ${inv.status === 'paid' ? '#059669' : inv.status === 'cancelled' ? '#dc2626' : '#d97706'}; text-transform: uppercase;">
          ${inv.status}
        </div>
        <div class="biz-details">
          ${inv.paymentMode ? `<div>Payment Mode: <strong>${inv.paymentMode.toUpperCase()}</strong></div>` : ''}
          ${inv.manualPaymentDetails ? `<div>Note: ${inv.manualPaymentDetails}</div>` : ''}
        </div>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th style="width: 35px;" class="text-center">#</th>
          <th>Item & Description</th>
          <th style="width: 70px;" class="text-center">Qty</th>
          <th style="width: 90px;" class="text-right">Rate</th>
          ${inv.hasTax ? '<th style="width: 60px;" class="text-right">Tax</th>' : ''}
          <th style="width: 110px;" class="text-right">Total (${profile.currencySymbol})</th>
        </tr>
      </thead>
      <tbody>
        ${inv.lines.map((l, idx) => `
          <tr>
            <td class="text-center">${idx + 1}</td>
            <td><strong>${l.itemName}</strong></td>
            <td class="text-center">${l.quantity} ${l.unit || 'Pcs'}</td>
            <td class="text-right">${profile.currencySymbol} ${l.rate.toLocaleString()}</td>
            ${inv.hasTax ? `<td class="text-right">${l.taxPercent || 0}%</td>` : ''}
            <td class="text-right"><strong>${profile.currencySymbol} ${l.totalAmount.toLocaleString()}</strong></td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="summary-section">
      <div class="summary-table">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>${profile.currencySymbol} ${inv.subtotal.toLocaleString()}</span>
        </div>
        ${inv.discountTotal > 0 ? `
          <div class="summary-row" style="color: #059669;">
            <span>Discount:</span>
            <span>-${profile.currencySymbol} ${inv.discountTotal.toLocaleString()}</span>
          </div>
        ` : ''}
        ${inv.hasTax && inv.taxTotal > 0 ? `
          <div class="summary-row">
            <span>Sales Tax:</span>
            <span>+${profile.currencySymbol} ${inv.taxTotal.toLocaleString()}</span>
          </div>
        ` : ''}
        ${inv.additionalCharges > 0 ? `
          <div class="summary-row">
            <span>Additional Charges:</span>
            <span>+${profile.currencySymbol} ${inv.additionalCharges.toLocaleString()}</span>
          </div>
        ` : ''}
        <div class="summary-row grand-total">
          <span>Grand Total:</span>
          <span>${profile.currencySymbol} ${inv.grandTotal.toLocaleString()}</span>
        </div>
        ${!isQuotation ? `
          <div class="summary-row">
            <span>Amount Paid:</span>
            <span>${profile.currencySymbol} ${inv.amountReceived.toLocaleString()}</span>
          </div>
          <div class="summary-row due">
            <span>Balance Due:</span>
            <span>${profile.currencySymbol} ${balanceDue.toLocaleString()}</span>
          </div>
        ` : ''}
      </div>
    </div>

    ${(profile.bankName || profile.easypaisaNumber || profile.jazzcashNumber) ? `
      <div class="bank-box">
        <strong>Bank & Online Transfer Account:</strong><br />
        ${profile.bankName ? `Bank: <strong>${profile.bankName}</strong> | Title: <strong>${profile.bankAccountTitle || profile.name}</strong> | A/C: <strong>${profile.bankAccountNumber || ''}</strong> ${profile.bankIban ? `| IBAN: <strong>${profile.bankIban}</strong>` : ''}<br />` : ''}
        ${profile.easypaisaNumber ? `EasyPaisa: <strong>${profile.easypaisaNumber}</strong> (${profile.easypaisaTitle || profile.name}) &nbsp; ` : ''}
        ${profile.jazzcashNumber ? `JazzCash: <strong>${profile.jazzcashNumber}</strong> (${profile.jazzcashTitle || profile.name})` : ''}
      </div>
    ` : ''}

    ${inv.terms || profile.termsConditions ? `
      <div class="terms-box">
        <h4>Terms & Conditions:</h4>
        <p style="white-space: pre-line;">${inv.terms || profile.termsConditions}</p>
      </div>
    ` : ''}

    <div class="footer-note">
      <p>${inv.notes || 'Thank you for your business!'}</p>
      <p style="font-size: 10px; margin-top: 4px; color: #cbd5e1;">Generated by HISAB KITAB - Business Accounting</p>
    </div>
  </div>
</body>
</html>`;
}

/**
 * Robust print helper: writes complete HTML into a hidden iframe and calls window.print()
 * This bypasses all modal backdrops, screen boundaries, and iframe clipping!
 */
export function printInvoiceDocument(inv: Invoice, profile: BusinessProfile): void {
  const html = generateInvoiceHtml(inv, profile);
  printHtmlString(html);
}

export function printHtmlString(htmlContent: string): void {
  // Create temporary invisible iframe
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('title', 'Print Document Frame');

  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    // Fallback to standard window.print if iframe not available
    window.print();
    return;
  }

  doc.open();
  doc.write(htmlContent);
  doc.close();

  // Give iframe fonts and styles time to calculate
  setTimeout(() => {
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch {
      window.print();
    } finally {
      setTimeout(() => {
        if (document.body.contains(iframe)) {
          document.body.removeChild(iframe);
        }
      }, 2000);
    }
  }, 350);
}

/**
 * Downloads a standalone HTML receipt ready for printing or offline PDF saving
 */
export function downloadInvoiceHtmlFile(inv: Invoice, profile: BusinessProfile): void {
  const isQuotation = inv.type === 'quotation';
  const isPurchase = inv.type === 'purchase';
  const fileName = `${isQuotation ? 'Quotation' : isPurchase ? 'Purchase_Bill' : 'Invoice'}_${inv.invoiceNumber}.html`;

  const html = generateInvoiceHtml(inv, profile);
  const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
