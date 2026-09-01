import { useState } from 'react'
import { BarChart3, Wallet, TrendingUp, Printer } from 'lucide-react'
import { AttendanceReport } from '../features/reports/components/AttendanceReport'
import { PaymentReport } from '../features/reports/components/PaymentReport'
import { StudentProgressReport } from '../features/reports/components/StudentProgressReport'
import { useLiveReports } from '../features/reports/useLiveReports'

type TabKey = 'attendance' | 'payment' | 'progress'

const TABS: { key: TabKey; label: string; icon: React.ElementType }[] = [
  { key: 'attendance', label: 'Attendance Analysis', icon: BarChart3 },
  { key: 'payment',    label: 'Finance & Collections', icon: Wallet },
  { key: 'progress',   label: 'Academic Performance', icon: TrendingUp },
]

export function Reports() {
  const [activeTab, setActiveTab] = useState<TabKey>('attendance')
  const { attendanceData, paymentData, studentProgress } = useLiveReports()

  return (
    <div className="space-y-6">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Institutional Reports & Analytics</h1>
          <p className="text-sm text-zinc-500 mt-1">Live data insights across student attendance, fee collections, and examination results</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="btn-secondary flex items-center gap-1.5"
          >
            <Printer size={15} />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* ── Tab Bar ──────────────────────────────────────────── */}
      <div className="flex items-center gap-1.5 p-1 bg-white border border-zinc-200/80 rounded-2xl shadow-xs w-fit">
        {TABS.map(tab => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all duration-150 cursor-pointer ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100/70'
              }`}
            >
              <Icon size={14} className={isActive ? 'text-emerald-400' : 'text-zinc-400'} />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* ── Tab Content ──────────────────────────────────────── */}
      <div className="animate-fadeIn">
        {activeTab === 'attendance' && <AttendanceReport data={attendanceData} />}
        {activeTab === 'payment'    && <PaymentReport data={paymentData} />}
        {activeTab === 'progress'   && <StudentProgressReport students={studentProgress} />}
      </div>
    </div>
  )
}
export default Reports
