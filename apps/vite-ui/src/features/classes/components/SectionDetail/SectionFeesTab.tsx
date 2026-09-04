import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  PhoneCall,
  ExternalLink,
  Receipt,
} from 'lucide-react'
import type { Section, SectionStudent } from '../../types'
import { classStore } from '@/data/stores'

interface SectionFeesTabProps {
  section: Section
  students: SectionStudent[]
}

export function SectionFeesTab({ section, students }: SectionFeesTabProps) {
  const classItem = useMemo(() => {
    return classStore.getWhere(c => c.id === section.classId)[0] || null
  }, [section.classId])

  const monthlyFee = classItem?.feeMonthly || 1500
  const totalReceivable = students.length * monthlyFee

  const paidStudents = useMemo(() => students.filter(s => s.feeStatus === 'PAID'), [students])
  const dueStudents = useMemo(() => students.filter(s => s.feeStatus === 'DUE' || s.feeStatus === 'PARTIAL'), [students])

  const totalCollected = paidStudents.length * monthlyFee
  const totalDue = dueStudents.length * monthlyFee
  const collectionRate = students.length > 0 ? Math.round((paidStudents.length / students.length) * 100) : 0

  return (
    <div className="space-y-5">
      {/* Header Summary */}
      <div className="bg-white rounded-2xl border border-zinc-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 shrink-0">
            <CreditCard size={24} />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900">
              Section Fee Collection — <span className="text-amber-600">৳{monthlyFee}/month</span>
            </h3>
            <p className="text-xs text-zinc-500 mt-0.5">
              Current Academic Session Monthly Tuition Collection Status
            </p>
          </div>
        </div>

        <Link
          to={`/payments`}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md shadow-indigo-500/20 transition-all"
        >
          <Receipt size={14} />
          <span>Billing & Payments Hub</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Expected</p>
          <p className="text-lg sm:text-xl font-extrabold text-zinc-900 mt-1 font-mono">৳{totalReceivable.toLocaleString()}</p>
          <p className="text-[11px] text-zinc-500 mt-0.5">{students.length} Students</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Collected</p>
          <p className="text-lg sm:text-xl font-extrabold text-emerald-700 mt-1 font-mono">৳{totalCollected.toLocaleString()}</p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">{paidStudents.length} Paid</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Total Due</p>
          <p className="text-lg sm:text-xl font-extrabold text-rose-700 mt-1 font-mono">৳{totalDue.toLocaleString()}</p>
          <p className="text-[11px] text-rose-600 font-semibold mt-0.5">{dueStudents.length} Due</p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-2xl p-3.5 sm:p-4 shadow-xs">
          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Collection Rate</p>
          <p className="text-lg sm:text-xl font-extrabold text-indigo-700 mt-1">{collectionRate}%</p>
          <div className="w-full bg-zinc-200 rounded-full h-1.5 mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${collectionRate}%` }} />
          </div>
        </div>
      </div>

      {/* Due Students Register */}
      <div className="bg-white rounded-2xl border border-zinc-200 overflow-hidden shadow-xs">
        <div className="px-5 py-3.5 border-b border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="text-rose-600" />
            <h4 className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Unpaid / Due Students ({dueStudents.length})
            </h4>
          </div>
          <span className="text-xs text-rose-700 font-bold font-mono">৳{totalDue.toLocaleString()}</span>
        </div>

        {dueStudents.length > 0 ? (
          <>
            {/* Mobile Cards View */}
            <div className="block sm:hidden divide-y divide-zinc-100">
              {dueStudents.map(student => (
                <div key={student.id} className="p-3.5 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-100">
                        #{String(student.roll).padStart(2, '0')}
                      </span>
                      <div className="min-w-0">
                        <p className="font-bold text-zinc-900 text-xs truncate">{student.fullNameEn}</p>
                        <p className="font-mono text-[10px] text-zinc-400">{student.studentId}</p>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-xs text-rose-600 shrink-0">
                      ৳{monthlyFee.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-zinc-50 text-[11px]">
                    {student.guardianPhone || student.mobile ? (
                      <a
                        href={`tel:${student.guardianPhone || student.mobile}`}
                        className="inline-flex items-center gap-1 text-zinc-600 hover:text-emerald-700 text-xs"
                      >
                        <PhoneCall size={12} className="text-emerald-600" />
                        <span>{student.guardianPhone || student.mobile}</span>
                      </a>
                    ) : (
                      <span className="text-zinc-300 text-[10px]">No contact</span>
                    )}

                    <Link
                      to={`/payments`}
                      className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px] transition-colors"
                    >
                      Collect Fee
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600">
                  <tr>
                    <th className="py-3 px-4 text-center font-bold w-16">Roll</th>
                    <th className="py-3 px-4 text-left font-bold">Student</th>
                    <th className="py-3 px-4 text-left font-bold">Student ID</th>
                    <th className="py-3 px-4 text-center font-bold">Due Amount</th>
                    <th className="py-3 px-4 text-left font-bold">Guardian Contact</th>
                    <th className="py-3 px-4 text-right font-bold">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {dueStudents.map(student => (
                    <tr key={student.id} className="hover:bg-zinc-50/80 transition-colors">
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-indigo-700">
                        #{String(student.roll).padStart(2, '0')}
                      </td>
                      <td className="py-2.5 px-4 font-semibold text-zinc-900">
                        {student.fullNameEn}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-zinc-500">
                        {student.studentId}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono font-bold text-rose-700">
                        ৳{monthlyFee.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 font-mono text-zinc-700">
                        {student.guardianPhone || student.mobile || '—'}
                      </td>
                      <td className="py-2.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {student.guardianPhone && (
                            <a
                              href={`tel:${student.guardianPhone}`}
                              className="p-1 rounded-lg bg-zinc-100 hover:bg-emerald-50 hover:text-emerald-700 text-zinc-600"
                              title={`Call: ${student.guardianPhone}`}
                            >
                              <PhoneCall size={13} />
                            </a>
                          )}
                          <Link
                            to={`/payments`}
                            className="px-2.5 py-1 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-[11px]"
                          >
                            Collect Fee
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <div className="p-8 text-center text-zinc-500">
            <CheckCircle2 size={32} className="mx-auto mb-2 text-emerald-600" />
            <p className="text-sm font-bold text-zinc-800">All Fees Paid!</p>
            <p className="text-xs text-zinc-500 mt-0.5">There are no outstanding tuition dues for this section.</p>
          </div>
        )}
      </div>
    </div>
  )
}
