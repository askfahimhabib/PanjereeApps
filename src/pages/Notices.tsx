import { useState } from 'react'
import { Plus, Trash2, Bell, X, Save, Eye, EyeOff } from 'lucide-react'
import { format, parseISO, isAfter } from 'date-fns'
import { useNotices } from '@/features/notices/useNotices'
import { createStore } from '@/lib/localStore'
import type { ClassItem } from '@/features/classes/types'
import {
  TARGET_LABELS, PRIORITY_CONFIG,
  type NoticeTarget, type NoticePriority, type Notice, type CreateNoticeDto
} from '@/features/notices/types'

// ─── Create Notice Modal ──────────────────────────────────────

interface ModalProps { open: boolean; onClose: () => void; onSave: (dto: CreateNoticeDto) => void }

const classStore = createStore<ClassItem>('classes')

function CreateNoticeModal({ open, onClose, onSave }: ModalProps) {
  const activeClasses = classStore.getAll()
    .map(c => ({ isActive: true, ...c } as ClassItem & { isActive: boolean }))
    .filter(c => c.isActive !== false)

  const [form, setForm] = useState<CreateNoticeDto>({
    title: '', body: '', target: 'ALL', priority: 'NORMAL',
  })
  if (!open) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim() || !form.body.trim()) return
    onSave(form)
    setForm({ title: '', body: '', target: 'ALL', priority: 'NORMAL' })
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg mx-4 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-bold text-slate-100">Create Notice</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white"><X size={20} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Priority */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Priority</label>
            <div className="flex gap-2">
              {(['NORMAL', 'IMPORTANT', 'URGENT'] as NoticePriority[]).map(p => {
                const cfg = PRIORITY_CONFIG[p]
                return (
                  <button
                    key={p} type="button"
                    onClick={() => setForm(f => ({ ...f, priority: p }))}
                    className={`flex-1 py-2 rounded-lg text-xs font-semibold border transition-all ${
                      form.priority === p ? `${cfg.bg} ${cfg.color} ${cfg.border}` : 'border-slate-700 text-slate-500'
                    }`}
                  >
                    {cfg.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Target */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-2">Send To</label>
            <div className="grid grid-cols-3 gap-2">
              {(['ALL', 'STUDENTS', 'TEACHERS', 'PARENTS', 'CLASS'] as NoticeTarget[]).map(t => (
                <button
                  key={t} type="button"
                  onClick={() => setForm(f => ({ ...f, target: t, targetClassId: undefined }))}
                  className={`py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    form.target === t ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-700 text-slate-400'
                  }`}
                >
                  {TARGET_LABELS[t]}
                </button>
              ))}
            </div>
            {form.target === 'CLASS' && (
              <select
                className="mt-2 w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
                value={form.targetClassId ?? ''}
                onChange={e => setForm(f => ({ ...f, targetClassId: e.target.value }))}
              >
                <option value="">— Select Class —</option>
                {activeClasses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            )}
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
            <input
              type="text" required value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Notice title..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Message *</label>
            <textarea
              required rows={4} value={form.body}
              onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
              placeholder="Write notice details..."
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          {/* Expiry */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Expires On (Optional)</label>
            <input
              type="date" value={form.expiresAt ?? ''}
              onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value || undefined }))}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl border border-slate-700 text-slate-400 text-sm hover:border-slate-600 transition-all">
              Cancel
            </button>
            <button type="submit" className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all">
              <Save size={15} />
              Publish
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Notice Card ──────────────────────────────────────────────

function NoticeCard({ notice, onDelete, onToggle }: {
  notice: Notice
  onDelete: (id: string) => void
  onToggle: (id: string) => void
}) {
  const cfg = PRIORITY_CONFIG[notice.priority]
  const isExpired = notice.expiresAt
    ? !isAfter(parseISO(notice.expiresAt), new Date())
    : false

  return (
    <div className={`relative rounded-2xl border p-5 transition-all ${cfg.bg} ${cfg.border} ${!notice.isPublished || isExpired ? 'opacity-50' : ''}`}>
      {/* Priority dot + label */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full flex-shrink-0 mt-0.5 ${cfg.dot}`} />
          <span className={`text-[10px] font-bold uppercase tracking-wider ${cfg.color}`}>{cfg.label}</span>
          {!notice.isPublished && (
            <span className="text-[10px] font-medium text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">Draft</span>
          )}
          {isExpired && (
            <span className="text-[10px] font-medium text-slate-600 bg-slate-800 px-2 py-0.5 rounded-full">Expired</span>
          )}
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <button
            onClick={() => onToggle(notice.id)}
            title={notice.isPublished ? 'Unpublish' : 'Publish'}
            className="text-slate-600 hover:text-slate-300 transition-colors"
          >
            {notice.isPublished ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            onClick={() => { if (confirm('Delete this notice?')) onDelete(notice.id) }}
            className="text-slate-600 hover:text-red-400 transition-colors"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      <h3 className="text-sm font-bold text-slate-100 mb-1.5 leading-snug">{notice.title}</h3>
      <p className="text-xs text-slate-400 leading-relaxed mb-3">{notice.body}</p>

      <div className="flex items-center justify-between text-[10px] text-slate-600">
        <span>To: <span className="text-slate-500">{TARGET_LABELS[notice.target]}{notice.targetClassId ? ` (${mockClasses.find(c => c.id === notice.targetClassId)?.name ?? notice.targetClassId})` : ''}</span></span>
        <span>{format(parseISO(notice.publishedAt), 'dd MMM yyyy, h:mm a')}</span>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────

export function Notices() {
  const { notices, createNotice, deleteNotice, togglePublish } = useNotices()
  const [modalOpen, setModalOpen] = useState(false)
  const [filterPriority, setFilterPriority] = useState<NoticePriority | 'ALL'>('ALL')

  const filtered = filterPriority === 'ALL'
    ? notices
    : notices.filter(n => n.priority === filterPriority)

  const urgentCount   = notices.filter(n => n.priority === 'URGENT'    && n.isPublished).length
  const importantCount = notices.filter(n => n.priority === 'IMPORTANT' && n.isPublished).length

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
          <p className="text-slate-400 mt-1 text-sm">Post and manage institutional announcements</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-lg shadow-blue-900/30"
        >
          <Plus size={17} />
          New Notice
        </button>
      </div>

      {/* Alert banners for active urgent/important */}
      {urgentCount > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/30">
          <Bell size={16} className="text-red-400 flex-shrink-0" />
          <p className="text-sm text-red-300">
            <strong>{urgentCount}</strong> urgent notice{urgentCount > 1 ? 's' : ''} currently active
          </p>
        </div>
      )}

      {/* Filter tabs */}
      <div className="flex items-center gap-2 flex-wrap">
        {(['ALL', 'URGENT', 'IMPORTANT', 'NORMAL'] as (NoticePriority | 'ALL')[]).map(p => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              filterPriority === p
                ? p === 'ALL'
                  ? 'bg-slate-700 text-white border-slate-600'
                  : `${PRIORITY_CONFIG[p as NoticePriority].bg} ${PRIORITY_CONFIG[p as NoticePriority].color} ${PRIORITY_CONFIG[p as NoticePriority].border}`
                : 'border-slate-700 text-slate-500 hover:border-slate-600'
            }`}
          >
            {p === 'ALL' ? `All (${notices.length})` : `${PRIORITY_CONFIG[p as NoticePriority].label} (${notices.filter(n => n.priority === p).length})`}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-slate-600">
          <Bell size={44} className="mb-4 opacity-30" />
          <p className="text-sm">No notices yet</p>
          <button
            onClick={() => setModalOpen(true)}
            className="mt-3 text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            + Post First Notice
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(notice => (
            <NoticeCard
              key={notice.id}
              notice={notice}
              onDelete={deleteNotice}
              onToggle={togglePublish}
            />
          ))}
        </div>
      )}

      <CreateNoticeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={createNotice}
      />
    </div>
  )
}