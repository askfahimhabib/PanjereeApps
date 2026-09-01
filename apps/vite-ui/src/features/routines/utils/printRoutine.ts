import type { Routine } from '../types'
import { DAY_LABELS, WEEKDAYS } from '../types'
import { groupByDay } from '../hooks/useRoutine'

interface PrintRoutineOptions {
  title: string               // e.g. "Class 10 - Academic Routine" or "SSC Model Test 2026 Routine"
  subtitle?: string           // e.g. "Academic Year 2026 • Day Shift"
  routines: Routine[]
  institutionName?: string    // Default "Panjeree Model School & College"
}

export function printRoutine({
  title,
  subtitle = 'Academic Year 2026 • Regular Schedule',
  routines,
  institutionName = 'PANJEREE MODEL SCHOOL & COLLEGE',
}: PrintRoutineOptions) {
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
  <title>${title} - ${institutionName}</title>
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
      font-size: 10px;
    }
    .slot-item.ct {
      border-left-color: #f59e0b;
      background: #fffbeb;
    }
    .slot-item.off {
      border-left-color: #ef4444;
      background: #fef2f2;
      text-align: center;
      padding: 8px 4px;
      color: #b91c1c;
      font-weight: bold;
    }
    .subject {
      font-weight: 700;
      color: #0f172a;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .time {
      color: #475569;
      font-size: 9px;
      font-family: monospace;
      margin-top: 1px;
    }
    .teacher {
      color: #334155;
      font-size: 9px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .room {
      color: #64748b;
      font-size: 8.5px;
    }
    .ct-badge {
      display: inline-block;
      font-size: 7.5px;
      font-weight: 700;
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #fde68a;
      padding: 0 3px;
      border-radius: 2px;
      margin-top: 1px;
    }
    .footer {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
      padding-top: 10px;
      border-top: 1px solid #e2e8f0;
      font-size: 9px;
      color: #64748b;
    }
    .sign-block {
      text-align: center;
      width: 140px;
      border-top: 1px dashed #94a3b8;
      padding-top: 4px;
      margin-top: 20px;
      color: #334155;
      font-weight: 600;
    }
    @media print {
      body { padding: 0; }
      button { display: none; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="institution">${institutionName}</div>
    <div class="routine-title">${title}</div>
    <div class="meta">${subtitle} • Printed on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
  </div>

  <table class="grid-table">
    <thead>
      <tr>
        ${WEEKDAYS.map(day => `<th>${DAY_LABELS[day]}</th>`).join('')}
      </tr>
    </thead>
    <tbody>
      <tr>
        ${WEEKDAYS.map(day => {
          const slots = (byDay[day] ?? []).sort((a, b) => a.start_time.localeCompare(b.start_time))
          if (slots.length === 0) {
            return `<td><div style="color: #94a3b8; text-align: center; margin-top: 25px; font-size: 9px; font-style: italic;">No Classes</div></td>`
          }

          const slotCards = slots.map(slot => {
            if (slot.entry_type === 'OFF_DAY') {
              return `<div class="slot-item off">🚫 Off Day</div>`
            }
            const isCT = slot.entry_type === 'CLASS_EXAM'
            const subName = slot.subjects?.name_bn ?? slot.subjects?.name ?? 'Subject'
            const teacherName = slot.teachers?.full_name ? `👨‍🏫 ${slot.teachers.full_name}` : ''
            const roomName = slot.room ? `📍 ${slot.room}` : ''
            const topicInfo = slot.topic ? `<div style="color:#b45309; font-size:8.5px; margin-top:1px;">📝 ${slot.topic}</div>` : ''

            return `
              <div class="slot-item ${isCT ? 'ct' : ''}">
                <div class="subject">${subName}</div>
                <div class="time">⏱️ ${slot.start_time} - ${slot.end_time}</div>
                ${teacherName ? `<div class="teacher">${teacherName}</div>` : ''}
                ${roomName ? `<div class="room">${roomName}</div>` : ''}
                ${topicInfo}
                ${isCT ? `<span class="ct-badge">Class Test${slot.total_marks ? ' (' + slot.total_marks + 'm)' : ''}</span>` : ''}
              </div>
            `
          }).join('')

          return `<td>${slotCards}</td>`
        }).join('')}
      </tr>
    </tbody>
  </table>

  <div class="footer">
    <div>Note: Students must arrive 10 minutes before the first period. Mobile phones are prohibited in classrooms.</div>
    <div style="display: flex; gap: 40px;">
      <div class="sign-block">Class Teacher</div>
      <div class="sign-block">Headmaster / Principal</div>
    </div>
  </div>

  <script>
    window.onload = function() {
      window.print();
    }
  </script>
</body>
</html>
`

  printWindow.document.open()
  printWindow.document.write(printHtml)
  printWindow.document.close()
}
