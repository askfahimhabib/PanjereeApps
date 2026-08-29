import { useState, useEffect, useMemo } from 'react'
import {
  X, Search, Plus, Phone, Trash2,
  GraduationCap, Users, CheckCircle2, XCircle, Check,
} from 'lucide-react'
import { useBatchStudents } from '../useBatchStudents'
import type { Batch } from '../types'
import type { Student } from '@/features/students/types'

// ── Props ────────────────────────────────────────────────────────────────────

interface Props {
  batch: Batch
  onClose: () => void
}

// ── Main Drawer ──────────────────────────────────────────────────────────────

export function BatchDetailDrawer({ batch, onClose }: Props) {
  const {
    filtered, search, setSearch,
    isPickerOpen, setIsPickerOpen,
    availableStudents,
    assignStudents,
    removeStudent,
  } = useBatchStudents(batch)

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm" onClick={onClose} />

      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl flex flex-col bg-white shadow-2xl">

        {/* ── Header ─────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/80 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-100 flex items-center justify-center shrink-0">
              <GraduationCap size={19} className="text-indigo-600" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900 leading-tight">{batch.name}</h2>
              <p className="text-xs text-zinc-500">{batch.className} · {batch.examName} {batch.examYear}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-zinc-200 text-zinc-400 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* ── Stats strip ─────────────────────────────────────── */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-zinc-100 bg-white shrink-0">
          <div className="flex items-center gap-2">
            <Users size={15} className="text-indigo-500" />
            <span className="text-sm font-bold text-zinc-800">{filtered.length}</span>
            <span className="text-xs text-zinc-500">Enrolled</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={15} className="text-green-500" />
            <span className="text-sm font-bold text-zinc-800">{filtered.filter(s => s.status === 'ACTIVE').length}</span>
            <span className="text-xs text-zinc-500">Active</span>
          </div>
          <div className="flex items-center gap-2">
            <XCircle size={15} className="text-red-400" />
            <span className="text-sm font-bold text-zinc-800">{filtered.filter(s => s.status !== 'ACTIVE').length}</span>
            <span className="text-xs text-zinc-500">Inactive</span>
          </div>
        </div>

        {/* ── Toolbar ─────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-6 py-3 border-b border-zinc-100 shrink-0">
          <div className="relative flex-1">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, phone..."
              className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
          <button
            onClick={() => setIsPickerOpen(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors shadow-lg shadow-indigo-500/20 shrink-0"
          >
            <Plus size={16} />
            Add Student
          </button>
        </div>

        {/* ── Student List ─────────────────────────────────────── */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-8">
              <div className="w-16 h-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <Users size={28} className="text-zinc-300" />
              </div>
              <div>
                <p className="font-semibold text-zinc-700">No students enrolled yet</p>
                <p className="text-sm text-zinc-400 mt-1">
                  {search ? 'No match found.' : 'Click "Add Student" to enroll students from the existing list.'}
                </p>
              </div>
              {!search && (
                <button onClick={() => setIsPickerOpen(true)}
                  className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">
                  <Plus size={15} /> Enroll Students
                </button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {filtered.map((s, i) => (
                <StudentRow
                  key={s.id}
                  student={s}
                  index={i + 1}
                  onRemove={() => removeStudent(s.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Student Picker Modal ─────────────────────────────── */}
      {isPickerOpen && (
        <StudentPickerModal
          available={availableStudents}
          onClose={() => setIsPickerOpen(false)}
          onAssign={assignStudents}
        />
      )}
    </>
  )
}

// ── Student Row ───────────────────────────────────────────────────────────────

function StudentRow({ student: s, index, onRemove }: {
  student: Student
  index: number
  onRemove: () => void
}) {
  const statusColors: Record<string, string> = {
    ACTIVE:    'bg-green-100 text-green-700',
    INACTIVE:  'bg-zinc-100 text-zinc-500',
    PASSED:    'bg-blue-100 text-blue-700',
    LEFT:      'bg-red-100 text-red-600',
    SUSPENDED: 'bg-amber-100 text-amber-700',
  }

  return (
    <div className="flex items-center gap-4 px-6 py-3.5 hover:bg-zinc-50/70 transition-colors group">
      <span className="text-xs font-bold text-zinc-400 w-5 shrink-0 text-right">{index}</span>

      {/* Avatar */}
      {s.profilePhoto ? (
        <img src={s.profilePhoto} alt={s.fullNameEn}
          className="w-9 h-9 rounded-full object-cover shrink-0 ring-2 ring-white shadow-sm" />
      ) : (
        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {s.fullNameEn.charAt(0)}
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-zinc-900 text-sm">{s.fullNameEn}</span>
          {s.fullNameBn && <span className="text-xs text-zinc-400">{s.fullNameBn}</span>}
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-zinc-500">
          <span className="font-mono">{s.studentId}</span>
          {s.mobile && (
            <span className="flex items-center gap-1">
              <Phone size={10} className="text-zinc-400" />{s.mobile}
            </span>
          )}
          {s.className && <span className="text-zinc-400">{s.className}</span>}
        </div>
      </div>

      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${statusColors[s.status] ?? 'bg-zinc-100 text-zinc-500'}`}>
        {s.status}
      </span>

      <button
        onClick={onRemove}
        className="p-1.5 rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
        title="Remove from batch"
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

// ── Student Picker Modal ──────────────────────────────────────────────────────

function StudentPickerModal({ available, onClose, onAssign }: {
  available: Student[]
  onClose: () => void
  onAssign: (ids: string[]) => void
}) {
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const filtered = useMemo(() =>
    available.filter(s =>
      !search ||
      s.fullNameEn.toLowerCase().includes(search.toLowerCase()) ||
      s.fullNameBn.includes(search) ||
      s.studentId.toLowerCase().includes(search.toLowerCase()) ||
      (s.mobile ?? '').includes(search) ||
      (s.className ?? '').toLowerCase().includes(search.toLowerCase())
    ), [available, search])

  const toggle = (id: string) =>
    setSelected(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set())
    else setSelected(new Set(filtered.map(s => s.id)))
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 shrink-0">
          <div>
            <h2 className="font-bold text-zinc-900">Select Students</h2>
            <p className="text-xs text-zinc-500 mt-0.5">
              {available.length} students available · {selected.size} selected
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-zinc-100 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              autoFocus
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name, ID, class, phone..."
              className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400"
            />
          </div>
        </div>

        {/* Select all bar */}
        {filtered.length > 0 && (
          <div className="flex items-center justify-between px-5 py-2 bg-zinc-50 border-b border-zinc-100 shrink-0">
            <button onClick={toggleAll}
              className="flex items-center gap-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">
              <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                selected.size === filtered.length && filtered.length > 0
                  ? 'bg-indigo-600 border-indigo-600'
                  : selected.size > 0 ? 'border-indigo-400' : 'border-zinc-300'
              }`}>
                {selected.size === filtered.length && filtered.length > 0 && <Check size={10} className="text-white" />}
                {selected.size > 0 && selected.size < filtered.length && <div className="w-2 h-0.5 bg-indigo-500 rounded" />}
              </div>
              Select all ({filtered.length})
            </button>
            <span className="text-xs text-zinc-500">{selected.size} selected</span>
          </div>
        )}

        {/* Student list */}
        <div className="flex-1 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <Users size={32} className="text-zinc-200 mb-3" />
              <p className="font-semibold text-zinc-600">
                {available.length === 0 ? 'All students are already enrolled' : 'No students match'}
              </p>
              <p className="text-sm text-zinc-400 mt-1">
                {available.length === 0 ? '' : 'Try a different search term'}
              </p>
            </div>
          ) : (
            <div className="divide-y divide-zinc-50">
              {filtered.map(s => {
                const isSelected = selected.has(s.id)
                return (
                  <div
                    key={s.id}
                    onClick={() => toggle(s.id)}
                    className={`flex items-center gap-3 px-5 py-3 cursor-pointer transition-colors ${
                      isSelected ? 'bg-indigo-50' : 'hover:bg-zinc-50'
                    }`}
                  >
                    {/* Checkbox */}
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'bg-indigo-600 border-indigo-600' : 'border-zinc-300'
                    }`}>
                      {isSelected && <Check size={12} className="text-white" />}
                    </div>

                    {/* Avatar */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                      {s.fullNameEn.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold text-sm ${isSelected ? 'text-indigo-900' : 'text-zinc-900'}`}>
                          {s.fullNameEn}
                        </span>
                        {s.fullNameBn && <span className="text-xs text-zinc-400">{s.fullNameBn}</span>}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-zinc-500 mt-0.5">
                        <span className="font-mono">{s.studentId}</span>
                        {s.className && <span>{s.className}</span>}
                        {s.mobile && (
                          <span className="flex items-center gap-1">
                            <Phone size={9} />{s.mobile}
                          </span>
                        )}
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                      s.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-zinc-100 text-zinc-500'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50 shrink-0">
          <button onClick={onClose}
            className="flex-1 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-100 transition-colors">
            Cancel
          </button>
          <button
            onClick={() => onAssign([...selected])}
            disabled={selected.size === 0}
            className="flex-1 py-2.5 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            <Check size={15} />
            Enroll {selected.size > 0 ? `${selected.size} Student${selected.size > 1 ? 's' : ''}` : ''}
          </button>
        </div>
      </div>
    </div>
  )
}
