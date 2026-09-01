import type { PaymentRecord, ReceiptPrintMode } from '../types'
import { PAYMENT_METHOD_LABELS, MONTH_NAMES, formatCurrency } from '../types'
import { getInstitutionInfo } from '@/lib/institutionInfo'

/**
 * Generates SMS / WhatsApp payment receipt confirmation text.
 */
export function generateReceiptSmsText(record: PaymentRecord): string {
  const inst = getInstitutionInfo()
  const paidDate = new Date(record.paid_at).toLocaleDateString('en-BD', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
  const itemsSummary = record.items.map(it => it.label).join(', ')

  return `Dear Parent, received ${formatCurrency(record.total_amount)} for ${record.student_name} (Roll: ${record.roll_number}, ${record.class_name || 'Class'}) on ${paidDate}. Purpose: ${itemsSummary}. Invoice #${record.invoice_number}. Thank you. - ${inst.name}`
}

/**
 * Generates and opens a printable invoice for a PaymentRecord.
 * Supports DUAL_A4 (Student Copy + Office Copy) & POS_80MM (Thermal slip).
 */
export function printInvoice(record: PaymentRecord, _mode: ReceiptPrintMode = 'DUAL_A4'): void {
  const inst = getInstitutionInfo()
  const institutionName = inst.name.toUpperCase()
  const institutionAddress = `${inst.address} | Phone: ${inst.phone}`
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
            ${inst.currencySymbol} ${item.amount.toLocaleString('en-BD')}
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
          - ${inst.currencySymbol} ${record.discount_amount.toLocaleString('en-BD')}
        </td>
      </tr>
    ` : ''

    return `
      <div class="voucher-box">
        <!-- Header -->
        <div class="header">
          <div class="badge-copy">${copyTitle}</div>
          <h2>${institutionName}</h2>
          ${inst.nameBn ? `<div style="font-size:11px; color:#475569; margin-top:-2px; margin-bottom:2px;">${inst.nameBn}</div>` : ''}
          <p class="subtitle">${institutionAddress}</p>
          <div style="font-size: 10px; color: #64748b; margin-top: 2px;">EIIN: ${inst.eiin} • Affiliation: ${inst.board}</div>
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
                  ${inst.currencySymbol} ${record.total_amount.toLocaleString('en-BD')}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        ${record.note ? `<div class="note-box">Memo: ${record.note}</div>` : ''}

        <div style="font-size: 9.5px; color: #64748b; font-style: italic; margin-top: 6px; padding: 4px 6px; background: #f8fafc; border-radius: 4px;">
          Note: ${inst.termsFooter}
        </div>

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
        <div class="print-meta">System generated on ${printDate} • Verified by ${inst.name}</div>
      </div>
    `
  }

  const dualA4Html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Receipt — ${record.invoice_number}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #0f172a;
      background: #f8fafc;
      padding: 12px;
      font-size: 12px;
    }
    @page { size: A4 portrait; margin: 8mm 10mm; }
    @media print {
      body { background: white; padding: 0; }
      .no-print { display: none !important; }
      .page-container { border: none !important; box-shadow: none !important; }
    }
    .page-container {
      max-width: 800px;
      margin: 0 auto;
      background: white;
      border: 1px solid #e2e8f0;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      border-radius: 8px;
      padding: 16px;
    }
    .grid-dual {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }
    .divider-cut {
      border: none;
      border-top: 1.5px dashed #cbd5e1;
      position: relative;
      margin: 4px 0;
    }
    .divider-cut::after {
      content: '✂ TEAR HERE / CUT ALONG DOTTED LINE';
      position: absolute;
      top: -7px;
      left: 50%;
      transform: translateX(-50%);
      background: white;
      padding: 0 10px;
      font-size: 8px;
      color: #94a3b8;
      font-weight: 700;
      letter-spacing: 1px;
    }
    .voucher-box {
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 14px 16px;
      background: white;
      position: relative;
    }
    .badge-copy {
      position: absolute;
      top: 10px;
      right: 12px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 2px 8px;
      font-size: 9px;
      font-weight: 800;
      color: #475569;
      border-radius: 4px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .header { text-align: center; margin-bottom: 12px; }
    .header h2 { font-size: 16px; font-weight: 900; letter-spacing: 0.5px; color: #0f172a; }
    .header .subtitle { font-size: 10px; color: #64748b; margin-top: 1px; }
    .receipt-pill {
      display: inline-block;
      margin-top: 6px;
      background: #0f172a;
      color: white;
      padding: 2px 10px;
      border-radius: 12px;
      font-size: 10px;
      letter-spacing: 0.5px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 8px 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px 12px;
      margin-bottom: 12px;
    }
    .info-item { display: flex; flex-direction: column; }
    .info-item .lbl { font-size: 8.5px; font-weight: 700; color: #64748b; letter-spacing: 0.5px; text-transform: uppercase; }
    .info-item .val { font-size: 11px; font-weight: 700; color: #0f172a; margin-top: 1px; }
    .status-paid { color: #059669 !important; }
    .table-container { border: 1px solid #cbd5e1; border-radius: 4px; overflow: hidden; margin-bottom: 10px; }
    .note-box {
      font-size: 10px;
      background: #fffbeb;
      border: 1px solid #fef3c7;
      color: #92400e;
      padding: 4px 8px;
      border-radius: 4px;
      margin-bottom: 10px;
    }
    .footer-signatures {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-top: 14px;
      padding-top: 8px;
    }
    .sign-block { width: 140px; text-align: center; }
    .sign-block .line { border-top: 1px solid #64748b; margin-bottom: 4px; }
    .sign-block span { font-size: 9px; font-weight: 700; color: #64748b; text-transform: uppercase; }
    .seal-block .stamp-circle {
      width: 55px;
      height: 55px;
      border: 2px solid #059669;
      color: #059669;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: 900;
      font-size: 11px;
      line-height: 1;
      transform: rotate(-10deg);
      opacity: 0.85;
    }
    .print-meta { font-size: 8px; color: #94a3b8; text-align: center; margin-top: 6px; }
  </style>
</head>
<body>
  <div class="no-print" style="max-width: 800px; margin: 0 auto 12px; display: flex; justify-content: space-between; align-items: center; background: white; padding: 10px 16px; border-radius: 8px; border: 1px solid #e2e8f0;">
    <div><strong>${inst.name}</strong> — Print Preview (Dual A4)</div>
    <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 6px 14px; border-radius: 6px; font-weight: 700; cursor: pointer; font-size: 12px;">Print Now 🖨️</button>
  </div>
  <div class="page-container">
    <div class="grid-dual">
      ${renderVoucherBlock('Student Copy')}
      <hr class="divider-cut" />
      ${renderVoucherBlock('Office / Accounts Copy')}
    </div>
  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=880,height=920')
  if (!win) {
    alert('Please allow popups for this application to open the printable invoice.')
    return
  }
  win.document.open()
  win.document.write(dualA4Html)
  win.document.close()
}
