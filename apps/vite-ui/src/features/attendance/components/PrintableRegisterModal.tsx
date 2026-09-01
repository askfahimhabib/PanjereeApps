import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'
import type { AttendanceStatus } from '../types'

interface PrintableRegisterModalProps {
  isOpen: boolean
  onClose: () => void
  className: string
  sectionName: string
  date: string
  students: {
    id: string
    name: string
    nameBn?: string
    roll: string
    gender?: string
  }[]
  draft: Record<string, AttendanceStatus>
}

export function PrintableRegisterModal({
  isOpen,
  onClose,
  className,
  sectionName,
  date,
  students,
  draft,
}: PrintableRegisterModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  const counts = {
    P: Object.values(draft).filter(s => s === 'PRESENT').length,
    L: Object.values(draft).filter(s => s === 'LATE').length,
    A: Object.values(draft).filter(s => s === 'ABSENT').length,
    LV: Object.values(draft).filter(s => s === 'LEAVE').length,
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Daily Attendance Register Sheet</h3>
            <p className="text-xs text-zinc-500 font-medium">
              {className} — Section {sectionName} · {date}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Printer size={15} />
              <span>Print Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area */}
        <div className="p-8 overflow-y-auto flex-1 bg-zinc-100 flex justify-center">
          <div
            ref={printAreaRef}
            className="bg-white p-8 rounded-2xl border border-zinc-300 shadow-xs w-full max-w-3xl text-zinc-900 print:p-0 print:border-none print:shadow-none"
          >
            {/* Header */}
            <div className="text-center border-b-2 border-zinc-900 pb-4 mb-6">
              <h1 className="text-xl font-black uppercase tracking-wide text-zinc-900">
                Ideal Model School & College
              </h1>
              <p className="text-xs text-zinc-600 mt-0.5 font-semibold">
                Daily Class Attendance Master Register · Academic Session 2024-2025
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs font-bold text-zinc-800 bg-zinc-50 py-1.5 px-4 rounded-xl border border-zinc-200">
                <span>Class: {className}</span>
                <span>•</span>
                <span>Section: {sectionName}</span>
                <span>•</span>
                <span>Date: {new Date(date).toLocaleDateString('en-BD', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}</span>
                <span>•</span>
                <span>Total: {students.length}</span>
              </div>
            </div>

            {/* Summary Counters */}
            <div className="grid grid-cols-4 gap-2 mb-4 text-center text-xs font-bold">
              <div className="p-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg">
                Present: {counts.P}
              </div>
              <div className="p-2 bg-amber-50 border border-amber-200 text-amber-800 rounded-lg">
                Late: {counts.L}
              </div>
              <div className="p-2 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg">
                Absent: {counts.A}
              </div>
              <div className="p-2 bg-indigo-50 border border-indigo-200 text-indigo-800 rounded-lg">
                Leave: {counts.LV}
              </div>
            </div>

            {/* Table */}
            <table className="w-full text-xs border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-800 font-bold">
                  <th className="border border-zinc-300 px-2 py-2 text-center w-12">Roll</th>
                  <th className="border border-zinc-300 px-3 py-2 text-left">Student Name</th>
                  <th className="border border-zinc-300 px-3 py-2 text-left hidden sm:table-cell">Bengali Name</th>
                  <th className="border border-zinc-300 px-2 py-2 text-center w-16">Gender</th>
                  <th className="border border-zinc-300 px-3 py-2 text-center w-24">Status</th>
                  <th className="border border-zinc-300 px-3 py-2 text-left">Signature / Note</th>
                </tr>
              </thead>
              <tbody>
                {students.map((st, idx) => {
                  const status = draft[st.id] || 'UNMARKED'
                  return (
                    <tr key={st.id} className={idx % 2 === 1 ? 'bg-zinc-50/50' : 'bg-white'}>
                      <td className="border border-zinc-300 px-2 py-1.5 text-center font-bold font-mono">
                        #{st.roll}
                      </td>
                      <td className="border border-zinc-300 px-3 py-1.5 font-semibold text-zinc-900">
                        {st.name}
                      </td>
                      <td className="border border-zinc-300 px-3 py-1.5 text-zinc-600 hidden sm:table-cell">
                        {st.nameBn || '—'}
                      </td>
                      <td className="border border-zinc-300 px-2 py-1.5 text-center capitalize text-zinc-600">
                        {st.gender?.toLowerCase() || 'student'}
                      </td>
                      <td className="border border-zinc-300 px-3 py-1.5 text-center font-bold">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] ${
                            status === 'PRESENT'
                              ? 'bg-emerald-100 text-emerald-800'
                              : status === 'LATE'
                              ? 'bg-amber-100 text-amber-800'
                              : status === 'ABSENT'
                              ? 'bg-rose-100 text-rose-800'
                              : status === 'LEAVE'
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'text-zinc-400'
                          }`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="border border-zinc-300 px-3 py-1.5 text-zinc-400 text-[10px]">
                        {status === 'PRESENT' ? '✓ In-Class' : ''}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Signature Area */}
            <div className="mt-12 pt-6 flex items-center justify-between text-xs font-bold text-zinc-800">
              <div className="text-center">
                <div className="w-40 border-t border-zinc-900 mb-1" />
                <p>Class Teacher Signature</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-t border-zinc-900 mb-1" />
                <p>Principal / Headmaster</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
