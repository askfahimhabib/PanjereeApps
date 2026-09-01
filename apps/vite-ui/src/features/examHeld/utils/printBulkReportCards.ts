import type { ExamHeld, StudentTabulationRow } from '../types'
import { EXAM_SCOPE_LABELS } from '../types'

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
            <div class="school-name">PANJEREE ACADEMY & MODEL SCHOOL</div>
            <div class="school-sub">Affiliated with Bangladesh Secondary & Higher Secondary Education Board</div>
            <div class="card-badge">ACADEMIC TRANSCRIPT & PROGRESS REPORT</div>
            <div class="exam-title">${exam.name} (${EXAM_SCOPE_LABELS[exam.scope]})</div>
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
                <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px">—</td>
                <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:11px">${student.grade}</td>
                <td style="padding:6px 8px;border:1px solid #cbd5e1;text-align:center;font-size:12px;color:#0f172a">${student.gpa.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <div class="result-summary-grid">
            <div class="summary-card ${isPass ? 'pass-card' : 'fail-card'}">
              <div class="sum-title">FINAL RESULT</div>
              <div class="sum-status">${isPass ? 'PASSED' : 'FAILED'}</div>
              <div class="sum-details">Percentage: <strong>${student.percentage}%</strong> · GPA: <strong>${student.gpa.toFixed(2)}</strong></div>
            </div>
            
            <div class="grade-scale-mini">
              <div class="scale-title">Grading Scale</div>
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
            <div class="sig-line">Exam Controller</div>
            <div class="sig-line">Headmaster / Principal</div>
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
      padding: 16mm 14mm;
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
      break-after: page;
      page-break-after: always;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    @media print {
      body { background: white; }
      .report-card-sheet {
        box-shadow: none;
        margin: 0;
        padding: 0;
        min-height: auto;
        page-break-after: always;
        break-after: page;
      }
    }

    .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 10px; margin-bottom: 12px; }
    .school-name { font-size: 18px; font-weight: 900; color: #1e1b4b; letter-spacing: 0.5px; }
    .school-sub { font-size: 10px; color: #64748b; margin-top: 2px; }
    .card-badge { display: inline-block; background: #312e81; color: white; font-size: 10px; font-weight: 800; padding: 3px 12px; border-radius: 999px; margin-top: 6px; letter-spacing: 1px; }
    .exam-title { font-size: 13px; font-weight: 700; color: #334155; margin-top: 5px; }

    .student-info-box {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 10px 14px;
      margin-bottom: 14px;
      font-size: 11px;
    }
    .info-row { margin-bottom: 4px; display: flex; }
    .info-row .lbl { color: #64748b; width: 100px; flex-shrink: 0; }
    .info-row .val { color: #0f172a; }

    .marks-table { width: 100%; border-collapse: collapse; margin-bottom: 14px; }
    .marks-table th { background: #1e293b; color: #f8fafc; font-size: 10px; text-transform: uppercase; letter-spacing: 0.5px; padding: 6px 8px; border: 1px solid #94a3b8; }
    .marks-table td { border: 1px solid #cbd5e1; }

    .result-summary-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: 12px;
      margin-bottom: 12px;
    }

    .summary-card {
      padding: 10px 14px;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: center;
    }
    .pass-card { background: #f0fdf4; border: 1.5px solid #86efac; color: #166534; }
    .fail-card { background: #fef2f2; border: 1.5px solid #fca5a5; color: #991b1b; }
    .sum-title { font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; opacity: 0.8; }
    .sum-status { font-size: 18px; font-weight: 900; letter-spacing: 0.5px; }
    .sum-details { font-size: 11px; margin-top: 2px; }

    .grade-scale-mini {
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 8px 10px;
      font-size: 9px;
      color: #64748b;
    }
    .scale-title { font-weight: 800; text-transform: uppercase; color: #475569; margin-bottom: 4px; }
    .scale-chips { display: flex; flex-wrap: wrap; gap: 4px; }
    .scale-chips span { background: #e2e8f0; padding: 2px 5px; border-radius: 4px; }

    .remarks-box {
      border: 1px dashed #cbd5e1;
      border-radius: 6px;
      padding: 8px 12px;
      font-size: 11px;
      color: #334155;
      background: #fafafa;
      margin-bottom: 30px;
    }

    .signatures {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-top: 20px;
      font-size: 10px;
      color: #475569;
    }
    .sig-line {
      border-top: 1px solid #0f172a;
      text-align: center;
      padding-top: 4px;
      font-weight: 600;
    }
  </style>
</head>
<body>
  ${cardsHtml}
</body>
</html>`

  const win = window.open('', '_blank', 'width=950,height=950')
  if (!win) {
    alert('Please allow popups in your browser to print the batch report cards.')
    return
  }
  win.document.write(fullHtml)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
  }, 700)
}
