import { useState, useMemo, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Printer,
  FileText,
  BookOpen,
  FileSpreadsheet,
  Trophy,
  Ticket,
} from 'lucide-react'
import {
  useExamHelds,
  usePublishResults,
  useUpdateExamHeldStatus,
} from '../features/examHeld/hooks/useExamHeld'
import { useExamResults } from '../features/examHeld/hooks/useExamResults'
import type { ExamHeld, StudentTabulationRow } from '../features/examHeld/types'
import { EXAM_SCOPE_LABELS, EXAM_STATUS_CONFIG } from '../features/examHeld/types'
import { TabulationMatrixSheet } from '../features/examHeld/components/TabulationMatrixSheet'
import { ResultAnalyticsView } from '../features/examHeld/components/ResultAnalyticsView'
import { ExcelImportExportModal } from '../features/examHeld/components/ExcelImportExportModal'
import { printClassMarksheet } from '../features/examHeld/utils/printClassMarksheet'
import { printBulkReportCards } from '../features/examHeld/utils/printBulkReportCards'
import { printBatchAdmitCards } from '../features/examHeld/utils/printBatchAdmitCards'

type ActiveViewTab = 'TABULATION' | 'ANALYTICS'

export function ExamResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { data: allExams = [], isLoading } = useExamHelds()
  const [selectedExamId, setSelectedExamId] = useState<string | null>(searchParams.get('examId'))
  const [statusFilter, setStatusFilter] = useState<string>('ALL')
  const [activeTab, setActiveTab] = useState<ActiveViewTab>(
    (searchParams.get('tab') as ActiveViewTab) || 'TABULATION'
  )
  const [excelModalOpen, setExcelModalOpen] = useState(false)
  const [computedRows, setComputedRows] = useState<StudentTabulationRow[]>([])

  const publishMutation = usePublishResults()
  const updateStatusMutation = useUpdateExamHeldStatus()

  // Sync URL search params on mount or param change
  useEffect(() => {
    const urlExamId = searchParams.get('examId')
    const urlTab = searchParams.get('tab') as ActiveViewTab
    if (urlExamId) setSelectedExamId(urlExamId)
    if (urlTab) setActiveTab(urlTab)
  }, [searchParams])

  // Filter exams by status
  const filteredExams = useMemo(() => {
    if (statusFilter === 'ALL') return allExams
    return allExams.filter((e) => e.status === statusFilter)
  }, [allExams, statusFilter])

  // Current selected exam
  const selectedExam: ExamHeld | null = useMemo(() => {
    if (selectedExamId) {
      const found = allExams.find((e) => e.id === selectedExamId)
      if (found) return found
    }
    return filteredExams[0] ?? allExams[0] ?? null
  }, [allExams, selectedExamId, filteredExams])

  // Results for selected exam
  const { data: existingResults = [] } = useExamResults(selectedExam?.id ?? null)

  // Toggle publish
  const handlePublishToggle = () => {
    if (!selectedExam) return
    const next = !selectedExam.result_published
    publishMutation.mutate({ id: selectedExam.id, published: next })
  }

  // Toggle status (e.g. mark completed)
  const handleMarkCompleted = () => {
    if (!selectedExam) return
    updateStatusMutation.mutate({ id: selectedExam.id, status: 'COMPLETED' })
  }

  const handleSelectExam = (id: string) => {
    setSelectedExamId(id)
    setSearchParams({ examId: id, tab: activeTab })
  }

  const handleSelectTab = (tab: ActiveViewTab) => {
    setActiveTab(tab)
    if (selectedExam) {
      setSearchParams({ examId: selectedExam.id, tab })
    }
  }

  const schedules = selectedExam?.exam_held_schedules ?? []
  const totalEnrolled = computedRows.length
  const passedStudents = computedRows.filter((r) => r.isPass).length
  const passRate = totalEnrolled > 0 ? Math.round((passedStudents / totalEnrolled) * 100) : 0

  return (
    <div className="space-y-6">
      {/* ── Page Header ───────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Exam Results & Tabulation</h1>
          <p className="text-zinc-500 text-xs sm:text-sm mt-0.5">
            Full-class matrix marksheets, automated BD board GPA ranking, bulk reports & analytics
          </p>
        </div>

        {/* Global Overview Pills */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/80 shadow-xs text-xs font-semibold text-zinc-700">
            <BookOpen size={14} className="text-indigo-600" />
            <span>{allExams.length} Total Exams</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-zinc-200/80 shadow-xs text-xs font-semibold text-emerald-700">
            <CheckCircle2 size={14} className="text-emerald-600" />
            <span>{allExams.filter((e) => e.result_published).length} Published</span>
          </div>
        </div>
      </div>

      {/* ── Exam Selector Banner ───────────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl p-4 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Exam Switcher Dropdown & Status Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Select Exam:</span>
              <select
                value={selectedExam?.id ?? ''}
                onChange={(e) => handleSelectExam(e.target.value)}
                className="text-sm font-bold text-zinc-900 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all cursor-pointer min-w-[240px]"
              >
                {filteredExams.map((exam) => (
                  <option key={exam.id} value={exam.id}>
                    {exam.name} ({exam.target_type === 'CLASS' ? exam.classes?.name ?? 'Class' : exam.batches?.name ?? 'Batch'})
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter buttons */}
            <div className="flex items-center gap-1 bg-zinc-50 border border-zinc-200 rounded-xl p-1 text-xs">
              {(['ALL', 'SCHEDULED', 'ONGOING', 'COMPLETED'] as const).map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    statusFilter === st
                      ? 'bg-white shadow-xs text-indigo-700 font-bold'
                      : 'text-zinc-500 hover:text-zinc-800'
                  }`}
                >
                  {st === 'ALL' ? 'All' : EXAM_STATUS_CONFIG[st]?.label}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Quick Action Hub */}
          {selectedExam && (
            <div className="flex flex-wrap items-center gap-2">
              {/* Admit Cards */}
              <button
                onClick={() => printBatchAdmitCards({ exam: selectedExam })}
                disabled={schedules.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-purple-200 bg-purple-50 text-purple-800 text-xs font-bold hover:bg-purple-100 shadow-xs transition-all cursor-pointer disabled:opacity-50"
                title="Print Admit Cards for all students"
              >
                <Ticket size={14} className="text-purple-600" />
                <span>Admit Cards</span>
              </button>

              {/* CSV Import/Export */}
              <button
                onClick={() => setExcelModalOpen(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-xs font-bold hover:bg-zinc-50 shadow-xs transition-all cursor-pointer"
              >
                <FileSpreadsheet size={14} className="text-emerald-600" />
                <span>Excel / CSV</span>
              </button>

              {/* Print Master Tabulation Marksheet */}
              <button
                onClick={() => printClassMarksheet({ exam: selectedExam, students: computedRows })}
                disabled={computedRows.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-800 text-xs font-bold hover:bg-zinc-50 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Printer size={14} className="text-indigo-600" />
                <span>Tabulation Sheet</span>
              </button>

              {/* Batch Print Report Cards */}
              <button
                onClick={() => printBulkReportCards({ exam: selectedExam, students: computedRows })}
                disabled={computedRows.length === 0}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-800 text-xs font-bold hover:bg-indigo-100 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                <FileText size={14} className="text-indigo-700" />
                <span>All Report Cards</span>
              </button>

              {/* Publish Toggle */}
              <button
                onClick={handlePublishToggle}
                disabled={publishMutation.isPending || existingResults.length === 0}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-50 ${
                  selectedExam.result_published
                    ? 'bg-rose-50 border border-rose-200 text-rose-800 hover:bg-rose-100'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700'
                }`}
              >
                {selectedExam.result_published ? (
                  <>
                    <EyeOff size={13} /> Unpublish
                  </>
                ) : (
                  <>
                    <Eye size={13} /> Publish Results
                  </>
                )}
              </button>
            </div>
          )}
        </div>


        {/* Selected Exam Meta Details */}
        {selectedExam && (
          <div className="pt-3 border-t border-zinc-100 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-bold text-zinc-900">{selectedExam.name}</span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-600 font-medium">
                Scope: <strong className="text-zinc-800">{EXAM_SCOPE_LABELS[selectedExam.scope]}</strong>
              </span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-600 font-medium">
                Target:{' '}
                <strong className="text-zinc-800">
                  {selectedExam.target_type === 'CLASS'
                    ? selectedExam.classes?.name ?? 'Class'
                    : selectedExam.batches?.name ?? 'Batch'}
                </strong>
              </span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-600 font-medium">
                Total Marks: <strong className="text-zinc-800">{selectedExam.total_marks}</strong>
              </span>
              <span className="text-zinc-400">·</span>
              <span className="text-zinc-600 font-medium">
                Scheduled Subjects: <strong className="text-zinc-800">{schedules.length}</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                  EXAM_STATUS_CONFIG[selectedExam.status].bg
                } ${EXAM_STATUS_CONFIG[selectedExam.status].color} ${
                  EXAM_STATUS_CONFIG[selectedExam.status].border
                }`}
              >
                {EXAM_STATUS_CONFIG[selectedExam.status].label}
              </span>

              {selectedExam.status !== 'COMPLETED' && (
                <button
                  onClick={handleMarkCompleted}
                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
                >
                  Mark as Completed
                </button>
              )}

              {selectedExam.result_published ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  <CheckCircle2 size={11} /> Published to Students
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-full">
                  <EyeOff size={11} /> Draft (Unpublished)
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Tab Switcher: Tabulation Sheet vs Analytics vs Report Cards ──── */}
      {selectedExam && (
        <div className="flex items-center justify-between border-b border-zinc-200">
          <div className="flex gap-1">
            <button
              onClick={() => handleSelectTab('TABULATION')}
              className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'TABULATION'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <FileSpreadsheet size={15} />
              <span>Tabulation Matrix (Spreadsheet)</span>
            </button>

            <button
              onClick={() => handleSelectTab('ANALYTICS')}
              className={`flex items-center gap-2 pb-3 px-4 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                activeTab === 'ANALYTICS'
                  ? 'border-indigo-600 text-indigo-700'
                  : 'border-transparent text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Trophy size={15} className="text-amber-500" />
              <span>Merit Ranking & Analytics</span>
            </button>
          </div>

          <div className="text-xs text-zinc-500 pb-2 hidden sm:block">
            Enrolled: <strong className="text-zinc-800">{totalEnrolled}</strong> · Pass Rate:{' '}
            <strong className="text-emerald-700">{passRate}%</strong>
          </div>
        </div>
      )}

      {/* ── Active View Content ────────────────────────────────── */}
      {isLoading ? (
        <div className="space-y-3 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-16 rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : !selectedExam ? (
        <div className="bg-white border border-zinc-200 rounded-3xl p-12 text-center text-zinc-500">
          <BookOpen size={44} className="mx-auto mb-3 text-zinc-400 opacity-60" />
          <h3 className="text-base font-bold text-zinc-800">No Exam Selected</h3>
          <p className="text-xs mt-1">Please select an exam from the dropdown above to view results.</p>
        </div>
      ) : activeTab === 'TABULATION' ? (
        <TabulationMatrixSheet
          exam={selectedExam}
          existingResults={existingResults}
          onComputedRowsChange={setComputedRows}
        />
      ) : (
        <ResultAnalyticsView exam={selectedExam} students={computedRows} />
      )}

      {/* ── Excel Import / Export Modal ───────────────────────── */}
      {selectedExam && (
        <ExcelImportExportModal
          open={excelModalOpen}
          exam={selectedExam}
          computedRows={computedRows}
          onClose={() => setExcelModalOpen(false)}
        />
      )}
    </div>
  )
}
