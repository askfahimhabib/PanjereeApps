import { useState } from 'react'
import { Plus, Search, BookOpen, Filter, Pencil, Trash2, Tag, FlaskConical, BarChart3 } from 'lucide-react'
import { useSubjects } from '../features/subjects/useSubjects'
import { SubjectModal } from '../features/subjects/components/SubjectModal'
import { PAPER_LABELS, CLASS_GROUP_LABELS } from '../features/subjects/types'
import type { ClassGroupType } from '../features/subjects/types'

const GROUP_COLORS: Record<ClassGroupType, { bg: string; text: string; border: string }> = {
  SCIENCE:  { bg: 'bg-blue-50',   text: 'text-blue-700',   border: 'border-blue-200' },
  ARTS:     { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  COMMERCE: { bg: 'bg-amber-50',  text: 'text-amber-700',  border: 'border-amber-200' },
}

const PAPER_STYLES = {
  FIRST:  'bg-emerald-100 text-emerald-700',
  SECOND: 'bg-teal-100 text-teal-700',
  NONE:   'bg-zinc-100 text-zinc-500',
}

export function Subjects() {
  const {
    filtered, groupedByClass, filters, stats,
    isModalOpen, editingSubject,
    openAddModal, openEditModal, closeModal,
    saveSubject, deleteSubject, updateFilter,
  } = useSubjects()

  const [viewMode, setViewMode] = useState<'grouped' | 'flat'>('grouped')

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Subjects</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage curriculum subjects by Class and Group</p>
        </div>
        <button
          onClick={openAddModal}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-violet-500/20 shrink-0"
        >
          <Plus size={17} />
          New Subject
        </button>
      </div>

      {/* ── Stats ────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Subjects', value: stats.total, icon: BookOpen, color: 'text-violet-600', bg: 'bg-violet-50' },
          { label: 'Filtered', value: stats.filtered, icon: Filter, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'With Papers', value: stats.withPapers, icon: FlaskConical, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Optional', value: stats.optional, icon: Tag, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map(s => (
          <div key={s.label} className="bg-white border border-zinc-100 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className={`w-9 h-9 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={17} className={s.color} />
            </div>
            <div>
              <p className={`text-2xl font-bold leading-none ${s.color}`}>{s.value}</p>
              <p className="text-[11px] text-zinc-500 mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ──────────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={filters.search}
            onChange={e => updateFilter('search', e.target.value)}
            placeholder="Search subjects..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
          />
        </div>

        {/* Class filter */}
        <select
          value={filters.classId}
          onChange={e => updateFilter('classId', e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
        >
          <option value="ALL">All Classes</option>
          {['cls-1','cls-2','cls-3','cls-4','cls-5','cls-6','cls-7','cls-8'].map(id => (
            <option key={id} value={id}>Class {id.replace('cls-', '')}</option>
          ))}
          <option value="cls-9">Class 9–10 (SSC)</option>
          <option value="cls-11">Class 11–12 (HSC)</option>
        </select>

        {/* Paper filter */}
        <select
          value={filters.paper}
          onChange={e => updateFilter('paper', e.target.value)}
          className="px-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-400"
        >
          <option value="ALL">All Papers</option>
          <option value="NONE">No Paper</option>
          <option value="FIRST">1st Paper</option>
          <option value="SECOND">2nd Paper</option>
        </select>

        {/* View toggle */}
        <div className="flex items-center gap-1 p-1 bg-zinc-100 rounded-xl ml-auto">
          <button
            onClick={() => setViewMode('grouped')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${viewMode === 'grouped' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
          >
            Class view
          </button>
          <button
            onClick={() => setViewMode('flat')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${viewMode === 'flat' ? 'bg-white text-zinc-900 shadow-sm' : 'text-zinc-500'}`}
          >
            List view
          </button>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-2xl p-12 text-center shadow-sm">
          <BookOpen size={36} className="mx-auto mb-3 text-zinc-200" />
          <p className="font-semibold text-zinc-700">No subjects found</p>
          <p className="text-sm text-zinc-400 mt-1">Change filters or add a new subject</p>
          <button onClick={openAddModal} className="mt-4 px-4 py-2 text-sm font-medium text-violet-600 hover:text-violet-700 bg-violet-50 rounded-xl transition-colors">
            + Add New Subject
          </button>
        </div>
      ) : viewMode === 'grouped' ? (
        /* Grouped by class */
        <div className="space-y-4">
          {groupedByClass.map(({ classId, className, subjects }) => (
            <div key={classId} className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 bg-zinc-50 border-b border-zinc-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-violet-100 flex items-center justify-center">
                    <BarChart3 size={14} className="text-violet-600" />
                  </div>
                  <span className="font-bold text-zinc-800">{className}</span>
                  <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full font-medium">
                    {subjects.length} Subjects
                  </span>
                </div>
              </div>
              <div className="divide-y divide-zinc-50">
                {subjects.map(s => (
                  <SubjectRow key={s.id} subject={s} onEdit={openEditModal} onDelete={deleteSubject} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Flat list */
        <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
          <div className="divide-y divide-zinc-50">
            {filtered.map(s => (
              <SubjectRow key={s.id} subject={s} onEdit={openEditModal} onDelete={deleteSubject} showClass />
            ))}
          </div>
        </div>
      )}

      {/* ── Modal ──────────────────────────────────────────────────── */}
      <SubjectModal
        isOpen={isModalOpen}
        editing={editingSubject}
        onClose={closeModal}
        onSave={saveSubject}
      />
    </div>
  )
}

// ── Subject Row ───────────────────────────────────────────────────────────────
function SubjectRow({
  subject: s,
  onEdit,
  onDelete,
  showClass = false,
}: {
  subject: ReturnType<typeof useSubjects>['filtered'][0]
  onEdit: (s: typeof s) => void
  onDelete: (id: string) => void
  showClass?: boolean
}) {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 hover:bg-zinc-50/50 transition-colors group">
      {/* Code badge */}
      <div className="w-14 h-8 shrink-0 bg-violet-100 rounded-lg flex items-center justify-center">
        <span className="text-xs font-bold text-violet-700 font-mono">{s.code}</span>
      </div>

      {/* Name */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-800 text-[14px]">{s.name}</span>
          {s.nameBn && <span className="text-xs text-zinc-500">{s.nameBn}</span>}
          {s.isOptional && (
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-700">Optional</span>
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          {showClass && (
            <span className="text-xs text-zinc-400">{s.className}</span>
          )}
          {s.groupName && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md border ${GROUP_COLORS[s.groupName].bg} ${GROUP_COLORS[s.groupName].text} ${GROUP_COLORS[s.groupName].border}`}>
              {CLASS_GROUP_LABELS[s.groupName]}
            </span>
          )}
        </div>
      </div>

      {/* Paper + Marks */}
      <div className="flex items-center gap-3 shrink-0">
        <span className={`text-[11px] font-semibold px-2 py-1 rounded-lg ${PAPER_STYLES[s.paper]}`}>
          {PAPER_LABELS[s.paper]}
        </span>
        <span className="text-xs text-zinc-500 hidden sm:block">
          <span className="font-semibold text-zinc-700">{s.totalMarks}</span> / {s.passMarks} pass
        </span>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
        <button
          onClick={() => onEdit(s)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
          title="Edit"
        >
          <Pencil size={14} />
        </button>
        <button
          onClick={() => onDelete(s.id)}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          title="Delete"
        >
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  )
}
