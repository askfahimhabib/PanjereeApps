import type { Routine } from '../types'
import { DAY_LABELS, WEEKDAYS } from '../types'
import { groupByDay } from '../hooks/useRoutine'
import { getInstitutionInfo } from '@/lib/institutionInfo'

interface PrintRoutineOptions {
  title: string               // e.g. "Class 10 - Academic Routine" or "SSC Model Test 2026 Routine"
  subtitle?: string           // e.g. "Academic Year 2026 • Day Shift"
  routines: Routine[]
  institutionName?: string
}

export function printRoutine({
  title,
  subtitle,
  routines,
  institutionName,
}: PrintRoutineOptions) {
  const inst = getInstitutionInfo()
  const finalInstName = institutionName || inst.name.toUpperCase()
  const finalSubtitle = subtitle || `Academic Session ${inst.session} • Regular Schedule`
  const byDay = groupByDay(routines)

  const printWindow = window.open('', '_blank', 'width=1100,height=850')
  if (!printWindow) {
    alert('Please allow popups to print the routine schedule.')
    return
  }

  const printHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${title} - ${finalInstName}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, sans-serif;
    }
    body {
      background: #fff;
      color: #0f172a;
      padding: 12px;
      font-size: 11px;
    }
    .header {
      text-align: center;
      border-bottom: 2px solid #334155;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .institution {
      font-size: 18px;
      font-weight: 800;
      letter-spacing: 0.5px;
      color: #1e293b;
      text-transform: uppercase;
    }
    .routine-title {
      font-size: 14px;
      font-weight: 700;
      color: #4338ca;
      margin-top: 2px;
    }
    .meta {
      font-size: 10px;
      color: #64748b;
      margin-top: 2px;
    }
    .grid-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 8px;
      table-layout: fixed;
    }
    .grid-table th {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      padding: 6px 4px;
      font-size: 11px;
      font-weight: 700;
      text-align: center;
      text-transform: uppercase;
      color: #1e293b;
    }
    .grid-table td {
      border: 1px solid #cbd5e1;
      vertical-align: top;
      padding: 4px;
      height: 90px;
      background: #fff;
    }
    .slot-item {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 3px solid #4f46e5;
      border-radius: 4px;
      padding: 4px 6px;
      margin-bottom: 4px;
    }
    .slot-item.break {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .slot-subject {
      font-weight: 700;
      font-size: 10.5px;
      color: #1e293b;
    }
    .slot-time {
      font-size: 9px;
      color: #64748b;
      font-weight: 600;
    }
    .slot-details {
      font-size: 9px;
      color: #475569;
      margin-top: 1px;
    }
    .footer {
      margin-top: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      padding-top: 12px;
    }
    .sign-box {
      text-align: center;
      width: 160px;
    }
    .sign-line {
      border-top: 1px solid #64748b;
      margin-bottom: 4px;
    }
    .sign-label {
      font-size: 9px;
      font-weight: 600;
      color: #64748b;
      text-transform: uppercase;
    }
    .print-date {
      font-size: 8.5px;
      color: #94a3b8;
      text-align: center;
      margin-top: 8px;
    }
    @media print {
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="no-print" style="margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1px solid #e2e8f0; padding: 8px 12px; border-radius: 6px;">
    <span style="font-weight: 600; font-size: 12px;">Timetable Preview</span>
    <button onclick="window.print()" style="background: #4f46e5; color: white; border: none; padding: 6px 16px; border-radius: 4px; font-weight: 600; cursor: pointer;">
      Print Routine 🖨️
    </button>
  </div>

  <div class="header">
    <div class="institution">${finalInstName}</div>
    ${inst.nameBn ? `<div style="font-size:11px; color:#475569; font-weight:600; margin-top:-2px;">${inst.nameBn}</div>` : ''}
    <div style="font-size:9.5px; color:#64748b; margin-top:2px;">EIIN: ${inst.eiin} • ${inst.address}</div>
    <div class="routine-title">${title}</div>
    <div class="meta">${finalSubtitle}</div>
  </div>

  <table class="grid-table">
    <thead>
      <tr>
        ${WEEKDAYS.map(d => `<th>${DAY_LABELS[d]}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        ${WEEKDAYS.map(day => {
          const daySlots = byDay[day] || []
          return `
            <td>
              ${daySlots.length === 0 ? '<div style="color: #cbd5e1; text-align: center; padding-top: 24px; font-size: 10px;">— No Class —</div>' : ''}
              ${daySlots.map(slot => `
                <div class="slot-item ${slot.entry_type === 'OFF_DAY' ? 'break' : ''}">
                  <div class="slot-subject">${slot.subjects?.name_bn || slot.subjects?.name || 'Class Session'}</div>
                  <div class="slot-time">${slot.start_time} - ${slot.end_time}</div>
                  <div class="slot-details">
                    ${slot.teachers?.full_name ? '👨‍🏫 ' + slot.teachers.full_name : ''}
                    ${slot.room ? ' • Room ' + slot.room : ''}
                  </div>
                </div>
              `).join('')}
            </td>
          `
        }).join('')}
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Routine Committee</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">Academic Coordinator</div>
    </div>
    <div class="sign-box">
      <div class="sign-line"></div>
      <div class="sign-label">${inst.principalDesignation}</div>
    </div>
  </div>

  <div class="print-date">
    Generated on ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • Verified by ${inst.name}
  </div>
</body>
</html>
  `

  printWindow.document.open()
  printWindow.document.write(printHtml)
  printWindow.document.close()
}
