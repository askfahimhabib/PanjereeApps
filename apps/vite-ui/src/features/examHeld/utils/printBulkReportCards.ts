import type { ExamHeld, StudentTabulationRow } from '../types'
import { EXAM_SCOPE_LABELS } from '../types'
import { getInstitutionInfo } from '@/lib/institutionInfo'

interface Props {
  exam: ExamHeld
  students: StudentTabulationRow[]
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

export function printBulkReportCards({ exam, students }: Props) {
  const inst = getInstitutionInfo()
  const schedules = exam.exam_held_schedules ?? []
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
  const examTarget = exam.classes?.name ?? exam.batches?.name ?? ''

  // Compute highest score for each subject in this exam for the "Highest Marks" column
  const subjectHighestMap: Record<string, number> = {}
  for (const s of schedules) {
    let max = 0
    for (const stu of students) {
      const score = stu.scores[s.subject_id]
      if (score && !score.isAbsent && score.marks !== null && score.marks > max) {
        max = score.marks
      }
    }
    subjectHighestMap[s.subject_id] = max
  }

  const cardsHtml = students.map((student) => {
    const isPass = student.isPass
    const rowsHtml = schedules.map((s) => {
      const score = student.scores[s.subject_id]
      const subName = s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id
      const subTotal = s.total_marks ?? exam.total_marks
      const subHighest = subjectHighestMap[s.subject_id] ?? '—'

      if (!score || score.marks === null) {
        return `<tr>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-size:11px">${subName}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#94a3b8">—</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px">${subTotal}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#64748b">${subHighest}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#94a3b8">—</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#94a3b8">—</td>
        </tr>`
      }

      if (score.isAbsent) {
        return `<tr style="background:#fff1f2">
          <td style="padding:6px 8px;border:1px solid #cbd5e1;font-size:11px">${subName}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#b91c1c;font-weight:700">ABS</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px">${subTotal}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#64748b">${subHighest}</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#b91c1c;font-weight:700">F</td>
          <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#b91c1c">0.00</td>
        </tr>`
      }

      const bg = score.grade ? GRADE_PRINT_COLOR[score.grade] ?? '#f8fafc' : '#f8fafc'

      return `<tr>
        <td style="padding:6px 8px;border:1px solid #cbd5e1;font-size:11px">${subName}</td>
        <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;font-weight:700">${score.marks}</td>
        <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px">${subTotal}</td>
        <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#64748b">${subHighest}</td>
        <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;background:${bg};font-weight:700">${score.grade ?? '—'}</td>
        <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;font-family:monospace">${score.gpa?.toFixed(2) ?? '—'}</td>
      </tr>`
    }).join('')

    return `
      <div class="report-card-sheet">
        <div class="card-inner">
          <div class="header">
            <div class="school-name">${inst.name.toUpperCase()}</div>
            ${inst.nameBn ? `<div style="font-size:12px; color:#475569; font-weight:600; margin-top:-2px;">${inst.nameBn}</div>` : ''}
            <div class="school-sub">EIIN: ${inst.eiin} • Affiliated with ${inst.board}</div>
            <div class="card-badge">ACADEMIC TRANSCRIPT & PROGRESS REPORT</div>
            <div class="exam-title">${exam.name} (${EXAM_SCOPE_LABELS[exam.scope]}) — Academic Session ${inst.session}</div>
          </div>

          <div class="student-info-box">
            <div class="info-col">
              <div class="info-row"><span class="lbl">Student Name:</span> <strong class="val">${student.studentName}</strong></div>
              <div class="info-row"><span class="lbl">Roll Number:</span> <strong class="val">${student.rollNumber}</strong></div>
              <div class="info-row"><span class="lbl">Class / Level:</span> <span class="val">${examTarget || '—'}</span></div>
            </div>
            <div class="info-col">
              <div class="info-row"><span class="lbl">Section:</span> <span class="val">${student.sectionName || 'A'}</span></div>
              <div class="info-row"><span class="lbl">Class Rank:</span> <strong class="val" style="color:${isPass ? '#15803d' : '#b91c1c'}">${student.rank ? '#' + student.rank : '—'}</strong></div>
              <div class="info-row"><span class="lbl">Issue Date:</span> <span class="val">${printDate}</span></div>
            </div>
          </div>

          <table class="marks-table">
            <thead>
              <tr>
                <th style="text-align:left;width:38%">Subject</th>
                <th style="width:12%">Obtained</th>
                <th style="width:12%">Total</th>
                <th style="width:12%">Highest</th>
                <th style="width:12%">Grade</th>
                <th style="width:14%">Grade Point</th>
              </tr>
            </thead>
            <tbody>
              ${rowsHtml}
            </tbody>
            <tfoot>
              <tr style="background:#f8fafc;font-weight:bold">
                <td style="padding:6px 8px;border:1px solid #cbd5e1;font-size:11px">TOTAL AGGREGATE</td>
                <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:12px;color:#0f172a">${student.totalObtained}</td>
                <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px">${student.totalPossible}</td>
                <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px;color:#64748b">—</td>
                <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:12px;color:${isPass ? '#15803d' : '#b91c1c'}">${student.grade}</td>
                <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:13px;font-family:monospace;color:${isPass ? '#15803d' : '#b91c1c'}">${student.gpa.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="summary-and-scale">
            <div class="result-summary-box" style="border-color:${isPass ? '#86efac' : '#fca5a5'};background:${isPass ? '#f0fdf4' : '#fff1f2'}">
              <div class="sum-title">FINAL RESULT</div>
              <div class="sum-status" style="color:${isPass ? '#15803d' : '#b91c1c'}">${isPass ? 'PASSED ✓' : 'FAILED ✗'}</div>
              <div class="sum-details">Percentage: <strong>${student.percentage}%</strong> · GPA: <strong>${student.gpa.toFixed(2)}</strong></div>
            </div>
            
            <div class="grade-scale-mini">
              <div class="scale-title">Grading Scale (NCTB Standard)</div>
              <div class="scale-chips">
                <span>A+ (80-100 / 5.0)</span>
                <span>A (70-79 / 4.0)</span>
                <span>A- (60-69 / 3.5)</span>
                <span>B (50-59 / 3.0)</span>
                <span>C (40-49 / 2.0)</span>
                <span>D (33-39 / 1.0)</span>
                <span>F (0-32 / 0.0)</span>
              </div>
            </div>
          </div>

          <div class="remarks-box">
            <strong>Teacher's Remark:</strong> ${
              isPass
                ? student.gpa >= 4.5
                  ? 'Outstanding performance! Keep up the excellent work.'
                  : student.gpa >= 3.5
                  ? 'Good performance with steady progress. Scope for improvement in core subjects.'
                  : 'Satisfactory. Needs dedicated effort and regular practice.'
                : 'Unsatisfactory result. Parent-teacher consultation required immediately.'
            }
          </div>

          <div class="signatures">
            <div class="sig-line">Class Teacher</div>
            <div class="sig-line">${inst.examinerTitle}</div>
            ${inst.showPrincipalSign ? `<div class="sig-line">${inst.principalDesignation}</div>` : ''}
            <div class="sig-line">Guardian Signature</div>
          </div>
        </div>
      </div>
    `
  }).join('')

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${exam.name} — Bulk Student Report Cards</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; color: #0f172a; background: #e2e8f0; }
    
    @page {
      size: A4 portrait;
      margin: 10mm 12mm;
    }

    .report-card-sheet {
      background: white;
      max-width: 210mm;
      min-height: 275mm;
      margin: 20px auto;
      padding: 16px 20px;
      page-break-after: always;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }

    .card-inner {
      border: 2px solid #0f172a;
      border-radius: 8px;
      padding: 16px 20px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .header { text-align: center; margin-bottom: 12px; }
    .school-name { font-size: 18px; font-weight: 900; color: #1e1b4b; letter-spacing: 0.5px; }
    .school-sub { font-size: 10px; color: #475569; margin-top: 2px; }
    .card-badge {
      display: inline-block;
      margin-top: 6px;
      padding: 3px 14px;
      background: #0f172a;
      color: white;
      font-size: 10px;
      font-weight: 800;
      border-radius: 20px;
      letter-spacing: 1px;
    }
    .exam-title { font-size: 12px; font-weight: 700; color: #334155; margin-top: 4px; }

    .student-info-box {
      display: flex;
      justify-content: space-between;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 14px;
      margin-bottom: 10px;
      font-size: 11px;
    }
    .info-col { display: flex; flex-direction: column; gap: 4px; }
    .info-row { display: flex; gap: 6px; }
    .lbl { color: #64748b; font-size: 10px; text-transform: uppercase; font-weight: 600; width: 85px; }
    .val { color: #0f172a; font-size: 11px; }

    .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 8px; }
    .marks-table th { background: #1e293b; color: white; padding: 6px 8px; font-size: 10px; border: 1px solid #334155; text-transform: uppercase; }
    .marks-table td { font-size: 11px; }

    .summary-and-scale { display: flex; gap: 12px; margin-bottom: 8px; }
    .result-summary-box { flex: 1; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 8px 12px; text-align: center; }
    .sum-title { font-size: 9px; font-weight: 800; color: #64748b; letter-spacing: 1px; }
    .sum-status { font-size: 16px; font-weight: 900; margin: 2px 0; }
    .sum-details { font-size: 10px; color: #334155; }

    .grade-scale-mini { flex: 1.5; border: 1px solid #e2e8f0; border-radius: 6px; padding: 6px 10px; background: #f8fafc; }
    .scale-title { font-size: 9px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 4px; }
    .scale-chips { display: flex; flex-wrap: wrap; gap: 4px; font-size: 8.5px; color: #334155; }
    .scale-chips span { background: white; border: 1px solid #cbd5e1; padding: 1px 4px; border-radius: 3px; }

    .remarks-box { background: #fffbeb; border: 1px solid #fef3c7; border-radius: 6px; padding: 6px 10px; font-size: 10.5px; color: #92400e; margin-bottom: 12px; }

    .signatures { display: flex; justify-content: space-between; margin-top: 14px; padding-top: 8px; }
    .sig-line { border-top: 1px solid #334155; width: 130px; text-align: center; font-size: 9px; font-weight: 700; color: #475569; padding-top: 4px; text-transform: uppercase; }

    @media print {
      body { background: white; }
      .no-print { display: none !important; }
      .report-card-sheet { box-shadow: none; margin: 0 auto; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="position:fixed;top:10px;right:10px;z-index:9999;background:white;padding:8px 14px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;gap:10px;align-items:center;">
    <span style="font-size:12px;font-weight:700;">Bulk Print: ${students.length} Student Report Cards</span>
    <button onclick="window.print()" style="background:#4f46e5;color:white;border:none;padding:6px 16px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Print All (A4) 🖨️</button>
  </div>
  ${cardsHtml}
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=950')
  if (!win) {
    alert('Popup blocked! Please allow popups to print report cards.')
    return
  }
  win.document.open()
  win.document.write(fullHtml)
  win.document.close()
}
