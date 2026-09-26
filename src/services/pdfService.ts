import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice, BusinessProfile, Party } from '../types';

/**
 * Creates a professional PDF document for an Invoice / Quotation / Bill
 */
export function generateInvoicePdf(inv: Invoice, profile: BusinessProfile): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;
  let currentY = 16;

  const isQuotation = inv.type === 'quotation';
  const isPurchase = inv.type === 'purchase';
  const balanceDue = Math.max(0, inv.grandTotal - inv.amountReceived);

  // Check if invoice has tax details
  const hasTaxDetails = Boolean(
    inv.hasTax ||
    (inv.taxTotal && inv.taxTotal > 0) ||
    (profile.ntn && inv.hasTax) ||
    inv.lines?.some(l => (l.taxPercent && l.taxPercent > 0) || (l.taxAmount && l.taxAmount > 0))
  );

  const docTitle = isQuotation
    ? 'QUOTATION / ESTIMATE'
    : isPurchase
    ? (hasTaxDetails ? 'TAX PURCHASE BILL' : 'PURCHASE BILL')
    : (hasTaxDetails ? 'TAX INVOICE' : 'INVOICE');

  // 1. Header background bar / accent
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.rect(margin, currentY, pageWidth - margin * 2, 2.5, 'F');
  currentY += 8;

  // 2. Business Info (Left side) & Document Meta (Right side)
  let headerLeftY = currentY;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(6, 78, 59); // deep emerald
  doc.text(profile.name || 'Hisab Kitab', margin, headerLeftY);
  headerLeftY += 6;

  // Business details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105); // slate-600

  if (profile.address) {
    doc.text(profile.address, margin, headerLeftY);
    headerLeftY += 4.5;
  }

  let contactStr = '';
  if (profile.phone) contactStr += `Phone: ${profile.phone}`;
  if (profile.email) contactStr += `${contactStr ? '  |  ' : ''}Email: ${profile.email}`;
  if (contactStr) {
    doc.text(contactStr, margin, headerLeftY);
    headerLeftY += 4.5;
  }

  if (hasTaxDetails && profile.ntn) {
    let taxStr = `NTN: ${profile.ntn}`;
    if (profile.strn) taxStr += `  |  STRN: ${profile.strn}`;
    doc.text(taxStr, margin, headerLeftY);
    headerLeftY += 4.5;
  }

  // Document Title & Meta right-aligned (Doc Title, Doc No, Date, Status)
  let rightMetaY = currentY;

  // Document Title Badge on upper right corner (TAX INVOICE if has tax details, else INVOICE)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(5, 150, 105);
  doc.text(docTitle, pageWidth - margin, rightMetaY, { align: 'right' });
  rightMetaY += 6; // Clear separation so Doc No never overlaps!

  // Document Number on its own place (if present)
  if (inv.invoiceNumber && inv.invoiceNumber.trim()) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 41, 59);
    doc.text(`Doc No: ${inv.invoiceNumber}`, pageWidth - margin, rightMetaY, { align: 'right' });
    rightMetaY += 4.5;
  }

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(`Date: ${inv.date}`, pageWidth - margin, rightMetaY, { align: 'right' });
  rightMetaY += 4.5;

  if (inv.dueDate) {
    doc.text(`Due Date: ${inv.dueDate}`, pageWidth - margin, rightMetaY, { align: 'right' });
    rightMetaY += 4.5;
  }

  const statusColor = inv.status === 'paid' ? [5, 150, 105] : inv.status === 'cancelled' ? [220, 38, 38] : [217, 119, 6];
  doc.setTextColor(statusColor[0], statusColor[1], statusColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`Status: ${inv.status.toUpperCase()}`, pageWidth - margin, rightMetaY, { align: 'right' });
  rightMetaY += 5;

  currentY = Math.max(headerLeftY, rightMetaY) + 4;

  // 3. Party Info Box ("Billed To")
  doc.setFillColor(248, 250, 252); // slate-50
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139); // slate-500
  doc.text(isPurchase ? 'SUPPLIER / BILLED BY:' : 'BILLED TO (CUSTOMER / PARTY):', margin + 4, currentY + 5);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42); // slate-900
  doc.text(inv.partyName || 'Cash / Walk-in Customer', margin + 4, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  let partySub = '';
  if (inv.partyPhone) partySub += `Phone: ${inv.partyPhone}`;
  if (inv.partyAddress) partySub += `${partySub ? '   ' : ''}Address: ${inv.partyAddress}`;
  if (partySub) {
    doc.text(partySub, margin + 4, currentY + 16.5);
  }

  // Right side of party box: Payment Mode
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PAYMENT MODE:', pageWidth - margin - 4, currentY + 5, { align: 'right' });

  doc.setFontSize(10);
  doc.setTextColor(15, 23, 42);
  doc.text((inv.paymentMode || 'cash').toUpperCase(), pageWidth - margin - 4, currentY + 11, { align: 'right' });

  if (inv.manualPaymentDetails) {
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(71, 85, 105);
    doc.text(`Ref: ${inv.manualPaymentDetails}`, pageWidth - margin - 4, currentY + 16.5, { align: 'right' });
  }

  currentY += 26;

  // 4. Items Table using autoTable
  const tableHeaders = [
    '#',
    'Item Description',
    'Qty',
    'Rate',
    ...(hasTaxDetails ? ['Tax %'] : []),
    `Total (${profile.currencySymbol})`,
  ];

  const tableBody = inv.lines.map((l, index) => [
    String(index + 1),
    l.itemName,
    `${l.quantity} ${l.unit || 'Pcs'}`,
    `${profile.currencySymbol} ${l.rate.toLocaleString()}`,
    ...(hasTaxDetails ? [`${l.taxPercent || 0}%`] : []),
    `${profile.currencySymbol} ${l.totalAmount.toLocaleString()}`,
  ]);

  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
      halign: 'left',
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { halign: 'center', cellWidth: 10 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 22 },
      3: { halign: 'right', cellWidth: 28 },
      ...(hasTaxDetails
        ? {
            4: { halign: 'center', cellWidth: 18 },
            5: { halign: 'right', cellWidth: 32 },
          }
        : {
            4: { halign: 'right', cellWidth: 35 },
          }),
    },
    margin: { left: margin, right: margin },
  });

  const finalTableY = (doc as any).lastAutoTable?.finalY || currentY + 40;
  currentY = finalTableY + 6;

  // 5. Check if page break is needed for Summary & Bank Details
  if (currentY + 55 > pageHeight - 15) {
    doc.addPage();
    currentY = 20;
  }

  // 6. Bank Details Box (Left) & Totals (Right)
  const leftColWidth = 95;
  const rightColX = pageWidth - margin;

  // Left side: Bank Info & Notes
  let leftY = currentY;
  if (profile.bankName || profile.easypaisaNumber || profile.jazzcashNumber) {
    doc.setFillColor(240, 253, 244); // emerald-50
    doc.setDrawColor(187, 247, 208); // emerald-200
    doc.roundedRect(margin, leftY, leftColWidth, 26, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(22, 101, 52); // green-800
    doc.text('Bank & Mobile Payment Accounts:', margin + 3, leftY + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(21, 128, 61);

    let bY = leftY + 9.5;
    if (profile.bankName) {
      doc.text(
        `${profile.bankName} | A/C: ${profile.bankAccountNumber || ''} | Title: ${profile.bankAccountTitle || profile.name}`,
        margin + 3,
        bY
      );
      bY += 4;
      if (profile.bankIban) {
        doc.text(`IBAN: ${profile.bankIban}`, margin + 3, bY);
        bY += 4;
      }
    }
    if (profile.easypaisaNumber || profile.jazzcashNumber) {
      let walletStr = '';
      if (profile.easypaisaNumber) walletStr += `EasyPaisa: ${profile.easypaisaNumber}`;
      if (profile.jazzcashNumber) walletStr += `${walletStr ? '  |  ' : ''}JazzCash: ${profile.jazzcashNumber}`;
      doc.text(walletStr, margin + 3, bY);
    }

    leftY += 30;
  }

  if (inv.terms || profile.termsConditions) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7.5);
    doc.setTextColor(100, 116, 139);
    doc.text('Terms & Conditions:', margin, leftY + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(71, 85, 105);
    const termsText = inv.terms || profile.termsConditions || '';
    const splitTerms = doc.splitTextToSize(termsText, leftColWidth);
    doc.text(splitTerms, margin, leftY + 8);
  }

  // Right side: Totals Calculation Table
  let rightY = currentY;
  const rowH = 5.2;

  const renderSummaryRow = (label: string, value: string, isBold = false, isAccent = false, isRed = false) => {
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setFontSize(isBold ? 9.5 : 8.5);
    if (isRed) {
      doc.setTextColor(220, 38, 38);
    } else if (isAccent) {
      doc.setTextColor(5, 150, 105);
    } else {
      doc.setTextColor(51, 65, 85);
    }
    doc.text(label, rightColX - 60, rightY);
    doc.text(value, rightColX, rightY, { align: 'right' });
    rightY += rowH;
  };

  renderSummaryRow('Subtotal:', `${profile.currencySymbol} ${inv.subtotal.toLocaleString()}`);

  if (inv.discountTotal > 0) {
    renderSummaryRow('Discount:', `-${profile.currencySymbol} ${inv.discountTotal.toLocaleString()}`, false, true);
  }
  if (inv.hasTax && inv.taxTotal > 0) {
    renderSummaryRow('Sales Tax:', `+${profile.currencySymbol} ${inv.taxTotal.toLocaleString()}`);
  }
  if (inv.additionalCharges > 0) {
    renderSummaryRow('Additional Charges:', `+${profile.currencySymbol} ${inv.additionalCharges.toLocaleString()}`);
  }

  // Grand Total line
  doc.setDrawColor(5, 150, 105);
  doc.setLineWidth(0.4);
  doc.line(rightColX - 65, rightY - 1, rightColX, rightY - 1);
  rightY += 1.5;

  renderSummaryRow(
    'Grand Total:',
    `${profile.currencySymbol} ${inv.grandTotal.toLocaleString()}`,
    true,
    true
  );

  if (!isQuotation) {
    renderSummaryRow('Amount Paid:', `${profile.currencySymbol} ${inv.amountReceived.toLocaleString()}`);
    renderSummaryRow(
      'Balance Due:',
      `${profile.currencySymbol} ${balanceDue.toLocaleString()}`,
      true,
      false,
      balanceDue > 0
    );
  }

  // 7. Footer Note & Signature Line
  const footerY = Math.max(pageHeight - 16, Math.max(leftY, rightY) + 12);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.line(margin, footerY - 4, pageWidth - margin, footerY - 4);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  doc.text(inv.notes || 'Thank you for your business! Generated by Hisab Kitab Accounting Suite.', margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.text('Authorized Signature: _______________________', pageWidth - margin, footerY, { align: 'right' });

  return doc;
}

/**
 * Creates a professional PDF document for a Party Ledger Statement
 */
export function generateLedgerPdf(
  party: Party,
  ledgerRows: Array<{
    id: string;
    date: string;
    ref: string;
    note: string;
    debit: number;
    credit: number;
    balanceAfter: number;
    status?: string;
  }>,
  profile: BusinessProfile
): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 14;
  let currentY = 16;

  // Header
  doc.setFillColor(5, 150, 105);
  doc.rect(margin, currentY, pageWidth - margin * 2, 2.5, 'F');
  currentY += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(6, 78, 59);
  doc.text(profile.name || 'Hisab Kitab', margin, currentY);

  doc.setFontSize(12);
  doc.setTextColor(5, 150, 105);
  doc.text('PARTY LEDGER STATEMENT', pageWidth - margin, currentY, { align: 'right' });
  currentY += 6;

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  if (profile.address) {
    doc.text(profile.address, margin, currentY);
    currentY += 4.5;
  }
  doc.text(`Statement Date: ${new Date().toLocaleDateString()}`, pageWidth - margin, currentY - 4.5, {
    align: 'right',
  });

  currentY += 4;

  // Party Summary Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 20, 2, 2, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('PARTY DETAILS:', margin + 4, currentY + 5);

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(party.name, margin + 4, currentY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105);
  doc.text(`Phone: ${party.phone || 'N/A'}  |  Opening: ${profile.currencySymbol} ${party.openingBalance.toLocaleString()} (${party.openingBalanceType})`, margin + 4, currentY + 16);

  // Closing Balance on right
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text('CLOSING BALANCE:', pageWidth - margin - 4, currentY + 5, { align: 'right' });

  doc.setFontSize(12);
  const balColor = party.currentBalance > 0 ? [5, 150, 105] : party.currentBalance < 0 ? [220, 38, 38] : [71, 85, 105];
  doc.setTextColor(balColor[0], balColor[1], balColor[2]);
  doc.text(
    `${profile.currencySymbol} ${party.currentBalance.toLocaleString()}`,
    pageWidth - margin - 4,
    currentY + 11,
    { align: 'right' }
  );

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(
    party.currentBalance > 0 ? '(You will receive)' : party.currentBalance < 0 ? '(You will pay)' : '(Settled)',
    pageWidth - margin - 4,
    currentY + 16,
    { align: 'right' }
  );

  currentY += 24;

  // Table
  const tableHeaders = ['Date', 'Type / Ref', 'Particulars / Note', 'Debit (+)', 'Credit (-)', 'Balance'];

  const tableBody = [
    // Opening balance row
    [
      '--',
      'Opening Balance',
      'Initial ledger balance',
      party.openingBalanceType === 'to_collect' ? `${profile.currencySymbol} ${party.openingBalance.toLocaleString()}` : '-',
      party.openingBalanceType === 'to_pay' ? `${profile.currencySymbol} ${party.openingBalance.toLocaleString()}` : '-',
      `${profile.currencySymbol} ${(party.openingBalanceType === 'to_collect' ? party.openingBalance : -party.openingBalance).toLocaleString()}`,
    ],
    ...ledgerRows.map((r) => [
      r.date,
      r.ref,
      r.note || '-',
      r.debit > 0 ? `${profile.currencySymbol} ${r.debit.toLocaleString()}` : '-',
      r.credit > 0 ? `${profile.currencySymbol} ${r.credit.toLocaleString()}` : '-',
      `${profile.currencySymbol} ${r.balanceAfter.toLocaleString()}`,
    ]),
  ];

  autoTable(doc, {
    startY: currentY,
    head: [tableHeaders],
    body: tableBody,
    theme: 'grid',
    headStyles: {
      fillColor: [5, 150, 105],
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      0: { cellWidth: 22 },
      1: { cellWidth: 26, fontStyle: 'bold' },
      2: { cellWidth: 'auto' },
      3: { halign: 'right', cellWidth: 25 },
      4: { halign: 'right', cellWidth: 25 },
      5: { halign: 'right', cellWidth: 28, fontStyle: 'bold' },
    },
    margin: { left: margin, right: margin },
  });

  return doc;
}

