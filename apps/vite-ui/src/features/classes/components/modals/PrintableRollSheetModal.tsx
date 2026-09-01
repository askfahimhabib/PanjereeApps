import { useRef } from 'react'
import { X, Printer, UserCircle } from 'lucide-react'
import type { Section, SectionStudent } from '../../types'

interface PrintableRollSheetModalProps {
  isOpen: boolean
  onClose: () => void
  section: Section
  students: SectionStudent[]
}

export function PrintableRollSheetModal({
  isOpen,
  onClose,
  section,
  students,
}: PrintableRollSheetModalProps) {
  const printAreaRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white rounded-3xl border border-zinc-200 shadow-2xl w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Toolbar */}
        <div className="px-6 py-4 border-b border-zinc-200 flex items-center justify-between bg-zinc-50/80">
          <div>
            <h3 className="text-base font-bold text-zinc-900">Printable Section Roll Sheet</h3>
            <p className="text-xs text-zinc-500">Official Class Attendance & Roll Register</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all cursor-pointer"
            >
              <Printer size={15} />
              Print Roll Sheet
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full hover:bg-zinc-200 text-zinc-400 hover:text-zinc-700 flex items-center justify-center transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable Area (Scrollable in modal, clean print layout) */}
        <div className="p-8 overflow-y-auto flex-1 bg-zinc-100 flex justify-center">
          <div
            ref={printAreaRef}
            className="bg-white p-8 rounded-2xl border border-zinc-300 shadow-xs w-full max-w-3xl text-zinc-900 print:p-0 print:border-none print:shadow-none"
          >
            {/* Institution Header */}
            <div className="text-center border-b-2 border-zinc-900 pb-4 mb-6">
              <h1 className="text-xl font-extrabold uppercase tracking-wide text-zinc-900">
                Ideal Model School & College
              </h1>
              <p className="text-xs text-zinc-600 mt-0.5 font-medium">
                Academic Session: {section.academicYear} · Section Master Roll Register
              </p>
              <div className="flex items-center justify-center gap-6 mt-3 text-xs font-semibold text-zinc-800 bg-zinc-50 py-1.5 px-4 rounded-lg border border-zinc-200">
                <span>Class: <strong>{section.className}</strong></span>
                <span>•</span>
                <span>Section: <strong>{section.name}</strong></span>
                <span>•</span>
                <span>Shift: <strong>{section.shift}</strong></span>
                <span>•</span>
                <span>Total Students: <strong>{students.length}</strong></span>
                <span>•</span>
                <span>Class Teacher: <strong>{section.classTeacherName ?? 'Not Assigned'}</strong></span>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-xs border-collapse border border-zinc-300">
                <thead>
                  <tr className="bg-zinc-100 border-b border-zinc-300 text-zinc-800">
                    <th className="border border-zinc-300 px-2 py-2 text-center w-12 font-bold">Roll</th>
                    <th className="border border-zinc-300 px-2 py-2 text-center w-12 font-bold">Photo</th>
                    <th className="border border-zinc-300 px-3 py-2 text-left font-bold">Student Name & ID</th>
                    <th className="border border-zinc-300 px-3 py-2 text-left font-bold hidden sm:table-cell">Bengali Name</th>
                    <th className="border border-zinc-300 px-2 py-2 text-center w-16 font-bold">Gender</th>
                    <th className="border border-zinc-300 px-3 py-2 text-left font-bold">Guardian Contact</th>
                    <th className="border border-zinc-300 px-3 py-2 text-center w-24 font-bold">Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((student, idx) => (
                    <tr key={student.id} className={idx % 2 === 1 ? 'bg-zinc-50/50' : 'bg-white'}>
                      <td className="border border-zinc-300 px-2 py-1.5 text-center font-bold font-mono text-zinc-900">
                        {String(student.roll).padStart(2, '0')}
                      </td>
                      <td className="border border-zinc-300 px-2 py-1 text-center">
                        <div className="w-7 h-7 rounded-full bg-zinc-100 mx-auto overflow-hidden flex items-center justify-center border border-zinc-200">
                          {student.profilePhoto ? (
                            <img src={student.profilePhoto} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <UserCircle size={18} className="text-zinc-400" />
                          )}
                        </div>
                      </td>
                      <td className="border border-zinc-300 px-3 py-1.5 font-medium text-zinc-900">
                        <div className="font-semibold">{student.fullNameEn}</div>
                        <div className="text-[10px] text-zinc-500 font-mono">{student.studentId}</div>
                      </td>
                      <td className="border border-zinc-300 px-3 py-1.5 text-zinc-700 hidden sm:table-cell">
                        {student.fullNameBn || '—'}
                      </td>
                      <td className="border border-zinc-300 px-2 py-1.5 text-center text-zinc-700 capitalize">
                        {student.gender.toLowerCase()}
                      </td>
                      <td className="border border-zinc-300 px-3 py-1.5 font-mono text-zinc-800">
                        {student.guardianPhone || student.mobile || '—'}
                      </td>
                      <td className="border border-zinc-300 px-3 py-1.5 text-center text-zinc-400 text-[10px]">
                        {student.status === 'ACTIVE' ? 'Regular' : student.status}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Official Signatures */}
            <div className="mt-12 pt-6 flex items-center justify-between text-xs font-semibold text-zinc-800">
              <div className="text-center">
                <div className="w-40 border-t border-zinc-900 mb-1" />
                <p>Class Teacher Signature</p>
                <p className="text-[10px] text-zinc-500 font-normal">{section.classTeacherName ?? 'Name'}</p>
              </div>

              <div className="text-center">
                <div className="w-40 border-t border-zinc-900 mb-1" />
                <p>Headmaster / Principal</p>
                <p className="text-[10px] text-zinc-500 font-normal">Seal & Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
