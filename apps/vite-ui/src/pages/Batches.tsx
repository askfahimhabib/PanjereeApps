import { Plus, Search, GraduationCap, Users, Calendar, Pencil, Trash2, ChevronRight, BookOpen, TrendingUp } from 'lucide-react'
import { useBatches } from '../features/batches/useBatches'
import { useClasses } from '../features/classes/useClasses'
import { BatchDetailDrawer } from '../features/batches/components/BatchDetailDrawer'
import { STATUS_CONFIG, EXAM_LABELS } from '../features/batches/types'
import type { Batch, BatchStatus, TargetExam } from '../features/batches/types'
import { useState } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

export function Batches() {
  const {
    filtered, stats, search, filterStatus, filterExam,
    isModalOpen, editingBatch,
    setSearch, setFilterStatus, setFilterExam,
    openAddModal, openEditModal, closeModal,
    saveBatch, deleteBatch, updateStatus,
    refreshCounts,
  } = useBatches()

  const [selectedBatch, setSelectedBatch] = useState<Batch | null>(null)

  return (
    <div className="space-y-5">
      {/* ── Header ──────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Exam Batches</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage SSC, HSC, and other exam batches</p>
        </div>
        <button
          onClick={openAddModal}
          className="btn-primary"
        >
          <Plus size={16} />
          New Batch
        </button>
      </div>

      {/* ── Stats ──────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Total Batches', value: stats.total, color: 'text-indigo-700', bg: 'bg-indigo-50', icon: BookOpen },
          { label: 'Ongoing', value: stats.ongoing, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: TrendingUp },
          { label: 'Upcoming', value: stats.upcoming, color: 'text-blue-700', bg: 'bg-blue-50', icon: Calendar },
          { label: 'Completed', value: stats.completed, color: 'text-zinc-600', bg: 'bg-zinc-100', icon: GraduationCap },
          { label: 'Total Students', value: stats.totalStudents, color: 'text-purple-700', bg: 'bg-purple-50', icon: Users },
        ].map(s => (
          <div key={s.label} className="card-surface p-4 flex items-center gap-3.5">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center shrink-0`}>
              <s.icon size={18} className={s.color} />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 leading-none tracking-tight">{s.value}</p>
              <p className="text-xs text-zinc-500 mt-1">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────── */}
      <div className="filter-container">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search batches..."
            className="input-field w-full pl-9.5 pr-4"
          />
        </div>
        <div className="pill-tab-container">
          {(['ALL', 'UPCOMING', 'ONGOING', 'COMPLETED'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s as BatchStatus | 'ALL')}
              className={filterStatus === s ? 'pill-tab-active' : 'pill-tab-inactive'}>
              {s === 'ALL' ? 'All' : STATUS_CONFIG[s as BatchStatus].label}
            </button>
          ))}
        </div>
        <select value={filterExam} onChange={e => setFilterExam(e.target.value as TargetExam | 'ALL')}
          className="input-field">
          <option value="ALL">All Exams</option>
          {(Object.keys(EXAM_LABELS) as TargetExam[]).map(e => (
            <option key={e} value={e}>{EXAM_LABELS[e]}</option>
          ))}
        </select>
      </div>

      {/* ── Batch Cards ────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="bg-white border border-zinc-100 rounded-2xl p-12 text-center shadow-sm">
          <GraduationCap size={36} className="mx-auto mb-3 text-zinc-200" />
          <p className="font-semibold text-zinc-700">No batches found</p>
          <button onClick={openAddModal} className="mt-4 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl">
            + Create New Batch
          </button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(b => (
            <BatchCard
              key={b.id}
              batch={b}
              onEdit={openEditModal}
              onDelete={deleteBatch}
              onStatusChange={updateStatus}
              onCardClick={() => setSelectedBatch(b)}
            />
          ))}
        </div>
      )}

      {/* ── Modal ────────────────────────────────────── */}
      {isModalOpen && (
        <BatchModal
          editing={editingBatch}
          onClose={closeModal}
          onSave={saveBatch}
        />
      )}

      {selectedBatch && (
        <BatchDetailDrawer
          batch={selectedBatch}
          onClose={() => { refreshCounts(); setSelectedBatch(null) }}
        />
      )}
    </div>
  )
}

