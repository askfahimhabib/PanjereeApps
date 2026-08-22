import type { PaymentRecord } from '../types'
import { PAYMENT_METHOD_LABELS, MONTH_NAMES } from '../types'

/**
 * Generates and opens a printable invoice for a PaymentRecord.
 * Pattern follows printStudentResultCard.ts — opens a new window and calls print().
 */
export function printInvoice(record: PaymentRecord): void {
  const centerName = 'PANJEREE COACHING CENTER'
  const printDate = new Date().toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })
  const paidDate = new Date(record.paid_at).toLocaleDateString('en-BD', { day: '2-digit', month: 'long', year: 'numeric' })

  const itemRows = record.items.map(item => {
    const monthLabel = item.month ? MONTH_NAMES[item.month - 1] : ''
    const periodLabel = monthLabel && item.year ? `${monthLabel} ${item.year}` : ''
    return `
      <tr>
        <td>${item.label}${periodLabel ? ` <span class="period">(${periodLabel})</span>` : ''}</td>
        <td class="amount">৳ ${item.amount.toLocaleString('en-BD')}</td>
      </tr>
    `
  }).join('')

  const discountRow = record.discount_amount > 0 ? `
    <tr class="discount-row">
      <td>Discount / Waiver${record.waiver_reason ? ` <span class="period">(${record.waiver_reason})</span>` : ''}</td>
      <td class="amount text-red">- ৳ ${record.discount_amount.toLocaleString('en-BD')}</td>
    </tr>
  ` : ''

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Invoice ${record.invoice_number}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      font-size: 13px;
      color: #1a1a2e;
      background: #fff;
      padding: 20px;
    }
    .invoice-wrapper {
      max-width: 420px;
      margin: 0 auto;
      border: 2px solid #1a1a2e;
      border-radius: 8px;
      overflow: hidden;
    }
    /* Header */
    .header {
      background: #1a1a2e;
      color: white;
      padding: 18px 20px 14px;
      text-align: center;
    }
    .header h1 { font-size: 18px; font-weight: 800; letter-spacing: 1px; }
    .header p  { font-size: 10px; color: #94a3b8; margin-top: 2px; }
    .invoice-no {
      background: #334155;
      color: #60a5fa;
      text-align: center;
      padding: 6px;
      font-size: 11px;
      font-weight: 700;
      letter-spacing: 1px;
    }
    /* Student Info */
    .student-section {
      padding: 14px 20px;
      border-bottom: 1px dashed #e2e8f0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 6px;
    }
    .info-row { display: flex; flex-direction: column; }
    .info-label { font-size: 9px; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; }
    .info-value { font-size: 13px; font-weight: 600; color: #1a1a2e; }
    .full-width { grid-column: 1 / -1; }
    /* Fee Table */
    .fee-section { padding: 14px 20px; }
    .fee-section h3 { font-size: 10px; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 10px; }
    table { width: 100%; border-collapse: collapse; }
    td { padding: 6px 4px; vertical-align: top; }
    td.amount { text-align: right; font-weight: 600; white-space: nowrap; }
    tr + tr td { border-top: 1px solid #f1f5f9; }
    .period { font-size: 11px; color: #64748b; }
    .discount-row td { color: #dc2626; }
    /* Total */
    .total-row {
      border-top: 2px solid #1a1a2e !important;
      margin-top: 4px;
    }
    .total-row td { font-size: 15px; font-weight: 800; padding-top: 10px; }
    /* Payment Method */
    .method-row {
      padding: 10px 20px;
      background: #f8fafc;
      border-top: 1px dashed #e2e8f0;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .method-badge {
      background: #dbeafe;
      color: #1d4ed8;
      padding: 3px 10px;
      border-radius: 20px;
      font-size: 11px;
      font-weight: 700;
    }
    /* Footer */
    .footer {
      padding: 14px 20px;
      border-top: 1px dashed #e2e8f0;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
    }
    .sig-box {
      text-align: center;
      padding-top: 30px;
      border-top: 1px solid #1a1a2e;
      font-size: 10px;
      color: #64748b;
      margin-top: 8px;
    }
    .watermark {
      text-align: center;
      padding: 8px;
      font-size: 9px;
      color: #cbd5e1;
      letter-spacing: 1px;
    }
    @media print {
      body { padding: 0; }
      .invoice-wrapper { border: none; max-width: 100%; }
    }
  </style>
</head>
<body>
  <div class="invoice-wrapper">
    <div class="header">
      <h1>${centerName}</h1>
      <p>Official Fee Receipt</p>
    </div>
    <div class="invoice-no">${record.invoice_number}</div>

    <div class="student-section">
      <div class="info-row full-width">
        <span class="info-label">Student Name</span>
        <span class="info-value">${record.student_name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Roll Number</span>
        <span class="info-value">${record.roll_number}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Class</span>
        <span class="info-value">${record.class_name ?? '—'}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Payment Date</span>
        <span class="info-value">${paidDate}</span>
      </div>
      <div class="info-row">
        <span class="info-label">Print Date</span>
        <span class="info-value">${printDate}</span>
      </div>
    </div>

    <div class="fee-section">
      <h3>Fee Details</h3>
      <table>
        <tbody>
          ${itemRows}
          ${discountRow}
          <tr class="total-row">
            <td>Total Paid</td>
            <td class="amount">৳ ${record.total_amount.toLocaleString('en-BD')}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="method-row">
      <span style="font-size:11px; color:#64748b;">Payment Method</span>
      <span class="method-badge">${PAYMENT_METHOD_LABELS[record.payment_method]}${record.transaction_id ? ` · ${record.transaction_id}` : ''}</span>
    </div>

    ${record.note ? `<div style="padding:10px 20px; font-size:11px; color:#64748b; background:#fffbeb; border-top:1px dashed #fde68a;">
      <strong>Note:</strong> ${record.note}
    </div>` : ''}

    <div class="footer">
      <div>
        <div class="sig-box">Student / Guardian Signature</div>
      </div>
      <div>
        <div class="sig-box">Collector: ${record.collected_by}</div>
      </div>
    </div>

    <div class="watermark">PANJEREE COACHING CENTER · OFFICIAL RECEIPT</div>
  </div>

  <script>
    window.onload = function () {
      window.print()
      setTimeout(function () { window.close() }, 500)
    }
  </script>
</body>
</html>`

  const win = window.open('', '_blank', 'width=500,height=700')
  if (!win) return
  win.document.open()
  win.document.write(html)
  win.document.close()
}
