import React, { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import {
  X,
  Upload,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  RefreshCw,
} from 'lucide-react'
import type { ExamHeld, StudentTabulationRow } from '../types'
import { useSaveResults } from '../hooks/useExamResults'
import { studentStore } from '@/data/stores'

interface Props {
  open: boolean
  exam: ExamHeld
  computedRows: StudentTabulationRow[]
  onClose: () => void
}

export function ExcelImportExportModal({ open, exam, computedRows, onClose }: Props) {
  const fileInputRef = useRef<HTMLInputElement | null>(null)
  const schedules = exam.exam_held_schedules ?? []
  const saveMutation = useSaveResults(exam.id)

  const [activeTab, setActiveTab] = useState<'EXPORT' | 'IMPORT'>('EXPORT')
  const [importedFile, setImportedFile] = useState<File | null>(null)
  const [parsedRows, setParsedRows] = useState<{
    studentId: string
    studentName: string
    rollNumber: string
    marks: Record<string, number | null>
    isAbsent: Record<string, boolean>
    errors: string[]
  }[]>([])
  const [parseError, setParseError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!open) return null

  // 1. Export Blank CSV Template
  const handleExportTemplate = () => {
    const enrolled =
      exam.target_type === 'CLASS' && exam.class_id
        ? studentStore
            .getWhere((s) => s.classId === exam.class_id && s.status === 'ACTIVE')
            .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
        : exam.target_type === 'BATCH' && exam.batch_id
        ? studentStore
            .getWhere((s) => s.batchId === exam.batch_id && s.status === 'ACTIVE')
            .sort((a, b) => (parseInt(a.rollNumber) || 0) - (parseInt(b.rollNumber) || 0))
        : []

    const subjectHeaders = schedules.map((s) => {
      const name = s.subjects?.name ?? s.subject_id
      const total = s.total_marks ?? exam.total_marks ?? 100
      return `"${name} [${s.subject_id}] (Max: ${total})"`
    })

    const headers = ['"Student ID"', '"Roll Number"', '"Student Name"', '"Section"', ...subjectHeaders]

    const rows = enrolled.map((stu) => {
      const emptyScores = schedules.map(() => '')
      return [
        `"${stu.id}"`,
        `"${stu.rollNumber}"`,
        `"${stu.fullNameEn}"`,
        `"${stu.sectionName || 'A'}"`,
        ...emptyScores,
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    downloadCsvFile(csvContent, `${exam.name.replace(/\s+/g, '_')}_Template.csv`)
  }

  // 2. Export Filled Tabulation CSV
  const handleExportCurrentMarksheet = () => {
    const subjectHeaders = schedules.map((s) => {
      const name = s.subjects?.name ?? s.subject_id
      return `"${name} Marks"`
    })

    const headers = [
      '"Roll"',
      '"Student Name"',
      '"Section"',
      ...subjectHeaders,
      '"Total Obtained"',
      '"Total Possible"',
      '"GPA"',
      '"Grade"',
      '"Result"',
      '"Rank"',
    ]

    const rows = computedRows.map((stu) => {
      const subjectMarks = schedules.map((s) => {
        const score = stu.scores[s.subject_id]
        if (!score || score.marks === null) return score?.isAbsent ? '"ABS"' : '""'
        return `"${score.marks}"`
      })

      return [
        `"${stu.rollNumber}"`,
        `"${stu.studentName}"`,
        `"${stu.sectionName || 'A'}"`,
        ...subjectMarks,
        `"${stu.totalObtained}"`,
        `"${stu.totalPossible}"`,
        `"${stu.gpa.toFixed(2)}"`,
        `"${stu.grade}"`,
        `"${stu.isPass ? 'PASSED' : 'FAILED'}"`,
        `"${stu.rank ? '#' + stu.rank : '—'}"`,
      ].join(',')
    })

    const csvContent = [headers.join(','), ...rows].join('\n')
    downloadCsvFile(csvContent, `${exam.name.replace(/\s+/g, '_')}_Marksheet.csv`)
  }

  // 3. Helper to trigger browser download
  function downloadCsvFile(content: string, filename: string) {
    const blob = new Blob(['\uFEFF' + content], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', filename)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  // 4. Handle CSV File Upload & Parsing
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setImportedFile(file)
    setParseError(null)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string
        parseCsvText(text)
      } catch (err: unknown) {
        setParseError(`Failed to parse CSV file: ${(err as Error).message}`)
      }
    }
    reader.readAsText(file)
  }

  const parseCsvText = (csvText: string) => {
    const lines = csvText
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0)

    if (lines.length < 2) {
      setParseError('The uploaded CSV file is empty or missing data rows.')
      return
    }

    const headerTokens = parseCsvLine(lines[0])

    // Map subject IDs from header tokens
    const subjectColumnIndices: { subjectId: string; colIndex: number; maxMarks: number }[] = []

    schedules.forEach((sch) => {
      // Find matching column by subject_id in brackets [s-001] or by subject name
      const colIdx = headerTokens.findIndex((h) =>
        h.includes(`[${sch.subject_id}]`) ||
        h.toLowerCase().includes((sch.subjects?.name ?? '').toLowerCase())
      )

      if (colIdx !== -1) {
        subjectColumnIndices.push({
          subjectId: sch.subject_id,
          colIndex: colIdx,
          maxMarks: sch.total_marks ?? exam.total_marks ?? 100,
        })
      }
    })

    if (subjectColumnIndices.length === 0) {
      setParseError(
        'Could not match any scheduled subjects in the CSV header. Please use the exported template.'
      )
      return
    }

    const studentIdCol = headerTokens.findIndex((h) => h.toLowerCase().includes('student id'))
    const rollCol = headerTokens.findIndex((h) => h.toLowerCase().includes('roll'))
    const nameCol = headerTokens.findIndex((h) => h.toLowerCase().includes('name'))

    const parsedData: typeof parsedRows = []

    for (let i = 1; i < lines.length; i++) {
      const tokens = parseCsvLine(lines[i])
      if (tokens.length === 0) continue

      const studentId = studentIdCol !== -1 ? tokens[studentIdCol] : ''
      const roll = rollCol !== -1 ? tokens[rollCol] : ''
      const name = nameCol !== -1 ? tokens[nameCol] : ''

      const marks: Record<string, number | null> = {}
      const isAbsent: Record<string, boolean> = {}
      const rowErrors: string[] = []

      subjectColumnIndices.forEach(({ subjectId, colIndex, maxMarks }) => {
        const val = tokens[colIndex]?.trim() ?? ''
        if (val === '') {
          marks[subjectId] = null
          isAbsent[subjectId] = false
        } else if (val.toUpperCase() === 'ABS' || val.toUpperCase() === 'A' || val.toUpperCase() === 'ABSENT') {
          marks[subjectId] = null
          isAbsent[subjectId] = true
        } else {
          const num = Number(val)
          if (isNaN(num)) {
            rowErrors.push(`Invalid mark '${val}' for subject`)
            marks[subjectId] = null
            isAbsent[subjectId] = false
          } else if (num < 0 || num > maxMarks) {
            rowErrors.push(`Marks ${num} exceeds maximum (${maxMarks})`)
            marks[subjectId] = num
            isAbsent[subjectId] = false
          } else {
            marks[subjectId] = num
            isAbsent[subjectId] = false
          }
        }
      })

      parsedData.push({
        studentId,
        studentName: name || `Student ${roll}`,
        rollNumber: roll,
        marks,
        isAbsent,
        errors: rowErrors,
      })
    }

    setParsedRows(parsedData)
  }

  function parseCsvLine(line: string): string[] {
    const result: string[] = []
    let current = ''
    let insideQuotes = false

    for (let i = 0; i < line.length; i++) {
      const char = line[i]
      if (char === '"') {
        insideQuotes = !insideQuotes
      } else if (char === ',' && !insideQuotes) {
        result.push(current.trim())
        current = ''
      } else {
        current += char
      }
    }
    result.push(current.trim())
    return result.map((s) => s.replace(/^"|"$/g, ''))
  }

  // 5. Save all imported results
  const handleSaveImported = () => {
    const resultsToSave: {
      exam_held_id: string
      student_id: string
      student_name: string
      roll_number: string
      subject_id: string
      subject_name: string
      marks_obtained: number | null
      is_absent: boolean
    }[] = []

    for (const row of parsedRows) {
      // Find matching student by studentId or rollNumber
      const matched = computedRows.find(
        (cr) =>
          (row.studentId && cr.studentId === row.studentId) ||
          (row.rollNumber && cr.rollNumber === row.rollNumber)
      )

      if (!matched) continue

      for (const sch of schedules) {
        const marksObtained = row.marks[sch.subject_id] ?? null
        const isAbs = row.isAbsent[sch.subject_id] ?? false
        const subName = sch.subjects?.name ?? sch.subject_id

        resultsToSave.push({
          exam_held_id: exam.id,
          student_id: matched.studentId,
          student_name: matched.studentName,
          roll_number: matched.rollNumber,
          subject_id: sch.subject_id,
          subject_name: subName,
          marks_obtained: isAbs ? null : marksObtained,
          is_absent: isAbs,
        })
      }
    }

    const subjectMarksMap: Record<string, number> = {}
    for (const s of schedules) {
      subjectMarksMap[s.subject_id] = s.total_marks ?? exam.total_marks ?? 100
    }

    saveMutation.mutate(
      {
        results: resultsToSave,
        totalMarks: exam.total_marks ?? 100,
        subjectMarksMap,
      },
      {
        onSuccess: () => {
          setIsSuccess(true)
          setTimeout(() => {
            setIsSuccess(false)
            onClose()
          }, 1800)
        },
      }
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-5">
      <div className="bg-white border border-zinc-200 rounded-3xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <FileSpreadsheet size={18} />
            </div>
            <div>
              <h3 className="font-bold text-base text-zinc-900">Excel / CSV Hub</h3>
              <p className="text-xs text-zinc-500">{exam.name}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-zinc-100 px-6 pt-2 bg-zinc-50/30">
          <button
            onClick={() => setActiveTab('EXPORT')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'EXPORT'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Export & Templates
          </button>
          <button
            onClick={() => setActiveTab('IMPORT')}
            className={`pb-3 px-4 text-xs font-bold transition-all border-b-2 ${
              activeTab === 'IMPORT'
                ? 'border-indigo-600 text-indigo-700'
                : 'border-transparent text-zinc-500 hover:text-zinc-800'
            }`}
          >
            Import Results CSV
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {activeTab === 'EXPORT' ? (
            <div className="space-y-4">
              {/* Option 1: Template */}
              <div className="p-4 rounded-2xl border border-zinc-200 hover:border-indigo-300 transition-all flex items-start justify-between gap-4 bg-zinc-50/40">
                <div>
                  <h4 className="font-bold text-xs text-zinc-900">Download Blank CSV Template</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Pre-populated with enrolled students (ID, Roll, Name) and subject columns. Teachers can
                    fill marks offline in Microsoft Excel.
                  </p>
                </div>
                <button
                  onClick={handleExportTemplate}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 shadow-xs flex-shrink-0 cursor-pointer"
                >
                  <Download size={14} className="text-indigo-600" />
                  Get Template
                </button>
              </div>

              {/* Option 2: Full Marksheet */}
              <div className="p-4 rounded-2xl border border-zinc-200 hover:border-indigo-300 transition-all flex items-start justify-between gap-4 bg-zinc-50/40">
                <div>
                  <h4 className="font-bold text-xs text-zinc-900">Export Current Computed Marksheet</h4>
                  <p className="text-xs text-zinc-500 mt-1">
                    Exports all entered subject marks, aggregate total, GPA, Grade, Pass/Fail, and Merit
                    Ranks in CSV format.
                  </p>
                </div>
                <button
                  onClick={handleExportCurrentMarksheet}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700 shadow-xs flex-shrink-0 cursor-pointer"
                >
                  <Download size={14} />
                  Export CSV
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Upload Dropzone */}
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />

              <div
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-zinc-300 hover:border-indigo-500 hover:bg-indigo-50/20 transition-all rounded-2xl p-6 text-center cursor-pointer"
              >
                <Upload size={28} className="mx-auto text-indigo-500 mb-2" />
                <p className="font-bold text-xs text-zinc-800">
                  {importedFile ? importedFile.name : 'Click or Drag & Drop CSV file here'}
                </p>
                <p className="text-[11px] text-zinc-500 mt-0.5">Supports CSV files exported from Excel or Google Sheets</p>
              </div>

              {parseError && (
                <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
                  <AlertTriangle size={16} className="text-rose-600 flex-shrink-0" />
                  {parseError}
                </div>
              )}

              {/* Parsed Preview */}
              {parsedRows.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-zinc-700">
                    <span>Parsed Preview ({parsedRows.length} students)</span>
                    <span className="text-emerald-700 font-semibold flex items-center gap-1">
                      <FileCheck size={14} /> Ready to import
                    </span>
                  </div>

                  <div className="border border-zinc-200 rounded-xl max-h-52 overflow-y-auto divide-y divide-zinc-100 text-xs">
                    {parsedRows.map((r, i) => (
                      <div key={i} className="p-2.5 flex items-center justify-between hover:bg-zinc-50">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-zinc-600 w-8">#{r.rollNumber}</span>
                          <span className="font-semibold text-zinc-800">{r.studentName}</span>
                        </div>
                        <div className="text-[11px] text-zinc-500">
                          {Object.keys(r.marks).length} subject marks detected
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {isSuccess && (
                <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-emerald-600" />
                  All marks successfully imported and saved!
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-bold text-zinc-600 hover:bg-zinc-200/60 transition-colors cursor-pointer"
          >
            Close
          </button>

          {activeTab === 'IMPORT' && parsedRows.length > 0 && (
            <button
              onClick={handleSaveImported}
              disabled={saveMutation.isPending}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              {saveMutation.isPending ? (
                <>
                  <RefreshCw size={13} className="animate-spin" /> Importing...
                </>
              ) : (
                'Import & Save Results'
              )}
            </button>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
