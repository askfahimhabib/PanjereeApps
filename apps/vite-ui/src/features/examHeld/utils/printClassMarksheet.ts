/**
 * PrintClassMarksheet
 * Opens a new browser window with a printable master tabulation marksheet,
 * then triggers window.print() automatically.
 */

import type { ExamHeld, ExamResult, StudentTabulationRow, SubjectScore } from '../types'
import { EXAM_SCOPE_LABELS, calculateGrade, calculateStudentOverallResult, assignMeritRanks } from '../types'

interface Props {
  exam: ExamHeld
  students?: StudentTabulationRow[]
  results?: ExamResult[]
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

export function printClassMarksheet({ exam, students: providedStudents, results }: Props) {
  const schedules = exam.exam_held_schedules ?? []
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const examTarget = exam.classes?.name ?? exam.batches?.name ?? ''

  // If students not provided, construct from results
  let students: StudentTabulationRow[] = providedStudents ?? []
  if (!providedStudents && results) {
    const studentMap = new Map<string, { name: string; roll: string }>()
    for (const r of results) {
      if (!studentMap.has(r.student_id)) {
        studentMap.set(r.student_id, { name: r.student_name, roll: r.roll_number })
      }
    }
    const rawList: StudentTabulationRow[] = Array.from(studentMap.entries()).map(([id, info]) => {
      const scores: Record<string, SubjectScore> = {}
      for (const s of schedules) {
        const r = results.find(res => res.student_id === id && res.subject_id === s.subject_id)
        const totalMarks = s.total_marks ?? exam.total_marks
        const passMarks = s.pass_marks ?? exam.pass_marks ?? 33
        const marks = r?.marks_obtained ?? null
        const isAbsent = r?.is_absent ?? false
        const gradeRes = marks !== null && !isAbsent ? calculateGrade(marks, totalMarks) : null
        scores[s.subject_id] = {
          subjectId: s.subject_id,
          subjectName: s.subjects?.name ?? s.subject_id,
          totalMarks,
          passMarks,
          marks,
          isAbsent,
          grade: isAbsent ? 'F' : gradeRes?.grade ?? null,
          gpa: isAbsent ? 0 : gradeRes?.gpa ?? null,
        }
      }
      const overall = calculateStudentOverallResult(scores)
      return {
        studentId: id,
        studentName: info.name,
        rollNumber: info.roll,
        sectionName: 'A',
        scores,
        ...overall,
      }
    })
    students = assignMeritRanks(rawList)
  }


  const subjects = schedules.map(s => ({
    id: s.subject_id,
    name: s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id,
    totalMarks: s.total_marks ?? exam.total_marks,
    passMarks: s.pass_marks ?? exam.pass_marks ?? 33,
  }))

  const thStyle = 'border:1px solid #cbd5e1;padding:6px 6px;background:#1e293b;color:#f1f5f9;font-size:10px;text-align:center;white-space:nowrap;'
  const thLeft  = 'border:1px solid #cbd5e1;padding:6px 8px;background:#1e293b;color:#f1f5f9;font-size:10px;text-align:left;'

  const subjectHeaders = subjects.map(s =>
    `<th style="${thStyle}">${s.name}<br/><span style="font-weight:400;font-size:9px;color:#94a3b8">/${s.totalMarks}</span></th>`
  ).join('')

  let passCount = 0

  const rows = students.map((stu) => {
    const isPass = stu.isPass
    if (isPass) passCount++

    const scoreCells = subjects.map((sub) => {
      const score = stu.scores[sub.id]
      if (!score || score.marks === null) {
        return `<td style="border:1px solid #cbd5e1;padding:4px;text-align:center;font-size:10px;color:#94a3b8">—</td>`
      }
      if (score.isAbsent) {
        return `<td style="border:1px solid #cbd5e1;padding:4px;text-align:center;font-size:10px;background:#fee2e2;color:#b91c1c;font-weight:700">ABS</td>`
      }
      const bg = score.grade ? GRADE_PRINT_COLOR[score.grade] ?? '#f8fafc' : '#f8fafc'
      const isFail = score.grade === 'F'
      return `<td style="border:1px solid #cbd5e1;padding:4px;text-align:center;font-size:10px;background:${bg}">
        <span style="font-weight:700;color:${isFail ? '#b91c1c' : '#0f172a'}">${score.marks}</span>
        <span style="font-size:8px;color:#64748b;display:block">${score.grade ?? ''}</span>
      </td>`
    }).join('')

    return `
      <tr style="${isPass ? '' : 'background:#fff1f2'}">
        <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-size:10px;font-family:monospace">${stu.rollNumber}</td>
        <td style="border:1px solid #cbd5e1;padding:4px 8px;font-size:10px;font-weight:600">${stu.studentName}</td>
        <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-size:10px">${stu.sectionName || 'A'}</td>
        ${scoreCells}
        <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-size:10px;font-weight:700">${stu.totalObtained}</td>
        <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-size:10px;font-weight:700;background:${isPass ? '#d1fae5' : '#fee2e2'};color:${isPass ? '#065f46' : '#991b1b'}">
          ${stu.gpa.toFixed(2)} (${stu.grade})
        </td>
        <td style="border:1px solid #cbd5e1;padding:4px 6px;text-align:center;font-size:10px;font-weight:700;color:${isPass ? '#065f46' : '#991b1b'}">
          ${isPass ? (stu.rank ? '#' + stu.rank : 'PASS') : 'FAILED'}
        </td>
      </tr>`
  }).join('')

  const failCount = students.length - passCount
  const passRate = students.length > 0 ? Math.round((passCount / students.length) * 100) : 0

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${exam.name} — Master Tabulation Marksheet</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #0f172a; background: white; padding: 18px; }
    @media print {
      body { padding: 8px; }
      @page { size: A4 landscape; margin: 8mm; }
    }
    table { border-collapse: collapse; width: 100%; margin-top: 12px; }
    .header { text-align: center; margin-bottom: 8px; }
    .school-name { font-size: 18px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; }
    .exam-title { font-size: 13px; font-weight: 700; color: #334155; margin-top: 2px; }
    .meta { font-size: 10px; color: #64748b; margin-top: 4px; display: flex; justify-content: center; gap: 16px; }
    .divider { border: none; border-top: 2px solid #1e293b; margin: 8px 0; }
    .summary-box { display: flex; gap: 24px; font-size: 10px; color: #334155; margin-top: 10px; background: #f8fafc; padding: 8px 12px; border: 1px solid #e2e8f0; border-radius: 4px; }
    .summary-box span { font-weight: 700; }
    .sig { margin-top: 36px; display: flex; justify-content: space-between; font-size: 10px; }
    .sig-line { border-top: 1px solid #1e293b; width: 140px; padding-top: 4px; text-align: center; font-weight: 600; }
  </style>
</head>
<body>
  <div class="header">
    <div class="school-name">PANJEREE ACADEMY & MODEL SCHOOL</div>
    <div class="exam-title">${exam.name} — Tabulation Master Marksheet</div>
    <div class="meta">
      <span>Class: <strong>${examTarget || '—'}</strong></span>
      <span>Scope: <strong>${EXAM_SCOPE_LABELS[exam.scope]}</strong></span>
      <span>Total Subjects: <strong>${subjects.length}</strong></span>
      <span>Print Date: <strong>${printDate}</strong></span>
    </div>
  </div>
  <hr class="divider"/>

  <table>
    <thead>
      <tr>
        <th style="${thStyle};width:35px">Roll</th>
        <th style="${thLeft}">Student Name</th>
        <th style="${thStyle};width:45px">Sec</th>
        ${subjectHeaders}
        <th style="${thStyle};width:55px">Total</th>
        <th style="${thStyle};width:70px">GPA / Grade</th>
        <th style="${thStyle};width:55px">Rank</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>

  <div class="summary-box">
    <div>Total Enrolled: <span>${students.length}</span></div>
    <div>Passed: <span style="color:#065f46">${passCount}</span></div>
    <div>Failed: <span style="color:#991b1b">${failCount}</span></div>
    <div>Pass Rate: <span>${passRate}%</span></div>
    <div>Grading System: <span>BD Education Board (A+ to F)</span></div>
  </div>

  <div class="sig">
    <div class="sig-line">Prepared by (Tabulator)</div>
    <div class="sig-line">Class Teacher</div>
    <div class="sig-line">Exam Controller</div>
    <div class="sig-line">Principal / Headmaster</div>
  </div>
</body>
</html>`

  const win = window.open('', '_blank', 'width=1200,height=800')
  if (!win) {
    alert('Please allow popups to print the marksheet.')
    return
  }
  win.document.write(html)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
  }, 600)
}