/**
 * Downloads the PDF file directly to device
 */
export function downloadInvoicePdf(inv: Invoice, profile: BusinessProfile): void {
  const doc = generateInvoicePdf(inv, profile);
  const isQuotation = inv.type === 'quotation';
  const isPurchase = inv.type === 'purchase';
  const prefix = isQuotation ? 'Quotation' : isPurchase ? 'Purchase_Bill' : 'Invoice';
  const fileName = `${prefix}_${inv.invoiceNumber}.pdf`;
  doc.save(fileName);
}

/**
 * Downloads a party ledger PDF file directly
 */
export function downloadLedgerPdf(
  party: Party,
  ledgerRows: Array<any>,
  profile: BusinessProfile
): void {
  const doc = generateLedgerPdf(party, ledgerRows, profile);
  const fileName = `Ledger_Statement_${party.name.replace(/\s+/g, '_')}.pdf`;
  doc.save(fileName);
}

/**
 * Generates a File object representing the PDF for Web Share API
 */
export function getInvoicePdfFile(inv: Invoice, profile: BusinessProfile): File {
  const doc = generateInvoicePdf(inv, profile);
  const isQuotation = inv.type === 'quotation';
  const isPurchase = inv.type === 'purchase';
  const prefix = isQuotation ? 'Quotation' : isPurchase ? 'Purchase_Bill' : 'Invoice';
  const fileName = `${prefix}_${inv.invoiceNumber}.pdf`;
  const blob = doc.output('blob');
  return new File([blob], fileName, { type: 'application/pdf' });
}

/**
 * Generates a File object for Party Ledger PDF
 */
export function getLedgerPdfFile(party: Party, ledgerRows: Array<any>, profile: BusinessProfile): File {
  const doc = generateLedgerPdf(party, ledgerRows, profile);
  const fileName = `Ledger_Statement_${party.name.replace(/\s+/g, '_')}.pdf`;
  const blob = doc.output('blob');
  return new File([blob], fileName, { type: 'application/pdf' });
}
