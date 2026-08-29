/**
 * PrintClassMarksheet
 * Opens a new browser window with a printable class marksheet,
 * then triggers window.print() automatically.
 *
 * Layout:
 *  ┌─────────────────────────────────────────┐
 *  │  Institution header                     │
 *  │  Exam name · Class · Scope · Date       │
 *  ├──────┬──────────────┬───┬───┬───┬───────┤
 *  │ Roll │ Student Name │ S1│ S2│ S3│  GPA  │
 *  ├──────┼──────────────┼───┼───┼───┼───────┤
 *  │  …   │  …           │ … │ … │ … │   …   │
 *  └──────┴──────────────┴───┴───┴───┴───────┘
 *  Footer: pass/fail summary
 */

import type { ExamHeld, ExamResult } from '../types'
import { EXAM_SCOPE_LABELS } from '../types'

interface Props {
  exam: ExamHeld
  results: ExamResult[]
}

// ─── Grade → background color (light, print-friendly) ────────────────────────
const GRADE_PRINT_COLOR: Record<string, string> = {
  'A+': '#d1fae5',
  'A':  '#d1fae5',
  'A-': '#ccfbf1',
  'B':  '#dbeafe',
  'C':  '#fef9c3',
  'D':  '#ffedd5',
  'F':  '#fee2e2',
}

