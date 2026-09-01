import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, ArrowRight, CheckCircle, ArrowRightLeft } from 'lucide-react'
import type { Section, SectionStudent } from '../../types'

interface TransferStudentModalProps {
  isOpen: boolean
  onClose: () => void
  student: SectionStudent | null
  currentSection?: Section
  availableSections: Section[]
  onTransfer: (studentId: string, toSectionId: string) => void
}

export function TransferStudentModal({
  isOpen,
  onClose,
  student,
  currentSection,
  availableSections,
  onTransfer,
}: TransferStudentModalProps) {
  const [selectedSectionId, setSelectedSectionId] = useState('')
  const [search, setSearch] = useState('')
  const [transferred, setTransferred] = useState(false)

  const filtered = useMemo(
    () =>
      availableSections.filter(
        s =>
          s.name.toLowerCase().includes(search.toLowerCase()) ||
          (s.classTeacherName ?? '').toLowerCase().includes(search.toLowerCase())
      ),
    [availableSections, search]
  )

  if (!isOpen || !student) return null

  const handleTransfer = () => {
    if (!selectedSectionId) return
    onTransfer(student.id, selectedSectionId)
    setTransferred(true)
    setTimeout(() => {
      setTransferred(false)
      setSelectedSectionId('')
      setSearch('')
      onClose()
    }, 800)
  }

  const handleClose = () => {
    setSelectedSectionId('')
    setSearch('')
    setTransferred(false)
    onClose()
  }

  const fillPct = (s: Section) =>
    s.capacity > 0 ? Math.round((s.totalStudents / s.capacity) * 100) : 0

  const isTransfer = !!currentSection

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-xs" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-md bg-white border border-zinc-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-zinc-100 bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-2xl bg-purple-50 border border-purple-100 text-purple-700">
              <ArrowRightLeft size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-zinc-900">
                {isTransfer ? 'Transfer Section' : 'Assign to Section'}
              </h2>
              <p className="text-xs text-zinc-500 font-medium">
                {student.fullNameEn} (Roll #{String(student.roll).padStart(2, '0')})
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* Student Info Card */}
          <div className="flex items-center gap-3 p-3.5 bg-zinc-50 border border-zinc-200/80 rounded-2xl">
            <div className="w-10 h-10 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center text-sm shrink-0">
              {student.fullNameEn.slice(0, 2).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-zinc-900 truncate">{student.fullNameEn}</p>
              <p className="text-xs text-zinc-500 font-mono">
                ID: {student.studentId} · Roll: #{String(student.roll).padStart(2, '0')}
              </p>
            </div>
            {isTransfer && (
              <span className="text-[11px] font-bold bg-zinc-200 text-zinc-800 px-2 py-0.5 rounded-lg shrink-0">
                Sec {currentSection.name}
              </span>
            )}
          </div>

          {/* Search Sections */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 uppercase tracking-wider mb-2">
              Select Target Section
            </label>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                placeholder="Filter sections..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-zinc-50 border border-zinc-200 rounded-xl text-xs text-zinc-900 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-600 transition-colors"
              />
            </div>

            {availableSections.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs border border-dashed border-zinc-200 rounded-2xl bg-zinc-50">
                No other sections available in this class.
              </div>
            ) : (
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {filtered.map(section => {
                  const pct = fillPct(section)
                  const isFull = section.totalStudents >= section.capacity
                  const isSelected = selectedSectionId === section.id
                  return (
                    <button
                      key={section.id}
                      type="button"
                      disabled={isFull}
                      onClick={() => setSelectedSectionId(section.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-purple-50 border-purple-500 text-purple-900 shadow-xs'
                          : isFull
                          ? 'opacity-40 cursor-not-allowed bg-zinc-100 border-zinc-200'
                          : 'bg-white border-zinc-200 hover:border-purple-300 hover:bg-purple-50/30 text-zinc-900'
                      }`}
                    >
                      <div
                        className={`w-9 h-9 rounded-xl border flex items-center justify-center font-black text-sm shrink-0 ${
                          isSelected
                            ? 'bg-purple-600 border-purple-600 text-white'
                            : 'bg-zinc-100 border-zinc-200 text-zinc-700'
                        }`}
                      >
                        {section.name}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-bold text-zinc-900">Section {section.name}</p>
                        <p className="text-[11px] text-zinc-500 truncate">
                          {section.classTeacherName ?? 'No Class Teacher'}
                        </p>
                      </div>

                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className="text-xs font-mono font-bold text-zinc-700">
                          {section.totalStudents}/{section.capacity}
                        </span>
                        <div className="w-14 h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-rose-500' : 'bg-indigo-600'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                      </div>

                      {isSelected && <CheckCircle size={16} className="text-purple-600 shrink-0" />}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100 bg-zinc-50/50">
          <button
            onClick={handleClose}
            className="px-4 py-2.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-100 text-xs font-bold transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedSectionId || transferred}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-white text-xs font-bold transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md cursor-pointer ${
              transferred
                ? 'bg-emerald-600'
                : 'bg-purple-600 hover:bg-purple-700 shadow-purple-500/20'
            }`}
          >
            {transferred ? (
              <>
                <CheckCircle size={15} />
                <span>Transferred!</span>
              </>
            ) : (
              <>
                <ArrowRight size={15} />
                <span>Confirm Transfer</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
