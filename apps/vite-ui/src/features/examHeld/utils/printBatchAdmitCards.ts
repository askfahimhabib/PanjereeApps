import type { ExamHeld } from '../types'
import { EXAM_SCOPE_LABELS } from '../types'
import { studentStore } from '@/data/stores'
import { format, parseISO } from 'date-fns'

interface Props {
  exam: ExamHeld
}

export function printBatchAdmitCards({ exam }: Props) {
  const schedules = exam.exam_held_schedules ?? []
  const examTarget = exam.classes?.name ?? exam.batches?.name ?? ''
  const printDate = new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })

  // 1. Fetch active students enrolled in this exam's class or batch
  const enrolledStudents =
    exam.target_type === 'CLASS' && exam.class_id
      ? studentStore
          .getWhere((s) => s.classId === exam.class_id && s.status === 'ACTIVE')
          .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
      : exam.target_type === 'BATCH' && exam.batch_id
      ? studentStore
          .getWhere((s) => s.batchId === exam.batch_id && s.status === 'ACTIVE')
          .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
      : []

  if (enrolledStudents.length === 0) {
    alert('No active students found for this class or batch to generate admit cards.')
    return
  }

  // 2. Build schedule rows HTML
  const scheduleRowsHtml = schedules.map((s, idx) => {
    const subName = s.subjects?.name_bn ?? s.subjects?.name ?? s.subject_id
    const dateFormatted = s.date ? format(parseISO(s.date), 'dd MMM yyyy (EEE)') : '—'
    const timeFormatted = s.start_time && s.end_time ? `${s.start_time} - ${s.end_time}` : '—'
    const room = s.room || 'Hall 1'

    return `
      <tr>
        <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;font-size:10px;font-family:monospace">${idx + 1}</td>
        <td style="padding:4px 8px;border:1px solid #cbd5e1;font-size:10px;font-weight:600">${subName}</td>
        <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;font-size:10px">${dateFormatted}</td>
        <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;font-size:10px">${timeFormatted}</td>
        <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;font-size:10px">${room}</td>
        <td style="padding:4px 6px;border:1px solid #cbd5e1;text-align:center;font-size:10px;color:#94a3b8">________________</td>
      </tr>
    `
  }).join('')

  // 3. Generate Admit Cards (2 per page layout)
  const cardsHtml = enrolledStudents.map((student) => {
    return `
      <div class="admit-card-container">
        <div class="admit-card-inner">
          <div class="header">
            <div class="school-title">PANJEREE ACADEMY & MODEL SCHOOL</div>
            <div class="school-sub">Affiliated with Bangladesh Secondary & Higher Secondary Education Board</div>
            <div class="badge-tag">EXAMINATION ADMIT CARD / HALL TICKET</div>
            <div class="exam-title">${exam.name} (${EXAM_SCOPE_LABELS[exam.scope]})</div>
          </div>

          <div class="student-profile-bar">
            <div class="info-grid">
              <div class="info-item"><span class="lbl">Student Name:</span> <strong class="val">${student.fullNameEn}</strong></div>
              <div class="info-item"><span class="lbl">Roll Number:</span> <strong class="val font-mono">#${student.rollNumber}</strong></div>
              <div class="info-item"><span class="lbl">Class / Level:</span> <span class="val">${examTarget || student.className || '—'}</span></div>
              <div class="info-item"><span class="lbl">Section:</span> <span class="val">${student.sectionName || 'A'}</span></div>
              <div class="info-item"><span class="lbl">Student ID:</span> <span class="val font-mono">${student.studentId || '—'}</span></div>
              <div class="info-item"><span class="lbl">Issue Date:</span> <span class="val">${printDate}</span></div>
            </div>

            <div class="photo-placeholder">
              <span>PHOTO</span>
            </div>
          </div>

          <div class="schedule-title">EXAMINATION TIME TABLE & SUBJECTS</div>
          <table class="schedule-table">
            <thead>
              <tr>
                <th style="width:25px">#</th>
                <th style="text-align:left;width:34%">Subject</th>
                <th style="width:22%">Date</th>
                <th style="width:18%">Time</th>
                <th style="width:12%">Room</th>
                <th style="width:14%">Invigilator Sig.</th>
              </tr>
            </thead>
            <tbody>
              ${scheduleRowsHtml}
            </tbody>
          </table>

          <div class="instructions-box">
            <strong>Candidate Instructions:</strong>
            1. Candidates must arrive at the examination hall at least 15 minutes before exam start.
            2. This Admit Card is mandatory for entry. No candidate will be allowed without this card.
            3. Digital devices, mobile phones, or unauthorized notes are strictly prohibited in the exam hall.
          </div>

          <div class="signature-row">
            <div class="sig-box">Class Teacher</div>
            <div class="sig-box">Controller of Examinations</div>
            <div class="sig-box">Headmaster / Principal</div>
          </div>
        </div>
      </div>
    `
  }).join('')

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${exam.name} — Class Admit Cards</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; color: #0f172a; background: #e2e8f0; }

    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }

    .admit-card-container {
      background: white;
      max-width: 200mm;
      height: 132mm; /* Exactly 2 cards per A4 portrait page */
      margin: 12px auto;
      padding: 8mm 10mm;
      box-shadow: 0 2px 10px rgba(0,0,0,0.08);
      border: 1.5px dashed #64748b;
      border-radius: 8px;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      page-break-inside: avoid;
    }

    @media print {
      body { background: white; }
      .admit-card-container {
        box-shadow: none;
        margin: 0 0 10mm 0;
        padding: 6mm 8mm;
        border: 1.5px dashed #475569;
        page-break-inside: avoid;
      }
    }

    .header { text-align: center; border-bottom: 1.5px solid #1e293b; padding-bottom: 4px; margin-bottom: 6px; }
    .school-title { font-size: 15px; font-weight: 900; color: #1e1b4b; text-transform: uppercase; letter-spacing: 0.5px; }
    .school-sub { font-size: 9px; color: #64748b; margin-top: 1px; }
    .badge-tag { display: inline-block; background: #312e81; color: white; font-size: 9px; font-weight: 800; padding: 2px 10px; border-radius: 999px; margin-top: 3px; letter-spacing: 0.8px; }
    .exam-title { font-size: 11px; font-weight: 700; color: #334155; margin-top: 3px; }

    .student-profile-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 6px 10px;
      margin-bottom: 6px;
    }

    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 3px 14px;
      font-size: 10px;
      flex: 1;
    }
    .info-item { display: flex; }
    .info-item .lbl { color: #64748b; width: 85px; flex-shrink: 0; }
    .info-item .val { color: #0f172a; }

    .photo-placeholder {
      width: 50px;
      height: 58px;
      border: 1px dashed #94a3b8;
      background: #f1f5f9;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #94a3b8;
      font-weight: 700;
      flex-shrink: 0;
      margin-left: 12px;
    }

    .schedule-title {
      font-size: 9px;
      font-weight: 800;
      color: #475569;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 3px;
    }

    .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    .schedule-table th { background: #1e293b; color: #f8fafc; font-size: 9px; text-transform: uppercase; padding: 3px 6px; border: 1px solid #94a3b8; }
    .schedule-table td { border: 1px solid #cbd5e1; }

    .instructions-box {
      border: 1px dashed #cbd5e1;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 8.5px;
      color: #334155;
      background: #fafafa;
      line-height: 1.3;
      margin-bottom: 6px;
    }

    .signature-row {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 20px;
      font-size: 9px;
      color: #475569;
      margin-top: 4px;
    }
    .sig-box {
      border-top: 1px solid #0f172a;
      text-align: center;
      padding-top: 2px;
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
    alert('Please allow popups in your browser to print the admit cards.')
    return
  }
  win.document.write(fullHtml)
  win.document.close()
  win.focus()
  setTimeout(() => {
    win.print()
  }, 700)
}
