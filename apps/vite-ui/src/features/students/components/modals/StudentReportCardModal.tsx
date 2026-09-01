import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, Award } from 'lucide-react'
import type { Student } from '../../types'

interface Props {
  open: boolean
  student: Student | null
  onClose: () => void
}

const MOCK_TRANSCRIPT_SUBJECTS = [
  { code: '101', name: 'Bangla 1st & 2nd Paper', totalMarks: 100, marksObtained: 84, grade: 'A+', gpa: 5.0 },
  { code: '107', name: 'English 1st & 2nd Paper', totalMarks: 100, marksObtained: 78, grade: 'A', gpa: 4.0 },
  { code: '109', name: 'Mathematics (Compulsory)', totalMarks: 100, marksObtained: 95, grade: 'A+', gpa: 5.0 },
  { code: '111', name: 'General Science / Physics', totalMarks: 100, marksObtained: 88, grade: 'A+', gpa: 5.0 },
  { code: '112', name: 'Chemistry / Social Science', totalMarks: 100, marksObtained: 82, grade: 'A+', gpa: 5.0 },
  { code: '154', name: 'Information & Comm. Tech (ICT)', totalMarks: 50, marksObtained: 46, grade: 'A+', gpa: 5.0 },
  { code: '126', name: 'Higher Mathematics (Optional)', totalMarks: 100, marksObtained: 91, grade: 'A+', gpa: 5.0 },
]

export function StudentReportCardModal({ open, student, onClose }: Props) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open || !student) return null

  const totalPossible = MOCK_TRANSCRIPT_SUBJECTS.reduce((s, sub) => s + sub.totalMarks, 0)
  const totalObtained = MOCK_TRANSCRIPT_SUBJECTS.reduce((s, sub) => s + sub.marksObtained, 0)
  const averagePercentage = Math.round((totalObtained / totalPossible) * 100)
  const gpa = 4.86 // Calculated GPA

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=850,height=800')
    if (!printWindow) {
      window.print()
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Academic Report Card - ${student.fullNameEn}</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { padding: 20px; color: #1e293b; font-size: 12px; }
          .crest { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 16px; }
          .crest h1 { font-size: 20px; font-weight: 900; text-transform: uppercase; color: #047857; }
          .crest p { font-size: 11px; color: #64748b; margin-top: 3px; }
          .title-badge { display: inline-block; margin-top: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 4px 16px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          .meta-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 12px 16px; margin-bottom: 20px; font-size: 11.5px; }
          .meta-grid p { margin-bottom: 4px; }
          .meta-grid strong { color: #0f172a; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 20px; border: 1px solid #cbd5e1; }
          th { background: #047857; color: #fff; padding: 8px 12px; text-align: left; font-size: 10.5px; text-transform: uppercase; }
          td { padding: 8px 12px; border-bottom: 1px solid #e2e8f0; font-size: 11.5px; }
          .summary-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; margin-bottom: 30px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px; }
          .summary-card p.label { font-size: 10px; color: #64748b; font-weight: 600; text-transform: uppercase; }
          .summary-card p.val { font-size: 16px; font-weight: 800; color: #047857; margin-top: 2px; }
          .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; font-size: 10px; color: #475569; margin-top: 50px; }
          .sig-line { border-top: 1px dashed #94a3b8; width: 120px; margin: 0 auto 5px auto; }
        </style>
      </head>
      <body>
        <div class="crest">
          <h1>Estudy International Model Academy</h1>
          <p>Sector 4, Uttara Model Town, Dhaka-1230 • Academic Year: 2026</p>
          <div class="title-badge">Terminal Evaluation & Academic Transcript</div>
        </div>

        <div class="meta-grid">
          <div>
            <p><strong>Student Name:</strong> ${student.fullNameEn}</p>
            <p><strong>Student ID:</strong> ${student.studentId}</p>
            <p><strong>Class & Section:</strong> ${student.className || 'Class'} (Section ${student.sectionName || 'A'})</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Roll Number:</strong> ${student.rollNumber}</p>
            <p><strong>Academic Session:</strong> ${student.session || '2024-2025'}</p>
            <p><strong>Exam Name:</strong> Half-Yearly Examination 2026</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Code</th>
              <th>Subject Title</th>
              <th style="text-align: center;">Total Marks</th>
              <th style="text-align: center;">Marks Obtained</th>
              <th style="text-align: center;">Letter Grade</th>
              <th style="text-align: right;">Grade Point</th>
            </tr>
          </thead>
          <tbody>
            ${MOCK_TRANSCRIPT_SUBJECTS.map(s => `
              <tr>
                <td>${s.code}</td>
                <td><strong>${s.name}</strong></td>
                <td style="text-align: center;">${s.totalMarks}</td>
                <td style="text-align: center; font-weight: 700;">${s.marksObtained}</td>
                <td style="text-align: center; font-weight: 800; color: #047857;">${s.grade}</td>
                <td style="text-align: right; font-weight: 700; font-family: monospace;">${s.gpa.toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="summary-box">
          <div class="summary-card">
            <p class="label">Total Marks</p>
            <p class="val">${totalObtained} / ${totalPossible}</p>
          </div>
          <div class="summary-card">
            <p class="label">Percentage</p>
            <p class="val">${averagePercentage}%</p>
          </div>
          <div class="summary-card">
            <p class="label">Result Status</p>
            <p class="val" style="color: #047857;">PASSED</p>
          </div>
          <div class="summary-card">
            <p class="label">Grade Point Avg (GPA)</p>
            <p class="val">${gpa.toFixed(2)}</p>
          </div>
        </div>

        <div class="signatures">
          <div>
            <div class="sig-line"></div>
            Class Teacher
          </div>
          <div>
            <div class="sig-line"></div>
            Exam Controller
          </div>
          <div>
            <div class="sig-line"></div>
            Headmaster / Principal
          </div>
        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return createPortal(
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 via-zinc-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Academic Transcript & Marksheet</h3>
              <p className="text-[11px] text-zinc-500">Official student evaluation result card</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
            >
              <Printer size={14} /> Print Marksheet
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 bg-zinc-50/50 max-h-[75vh] overflow-y-auto space-y-4 text-xs">
          <div className="bg-white p-4 rounded-2xl border border-zinc-200 shadow-xs flex justify-between items-center">
            <div>
              <h4 className="font-bold text-zinc-900 text-sm">{student.fullNameEn}</h4>
              <p className="text-zinc-500 text-[11px]">
                {student.className} • Roll: {student.rollNumber} • ID: {student.studentId}
              </p>
            </div>
            <div className="text-right">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
                GPA: {gpa.toFixed(2)} (A+)
              </span>
            </div>
          </div>

          {/* Subjects Table */}
          <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-50 text-zinc-500 font-semibold border-b border-zinc-100 uppercase text-[9px] tracking-wider">
                <tr>
                  <th className="px-4 py-2.5">Subject</th>
                  <th className="px-4 py-2.5 text-center">Marks</th>
                  <th className="px-4 py-2.5 text-center">Grade</th>
                  <th className="px-4 py-2.5 text-right">Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {MOCK_TRANSCRIPT_SUBJECTS.map((sub) => (
                  <tr key={sub.code} className="hover:bg-zinc-50/70">
                    <td className="px-4 py-2.5 font-medium text-zinc-800">
                      {sub.name} <span className="text-[10px] text-zinc-400 font-mono">({sub.code})</span>
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono font-bold text-zinc-700">
                      {sub.marksObtained} <span className="text-[10px] text-zinc-400">/{sub.totalMarks}</span>
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-100">
                        {sub.grade}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-zinc-900">
                      {sub.gpa.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
