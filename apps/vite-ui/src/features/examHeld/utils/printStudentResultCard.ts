/**
 * printStudentResultCard
 * Opens a new window with a printable result card for a single student
 * showing all their results across all subjects in one exam.
 */

import type { ExamHeld, ExamResult } from '../types'
import { EXAM_SCOPE_LABELS } from '../types'
import { getInstitutionInfo } from '@/lib/institutionInfo'

interface Props {
  exam: ExamHeld
  studentId: string
  studentName: string
  rollNumber: string
  results: ExamResult[]   // filtered to this student only
}

const GRADE_PRINT_COLOR: Record<string, string> = {
  'A+': '#d1fae5',
  'A':  '#d1fae5',
  'A-': '#ccfbf1',
  'B':  '#dbeafe',
  'C':  '#fef9c3',
  'D':  '#ffedd5',
  'F':  '#fee2e2',
}

const tdStyle = 'border:1px solid #cbd5e1;padding:6px 10px;font-size:11px;'
const tdCenter = 'border:1px solid #cbd5e1;padding:6px 10px;font-size:11px;text-align:center;'

function buildStudentCardHTML({ exam, studentName, rollNumber, results }: Props): string {
  const inst = getInstitutionInfo()
  const schedules = exam.exam_held_schedules ?? []
  const examTarget = exam.classes?.name ?? exam.batches?.name ?? ''
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  // Order by schedule order
  const subjectRows = schedules.map(s => {
    const r = results.find(r => r.subject_id === s.subject_id)
    const subTotal = s.total_marks ?? exam.total_marks
    const subName = s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id

    if (!r) {
      return `<tr>
        <td style="${tdStyle}">${subName}</td>
        <td style="${tdCenter}">—</td>
        <td style="${tdCenter}">—</td>
        <td style="${tdCenter}">—</td>
        <td style="${tdCenter}">—</td>
      </tr>`
    }

    if (r.is_absent) {
      return `<tr style="background:#fff1f2">
        <td style="${tdStyle}">${subName}</td>
        <td style="${tdCenter}">—</td>
        <td style="${tdCenter}">${subTotal}</td>
        <td style="${tdCenter}" colspan="2"><strong style="color:#b91c1c">ABSENT</strong></td>
      </tr>`
    }

    const bg = r.grade ? GRADE_PRINT_COLOR[r.grade] ?? 'white' : 'white'
    return `<tr>
      <td style="${tdStyle}">${subName}</td>
      <td style="${tdCenter};font-weight:700">${r.marks_obtained}</td>
      <td style="${tdCenter}">${subTotal}</td>
      <td style="${tdCenter};background:${bg};font-weight:700">${r.grade ?? '—'}</td>
      <td style="${tdCenter};font-family:monospace">${r.gpa?.toFixed(2) ?? '—'}</td>
    </tr>`
  }).join('')

  const validScores = results.filter(r => !r.is_absent && r.marks_obtained !== null)
  const totalObtained = validScores.reduce((sum, r) => sum + (r.marks_obtained ?? 0), 0)
  const totalPossible = schedules.reduce((sum, s) => sum + (s.total_marks ?? exam.total_marks), 0)
  const isPass = validScores.every(r => (r.gpa ?? 0) > 0) && validScores.length === schedules.length
  const avgGpa = validScores.length > 0
    ? (validScores.reduce((sum, r) => sum + (r.gpa ?? 0), 0) / schedules.length).toFixed(2)
    : '0.00'

  const thStyle = 'border:1px solid #cbd5e1;padding:7px 10px;background:#1e293b;color:white;font-size:11px;text-align:center;'
  const thLeft  = 'border:1px solid #cbd5e1;padding:7px 10px;background:#1e293b;color:white;font-size:11px;text-align:left;'

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${studentName} — ${exam.name} Result Card</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: white; padding: 24px; max-width: 600px; margin: 0 auto; }
    @media print {
      body { padding: 12px; }
      @page { size: A5 portrait; margin: 10mm; }
    }
    table { border-collapse: collapse; width: 100%; margin-top: 14px; }
    .header { text-align: center; margin-bottom: 8px; }
    .school-name { font-size: 16px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; }
    .card-title { font-size: 13px; font-weight: 700; color: #475569; margin-top: 2px; }
    .divider { border: none; border-top: 2px solid #1e293b; margin: 10px 0; }
    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 11px; margin-top: 8px; }
    .info-row { display: flex; gap: 6px; }
    .info-label { color: #64748b; font-weight: 600; width: 65px; }
    .info-value { color: #0f172a; font-weight: 700; }
    .result-banner { display: flex; justify-content: space-between; align-items: center; background: #f8fafc; border: 1.5px solid ${isPass ? '#059669' : '#e11d48'}; border-radius: 6px; padding: 10px 14px; margin-top: 14px; }
    .result-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; }
    .result-value { font-size: 16px; font-weight: 900; color: ${isPass ? '#059669' : '#e11d48'}; }
    .sig { margin-top: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #475569; }
    .sig-line { border-top: 1px solid #334155; width: 140px; padding-top: 4px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">${inst.name.toUpperCase()}</div>
    ${inst.nameBn ? `<div style="font-size:11px; color:#475569; font-weight:600;">${inst.nameBn}</div>` : ''}
    <div style="font-size:9.5px; color:#64748b;">EIIN: ${inst.eiin} • ${inst.address}</div>
    <div class="card-title">Individual Student Result Card (Session ${inst.session})</div>
  </div>
  <hr class="divider"/>

  <div class="info-grid">
    <div>
      <div class="info-row"><span class="info-label">Student:</span><span class="info-value">${studentName}</span></div>
      <div class="info-row" style="margin-top:4px"><span class="info-label">Roll No:</span><span class="info-value">${rollNumber}</span></div>
      <div class="info-row" style="margin-top:4px"><span class="info-label">Class:</span><span class="info-value">${examTarget || '—'}</span></div>
    </div>
    <div>
      <div class="info-row"><span class="info-label">Exam:</span><span class="info-value">${exam.name}</span></div>
      <div class="info-row" style="margin-top:4px"><span class="info-label">Type:</span><span class="info-value">${EXAM_SCOPE_LABELS[exam.scope]}</span></div>
      <div class="info-row" style="margin-top:4px"><span class="info-label">Print Date:</span><span class="info-value">${printDate}</span></div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th style="${thLeft}">Subject</th>
        <th style="${thStyle}">Obtained</th>
        <th style="${thStyle}">Total</th>
        <th style="${thStyle}">Grade</th>
        <th style="${thStyle}">GPA</th>
      </tr>
    </thead>
    <tbody>${subjectRows}</tbody>
    <tfoot>
      <tr style="background:#f1f5f9">
        <td style="border:1px solid #cbd5e1;padding:7px 10px;font-size:11px;font-weight:700">TOTAL</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;text-align:center;font-size:12px;font-weight:800">${totalObtained}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;text-align:center;font-size:11px">${totalPossible}</td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;text-align:center;font-size:11px"></td>
        <td style="border:1px solid #cbd5e1;padding:7px 10px;text-align:center;font-size:12px;font-weight:800">${avgGpa}</td>
      </tr>
    </tfoot>
  </table>

  <div class="result-banner">
    <div>
      <div class="result-label">Overall Result</div>
      <div style="font-size:11px;color:${isPass ? '#065f46' : '#991b1b'};margin-top:2px">GPA: ${avgGpa} · ${totalObtained}/${totalPossible} marks</div>
    </div>
    <div class="result-value">${isPass ? 'PASSED ✓' : 'FAILED ✗'}</div>
  </div>

  <div class="sig">
    <div class="sig-line">Class Teacher</div>
    <div class="sig-line">${inst.principalDesignation}</div>
  </div>
</body>
</html>`
}

export function printStudentResultCard(props: Props) {
  const html = buildStudentCardHTML(props)
  const win = window.open('', '_blank', 'width=800,height=900')
  if (!win) { alert('Please allow popups to print the result card.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 600)
}