function buildMarksheetHTML({ exam, results }: Props): string {
  const schedules = exam.exam_held_schedules ?? []

  // Unique students sorted by roll
  const studentMap = new Map<string, { name: string; roll: string }>()
  for (const r of results) {
    if (!studentMap.has(r.student_id)) {
      studentMap.set(r.student_id, { name: r.student_name, roll: r.roll_number })
    }
  }
  const students = [...studentMap.entries()]
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => (parseInt(a.roll) || 0) - (parseInt(b.roll) || 0))

  // Subject columns
  const subjects = schedules.map(s => ({
    id: s.subject_id,
    name: s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id,
    totalMarks: s.total_marks ?? exam.total_marks,
  }))

  // Quick lookup: student + subject → result
  const lookup = new Map<string, ExamResult>()
  for (const r of results) {
    lookup.set(`${r.student_id}__${r.subject_id}`, r)
  }

  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const examTarget = exam.classes?.name ?? exam.batches?.name ?? ''

  // Build header row
  const thStyle = 'border:1px solid #cbd5e1;padding:6px 8px;background:#1e293b;color:#f1f5f9;font-size:11px;text-align:center;white-space:nowrap;'
  const thLeft  = 'border:1px solid #cbd5e1;padding:6px 8px;background:#1e293b;color:#f1f5f9;font-size:11px;text-align:left;'

  let subjectHeaders = subjects.map(s =>
    `<th style="${thStyle}">${s.name}<br/><span style="font-weight:400;font-size:10px;color:#94a3b8">/${s.totalMarks}</span></th>`
  ).join('')

  // Build student rows
  let rows = ''
  let passCount = 0
  for (const student of students) {
    const cells = subjects.map(sub => {
      const r = lookup.get(`${student.id}__${sub.id}`)
      if (!r) return `<td style="border:1px solid #cbd5e1;padding:5px 6px;text-align:center;font-size:11px;color:#94a3b8">—</td>`
      if (r.is_absent) return `<td style="border:1px solid #cbd5e1;padding:5px 6px;text-align:center;font-size:11px;background:#fee2e2;color:#b91c1c">ABS</td>`
      const bg = r.grade ? GRADE_PRINT_COLOR[r.grade] ?? '#f8fafc' : '#f8fafc'
      return `<td style="border:1px solid #cbd5e1;padding:5px 6px;text-align:center;font-size:11px;background:${bg}">
        <strong>${r.marks_obtained ?? '—'}</strong>
        <span style="font-size:9px;color:#64748b;display:block">${r.grade ?? ''}</span>
      </td>`
    }).join('')

    // Calculate overall GPA (average of non-absent subjects)
    const presentResults = subjects.map(s => lookup.get(`${student.id}__${s.id}`)).filter(r => r && !r.is_absent)
    const avgGpa = presentResults.length
      ? (presentResults.reduce((sum, r) => sum + (r!.gpa ?? 0), 0) / presentResults.length).toFixed(2)
      : '—'
    const hasFail = presentResults.some(r => r!.grade === 'F')
    const overallGrade = hasFail ? 'F' : (presentResults[0]?.grade ?? '—')
    const isPass = !hasFail && presentResults.length > 0
    if (isPass) passCount++

    const rowBg = isPass ? '' : 'background:#fff1f2;'
    rows += `
      <tr style="${rowBg}">
        <td style="border:1px solid #cbd5e1;padding:5px 8px;text-align:center;font-size:11px;font-family:monospace">${student.roll}</td>
        <td style="border:1px solid #cbd5e1;padding:5px 8px;font-size:11px">${student.name}</td>
        ${cells}
        <td style="border:1px solid #cbd5e1;padding:5px 8px;text-align:center;font-size:11px;font-weight:700;background:${isPass ? '#d1fae5' : '#fee2e2'};color:${isPass ? '#065f46' : '#991b1b'}">
          ${avgGpa}<br/><span style="font-size:9px">${isPass ? 'PASS' : 'FAIL'}</span>
        </td>
      </tr>`
  }

  const failCount = students.length - passCount

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${exam.name} — Class Marksheet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: white; padding: 24px; }
    @media print {
      body { padding: 12px; }
      @page { size: A4 landscape; margin: 12mm; }
    }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    .header { text-align: center; margin-bottom: 12px; }
    .school-name { font-size: 20px; font-weight: 800; color: #1e293b; }
    .exam-title { font-size: 15px; font-weight: 700; color: #334155; margin-top: 4px; }
    .meta { font-size: 11px; color: #64748b; margin-top: 4px; display: flex; justify-content: center; gap: 20px; }
    .divider { border: none; border-top: 2px solid #334155; margin: 10px 0; }
    .footer { margin-top: 16px; display: flex; justify-content: space-between; font-size: 10px; color: #64748b; }
    .summary { display: flex; gap: 20px; font-size: 11px; color: #334155; margin-top: 8px; }
    .summary span { font-weight: 700; }
    .sig { margin-top: 48px; display: flex; justify-content: space-between; font-size: 11px; }
    .sig-line { border-top: 1px solid #334155; width: 160px; padding-top: 4px; text-align: center; }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">Panjeree Apps LMS</div>
    <div class="exam-title">${exam.name}</div>
    <div class="meta">
      <span>Class: ${examTarget || '—'}</span>
      <span>Type: ${EXAM_SCOPE_LABELS[exam.scope]}</span>
      <span>Total Marks: ${exam.total_marks}</span>
      ${exam.pass_marks ? `<span>Pass Marks: ${exam.pass_marks}</span>` : ''}
    </div>
  </div>
  <hr class="divider"/>

  <table>
    <thead>
      <tr>
        <th style="${thStyle}">Roll</th>
        <th style="${thLeft}">Student Name</th>
        ${subjectHeaders}
        <th style="${thStyle}">GPA / Result</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="summary">
    <div>Total Students: <span>${students.length}</span></div>
    <div>Passed: <span style="color:#065f46">${passCount}</span></div>
    <div>Failed: <span style="color:#991b1b">${failCount}</span></div>
    <div>Pass Rate: <span>${students.length ? Math.round((passCount / students.length) * 100) : 0}%</span></div>
  </div>

  <div class="sig">
    <div class="sig-line">Class Teacher</div>
    <div class="sig-line">Head Teacher / Principal</div>
    <div class="sig-line">Date: ${printDate}</div>
  </div>
</body>
</html>`
}

export function printClassMarksheet(props: Props) {
  const html = buildMarksheetHTML(props)
  const win = window.open('', '_blank', 'width=1200,height=800')
  if (!win) { alert('Please allow popups to print the marksheet.'); return }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => { win.print() }, 600)
}
