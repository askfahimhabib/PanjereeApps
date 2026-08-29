import { useState, useMemo } from 'react'
import { createPortal } from 'react-dom'
import { X, Search, ArrowRight, Users, CheckCircle, PlusCircle } from 'lucide-react'
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

  const selectedSection = availableSections.find(s => s.id === selectedSectionId)

  const handleTransfer = () => {
    if (!selectedSectionId) return
    onTransfer(student.id, selectedSectionId)
    setTransferred(true)
    setTimeout(() => {
      setTransferred(false)
      setSelectedSectionId('')
      setSearch('')
      onClose()
    }, 900)
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={handleClose} />

      <div className="relative z-10 w-full max-w-md mx-4 bg-white border border-zinc-100 rounded-2xl shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-5 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl border ${isTransfer ? 'bg-purple-500/10 border-purple-500/20' : 'bg-blue-500/10 border-blue-500/20'}`}>
              {isTransfer ? <ArrowRight size={16} className="text-purple-400" /> : <PlusCircle size={16} className="text-blue-400" />}
            </div>
            <div>
              <h2 className="text-base font-semibold text-white">{isTransfer ? 'Transfer Student' : 'Assign to Section'}</h2>
              <p className="text-xs text-zinc-600 mt-0.5">
                {isTransfer ? (
                  <>Move <span className="text-zinc-800 font-medium">{student.fullNameEn}</span> from Section {currentSection.name}</>
                ) : (
                  <>Assign <span className="text-zinc-800 font-medium">{student.fullNameEn}</span> to a section</>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-xl hover:bg-zinc-50 text-zinc-600 hover:text-white transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Student info */}
          <div className="flex items-center gap-3 p-3 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl">
            <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0 border ${isTransfer ? 'bg-purple-600/20 border-purple-500/20 text-purple-300' : 'bg-blue-600/20 border-blue-500/20 text-blue-300'}`}>
              {student.fullNameEn.split(' ').map(n => n[0]).slice(0, 2).join('')}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-zinc-800 truncate">{student.fullNameEn}</p>
              <p className="text-xs text-zinc-600">{student.studentId} · Roll: {student.rollPrefix}-{String(student.roll).padStart(2, '0')}</p>
            </div>
            {isTransfer && (
              <div className="ml-auto flex items-center gap-1 text-xs text-zinc-600 shrink-0">
                <span className="bg-zinc-100 px-2 py-0.5 rounded-lg">Sec {currentSection.name}</span>
                <ArrowRight size={12} className="text-purple-400" />
              </div>
            )}
          </div>

          {/* Search sections */}
          <div>
            <label className="block text-sm font-medium text-zinc-800 mb-2">
              Select Target Section
            </label>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
              <input
                type="text"
                placeholder="Search sections..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl text-sm text-zinc-800 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
            </div>

            {availableSections.length === 0 ? (
              <div className="text-center py-6 text-zinc-600 text-sm border border-dashed border-zinc-100 rounded-xl">
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
                      disabled={isFull}
                      onClick={() => setSelectedSectionId(section.id)}
                      className={`w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'bg-purple-600/15 border-purple-500/40 text-white'
                          : isFull
                          ? 'opacity-40 cursor-not-allowed bg-zinc-50 border-zinc-100'
                          : 'bg-zinc-50 border-zinc-100 hover:border-zinc-100 text-zinc-800'
                      }`}
                    >
                      {/* Section icon */}
                      <div className={`w-9 h-9 rounded-full border flex items-center justify-center font-bold text-sm flex-shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-purple-600 border-purple-500 text-white'
                          : 'bg-zinc-100 border-zinc-100 text-zinc-800'
                      }`}>
                        {section.name}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">Section {section.name}</p>
                        <p className="text-xs text-zinc-600 truncate">
                          {section.classTeacherName ?? 'No class teacher'}
                        </p>
                      </div>

                      {/* Capacity indicator */}
                      <div className="flex flex-col items-end gap-1 shrink-0">
                        <span className={`text-xs font-medium ${
                          pct >= 90 ? 'text-red-400' : 'text-zinc-600'
                        }`}>
                          {section.totalStudents}/{section.capacity}
                        </span>
                        <div className="w-16 h-1 bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${pct >= 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                            style={{ width: `${Math.min(100, pct)}%` }}
                          />
                        </div>
                        {isFull && (
                          <span className="text-[10px] text-red-400">Full</span>
                        )}
                      </div>

                      {isSelected && (
                        <CheckCircle size={16} className="text-purple-400 shrink-0" />
                      )}
                    </button>
                  )
                })}

                {filtered.length === 0 && (
                  <p className="text-center text-sm text-zinc-600 py-4">No sections match your search.</p>
                )}
              </div>
            )}
          </div>

          {/* Transfer preview */}
          {selectedSection && (
            <div className="flex items-center gap-2 p-3 bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl text-xs text-zinc-600">
              <Users size={13} className="text-zinc-600 shrink-0" />
              <span>
                {currentSection ? (
                  <>Section {currentSection.name} → Section {selectedSection.name}</>
                ) : (
                  <>Assign to Section {selectedSection.name}</>
                )} &nbsp;·&nbsp;
                <span className="text-zinc-800">{selectedSection.name}</span> will have{' '}
                <span className="text-zinc-800 font-medium">{selectedSection.totalStudents + 1}</span> students
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-zinc-100">
          <button
            onClick={handleClose}
            className="px-4 py-2 rounded-xl border border-zinc-100 text-zinc-800 hover:bg-zinc-50 text-sm font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleTransfer}
            disabled={!selectedSectionId || transferred}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white text-sm font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
              transferred
                ? 'bg-emerald-600'
                : 'bg-purple-600 hover:bg-purple-500 shadow-lg shadow-purple-900/30'
            }`}
          >
            {transferred ? (
              <><CheckCircle size={15} /> Transferred!</>
            ) : (
              <><ArrowRight size={15} /> Confirm Transfer</>
            )}
          </button>
        </div>
      </div>
    </div>
  , document.body
  )
}
