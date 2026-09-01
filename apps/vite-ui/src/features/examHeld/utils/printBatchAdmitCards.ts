import type { ExamHeld } from '../types'
import { EXAM_SCOPE_LABELS } from '../types'
import { studentStore } from '@/data/stores'
import { format, parseISO } from 'date-fns'
import { getInstitutionInfo } from '@/lib/institutionInfo'

interface Props {
  exam: ExamHeld
}

export function printBatchAdmitCards({ exam }: Props) {
  const inst = getInstitutionInfo()
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
            <div class="school-title">${inst.name.toUpperCase()}</div>
            ${inst.nameBn ? `<div style="font-size:11px; color:#475569; font-weight:600;">${inst.nameBn}</div>` : ''}
            <div class="school-sub">EIIN: ${inst.eiin} • Affiliated with ${inst.board}</div>
            <div class="badge-tag">EXAMINATION ADMIT CARD / HALL TICKET</div>
            <div class="exam-title">${exam.name} (${EXAM_SCOPE_LABELS[exam.scope]}) — Session ${inst.session}</div>
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

          <div class="signatures-row">
            <div class="sig-block">
              <div class="line"></div>
              <span>Candidate Signature</span>
            </div>
            <div class="sig-block">
              <div class="line"></div>
              <span>${inst.examinerTitle}</span>
            </div>
            <div class="sig-block">
              <div class="line"></div>
              <span>${inst.principalDesignation}</span>
            </div>
          </div>
        </div>
      </div>
    `
  }).join('')

  const fullHtml = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <title>${exam.name} — Batch Admit Cards</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif; color: #0f172a; background: #e2e8f0; }

    @page {
      size: A4 portrait;
      margin: 8mm 10mm;
    }

    .admit-card-container {
      background: white;
      max-width: 210mm;
      height: 138mm;
      margin: 10px auto;
      padding: 10px 12px;
      page-break-inside: avoid;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
      display: flex;
      flex-direction: column;
    }

    .admit-card-inner {
      border: 1.5px solid #0f172a;
      border-radius: 6px;
      padding: 10px 14px;
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }

    .header { text-align: center; margin-bottom: 6px; }
    .school-title { font-size: 15px; font-weight: 900; color: #1e1b4b; letter-spacing: 0.5px; }
    .school-sub { font-size: 9px; color: #475569; margin-top: 1px; }
    .badge-tag {
      display: inline-block;
      margin-top: 3px;
      padding: 2px 10px;
      background: #0f172a;
      color: white;
      font-size: 9px;
      font-weight: 800;
      border-radius: 12px;
      letter-spacing: 0.5px;
    }
    .exam-title { font-size: 11px; font-weight: 700; color: #334155; margin-top: 3px; }

    .student-profile-bar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      padding: 6px 10px;
      margin-bottom: 6px;
    }
    .info-grid {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 3px 12px;
      font-size: 10px;
      flex: 1;
    }
    .info-item { display: flex; gap: 4px; }
    .lbl { color: #64748b; font-size: 9px; text-transform: uppercase; font-weight: 600; width: 75px; }
    .val { color: #0f172a; font-size: 10px; }

    .photo-placeholder {
      width: 48px;
      height: 56px;
      border: 1px dashed #94a3b8;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 8px;
      color: #94a3b8;
      font-weight: 700;
      background: white;
      margin-left: 10px;
    }

    .schedule-title { font-size: 9px; font-weight: 800; color: #475569; text-transform: uppercase; margin-bottom: 2px; }
    .schedule-table { width: 100%; border-collapse: collapse; margin-bottom: 6px; }
    .schedule-table th { background: #1e293b; color: white; padding: 4px 6px; font-size: 9px; border: 1px solid #334155; text-transform: uppercase; }
    .schedule-table td { font-size: 9.5px; }

    .instructions-box {
      background: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 4px;
      padding: 4px 8px;
      font-size: 8.5px;
      color: #92400e;
      line-height: 1.3;
      margin-bottom: 6px;
    }

    .signatures-row {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
    }
    .sig-block { width: 130px; text-align: center; }
    .sig-block .line { border-top: 1px solid #334155; margin-bottom: 2px; }
    .sig-block span { font-size: 8px; font-weight: 700; color: #475569; text-transform: uppercase; }

    @media print {
      body { background: white; }
      .no-print { display: none !important; }
      .admit-card-container { box-shadow: none; margin: 0 auto; page-break-after: always; }
      .admit-card-container:nth-child(2n) { page-break-after: always; }
    }
  </style>
</head>
<body>
  <div class="no-print" style="position:fixed;top:10px;right:10px;z-index:9999;background:white;padding:8px 14px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);display:flex;gap:10px;align-items:center;">
    <span style="font-size:12px;font-weight:700;">Print: ${enrolledStudents.length} Admit Cards</span>
    <button onclick="window.print()" style="background:#4f46e5;color:white;border:none;padding:6px 16px;border-radius:6px;font-weight:700;cursor:pointer;font-size:12px;">Print Batch Admit Cards 🖨️</button>
  </div>
  ${cardsHtml}
</body>
</html>`

  const win = window.open('', '_blank', 'width=900,height=950')
  if (!win) {
    alert('Popup blocked! Please allow popups to print admit cards.')
    return
  }
  win.document.open()
  win.document.write(fullHtml)
  win.document.close()
}
