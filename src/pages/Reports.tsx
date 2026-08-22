import { useState } from 'react'
import { BarChart3, Wallet, TrendingUp, Printer } from 'lucide-react'
import { AttendanceReport } from '../features/reports/components/AttendanceReport'
import { PaymentReport } from '../features/reports/components/PaymentReport'
import { StudentProgressReport } from '../features/reports/components/StudentProgressReport'
import { MOCK_ATTENDANCE_SUMMARY, MOCK_PAYMENT_SUMMARY, MOCK_STUDENT_PROGRESS } from '../features/reports/mockData'

type TabKey = 'attendance' | 'payment' | 'progress'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'attendance', label: 'Attendance', icon: BarChart3 },
  { key: 'payment',    label: 'Payment',    icon: Wallet },
  { key: 'progress',   label: 'Student Progress', icon: TrendingUp },
]

export function Reports() {
  const [activeTab, setActiveTab] = useState<TabKey>('attendance')

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Reports</h1>
          <p className="text-sm text-slate-500 mt-1">Aggregate insights across attendance, payments, and student performance</p>
        </div>
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-slate-700 text-slate-400 hover:text-white hover:border-slate-500 transition-all"
        >
          <Printer size={15} />
          Print Report
        </button>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1 p-1 bg-slate-800/60 border border-slate-700/50 rounded-xl w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                isActive
                  ? 'bg-slate-700 text-slate-100 shadow-sm'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
            >
              <Icon size={15} />
              {tab.label}
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div className="animate-fadeIn">
        {activeTab === 'attendance' && <AttendanceReport data={MOCK_ATTENDANCE_SUMMARY} />}
        {activeTab === 'payment'    && <PaymentReport data={MOCK_PAYMENT_SUMMARY} />}
        {activeTab === 'progress'   && <StudentProgressReport students={MOCK_STUDENT_PROGRESS} />}
      </div>
    </div>
  )
}
