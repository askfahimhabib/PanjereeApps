import { useEffect, useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { Printer, X, Award, CheckCircle2, AlertCircle, Sparkles, BookOpen } from 'lucide-react'
import type { Student } from '../../types'
import { getInstitutionInfo } from '@/lib/institutionInfo'
import { getStudentResults } from '@/features/examHeld/hooks/useExamResults'
import { examStore, subjectStore } from '@/data/stores'
import { calculateGrade, gpaToGrade } from '@/features/examHeld/types'

interface Props {
  open: boolean
  student: Student | null
  examId?: string
  onClose: () => void
}

export function StudentReportCardModal({ open, student, examId: initialExamId, onClose }: Props) {
  const inst = getInstitutionInfo()

  // Fetch real stored exam results for this student
  const studentResults = useMemo(() => {
    if (!student) return []
    return getStudentResults(student.id)
  }, [student])

  const allExams = useMemo(() => examStore.getAll(), [])
  const allSubjects = useMemo(() => subjectStore.getAll(), [])

  // Find all exams that have recorded results for this student
  const studentExams = useMemo(() => {
    const examIds = Array.from(new Set(studentResults.map((r) => r.exam_held_id)))
    const list = allExams.filter((e) => examIds.includes(e.id))
    if (list.length > 0) return list

    // Fallback: exams matching student's class
    const classExams = allExams.filter((e) => e.class_id === student?.classId)
    return classExams.length > 0 ? classExams : allExams
  }, [allExams, studentResults, student?.classId])

  const [selectedExamId, setSelectedExamId] = useState<string>('')

  // Sync selected exam when modal opens or student changes
  useEffect(() => {
    if (initialExamId) {
      setSelectedExamId(initialExamId)
    } else if (studentExams.length > 0) {
      setSelectedExamId(studentExams[0].id)
    }
  }, [initialExamId, studentExams, open])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  const selectedExam = useMemo(() => {
    return allExams.find((e) => e.id === selectedExamId) || studentExams[0] || allExams[0]
  }, [allExams, selectedExamId, studentExams])

  // Results for the selected exam
  const examResults = useMemo(() => {
    if (!selectedExam) return []
    return studentResults.filter((r) => r.exam_held_id === selectedExam.id)
  }, [studentResults, selectedExam])

  const hasResults = examResults.length > 0

  // Build subject row details
  const transcriptRows = useMemo(() => {
    if (hasResults) {
      return examResults.map((r) => {
        const schedule = selectedExam?.exam_held_schedules?.find((s) => s.subject_id === r.subject_id)
        const subjectObj =
          allSubjects.find((s) => s.id === r.subject_id) ||
          allSubjects.find((s) => s.name.toLowerCase() === r.subject_name.toLowerCase())

        const code = subjectObj?.code || schedule?.subjects?.id || '101'
        const name = subjectObj?.name || r.subject_name || schedule?.subjects?.name || 'Subject'
        const nameBn = subjectObj?.nameBn || schedule?.subjects?.name_bn || null
        const totalMarks = schedule?.total_marks ?? selectedExam?.total_marks ?? 100
        const marksObtained = r.marks_obtained
        const isAbsent = r.is_absent
        const grade = isAbsent ? 'F' : (r.grade ?? calculateGrade(marksObtained ?? 0, totalMarks).grade)
        const gpa = isAbsent ? 0.0 : (r.gpa ?? calculateGrade(marksObtained ?? 0, totalMarks).gpa)

        return {
          id: r.id,
          code,
          name,
          nameBn,
          totalMarks,
          marksObtained,
          isAbsent,
          grade,
          gpa,
        }
      })
    } else {
      // Show actual curriculum subjects for student's class with pending status
      const classSubjects = allSubjects.filter(
        (s) => s.classId === student?.classId || s.className?.toLowerCase() === student?.className?.toLowerCase()
      )
      const subjectsToDisplay = classSubjects.length > 0 ? classSubjects.slice(0, 8) : allSubjects.slice(0, 6)

      return subjectsToDisplay.map((s) => ({
        id: s.id,
        code: s.code,
        name: s.name,
        nameBn: s.nameBn,
        totalMarks: s.totalMarks || 100,
        marksObtained: null as number | null,
        isAbsent: false,
        grade: '—',
        gpa: null as number | null,
      }))
    }
  }, [hasResults, examResults, selectedExam, allSubjects, student])

  const totalPossible = useMemo(() => {
    return transcriptRows.reduce((sum, r) => sum + r.totalMarks, 0)
  }, [transcriptRows])

  const totalObtained = useMemo(() => {
    if (!hasResults) return 0
    return transcriptRows
      .filter((r) => !r.isAbsent && r.marksObtained !== null)
      .reduce((sum, r) => sum + (r.marksObtained ?? 0), 0)
  }, [transcriptRows, hasResults])

  const averagePercentage = useMemo(() => {
    if (!hasResults || totalPossible === 0) return 0
    return Number(((totalObtained / totalPossible) * 100).toFixed(1))
  }, [hasResults, totalObtained, totalPossible])

  const hasFail = useMemo(() => {
    if (!hasResults) return false
    return transcriptRows.some((r) => r.isAbsent || r.grade === 'F' || (r.gpa !== null && r.gpa === 0))
  }, [hasResults, transcriptRows])

  const gpa = useMemo(() => {
    if (!hasResults) return 0.0
    if (hasFail) return 0.0
    const validGpas = transcriptRows.map((r) => r.gpa ?? 0)
    if (validGpas.length === 0) return 0.0
    return Number((validGpas.reduce((s, g) => s + g, 0) / validGpas.length).toFixed(2))
  }, [hasResults, hasFail, transcriptRows])

  const overallGrade = useMemo(() => {
    if (!hasResults) return 'Pending'
    if (hasFail) return 'F'
    return gpaToGrade(gpa)
  }, [hasResults, hasFail, gpa])

  const finalStatus = useMemo(() => {
    if (!hasResults) return 'RESULT PENDING'
    return hasFail ? 'FAILED' : 'PASSED'
  }, [hasResults, hasFail])

  if (!open || !student) return null

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=880,height=920')
    if (!printWindow) {
      window.print()
      return
    }

    const printDate = new Date().toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Academic Transcript - ${student.fullNameEn} (${student.studentId})</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A4 portrait; margin: 12mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { padding: 16px; color: #0f172a; font-size: 11px; line-height: 1.4; }
          .crest { text-align: center; border-bottom: 2px solid #047857; padding-bottom: 12px; margin-bottom: 14px; }
          .crest h1 { font-size: 19px; font-weight: 900; text-transform: uppercase; color: #047857; letter-spacing: 0.5px; }
          .crest p.bn-name { font-size: 12px; font-weight: 700; color: #334155; margin-top: 2px; }
          .crest p.sub { font-size: 10px; color: #64748b; margin-top: 3px; }
          .title-badge { display: inline-block; margin-top: 8px; background: #ecfdf5; border: 1px solid #a7f3d0; color: #065f46; padding: 3px 14px; border-radius: 9999px; font-size: 10.5px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; }
          .meta-grid { display: grid; grid-template-columns: 1.2fr 1fr; gap: 8px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 11px; }
          .meta-grid p { margin-bottom: 3px; }
          .meta-grid strong { color: #0f172a; font-weight: 700; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #cbd5e1; }
          th { background: #047857; color: #fff; padding: 7px 10px; text-align: left; font-size: 10px; text-transform: uppercase; font-weight: 800; }
          td { padding: 7px 10px; border-bottom: 1px solid #e2e8f0; font-size: 11px; }
          .summary-box { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; text-align: center; margin-bottom: 24px; }
          .summary-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 10px 6px; }
          .summary-card p.label { font-size: 9.5px; color: #64748b; font-weight: 700; text-transform: uppercase; }
          .summary-card p.val { font-size: 15px; font-weight: 900; color: #047857; margin-top: 3px; }
          .grading-scale { width: 100%; margin-bottom: 28px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; font-size: 9.5px; }
          .grading-scale th { background: #f1f5f9; color: #475569; font-size: 9px; padding: 4px 8px; text-align: center; }
          .grading-scale td { padding: 4px 8px; text-align: center; border-bottom: 1px solid #f1f5f9; font-size: 9px; }
          .signatures { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; text-align: center; font-size: 10px; color: #475569; margin-top: 40px; }
          .sig-line { border-top: 1px dashed #94a3b8; width: 130px; margin: 0 auto 5px auto; }
          .footer-note { margin-top: 24px; font-size: 9px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 8px; }
        </style>
      </head>
      <body>
        <div class="crest">
          <h1>${inst.name}</h1>
          ${inst.nameBn ? `<p class="bn-name">${inst.nameBn}</p>` : ''}
          <p class="sub">${inst.address} • EIIN: ${inst.eiin} • Affiliation: ${inst.board}</p>
          <div class="title-badge">${selectedExam?.name || 'Academic Progress Report & Transcript'}</div>
        </div>

        <div class="meta-grid">
          <div>
            <p><strong>Student Name:</strong> ${student.fullNameEn} ${student.fullNameBn ? `(${student.fullNameBn})` : ''}</p>
            <p><strong>Student ID:</strong> ${student.studentId} • <strong>Roll:</strong> ${student.rollNumber}</p>
            <p><strong>Class & Section:</strong> ${student.className || 'Class'} (${student.sectionName || 'A'})</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Group / Shift:</strong> ${student.groupId || 'Science'} • ${student.shift || 'Day'}</p>
            <p><strong>Academic Session:</strong> ${student.session || inst.session}</p>
            <p><strong>Issue Date:</strong> ${printDate}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 60px;">Code</th>
              <th>Subject Title</th>
              <th style="text-align: center; width: 85px;">Full Marks</th>
              <th style="text-align: center; width: 95px;">Marks Obtained</th>
              <th style="text-align: center; width: 85px;">Letter Grade</th>
              <th style="text-align: right; width: 85px;">Grade Point</th>
            </tr>
          </thead>
          <tbody>
            ${transcriptRows
              .map(
                (sub) => `
              <tr>
                <td style="font-family: monospace; color: #64748b; font-weight: 700;">${sub.code}</td>
                <td><strong>${sub.name}</strong> ${sub.nameBn ? `<span style="color:#64748b; font-size:10px;">(${sub.nameBn})</span>` : ''}</td>
                <td style="text-align: center; font-family: monospace;">${sub.totalMarks}</td>
                <td style="text-align: center; font-weight: 800; font-family: monospace; ${
                  sub.isAbsent
                    ? 'color: #e11d48;'
                    : sub.marksObtained !== null
                    ? 'color: #047857;'
                    : 'color: #94a3b8;'
                }">
                  ${sub.isAbsent ? 'ABSENT' : sub.marksObtained !== null ? sub.marksObtained : '—'}
                </td>
                <td style="text-align: center;">
                  <span style="font-weight: 800; padding: 2px 8px; border-radius: 4px; font-size: 10.5px; ${
                    sub.grade === 'F' || sub.isAbsent
                      ? 'background: #fee2e2; color: #991b1b;'
                      : sub.grade === '—'
                      ? 'background: #f1f5f9; color: #64748b;'
                      : 'background: #ecfdf5; color: #065f46;'
                  }">
                    ${sub.grade}
                  </span>
                </td>
                <td style="text-align: right; font-weight: 800; font-family: monospace;">
                  ${sub.gpa !== null ? sub.gpa.toFixed(2) : '—'}
                </td>
              </tr>
            `
              )
              .join('')}
          </tbody>
          <tfoot>
            <tr style="background: #f8fafc; font-weight: bold;">
              <td colspan="2" style="text-align: right; text-transform: uppercase; font-size: 10.5px;">Aggregate Total:</td>
              <td style="text-align: center; font-family: monospace;">${totalPossible}</td>
              <td style="text-align: center; font-family: monospace; color: #047857; font-size: 12px;">${
                hasResults ? totalObtained : '—'
              }</td>
              <td style="text-align: center;">Overall: ${overallGrade}</td>
              <td style="text-align: right; font-family: monospace; font-size: 12px;">${
                hasResults ? gpa.toFixed(2) : '—'
              }</td>
            </tr>
          </tfoot>
        </table>

        <div class="summary-box">
          <div class="summary-card">
            <p class="label">Total Marks</p>
            <p class="val">${hasResults ? `${totalObtained} / ${totalPossible}` : '—'}</p>
          </div>
          <div class="summary-card">
            <p class="label">Percentage Score</p>
            <p class="val">${hasResults ? `${averagePercentage}%` : '—'}</p>
          </div>
          <div class="summary-card">
            <p class="label">Grade Point Average</p>
            <p class="val">${hasResults ? gpa.toFixed(2) : '—'}</p>
          </div>
          <div class="summary-card">
            <p class="label">Final Result</p>
            <p class="val" style="${hasFail ? 'color: #dc2626;' : 'color: #059669;'}">${finalStatus} ${
      hasResults && !hasFail ? '✓' : ''
    }</p>
          </div>
        </div>

        <table class="grading-scale">
          <thead>
            <tr>
              <th>Marks Range</th>
              <th>80-100%</th>
              <th>70-79%</th>
              <th>60-69%</th>
              <th>50-59%</th>
              <th>40-49%</th>
              <th>33-39%</th>
              <th>0-32%</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Letter Grade</strong></td>
              <td>A+</td>
              <td>A</td>
              <td>A-</td>
              <td>B</td>
              <td>C</td>
              <td>D</td>
              <td style="color: #dc2626; font-weight: bold;">F</td>
            </tr>
            <tr>
              <td><strong>Grade Point</strong></td>
              <td>5.00</td>
              <td>4.00</td>
              <td>3.50</td>
              <td>3.00</td>
              <td>2.00</td>
              <td>1.00</td>
              <td style="color: #dc2626; font-weight: bold;">0.00</td>
            </tr>
          </tbody>
        </table>

        <div class="signatures">
          <div>
            <div class="sig-line"></div>
            <p>Class Teacher</p>
          </div>
          <div>
            <div class="sig-line"></div>
            <p>${inst.examinerTitle || 'Controller of Examinations'}</p>
          </div>
          <div>
            <div class="sig-line"></div>
            <p>${inst.principalDesignation || 'Principal / Headmaster'}</p>
          </div>
        </div>

        <p class="footer-note">
          This is an official computer-generated academic transcript verified from the institution's examination database.
        </p>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 600);
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
        className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl overflow-hidden border border-zinc-200 animate-in zoom-in-95 duration-150 flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 sm:py-4 border-b border-zinc-100 bg-gradient-to-r from-emerald-50 via-zinc-50 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Award size={20} />
            </div>
            <div>
              <h3 className="font-bold text-zinc-900 text-sm">Academic Transcript & Progress Report</h3>
              <p className="text-[11px] text-zinc-500">Official student performance card</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 text-white text-xs font-bold hover:bg-zinc-800 transition-all shadow-sm cursor-pointer"
            >
              <Printer size={14} /> Print Report Card
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-4 sm:space-y-6 flex-1">
          {/* Exam Selector if multiple exams exist */}
          {studentExams.length > 1 && (
            <div className="flex items-center justify-between gap-3 bg-zinc-50 border border-zinc-200/80 rounded-2xl px-4 py-2.5">
              <label className="text-xs font-bold text-zinc-700 flex items-center gap-1.5">
                <Sparkles size={14} className="text-amber-500" />
                Select Examination:
              </label>
              <select
                value={selectedExamId}
                onChange={(e) => setSelectedExamId(e.target.value)}
                className="bg-white border border-zinc-300 rounded-xl px-3 py-1.5 text-xs font-bold text-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer"
              >
                {studentExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Student & Overall Metric Banner */}
          <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">{inst.name}</p>
              <h4 className="text-base font-extrabold text-zinc-900 mt-0.5">
                {student.fullNameEn} {student.fullNameBn ? <span className="font-normal text-zinc-600">({student.fullNameBn})</span> : ''}
              </h4>
              <p className="text-xs text-zinc-600 font-mono mt-0.5">
                ID: <strong className="text-zinc-900">{student.studentId}</strong> · Roll:{' '}
                <strong className="text-zinc-900">{student.rollNumber}</strong> · Class:{' '}
                <strong className="text-zinc-900">{student.className}</strong> ({student.sectionName || 'A'})
              </p>
              <p className="text-[11px] text-zinc-500 mt-1">
                Exam: <strong className="text-zinc-800">{selectedExam?.name || 'Annual Examination'}</strong>
              </p>
            </div>

            <div className="text-right">
              {hasResults ? (
                <>
                  <span
                    className={`px-3.5 py-1.5 rounded-full text-xs font-black shadow-xs inline-block ${
                      hasFail
                        ? 'bg-rose-600 text-white'
                        : gpa >= 5.0
                        ? 'bg-emerald-600 text-white'
                        : 'bg-indigo-600 text-white'
                    }`}
                  >
                    GPA {gpa.toFixed(2)} / 5.00
                  </span>
                  <p
                    className={`text-[11px] font-extrabold mt-1.5 flex items-center justify-end gap-1 ${
                      hasFail ? 'text-rose-600' : 'text-emerald-700'
                    }`}
                  >
                    {hasFail ? (
                      <>
                        <AlertCircle size={13} /> Status: Failed ({overallGrade})
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={13} /> Status: Passed ({overallGrade} Grade)
                      </>
                    )}
                  </p>
                  <p className="text-[10px] text-zinc-500 font-semibold mt-0.5">
                    Total: {totalObtained}/{totalPossible} ({averagePercentage}%)
                  </p>
                </>
              ) : (
                <div className="text-right">
                  <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 inline-block">
                    Result Pending
                  </span>
                  <p className="text-[11px] text-zinc-500 mt-1">Marks not published yet</p>
                </div>
              )}
            </div>
          </div>

          {!hasResults && (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-800 text-xs flex items-center gap-2">
              <BookOpen size={16} className="text-amber-600 shrink-0" />
              <span>
                Examination marks have not been recorded in the LMS registry for this student yet. Below is the registered curriculum subject roster.
              </span>
            </div>
          )}

          {/* Table Preview */}
          <div className="border border-zinc-200 rounded-2xl overflow-x-auto shadow-xs bg-white">
            <table className="w-full min-w-[480px] sm:min-w-full text-xs">
              <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-[10px] font-bold">
                <tr>
                  <th className="px-4 py-2.5 text-left">Code</th>
                  <th className="px-4 py-2.5 text-left">Subject Title</th>
                  <th className="px-4 py-2.5 text-center">Full Marks</th>
                  <th className="px-4 py-2.5 text-center">Marks Obtained</th>
                  <th className="px-4 py-2.5 text-center">Grade</th>
                  <th className="px-4 py-2.5 text-right">Grade Point</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {transcriptRows.map((sub) => (
                  <tr key={sub.id || sub.code} className="hover:bg-zinc-50/50">
                    <td className="px-4 py-2.5 font-mono text-zinc-400 font-bold">{sub.code}</td>
                    <td className="px-4 py-2.5 font-semibold text-zinc-800">
                      {sub.name}
                      {sub.nameBn && (
                        <span className="text-zinc-400 font-normal text-[11px] ml-1.5">
                          ({sub.nameBn})
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono text-zinc-500">{sub.totalMarks}</td>
                    <td className="px-4 py-2.5 text-center font-bold font-mono">
                      {sub.isAbsent ? (
                        <span className="text-rose-600 font-bold">ABSENT</span>
                      ) : sub.marksObtained !== null ? (
                        <span className="text-emerald-700 font-black">{sub.marksObtained}</span>
                      ) : (
                        <span className="text-zinc-400 font-normal">—</span>
                      )}
                    </td>
                    <td className="px-4 py-2.5 text-center">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                          sub.grade === 'F' || sub.isAbsent
                            ? 'bg-rose-100 text-rose-800'
                            : sub.grade === '—'
                            ? 'bg-zinc-100 text-zinc-500'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {sub.grade}
                      </span>
                    </td>
                    <td className="px-4 py-2.5 text-right font-mono font-bold text-zinc-800">
                      {sub.gpa !== null ? sub.gpa.toFixed(2) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
              {hasResults && (
                <tfoot className="bg-zinc-50 border-t border-zinc-200 text-xs font-bold">
                  <tr>
                    <td colSpan={2} className="px-4 py-2.5 text-right uppercase text-[10px] text-zinc-500">
                      Summary Total:
                    </td>
                    <td className="px-4 py-2.5 text-center font-mono text-zinc-700">{totalPossible}</td>
                    <td className="px-4 py-2.5 text-center font-mono text-emerald-700 font-black">
                      {totalObtained}
                    </td>
                    <td className="px-4 py-2.5 text-center text-[11px] text-zinc-700">{overallGrade}</td>
                    <td className="px-4 py-2.5 text-right font-mono text-zinc-900 font-black">
                      {gpa.toFixed(2)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}

