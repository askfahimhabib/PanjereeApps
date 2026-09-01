import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, RefreshCw, ClipboardList, Trophy } from 'lucide-react'
import { useExamHelds, useCreateExamHeld, useUpdateExamHeldStatus, useDeleteExamHeld, useSaveSchedules } from '@/features/examHeld/hooks/useExamHeld'
import { ExamHeldCard } from '@/features/examHeld/components/ExamHeldCard'
import { ExamHeldModal } from '@/features/examHeld/components/ExamHeldModal'
import { SubjectSchedulePicker } from '@/features/examHeld/components/SubjectSchedulePicker'
import type { ExamHeld, CreateExamHeldDto, CreateScheduleDto } from '@/features/examHeld/types'
import { EXAM_STATUS_CONFIG } from '@/features/examHeld/types'

type FilterStatus = 'ALL' | ExamHeld['status']

export function ExamHeldPage() {
  const navigate = useNavigate()
  const [createOpen, setCreateOpen] = useState(false)
  const [scheduling, setScheduling] = useState<ExamHeld | null>(null)
  const [filter, setFilter] = useState<FilterStatus>('ALL')

  const { data: exams = [], isLoading } = useExamHelds()
  const create = useCreateExamHeld()
  const updateStatus = useUpdateExamHeldStatus()
  const deleteExam = useDeleteExamHeld()
  const saveSchedules = useSaveSchedules(scheduling?.id ?? '')

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

  // Navigate to full tabulation matrix
  const handleOpenTabulation = (exam: ExamHeld) => {
    navigate(`/exam-results?examId=${exam.id}&tab=TABULATION`)
  }

  // Navigate to summary analytics
  const handleOpenSummary = (exam: ExamHeld) => {
    navigate(`/exam-results?examId=${exam.id}&tab=ANALYTICS`)
  }

  const filterOptions: FilterStatus[] = ['ALL', 'SCHEDULED', 'ONGOING', 'COMPLETED', 'POSTPONED', 'CANCELLED']

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Exam & Routine Management</h1>
          <p className="text-zinc-500 mt-0.5 text-xs sm:text-sm flex items-center gap-1.5">
            <RefreshCw size={13} className="text-emerald-600" />
            Plan date-sheets, generate batch admit cards & evaluate marks
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/exam-results')}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white border border-zinc-200 text-zinc-800 text-xs font-bold hover:bg-zinc-50 shadow-xs transition-all cursor-pointer"
          >
            <Trophy size={14} className="text-amber-500" />
            <span>Tabulation Hub</span>
          </button>

          <button
            onClick={() => setCreateOpen(true)}
            className="btn-primary flex items-center gap-1.5"
          >
            <Plus size={16} />
            Create Exam
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="pill-tab-container w-fit">
        {filterOptions.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={filter === f ? 'pill-tab-active' : 'pill-tab-inactive'}
          >
            {f === 'ALL' ? `All (${exams.length})` : `${EXAM_STATUS_CONFIG[f].label} (${exams.filter(e => e.status === f).length})`}
          </button>
        ))}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-56 rounded-2xl bg-zinc-100" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-zinc-600 bg-white border border-zinc-200/80 rounded-3xl p-8">
          <ClipboardList size={48} className="mb-4 opacity-30 text-zinc-400" />
          {filter === 'ALL' ? (
            <>
              <p className="text-sm font-semibold text-zinc-800">No exams created yet</p>
              <p className="text-xs text-zinc-500 mt-1">Create your first examination to set date-sheets and generate admit cards.</p>
              <button
                onClick={() => setCreateOpen(true)}
                className="mt-4 text-xs font-bold px-4 py-2 rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 transition-colors cursor-pointer"
              >
                + Create First Exam
              </button>
            </>
          ) : (
            <>
              <p className="text-sm font-semibold text-zinc-800">No exams with status &ldquo;{EXAM_STATUS_CONFIG[filter as Exclude<FilterStatus, 'ALL'>]?.label}&rdquo;</p>
              <button
                onClick={() => setFilter('ALL')}
                className="mt-3 text-xs text-indigo-600 hover:text-indigo-800 font-semibold underline transition-colors cursor-pointer"
              >
                Clear filter
              </button>
            </>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((exam) => (
            <ExamHeldCard
              key={exam.id}
              exam={exam}
              onStatusChange={(id, status) => updateStatus.mutate({ id, status })}
              onDelete={handleDelete}
              onSchedule={setScheduling}
              onEnterResults={handleOpenTabulation}
              onViewSummary={handleOpenSummary}
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
    </div>
  )
}

