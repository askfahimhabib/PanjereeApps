import type { PaymentRecord, ReceiptPrintMode } from '../types'
import { PAYMENT_METHOD_LABELS, MONTH_NAMES, formatCurrency } from '../types'

/**
 * Generates SMS / WhatsApp payment receipt confirmation text.
 */
export function generateReceiptSmsText(record: PaymentRecord): string {
  const paidDate = new Date(record.paid_at).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const itemsSummary = record.items.map(it => it.label).join(', ')

  return `Dear Parent, received ${formatCurrency(record.total_amount)} for ${record.student_name} (Roll: ${record.roll_number}, ${record.class_name || 'Class'}) on ${paidDate}. Purpose: ${itemsSummary}. Memo: ${record.invoice_number}. Thank you. - Panjeree LMS`
}

/**
 * Generates and opens a printable invoice for a PaymentRecord.
 * Supports DUAL_A4 (Student Copy + Office Copy) & POS_80MM (Thermal slip).
 */
export function printInvoice(record: PaymentRecord, mode: ReceiptPrintMode = 'DUAL_A4'): void {
  const institutionName = 'PANJEREE EDUCATION & COACHING'
  const institutionAddress = 'Mirpur-10, Dhaka-1216 | Phone: +880 1711-000000'
  const printDate = new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })
  const paidDate = new Date(record.paid_at).toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric' })

  const renderVoucherBlock = (copyTitle: string) => {
    const itemRows = record.items.map(item => {
      const monthLabel = item.month ? MONTH_NAMES[item.month - 1] : ''
      const periodLabel = monthLabel && item.year ? ` (${monthLabel} ${item.year})` : ''
      return `
        <tr>
          <td style="padding: 6px 8px; border-bottom: 1px solid #f1f5f9;">
            <div style="font-weight: 600; color: #1e293b;">${item.label}</div>
            <div style="font-size: 10px; color: #64748b;">${item.fee_type}${periodLabel}</div>
          </td>
          <td style="padding: 6px 8px; text-align: right; font-weight: 700; font-family: monospace; border-bottom: 1px solid #f1f5f9;">
            ৳ ${item.amount.toLocaleString('en-BD')}
          </td>
        </tr>
      `
    }).join('')

    const discountRow = record.discount_amount > 0 ? `
      <tr style="color: #e11d48; background: #fff1f2;">
        <td style="padding: 6px 8px; font-size: 11px; font-weight: 600;">
          Special Waiver / Scholarship ${record.waiver_reason ? `(${record.waiver_reason})` : ''}
        </td>
        <td style="padding: 6px 8px; text-align: right; font-weight: 700; font-family: monospace;">
          - ৳ ${record.discount_amount.toLocaleString('en-BD')}
        </td>
      </tr>
    ` : ''

    return `
      <div class="voucher-box">
        <!-- Header -->
        <div class="header">
          <div class="badge-copy">${copyTitle}</div>
          <h2>${institutionName}</h2>
          <p class="subtitle">${institutionAddress}</p>
          <div class="receipt-pill">
            <span>MONEY RECEIPT</span> • <strong>${record.invoice_number}</strong>
          </div>
        </div>

        <!-- Student & Payment Info Grid -->
        <div class="info-grid">
          <div class="info-item">
            <span class="lbl">STUDENT NAME</span>
            <span class="val">${record.student_name}</span>
          </div>
          <div class="info-item">
            <span class="lbl">ROLL / ID</span>
            <span class="val font-mono">Roll: ${record.roll_number}</span>
          </div>
          <div class="info-item">
            <span class="lbl">CLASS / SECTION</span>
            <span class="val">${record.class_name || 'Class 8'}</span>
          </div>
          <div class="info-item">
            <span class="lbl">PAYMENT DATE</span>
            <span class="val">${paidDate}</span>
          </div>
          <div class="info-item">
            <span class="lbl">PAYMENT METHOD</span>
            <span class="val">${PAYMENT_METHOD_LABELS[record.payment_method]} ${record.transaction_id ? `(Trx: ${record.transaction_id})` : ''}</span>
          </div>
          <div class="info-item">
            <span class="lbl">STATUS</span>
            <span class="val status-paid">PAID & VERIFIED ✓</span>
          </div>
        </div>

        <!-- Fee Items Table -->
        <div class="table-container">
          <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
            <thead>
              <tr style="background: #f8fafc; color: #475569; text-transform: uppercase; font-size: 9px; letter-spacing: 0.5px;">
                <th style="padding: 6px 8px; text-align: left; border-bottom: 2px solid #cbd5e1;">Particulars / Fee Item</th>
                <th style="padding: 6px 8px; text-align: right; border-bottom: 2px solid #cbd5e1;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${itemRows}
              ${discountRow}
            </tbody>
            <tfoot>
              <tr style="border-top: 2px solid #0f172a; font-size: 13px; font-weight: 800;">
                <td style="padding: 8px 8px; color: #0f172a;">TOTAL COLLECTED</td>
                <td style="padding: 8px 8px; text-align: right; color: #059669; font-family: monospace;">
                  ৳ ${record.total_amount.toLocaleString('en-BD')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${record.note ? `<div class="note-box">Memo: ${record.note}</div>` : ''}

        <!-- Signatures & Stamp -->
        <div class="footer-signatures">
          <div class="sign-block">
            <div class="line"></div>
            <span>Student / Depositor</span>
          </div>
          <div class="seal-block">
            <div class="stamp-circle">PAID<br><small>${paidDate}</small></div>
          </div>
          <div class="sign-block">
            <div class="line"></div>
            <span>Authorized Officer</span>
          </div>
        </div>
        <div class="print-meta">System generated on ${printDate} • Verified by LMS</div>
      </div>
    `
  }

  let bodyHtml = ''

  if (mode === 'POS_80MM') {
    bodyHtml = `
      <div class="pos-wrapper">
        ${renderVoucherBlock('OFFICE / CUSTOMER COPY')}
      </div>
    `
  } else {
    // DUAL A4: Side-by-Side or Stacked Dual Copies
    bodyHtml = `
      <div class="dual-wrapper">
        ${renderVoucherBlock('STUDENT COPY')}
        <div class="cut-line">
          <span>✂ ----------------- CUT HERE (SEPARATION LINE) ----------------- ✂</span>
        </div>
        ${renderVoucherBlock('OFFICE / ACCOUNTS COPY')}
      </div>
    `
  }

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt_${record.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
      font-size: 12px;
      color: #0f172a;
      background: #f8fafc;
      padding: 12px;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .dual-wrapper { gap: 8px !important; }
      @page { size: A4 portrait; margin: 10mm; }
    }

    .dual-wrapper {
      max-width: 820px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .pos-wrapper {
      max-width: 380px;
      margin: 0 auto;
    }

    .voucher-box {
      background: #fff;
      border: 1.5px solid #0f172a;
      border-radius: 12px;
      padding: 16px 20px;
      position: relative;
      overflow: hidden;
    }

    .badge-copy {
      position: absolute;
      top: 12px;
      right: 16px;
      background: #0f172a;
      color: #fff;
      font-size: 9px;
      font-weight: 800;
      letter-spacing: 0.8px;
      padding: 3px 8px;
      border-radius: 6px;
      text-transform: uppercase;
    }

    .header {
      text-align: center;
      padding-bottom: 12px;
      border-bottom: 1px solid #e2e8f0;
    }
    .header h2 {
      font-size: 16px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #0f172a;
    }
    .header .subtitle {
      font-size: 10px;
      color: #64748b;
      margin-top: 1px;
    }
    .receipt-pill {
      display: inline-block;
      margin-top: 6px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2px 10px;
      border-radius: 20px;
      font-size: 10px;
      color: #334155;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px 12px;
      padding: 12px 0;
      border-bottom: 1px solid #e2e8f0;
    }
    .info-item .lbl {
      display: block;
      font-size: 9px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      letter-spacing: 0.4px;
    }
    .info-item .val {
      font-size: 12px;
      font-weight: 700;
      color: #0f172a;
    }
    .status-paid {
      color: #059669;
    }

    .table-container {
      padding: 12px 0;
    }

    .note-box {
      font-size: 10px;
      font-style: italic;
      color: #475569;
      background: #f8fafc;
      padding: 6px 10px;
      border-radius: 6px;
      margin-bottom: 10px;
    }

    .footer-signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 16px;
      margin-top: 4px;
    }
    .sign-block {
      text-align: center;
      width: 140px;
    }
    .sign-block .line {
      border-top: 1px dashed #475569;
      margin-bottom: 4px;
    }
    .sign-block span {
      font-size: 9px;
      font-weight: 600;
      color: #475569;
      text-transform: uppercase;
    }
    .seal-block {
      text-align: center;
    }
    .stamp-circle {
      display: inline-flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 54px;
      height: 54px;
      border: 2px solid #059669;
      border-radius: 50%;
      color: #059669;
      font-weight: 900;
      font-size: 10px;
      transform: rotate(-10deg);
      opacity: 0.85;
    }

    .cut-line {
      text-align: center;
      font-size: 10px;
      color: #94a3b8;
      font-weight: 600;
      letter-spacing: 1px;
      margin: 4px 0;
    }

    .print-meta {
      text-align: right;
      font-size: 8px;
      color: #94a3b8;
      margin-top: 6px;
    }
  </style>
</head>
<body>
  ${bodyHtml}
  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>`

  const printWindow = window.open('', '_blank', 'width=900,height=800')
  if (printWindow) {
    printWindow.document.write(html)
    printWindow.document.close()
  }
}
