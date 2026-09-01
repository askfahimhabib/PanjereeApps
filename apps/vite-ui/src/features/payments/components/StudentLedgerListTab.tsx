import { useState, useMemo } from 'react'
import {
  Search,
  FileText,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Lock,
} from 'lucide-react'
import { useClasses } from '@/features/classes/useClasses'
import { createStore } from '@/lib/localStore'
import type { Student } from '@/features/students/types'
import type { ClassItem } from '@/features/classes/types'
import { paymentStore, manualDueStore } from '@/data/stores'
import { formatCurrency, MONTH_NAMES_SHORT } from '../types'
import { StudentFeeStatementModal } from './StudentFeeStatementModal'

const studentStore = createStore<Student>('students')

interface StudentLedgerListTabProps {
  onQuickCollect: (student: Student) => void
}

export function StudentLedgerListTab({ onQuickCollect }: StudentLedgerListTabProps) {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  const currentYear = now.getFullYear()
  const currentMonthName = MONTH_NAMES_SHORT[currentMonth - 1]

  const [search, setSearch] = useState('')
  const [selectedClassId, setSelectedClassId] = useState<string>('ALL')
  const [dueFilter, setDueFilter] = useState<'ALL' | 'DUE_ONLY' | 'CLEAR'>('ALL')
  const [statementStudent, setStatementStudent] = useState<Student | null>(null)

  const { classes = [] } = useClasses()
  const allStudents = studentStore.getAll().filter(s => s.status === 'ACTIVE')
  const allDues = manualDueStore.getAll().filter(d => !d.is_paid)
  const allPayments = paymentStore.getAll().filter(p => p.status !== 'REFUNDED')

  // Calculate quick stats per student including current-month paid lock status
  const studentLedgerSummaries = useMemo(() => {
    return allStudents.map(student => {
      const studentDues = allDues.filter(d => d.student_id === student.id)
      const studentPayments = allPayments.filter(p => p.student_id === student.id)

      const totalDue = studentDues.reduce((s, d) => s + d.amount, 0)
      const totalPaid = studentPayments.reduce((s, p) => s + p.total_amount, 0)

      // Check if student has paid current month
      const hasPaidCurrentMonth = studentPayments.some(p =>
        p.status !== 'REFUNDED' &&
        p.items.some(it => it.month === currentMonth && (it.year === currentYear || !it.year))
      )

      // If they have 0 dues and have paid current month, lock fee collection for current month
      const isCurrentMonthCleared = totalDue === 0 && hasPaidCurrentMonth

      return {
        student,
        totalDue,
        totalPaid,
        unpaidCount: studentDues.length,
        hasPaidCurrentMonth,
        isCurrentMonthCleared,
      }
    })
  }, [allStudents, allDues, allPayments, currentMonth, currentYear])

  const filtered = studentLedgerSummaries.filter(({ student, totalDue }) => {
    if (selectedClassId !== 'ALL' && student.classId !== selectedClassId) return false
    if (dueFilter === 'DUE_ONLY' && totalDue === 0) return false
    if (dueFilter === 'CLEAR' && totalDue > 0) return false
    if (search) {
      const q = search.toLowerCase()
      return (
        student.fullNameEn.toLowerCase().includes(q) ||
        student.rollNumber.toLowerCase().includes(q) ||
        (student.className && student.className.toLowerCase().includes(q))
      )
    }
    return true
  })

  return (
    <div className="space-y-4">
      {/* Filter Control Bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[180px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search student by roll, name, class..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Class Filter */}
          <select
            value={selectedClassId}
            onChange={(e) => setSelectedClassId(e.target.value)}
            className="px-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 font-medium text-zinc-800"
          >
            <option value="ALL">All Classes</option>
            {classes.map((c: ClassItem) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          {/* Due Status Pill */}
          <div className="flex bg-zinc-100 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setDueFilter('ALL')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                dueFilter === 'ALL' ? 'bg-white text-zinc-900 shadow-xs' : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setDueFilter('DUE_ONLY')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                dueFilter === 'DUE_ONLY' ? 'bg-white text-rose-700 shadow-xs' : 'text-zinc-500 hover:text-rose-700'
              }`}
            >
              With Dues
            </button>
            <button
              onClick={() => setDueFilter('CLEAR')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                dueFilter === 'CLEAR' ? 'bg-white text-emerald-700 shadow-xs' : 'text-zinc-500 hover:text-emerald-700'
              }`}
            >
              Cleared
            </button>
          </div>
        </div>

        <span className="text-xs text-zinc-500 font-medium">
          {filtered.length} Student{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Student Ledger List */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Student Particulars</th>
                <th className="px-4 py-3 text-right">Lifetime Collected</th>
                <th className="px-4 py-3 text-right">Current Dues Balance</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-5 py-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map(({ student, totalDue, totalPaid, unpaidCount, isCurrentMonthCleared }) => (
                <tr key={student.id} className="hover:bg-zinc-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold flex items-center justify-center text-xs shadow-xs">
                        {student.rollNumber}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 text-sm">{student.fullNameEn}</p>
                        <p className="text-[11px] text-zinc-500">
                          {student.className || 'Class'} {student.sectionName ? `• Sec ${student.sectionName}` : ''} • ID: {student.id}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono font-bold text-emerald-700">
                    {formatCurrency(totalPaid)}
                  </td>

                  <td className="px-4 py-3.5 text-right font-mono font-extrabold text-sm">
                    {totalDue > 0 ? (
                      <span className="text-rose-600">{formatCurrency(totalDue)}</span>
                    ) : (
                      <span className="text-emerald-600">৳ 0</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-center">
                    {totalDue > 0 ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                        <AlertCircle size={10} /> {unpaidCount} Due Items
                      </span>
                    ) : isCurrentMonthCleared ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 size={10} /> {currentMonthName} Paid ✓
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-zinc-50 text-zinc-600 border border-zinc-200">
                        <CheckCircle2 size={10} /> Cleared
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-3.5 text-right space-x-2">
                    <button
                      onClick={() => setStatementStudent(student)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <FileText size={13} className="text-indigo-600" />
                      12-Month Matrix
                    </button>

                    {isCurrentMonthCleared ? (
                      <span
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold select-none cursor-default shadow-2xs"
                        title={`Current month (${currentMonthName} ${currentYear}) fee is fully cleared. Next month collection will unlock automatically on the 1st.`}
                      >
                        <CheckCircle2 size={12} className="text-emerald-600" />
                        <span>{currentMonthName} Paid</span>
                        <Lock size={10} className="text-emerald-500 opacity-70 ml-0.5" />
                      </span>
                    ) : (
                      <button
                        onClick={() => onQuickCollect(student)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <DollarSign size={13} />
                        {totalDue > 0 ? 'Collect Due' : `Collect (${currentMonthName})`}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Statement Modal */}
      {statementStudent && (
        <StudentFeeStatementModal
          student={statementStudent}
          open={Boolean(statementStudent)}
          onClose={() => setStatementStudent(null)}
          onCollectDue={(s) => onQuickCollect(s)}
        />
      )}
    </div>
  )
}
