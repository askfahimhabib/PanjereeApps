import { useState, useMemo } from 'react'
import {
  X,
  Sparkles,
  Trophy,
  ArrowDownAZ,
  Calendar,
  ArrowLeftRight,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import type { Section, SectionStudent, RollAssignStrategy } from '../../types'
import type { ExamHeld } from '@/features/examHeld/types'

interface SmartRollModalProps {
  isOpen: boolean
  onClose: () => void
  section: Section
  students: SectionStudent[]
  classExams: ExamHeld[]
  onAutoAssign: (strategy: RollAssignStrategy, examId?: string) => void
  onSwapRolls: (studentId1: string, studentId2: string) => void
}

export function SmartRollModal({
  isOpen,
  onClose,
  section,
  students,
  classExams,
  onAutoAssign,
  onSwapRolls,
}: SmartRollModalProps) {
  const [strategy, setStrategy] = useState<RollAssignStrategy>('EXAM_MERIT')
  const [selectedExamId, setSelectedExamId] = useState<string>(classExams[0]?.id || '')
  const [student1Id, setStudent1Id] = useState<string>(students[0]?.id || '')
  const [student2Id, setStudent2Id] = useState<string>(students[1]?.id || '')
  const [appliedSuccess, setAppliedSuccess] = useState(false)

  // Calculate preview of new rolls based on selected strategy
  const previewList = useMemo(() => {
    const list = [...students]
    if (strategy === 'ALPHABETICAL') {
      list.sort((a, b) => a.fullNameEn.localeCompare(b.fullNameEn))
    } else if (strategy === 'ADMISSION_DATE') {
      list.sort((a, b) => (a.admissionDate || '').localeCompare(b.admissionDate || ''))
    } else if (strategy === 'EXAM_MERIT') {
      list.sort((a, b) => {
        const gpaA = a.latestGpa ?? 0
        const gpaB = b.latestGpa ?? 0
        if (gpaB !== gpaA) return gpaB - gpaA
        return a.fullNameEn.localeCompare(b.fullNameEn)
      })
    } else if (strategy === 'MANUAL_SWAP') {
      const s1 = list.find(s => s.id === student1Id)
      const s2 = list.find(s => s.id === student2Id)
      if (s1 && s2) {
        return list.map(s => {
          if (s.id === s1.id) return { ...s, proposedRoll: s2.roll }
          if (s.id === s2.id) return { ...s, proposedRoll: s1.roll }
          return { ...s, proposedRoll: s.roll }
        }).sort((a, b) => (a.proposedRoll || a.roll) - (b.proposedRoll || b.roll))
      }
    }

    return list.map((s, index) => ({
      ...s,
      proposedRoll: index + 1,
    }))
  }, [students, strategy, student1Id, student2Id])

  if (!isOpen) return null

  const handleApply = () => {
    if (strategy === 'MANUAL_SWAP') {
      if (!student1Id || !student2Id || student1Id === student2Id) return
      onSwapRolls(student1Id, student2Id)
    } else {
      onAutoAssign(strategy, selectedExamId)
    }
    setAppliedSuccess(true)
    setTimeout(() => {
      setAppliedSuccess(false)
      onClose()
    }, 1200)
  }

  const s1 = students.find(s => s.id === student1Id)
  const s2 = students.find(s => s.id === student2Id)

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-3xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-zinc-900 tracking-tight">
                Smart Roll Management
              </h2>
              <p className="text-xs text-zinc-500">
                {section.className} — Section {section.name} · {students.length} Students
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Frozen Alert */}
        {section.isRollFrozen && (
          <div className="mx-6 mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-center gap-3 text-amber-800 text-xs font-medium">
            <Lock size={16} className="text-amber-600 shrink-0" />
            <span>
              <strong>Rolls are currently Frozen.</strong> You must unfreeze roll numbers in the section manager before applying changes.
            </span>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto flex-1">
          {/* Strategy Selection Grid */}
          <div>
            <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider block mb-2.5">
              Select Roll Assignment Method:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Option 1: Exam Merit */}
              <button
                type="button"
                onClick={() => setStrategy('EXAM_MERIT')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  strategy === 'EXAM_MERIT'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2">
                    <Trophy size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">Exam Merit-wise</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-tight">
                    Ranks students by GPA and total marks.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 mt-3 block">
                  {strategy === 'EXAM_MERIT' ? '● Selected' : 'Select'}
                </span>
              </button>

              {/* Option 2: Alphabetical */}
              <button
                type="button"
                onClick={() => setStrategy('ALPHABETICAL')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  strategy === 'ALPHABETICAL'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2">
                    <ArrowDownAZ size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">Alphabetical (A-Z)</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-tight">
                    Sorts by full English name alphabetically.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 mt-3 block">
                  {strategy === 'ALPHABETICAL' ? '● Selected' : 'Select'}
                </span>
              </button>

              {/* Option 3: Admission Date */}
              <button
                type="button"
                onClick={() => setStrategy('ADMISSION_DATE')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  strategy === 'ADMISSION_DATE'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2">
                    <Calendar size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">Admission Serial</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-tight">
                    Sorts by registration / admission date.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 mt-3 block">
                  {strategy === 'ADMISSION_DATE' ? '● Selected' : 'Select'}
                </span>
              </button>

              {/* Option 4: Swap Two */}
              <button
                type="button"
                onClick={() => setStrategy('MANUAL_SWAP')}
                className={`p-3.5 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                  strategy === 'MANUAL_SWAP'
                    ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-2 ring-indigo-500/20'
                    : 'border-zinc-200 bg-white hover:border-zinc-300'
                }`}
              >
                <div>
                  <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2">
                    <ArrowLeftRight size={16} />
                  </div>
                  <h4 className="text-xs font-bold text-zinc-900">Swap Two Rolls</h4>
                  <p className="text-[11px] text-zinc-500 mt-1 leading-tight">
                    Exchange rolls between any 2 students.
                  </p>
                </div>
                <span className="text-[10px] font-semibold text-indigo-600 mt-3 block">
                  {strategy === 'MANUAL_SWAP' ? '● Selected' : 'Select'}
                </span>
              </button>
            </div>
          </div>

          {/* Strategy Specific Controls */}
          {strategy === 'EXAM_MERIT' && (
            <div className="p-4 bg-zinc-50 rounded-2xl border border-zinc-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-zinc-800">Choose Benchmark Exam:</h4>
                <p className="text-[11px] text-zinc-500">
                  Total marks from this exam will determine new student rolls.
                </p>
              </div>
              <select
                value={selectedExamId}
                onChange={e => setSelectedExamId(e.target.value)}
                className="text-xs font-bold text-zinc-800 bg-white border border-zinc-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-indigo-500 focus:outline-none min-w-[220px]"
              >
                {classExams.length > 0 ? (
                  classExams.map(ex => (
                    <option key={ex.id} value={ex.id}>
                      {ex.name} (Marks: {ex.total_marks})
                    </option>
                  ))
                ) : (
                  <option value="">Latest Overall Results (GPA)</option>
                )}
              </select>
            </div>
          )}

          {strategy === 'MANUAL_SWAP' && (
            <div className="p-4 bg-purple-50/60 rounded-2xl border border-purple-200 space-y-3">
              <h4 className="text-xs font-bold text-purple-900">Select Two Students to Swap Rolls:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Student 1:</label>
                  <select
                    value={student1Id}
                    onChange={e => setStudent1Id(e.target.value)}
                    className="w-full text-xs font-medium text-zinc-800 bg-white border border-purple-200 rounded-xl p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id} disabled={s.id === student2Id}>
                        Roll {s.roll} — {s.fullNameEn} ({s.studentId})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-zinc-600 block mb-1">Student 2:</label>
                  <select
                    value={student2Id}
                    onChange={e => setStudent2Id(e.target.value)}
                    className="w-full text-xs font-medium text-zinc-800 bg-white border border-purple-200 rounded-xl p-2 focus:ring-2 focus:ring-purple-500 focus:outline-none"
                  >
                    {students.map(s => (
                      <option key={s.id} value={s.id} disabled={s.id === student1Id}>
                        Roll {s.roll} — {s.fullNameEn} ({s.studentId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              {s1 && s2 && (
                <div className="text-xs font-medium text-purple-800 bg-white/80 p-2.5 rounded-xl border border-purple-100 flex items-center justify-between">
                  <span>
                    <strong>{s1.fullNameEn}</strong> (Current Roll: {s1.roll}) ➔ <strong>New Roll: {s2.roll}</strong>
                  </span>
                  <ArrowLeftRight size={14} className="text-purple-600" />
                  <span>
                    <strong>{s2.fullNameEn}</strong> (Current Roll: {s2.roll}) ➔ <strong>New Roll: {s1.roll}</strong>
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Proposed Roll Preview Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-xs font-bold text-zinc-700 uppercase tracking-wider">
                Live Proposed Roll Preview ({previewList.length} Students)
              </h4>
              <span className="text-[11px] text-zinc-500">
                Sorted by new proposed roll sequence
              </span>
            </div>

            <div className="border border-zinc-200 rounded-2xl overflow-hidden bg-white max-h-56 overflow-y-auto">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0">
                  <tr>
                    <th className="py-2.5 px-3 text-left font-bold text-zinc-600">Proposed Roll</th>
                    <th className="py-2.5 px-3 text-left font-bold text-zinc-600">Student Name</th>
                    <th className="py-2.5 px-3 text-center font-bold text-zinc-600">Current Roll</th>
                    <th className="py-2.5 px-3 text-center font-bold text-zinc-600">Exam GPA</th>
                    <th className="py-2.5 px-3 text-right font-bold text-zinc-600">Change</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {previewList.map((item, i) => {
                    const diff = item.roll - (item.proposedRoll ?? i + 1)
                    return (
                      <tr key={item.id} className="hover:bg-zinc-50/80">
                        <td className="py-2 px-3 font-bold font-mono text-indigo-700">
                          #{String(item.proposedRoll ?? i + 1).padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 font-medium text-zinc-900">
                          {item.fullNameEn}
                          <span className="text-[10px] text-zinc-400 block font-normal">{item.studentId}</span>
                        </td>
                        <td className="py-2 px-3 text-center font-mono text-zinc-600">
                          {String(item.roll).padStart(2, '0')}
                        </td>
                        <td className="py-2 px-3 text-center">
                          {item.latestGpa !== undefined ? (
                            <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md text-[11px]">
                              {item.latestGpa.toFixed(2)} ({item.latestGrade})
                            </span>
                          ) : (
                            <span className="text-zinc-400">—</span>
                          )}
                        </td>
                        <td className="py-2 px-3 text-right font-semibold">
                          {diff > 0 ? (
                            <span className="text-emerald-600 font-bold">▲ +{diff}</span>
                          ) : diff < 0 ? (
                            <span className="text-rose-600 font-bold">▼ {diff}</span>
                          ) : (
                            <span className="text-zinc-400 font-normal">0 (Same)</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-zinc-100 flex items-center justify-between bg-zinc-50/50">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-zinc-600 hover:text-zinc-900 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={section.isRollFrozen || appliedSuccess}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold text-white shadow-lg transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
              appliedSuccess
                ? 'bg-emerald-600 shadow-emerald-500/30'
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-500/20'
            }`}
          >
            {appliedSuccess ? (
              <>
                <CheckCircle2 size={16} />
                <span>Rolls Updated Successfully!</span>
              </>
            ) : (
              <>
                <Sparkles size={15} />
                <span>Apply & Finalize New Rolls</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
