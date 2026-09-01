import { useState, useMemo } from 'react'
import {
  Plus, Trash2, Bell, X, Save, Eye, EyeOff, Search,
  Pencil, Calendar, AlertCircle, FileText, CheckCircle2,
  SlidersHorizontal, Clock, Printer
} from 'lucide-react'
import { format, parseISO, isAfter } from 'date-fns'
import { useNotices } from '@/features/notices/useNotices'
import { classStore } from '@/data/stores'
import {
  TARGET_LABELS, PRIORITY_CONFIG,
  type NoticeTarget, type NoticePriority, type Notice, type CreateNoticeDto
} from '@/features/notices/types'

// ─── Create / Edit Notice Modal ───────────────────────────────────────────────

interface FormModalProps {
  open: boolean
  editingNotice: Notice | null
  onClose: () => void
  onSave: (dto: CreateNoticeDto) => void
}

function NoticeFormModal({ open, editingNotice, onClose, onSave }: FormModalProps) {
  const activeClasses = useMemo(() =>
    classStore.getAll().filter(c => c.isActive !== false)
  , [])

  const [form, setForm] = useState<CreateNoticeDto>({
    title: editingNotice?.title ?? '',
    body: editingNotice?.body ?? '',
    target: editingNotice?.target ?? 'ALL',
    targetClassId: editingNotice?.targetClassId,
    priority: editingNotice?.priority ?? 'NORMAL',
    expiresAt: editingNotice?.expiresAt ? editingNotice.expiresAt.split('T')[0] : undefined,
  })

  // Synchronize form when editingNotice changes
  useState(() => {
    if (editingNotice) {
      setForm({
        title: editingNotice.title,
        body: editingNotice.body,
        target: editingNotice.target,
        targetClassId: editingNotice.targetClassId,
        priority: editingNotice.priority,
        expiresAt: editingNotice.expiresAt ? editingNotice.expiresAt.split('T')[0] : undefined,
      })
    }
  })

  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    onSave(form)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="card-surface w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4.5 border-b border-zinc-100 bg-zinc-50/50">
          <div>
            <h3 className="text-lg font-bold text-zinc-900">
              {editingNotice ? 'Edit Notice' : 'Create Notice'}
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              {editingNotice ? 'Update announcement details' : 'Post a new announcement to students, teachers, or parents'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4.5">
          {/* Priority Selection */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">Priority Level</label>
            <div className="grid grid-cols-3 gap-2">
              {(['NORMAL', 'IMPORTANT', 'URGENT'] as NoticePriority[]).map(p => {
                const cfg = PRIORITY_CONFIG[p]
                const isSelected = form.priority === p
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isSelected
                        ? `${cfg.bg} ${cfg.color} ${cfg.border} ring-2 ring-current/15 shadow-xs font-bold`
                        : 'border-zinc-200 text-zinc-600 hover:bg-zinc-50 hover:border-zinc-300'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Send To Audience */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">Target Audience</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ALL', 'STUDENTS', 'TEACHERS', 'PARENTS', 'CLASS'] as NoticeTarget[]).map(t => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setForm(f => ({ ...f, target: t, targetClassId: t === 'CLASS' ? f.targetClassId : undefined }))}
                  className={`py-2 px-2.5 rounded-xl text-xs font-medium border transition-all cursor-pointer ${
                    form.target === t
                      ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] font-semibold shadow-xs'
                      : 'border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50'
                  }`}
                >
                  {TARGET_LABELS[t]}
                </button>
              ))}
            </div>
            {form.target === 'CLASS' && (
              <select
                className="input-field w-full mt-2.5"
                value={form.targetClassId ?? ''}
                required
                onChange={e => setForm(f => ({ ...f, targetClassId: e.target.value }))}
              >
                <option value="">— Select Target Class —</option>
                {activeClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Notice Title *</label>
            <input
              type="text"
              required
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="e.g. Annual Sports Day 2026 Schedule"
              className="input-field w-full"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Message Content *</label>
            <textarea
              required
              rows={4}
              value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Write the full announcement details, guidelines, and schedules..."
              className="input-field w-full h-28 py-2.5 resize-none leading-relaxed"
            />
          </div>

          {/* Expiry Date */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Expires On (Optional)</label>
            <input
              type="date"
              value={form.expiresAt ?? ''}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value || undefined }))}
              className="input-field w-full"
            />
            <p className="text-[11px] text-zinc-400 mt-1">Expired notices will be automatically grayed out.</p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2.5 pt-2 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 cursor-pointer"
            >
              <Save size={15} />
              {editingNotice ? 'Save Changes' : 'Publish Notice'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Notice Detail View Modal ─────────────────────────────────────────────────

function NoticeDetailModal({
  notice,
  onClose,
  onEdit,
  onDelete,
  onTogglePublish
}: {
  notice: Notice | null
  onClose: () => void
  onEdit: (n: Notice) => void
  onDelete: (id: string) => void
  onTogglePublish: (id: string) => void
}) {
  if (!notice) return null

  const classes = classStore.getAll()
  const targetClassName = notice.targetClassId ? classes.find(c => c.id === notice.targetClassId)?.name : null
  const cfg = PRIORITY_CONFIG[notice.priority]
  const isExpired = notice.expiresAt ? !isAfter(parseISO(notice.expiresAt), new Date()) : false

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="card-surface w-full max-w-lg shadow-2xl overflow-hidden animate-scaleIn">
        {/* Header */}
        <div className={`px-6 py-5 border-b border-zinc-100 ${cfg.bg}`}>
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.color} ${cfg.border} bg-white inline-flex items-center gap-1.5`}>
                <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                {cfg.label} Priority
              </span>
              <span className="text-[11px] font-semibold text-zinc-600 bg-white/90 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                To: {TARGET_LABELS[notice.target]}{targetClassName ? ` (${targetClassName})` : ''}
              </span>
              {!notice.isPublished && (
                <span className="text-[11px] font-semibold text-zinc-500 bg-zinc-100 border border-zinc-200 px-2.5 py-0.5 rounded-full">
                  Draft
                </span>
              )}
              {isExpired && (
                <span className="text-[11px] font-semibold text-red-600 bg-red-50 border border-red-200 px-2.5 py-0.5 rounded-full">
                  Expired
                </span>
              )}
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-white/80 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <h2 className="text-xl font-bold text-zinc-900 mt-3 leading-snug">{notice.title}</h2>

          <div className="flex items-center gap-3 text-xs text-zinc-500 mt-2">
            <span className="flex items-center gap-1">
              <Clock size={13} className="text-zinc-400" />
              {format(parseISO(notice.publishedAt), 'dd MMMM yyyy, h:mm a')}
            </span>
            <span>•</span>
            <span>By {notice.createdBy}</span>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="prose prose-sm max-w-none text-zinc-700 leading-relaxed whitespace-pre-line text-[14px]">
            {notice.body}
          </div>

          {notice.expiresAt && (
            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200/80 text-xs text-zinc-600 flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-medium">
                <Calendar size={14} className="text-zinc-400" />
                Expiry Date: {format(parseISO(notice.expiresAt), 'dd MMMM yyyy')}
              </span>
              <span className={isExpired ? 'text-red-600 font-semibold' : 'text-emerald-600 font-semibold'}>
                {isExpired ? 'Expired' : 'Active'}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-zinc-50/70 border-t border-zinc-100 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => { onClose(); onEdit(notice) }}
              className="btn-secondary !h-9 !px-3 text-xs cursor-pointer"
            >
              <Pencil size={14} />
              Edit
            </button>
            <button
              onClick={() => onTogglePublish(notice.id)}
              className="btn-secondary !h-9 !px-3 text-xs cursor-pointer"
            >
              {notice.isPublished ? <EyeOff size={14} /> : <Eye size={14} />}
              {notice.isPublished ? 'Unpublish' : 'Publish'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="btn-secondary !h-9 !px-3 text-xs cursor-pointer"
            >
              <Printer size={14} />
              Print
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this notice? This action cannot be undone.')) {
                  onDelete(notice.id)
                  onClose()
                }
              }}
              className="btn-danger !h-9 !px-3 text-xs cursor-pointer"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Notice Card ──────────────────────────────────────────────────────────────

function NoticeCard({
  notice,
  onView,
  onEdit,
  onDelete,
  onToggle
}: {
  notice: Notice
  onView: (n: Notice) => void
  onEdit: (n: Notice) => void
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}) {
  const classes = classStore.getAll()
  const targetClassName = notice.targetClassId ? classes.find(c => c.id === notice.targetClassId)?.name : null
  const cfg = PRIORITY_CONFIG[notice.priority]
  const isExpired = notice.expiresAt ? !isAfter(parseISO(notice.expiresAt), new Date()) : false

  return (
    <div
      onClick={() => onView(notice)}
      className={`card-surface p-5 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group ${
        !notice.isPublished || isExpired ? 'opacity-65 bg-zinc-50/50' : ''
      }`}
    >
      <div>
        {/* Priority badge + Audience + Actions */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${cfg.color} ${cfg.bg} ${cfg.border} inline-flex items-center gap-1`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
              {cfg.label}
            </span>
            <span className="text-[11px] font-semibold text-zinc-600 bg-zinc-100 border border-zinc-200/80 px-2 py-0.5 rounded-md">
              {TARGET_LABELS[notice.target]}{targetClassName ? ` · ${targetClassName}` : ''}
            </span>
            {!notice.isPublished && (
              <span className="text-[10px] font-semibold text-zinc-500 bg-zinc-200/60 px-2 py-0.5 rounded-md">
                Draft
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => onEdit(notice)}
              title="Edit notice"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onToggle(notice.id)}
              title={notice.isPublished ? 'Unpublish' : 'Publish'}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              {notice.isPublished ? <Eye size={13} /> : <EyeOff size={13} />}
            </button>
            <button
              onClick={() => {
                if (confirm('Delete this notice?')) onDelete(notice.id)
              }}
              title="Delete notice"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
            >
              <Trash2 size={13} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-[15px] font-bold text-zinc-900 mb-1.5 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
          {notice.title}
        </h3>

        {/* Body snippet */}
        <p className="text-xs text-zinc-600 leading-relaxed line-clamp-3 mb-4">
          {notice.body}
        </p>
      </div>

      {/* Footer */}
      <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-[11px] text-zinc-400">
        <span className="flex items-center gap-1 text-zinc-500">
          <Clock size={12} className="text-zinc-400" />
          {format(parseISO(notice.publishedAt), 'dd MMM yyyy')}
        </span>
        {notice.expiresAt ? (
          <span className={isExpired ? 'text-red-500 font-medium' : 'text-zinc-500'}>
            {isExpired ? 'Expired' : `Exp: ${format(parseISO(notice.expiresAt), 'dd MMM')}`}
          </span>
        ) : (
          <span className="text-zinc-400">No Expiry</span>
        )}
      </div>
    </div>
  )
}

// ─── Main Notices Page ────────────────────────────────────────────────────────

export function Notices() {
  const { notices, createNotice, updateNotice, deleteNotice, togglePublish } = useNotices()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Notice | null>(null)
  const [viewingNotice, setViewingNotice] = useState<Notice | null>(null)

  // Filters State
  const [search, setSearch] = useState('')
  const [filterPriority, setFilterPriority] = useState<NoticePriority | 'ALL'>('ALL')
  const [filterTarget, setFilterTarget] = useState<NoticeTarget | 'ALL'>('ALL')

  // Stats calculation
  const stats = useMemo(() => {
    const total = notices.length
    const published = notices.filter(n => n.isPublished).length
    const urgent = notices.filter(n => n.priority === 'URGENT' && n.isPublished).length
    const important = notices.filter(n => n.priority === 'IMPORTANT' && n.isPublished).length
    const draftsOrExpired = notices.filter(n => {
      if (!n.isPublished) return true
      if (n.expiresAt) return !isAfter(parseISO(n.expiresAt), new Date())
      return false
    }).length

    return { total, published, urgent, important, draftsOrExpired }
  }, [notices])

  // Filtered notices
  const filtered = useMemo(() => {
    return notices.filter(n => {
      if (filterPriority !== 'ALL' && n.priority !== filterPriority) return false
      if (filterTarget !== 'ALL' && n.target !== filterTarget) return false
      if (search.trim()) {
        const query = search.toLowerCase()
        const matchesTitle = n.title.toLowerCase().includes(query)
        const matchesBody = n.body.toLowerCase().includes(query)
        if (!matchesTitle && !matchesBody) return false
      }
      return true
    })
  }, [notices, filterPriority, filterTarget, search])

  const hasActiveFilters = search.trim() !== '' || filterPriority !== 'ALL' || filterTarget !== 'ALL'

  const resetFilters = () => {
    setSearch('')
    setFilterPriority('ALL')
    setFilterTarget('ALL')
  }

  const handleOpenCreate = () => {
    setEditingNotice(null)
    setModalOpen(true)
  }

  const handleOpenEdit = (n: Notice) => {
    setEditingNotice(n)
    setModalOpen(true)
  }

  const handleSaveNotice = (dto: CreateNoticeDto) => {
    if (editingNotice) {
      updateNotice(editingNotice.id, dto)
    } else {
      createNotice(dto)
    }
  }

  return (
    <div className="space-y-5">
      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Notices & Circulars</h1>
          <p className="text-zinc-500 mt-1 text-sm">Post, publish, and manage institutional announcements</p>
        </div>
        <button
          onClick={handleOpenCreate}
          className="btn-primary shrink-0"
        >
          <Plus size={16} />
          New Notice
        </button>
      </div>

      {/* ── Urgent Announcement Alert ─────────────────────────────── */}
      {stats.urgent > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-red-50/80 border border-red-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
            <Bell size={16} />
          </div>
          <p className="text-sm text-red-800 font-medium">
            <strong>{stats.urgent}</strong> urgent notice{stats.urgent > 1 ? 's' : ''} currently active. Review broadcasts to ensure parents and students stay informed.
          </p>
        </div>
      )}

      {/* ── Stats Cards ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total Notices', value: stats.total, color: 'text-indigo-700', bg: 'bg-indigo-50', icon: FileText },
          { label: 'Active Published', value: stats.published, color: 'text-emerald-700', bg: 'bg-emerald-50', icon: CheckCircle2 },
          { label: 'Urgent & Important', value: stats.urgent + stats.important, color: 'text-amber-700', bg: 'bg-amber-50', icon: AlertCircle },
          { label: 'Drafts / Expired', value: stats.draftsOrExpired, color: 'text-zinc-600', bg: 'bg-zinc-100', icon: Clock },
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

      {/* ── Filters Bar ──────────────────────────────────────────── */}
      <div className="filter-container flex-col !items-stretch gap-3.5">
        {/* Top row: Priority Tabs & Result count */}
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="pill-tab-container">
            {(['ALL', 'URGENT', 'IMPORTANT', 'NORMAL'] as (NoticePriority | 'ALL')[]).map(p => (
              <button
                key={p}
                onClick={() => setFilterPriority(p)}
                className={filterPriority === p ? 'pill-tab-active' : 'pill-tab-inactive'}
              >
                {p === 'ALL' ? `All (${notices.length})` : `${PRIORITY_CONFIG[p as NoticePriority].label} (${notices.filter(n => n.priority === p).length})`}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 text-xs text-zinc-500">
            <SlidersHorizontal size={13} className="text-zinc-400" />
            <span>
              Showing <span className="text-zinc-800 font-semibold">{filtered.length}</span> of{' '}
              <span className="text-zinc-800 font-semibold">{notices.length}</span> notices
            </span>
          </div>
        </div>

        {/* Bottom row: Search + Target Audience dropdown + Reset */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              placeholder="Search notice title or message text..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field w-full pl-9.5 pr-4"
            />
          </div>

          <select
            value={filterTarget}
            onChange={e => setFilterTarget(e.target.value as NoticeTarget | 'ALL')}
            className="input-field"
          >
            <option value="ALL">All Audiences</option>
            {(Object.keys(TARGET_LABELS) as NoticeTarget[]).map(t => (
              <option key={t} value={t}>{TARGET_LABELS[t]}</option>
            ))}
          </select>

          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-red-600 transition-colors px-3 py-2 rounded-xl hover:bg-red-50 cursor-pointer"
            >
              <X size={14} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* ── Notice Grid ──────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="card-surface p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-zinc-50 border border-zinc-200/80 flex items-center justify-center text-zinc-400 mx-auto mb-3">
            <Bell size={26} />
          </div>
          <p className="text-base font-bold text-zinc-800">No notices found</p>
          <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
            {hasActiveFilters
              ? 'Try clearing or modifying your filter criteria to view more notices.'
              : 'Start by creating your first official school announcement.'}
          </p>
          <button
            onClick={hasActiveFilters ? resetFilters : handleOpenCreate}
            className="btn-primary mt-4"
          >
            {hasActiveFilters ? 'Reset Filters' : '+ Create First Notice'}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(notice => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onView={setViewingNotice}
              onEdit={handleOpenEdit}
              onDelete={deleteNotice}
              onToggle={togglePublish}
            />
          ))}
        </div>
      )}

      {/* ── Modals ───────────────────────────────────────────────── */}
      <NoticeFormModal
        open={modalOpen}
        editingNotice={editingNotice}
        onClose={() => { setModalOpen(false); setEditingNotice(null) }}
        onSave={handleSaveNotice}
      />

      <NoticeDetailModal
        notice={viewingNotice}
        onClose={() => setViewingNotice(null)}
        onEdit={handleOpenEdit}
        onDelete={deleteNotice}
        onTogglePublish={togglePublish}
      />
    </div>
  )
}