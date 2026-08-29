import { useState } from 'react'
import { Plus, RefreshCw, ClipboardList } from 'lucide-react'
import { useExamHelds, useCreateExamHeld, useUpdateExamHeldStatus, useDeleteExamHeld, useSaveSchedules } from '@/features/examHeld/hooks/useExamHeld'
import { ExamHeldCard } from '@/features/examHeld/components/ExamHeldCard'
import { ExamHeldModal } from '@/features/examHeld/components/ExamHeldModal'
import { SubjectSchedulePicker } from '@/features/examHeld/components/SubjectSchedulePicker'
import { ResultsEntryModal } from '@/features/examHeld/components/ResultsEntryModal'
import { ResultSummaryModal } from '@/features/examHeld/components/ResultSummaryModal'
import { useExamResults } from '@/features/examHeld/hooks/useExamResults'
import type { ExamHeld, CreateExamHeldDto, CreateScheduleDto } from '@/features/examHeld/types'
import { EXAM_STATUS_CONFIG } from '@/features/examHeld/types'

type FilterStatus = 'ALL' | ExamHeld['status']

export function ExamHeldPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [scheduling, setScheduling] = useState<ExamHeld | null>(null)
  const [resultsExam, setResultsExam] = useState<ExamHeld | null>(null)
  const [summaryExam, setSummaryExam] = useState<ExamHeld | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('ALL')

  const { data: exams = [], isLoading } = useExamHelds()
  const create = useCreateExamHeld()
  const updateStatus = useUpdateExamHeldStatus()
  const deleteExam = useDeleteExamHeld()
  const saveSchedules = useSaveSchedules(scheduling?.id ?? '')
  const { data: resultsData = [] } = useExamResults(resultsExam?.id ?? null)

  const filtered = filter === 'ALL' ? exams : exams.filter((e) => e.status === filter)

  const handleCreate = (dto: CreateExamHeldDto) => {
    create.mutate(dto, { onSuccess: () => setCreateOpen(false) })
  }

  const handleSaveSchedules = (schedules: CreateScheduleDto[]) => {
    saveSchedules.mutate(schedules, { onSuccess: () => setScheduling(null) })
  }

  const handleDelete = (id: string) => {
    if (confirm('This exam and its routine entries will be deleted. Confirm?')) {
      deleteExam.mutate(id)
    }
  }

  const filterOptions: FilterStatus[] = ['ALL', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'POSTPONED', 'CANCELLED']

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Exam Management</h1>
          <p className="text-zinc-600 mt-1 text-sm flex items-center gap-1.5">
            <RefreshCw size={12} className="text-purple-400" />
            Schedules auto-sync to Routines on save
          </p>
        </div>
        <button
          onClick={() => setCreateOpen(true)}
          className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2.5 rounded-xl hover:bg-purple-700 transition-colors font-medium text-sm shadow-lg shadow-purple-500/20"
        >
          <Plus size={17} />
          New Exam
        </button>
      </div>

      {/* Sync info banner */}
      <div className="flex items-center gap-3 p-4 rounded-xl bg-purple-500/8 border border-purple-500/20">
        <RefreshCw size={16} className="text-purple-400 flex-shrink-0" />
        <p className="text-sm text-purple-300">
          Schedules created from this module will appear automatically as <strong>FORMAL_EXAM</strong> in the <em>Routines module</em>. Students can view them from their dashboard.
        </p>
      </div>

      {/* Status Filter */}
      <div className="flex items-center gap-2 flex-wrap">
        {filterOptions.map((s) => {
          const cfg = s !== 'ALL' ? EXAM_STATUS_CONFIG[s] : null
          const isActive = filter === s
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                isActive
                  ? s === 'ALL'
                    ? 'bg-zinc-100 text-white border-zinc-100'
                    : `${cfg!.bg} ${cfg!.color} ${cfg!.border}`
                  : 'border-zinc-100 text-zinc-600 hover:border-zinc-100'
              }`}
            >
              {s === 'ALL' ? `All (${exams.length})` : cfg!.label}
              {s !== 'ALL' && (
                <span className="ml-1.5 opacity-60">
                  ({exams.filter((e) => e.status === s).length})
                </span>
              )}
            </button>
          )
        })}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-zinc-50" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600">
          <ClipboardList size={48} className="mb-4 opacity-30" />
          {filter === 'ALL' ? (
            <>
              <p className="text-sm">No exams found</p>
              <button
                onClick={() => setCreateOpen(true)}
                className="mt-4 text-sm text-purple-400 hover:text-purple-300 transition-colors"
              >
                + Create First Exam
              </button>
            </>
          ) : (
            <>
              <p className="text-sm">No exams with status &ldquo;{EXAM_STATUS_CONFIG[filter as Exclude<FilterStatus, 'ALL'>]?.label}&rdquo;</p>
              <button
                onClick={() => setFilter('ALL')}
                className="mt-3 text-xs text-zinc-600 hover:text-zinc-800 underline transition-colors"
              >
                Clear filter
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((exam) => (
            <ExamHeldCard
              key={exam.id}
              exam={exam}
              onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
              onDelete={handleDelete}
              onSchedule={setScheduling}
              onEnterResults={setResultsExam}
              onViewSummary={setSummaryExam}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <ExamHeldModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSave={handleCreate}
        isSaving={create.isPending}
      />
      <SubjectSchedulePicker
        open={!!scheduling}
        exam={scheduling}
        onClose={() => setScheduling(null)}
        onSave={handleSaveSchedules}
        isSaving={saveSchedules.isPending}
      />
      <ResultsEntryModal
        open={!!resultsExam}
        exam={resultsExam}
        existingResults={resultsData}
        onClose={() => setResultsExam(null)}
      />
      <ResultSummaryModal
        open={!!summaryExam}
        exam={summaryExam}
        onClose={() => setSummaryExam(null)}
      />
    </div>
  )
}