// ── Batch Card ──────────────────────────────────────────────────────────────
function BatchCard({ batch: b, onEdit, onDelete, onStatusChange, onCardClick }: {
  batch: Batch
  onEdit: (b: Batch) => void
  onDelete: (id: string) => void
  onStatusChange: (id: string, s: BatchStatus) => void
  onCardClick: () => void
}) {
  const cfg = STATUS_CONFIG[b.status]
  const totalCapacity = b.sections.reduce((a, s) => a + s.capacity, 0)
  const fillPct = totalCapacity ? Math.round((b.totalStudents / totalCapacity) * 100) : 0

  return (
    <div
      onClick={onCardClick}
      className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden hover:shadow-md hover:border-indigo-200 transition-all group cursor-pointer"
    >
      {/* Header */}
      <div className="px-5 py-4 border-b border-zinc-100">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-zinc-900 text-[15px] leading-tight truncate">{b.name}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{b.className} · {EXAM_LABELS[b.examName]} {b.examYear}</p>
          </div>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold shrink-0 ${cfg.bg} ${cfg.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
            {cfg.label}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-zinc-600">
            <Users size={14} className="text-zinc-400" />
            <span className="font-semibold text-zinc-800">{b.totalStudents}</span> Students
          </div>
          <div className="flex items-center gap-1.5 text-zinc-600">
            <BookOpen size={14} className="text-zinc-400" />
            <span className="font-semibold text-zinc-800">{b.sections.length}</span> Sections
          </div>
          <div className="text-xs text-zinc-500">
            ৳{b.monthlyFee.toLocaleString()}/month
          </div>
        </div>

        {totalCapacity > 0 && (
          <div>
            <div className="flex justify-between text-xs text-zinc-500 mb-1">
              <span>Enrollment</span>
              <span>{fillPct}%</span>
            </div>
            <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${fillPct >= 90 ? 'bg-red-500' : fillPct >= 70 ? 'bg-amber-500' : 'bg-green-500'}`}
                style={{ width: `${fillPct}%` }}
              />
            </div>
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-zinc-500">
          <Calendar size={12} />
          {new Date(b.startDate).toLocaleDateString('bn-BD')} — {new Date(b.endDate).toLocaleDateString('bn-BD')}
        </div>
      </div>

      {/* Footer actions */}
      <div className="px-5 py-3 bg-zinc-50 border-t border-zinc-100 flex items-center justify-between">
        <div className="flex gap-1">
          <button onClick={e => { e.stopPropagation(); onEdit(b) }} className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-600 hover:bg-blue-50 transition-colors">
            <Pencil size={14} />
          </button>
          <button onClick={e => { e.stopPropagation(); onDelete(b.id) }} className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors">
            <Trash2 size={14} />
          </button>
        </div>
        {b.status === 'UPCOMING' && (
          <button onClick={e => { e.stopPropagation(); onStatusChange(b.id, 'ONGOING') }} className="flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-3 py-1.5 rounded-lg hover:bg-green-200 transition-colors">
            Start <ChevronRight size={12} />
          </button>
        )}
        {b.status === 'ONGOING' && (
          <button onClick={e => { e.stopPropagation(); onStatusChange(b.id, 'COMPLETED') }} className="flex items-center gap-1 text-xs font-medium text-zinc-700 bg-zinc-200 px-3 py-1.5 rounded-lg hover:bg-zinc-300 transition-colors">
            End <ChevronRight size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Batch Modal ─────────────────────────────────────────────────────────────
function BatchModal({ editing, onClose, onSave }: {
  editing: Batch | null
  onClose: () => void
  onSave: (d: import('../features/batches/types').BatchFormData) => void
}) {
  const { classes } = useClasses()
  const activeClasses = classes.filter(c => c.isActive !== false)
  const [form, setForm] = useState({
    name: editing?.name ?? '',
    examName: (editing?.examName ?? 'SSC') as TargetExam,
    examYear: editing?.examYear ?? new Date().getFullYear() + 1,
    classId: editing?.classId ?? 'cls-9',
    startDate: editing?.startDate ?? '',
    endDate: editing?.endDate ?? '',
    monthlyFee: editing?.monthlyFee ?? 1500,
  })

  const set = <K extends keyof typeof form>(k: K, v: typeof form[K]) => setForm(p => ({ ...p, [k]: v }))

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave(form)
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden border border-zinc-200">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center">
              <GraduationCap size={18} className="text-indigo-600" />
            </div>
            <h2 className="font-bold text-zinc-900">{editing ? 'Edit Batch' : 'New Batch'}</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Batch Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. SSC Special Batch 2025"
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/30 focus:border-indigo-400" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Exam Type</label>
              <select value={form.examName} onChange={e => set('examName', e.target.value as TargetExam)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none">
                {(Object.keys(EXAM_LABELS) as TargetExam[]).map(e => <option key={e} value={e}>{e}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Exam Year</label>
              <input type="number" value={form.examYear} onChange={e => set('examYear', Number(e.target.value))}
                min={2020} max={2035}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Class</label>
              <select value={form.classId} onChange={e => set('classId', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none">
                {activeClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Monthly Fee (৳)</label>
              <input type="number" value={form.monthlyFee} onChange={e => set('monthlyFee', Number(e.target.value))}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Start Date</label>
              <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-700 mb-1.5">End Date</label>
              <input type="date" value={form.endDate} onChange={e => set('endDate', e.target.value)}
                className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none" />
            </div>
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancel</button>
            <button type="submit" className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-md shadow-indigo-500/20">
              {editing ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
