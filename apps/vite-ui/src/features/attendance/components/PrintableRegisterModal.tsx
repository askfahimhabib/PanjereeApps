import { useRef } from 'react'
import { createPortal } from 'react-dom'
import { X, Printer } from 'lucide-react'
import type { AttendanceStatus } from '../types'
import { getInstitutionInfo } from '@/lib/institutionInfo'

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
  const inst = getInstitutionInfo()

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
                {inst.name}
              </h1>
              {inst.nameBn && (
                <p className="text-xs text-zinc-600 font-bold mt-0.5">{inst.nameBn}</p>
              )}
              <p className="text-[11px] text-zinc-500 mt-0.5">
                EIIN: {inst.eiin} • {inst.address}
              </p>
              <p className="text-xs text-zinc-700 mt-1 font-bold">
                Daily Class Attendance Master Register · Academic Session {inst.session}
              </p>
              <div className="flex items-center justify-center gap-4 mt-3 text-xs font-bold text-zinc-800 bg-zinc-50 py-1.5 px-4 rounded-xl border border-zinc-200">
                <span>Class: {className}</span>
                <span>•</span>
                <span>Section: {sectionName}</span>
                <span>•</span>
                <span>Date: {date}</span>
                <span>•</span>
                <span>Total Enrolled: {students.length}</span>
              </div>
            </div>

            {/* Summary Statistics Bar */}
            <div className="grid grid-cols-4 gap-3 mb-6">
              <div className="border border-emerald-300 bg-emerald-50/50 p-2.5 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-800 tracking-wider">Present</span>
                <p className="text-lg font-black text-emerald-700">{counts.P}</p>
              </div>
              <div className="border border-amber-300 bg-amber-50/50 p-2.5 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-amber-800 tracking-wider">Late</span>
                <p className="text-lg font-black text-amber-700">{counts.L}</p>
              </div>
              <div className="border border-rose-300 bg-rose-50/50 p-2.5 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-rose-800 tracking-wider">Absent</span>
                <p className="text-lg font-black text-rose-700">{counts.A}</p>
              </div>
              <div className="border border-blue-300 bg-blue-50/50 p-2.5 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-blue-800 tracking-wider">Leave</span>
                <p className="text-lg font-black text-blue-700">{counts.LV}</p>
              </div>
            </div>

            {/* Attendance Table */}
            <table className="w-full text-left text-xs border-collapse border border-zinc-300">
              <thead>
                <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-900">
                  <th className="p-2 border-r border-zinc-300 w-12 text-center font-bold">Roll</th>
                  <th className="p-2 border-r border-zinc-300 font-bold">Student Full Name</th>
                  <th className="p-2 border-r border-zinc-300 w-24 text-center font-bold">Gender</th>
                  <th className="p-2 border-r border-zinc-300 w-28 text-center font-bold">Status</th>
                  <th className="p-2 w-32 text-center font-bold">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {students.map((student) => {
                  const status = draft[student.id] || 'PRESENT'
                  const statusConfig = {
                    PRESENT: { label: 'P (Present)', style: 'text-emerald-700 font-bold' },
                    LATE:    { label: 'L (Late)',    style: 'text-amber-700 font-bold' },
                    ABSENT:  { label: 'A (Absent)',  style: 'text-rose-700 font-bold' },
                    LEAVE:   { label: 'LV (Leave)',  style: 'text-blue-700 font-bold' },
                  }[status]

                  return (
                    <tr key={student.id} className="hover:bg-zinc-50">
                      <td className="p-2 border-r border-zinc-300 text-center font-mono font-bold text-zinc-800">
                        {student.roll}
                      </td>
                      <td className="p-2 border-r border-zinc-300 font-medium text-zinc-900">
                        <div>{student.name}</div>
                        {student.nameBn && (
                          <div className="text-[10px] text-zinc-500 font-normal">{student.nameBn}</div>
                        )}
                      </td>
                      <td className="p-2 border-r border-zinc-300 text-center text-zinc-600 capitalize">
                        {student.gender?.toLowerCase() || '—'}
                      </td>
                      <td className={`p-2 border-r border-zinc-300 text-center ${statusConfig.style}`}>
                        {statusConfig.label}
                      </td>
                      <td className="p-2 text-center text-zinc-400 text-[10px]">
                        _______________
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>

            {/* Footer Signatures */}
            <div className="mt-14 pt-4 flex justify-between items-center text-xs font-bold text-zinc-700">
              <div className="text-center w-48 border-t border-zinc-400 pt-1.5">
                <span>Class Teacher's Signature</span>
              </div>
              <div className="text-center w-48 border-t border-zinc-400 pt-1.5">
                <span>{inst.principalDesignation}</span>
              </div>
            </div>

            <div className="text-center mt-6 text-[10px] text-zinc-400">
              Printed on {new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • Verified by {inst.name}
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  )
}
