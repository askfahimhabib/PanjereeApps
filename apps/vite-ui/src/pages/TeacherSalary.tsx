import {
  Wallet, Search, CheckCircle2, XCircle, Clock, Printer,
  ChevronLeft, ChevronRight, Plus, X, DollarSign, User
} from 'lucide-react'
import { useState } from 'react'
import { useTeacherSalary, type TeacherSalaryRecord, type SalaryStatus } from '@/features/teachers/salary/useTeacherSalary'

// ── Config ────────────────────────────────────────────────────────────────────

const STATUS_CFG: Record<SalaryStatus, { label: string; bg: string; text: string; icon: typeof CheckCircle2 }> = {
  PAID:    { label: 'Paid',    bg: 'bg-green-100', text: 'text-green-700', icon: CheckCircle2 },
  UNPAID:  { label: 'Unpaid',  bg: 'bg-red-100',   text: 'text-red-700',   icon: XCircle },
  PARTIAL: { label: 'Partial', bg: 'bg-amber-100', text: 'text-amber-700', icon: Clock },
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']

// ── Component ────────────────────────────────────────────────────────────────

export function TeacherSalary() {
  const {
    month, year, search,
    setSearch, prevMonth, nextMonth,
    filtered, stats,
    markAsPaid,
  } = useTeacherSalary()

  const [payModal, setPayModal] = useState<TeacherSalaryRecord | null>(null)

  return (
    <div className="space-y-5">
      {/* ── Header ───────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Teacher Salary</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage and disburse monthly salaries</p>
        </div>
        <button className="flex items-center gap-2 border border-zinc-200 text-zinc-600 px-4 py-2.5 rounded-xl text-sm font-medium hover:bg-zinc-50 transition-colors">
          <Printer size={16} />
          Print
        </button>
      </div>

      {/* ── Month selector ──────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <button onClick={prevMonth} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"><ChevronLeft size={18} /></button>
          <div className="text-center min-w-32">
            <p className="font-bold text-zinc-900 text-lg">{MONTHS[month - 1]}</p>
            <p className="text-sm text-zinc-500">{year}</p>
          </div>
          <button onClick={nextMonth} className="p-2 rounded-xl hover:bg-zinc-100 text-zinc-500 transition-colors"><ChevronRight size={18} /></button>
        </div>
        <div className="h-8 w-px bg-zinc-200 hidden sm:block" />
        <div className="relative flex-1 min-w-40">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search teacher..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-400" />
        </div>
      </div>

      {/* ── Stats ─────────────────────────────────────────── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Paid',      value: stats.paid,    color: 'text-green-600', bg: 'bg-green-50' },
          { label: 'Unpaid',    value: stats.unpaid,  color: 'text-red-600',   bg: 'bg-red-50' },
          { label: 'Partial',   value: stats.partial, color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: `Total (৳)`, value: `৳${(stats.totalAmount/1000).toFixed(0)}k`, color: 'text-indigo-600', bg: 'bg-indigo-50' },
        ].map(s => (
          <div key={s.label} className={`${s.bg} border border-zinc-100 rounded-2xl p-4 shadow-sm`}>
            <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs text-zinc-600 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* ── Table ─────────────────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="p-12 text-center">
            <Wallet size={36} className="mx-auto mb-3 text-zinc-200" />
            <p className="font-semibold text-zinc-700">No salary records for this month</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 border-b border-zinc-100">
              <tr>
                <th className="text-left px-5 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Teacher</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Base Salary</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Bonus</th>
                <th className="text-right px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Net</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-zinc-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map(r => {
                const net = r.baseSalary + r.bonus - r.deduction
                const cfg = STATUS_CFG[r.status]
                const StatusIcon = cfg.icon
                return (
                  <tr key={r.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {r.teacherName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-zinc-800">{r.teacherName}</p>
                          <p className="text-xs text-zinc-500">{r.designation}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-right text-zinc-700 font-mono">৳{r.baseSalary.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-right text-green-600 font-mono">
                      {r.bonus > 0 ? `+৳${r.bonus.toLocaleString()}` : '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-zinc-900 font-mono">৳{net.toLocaleString()}</td>
                    <td className="px-4 py-3.5">
                      <div className="flex justify-center">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold ${cfg.bg} ${cfg.text}`}>
                          <StatusIcon size={11} />
                          {cfg.label}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      {r.status !== 'PAID' && (
                        <button onClick={() => setPayModal(r)}
                          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition-colors ml-auto">
                          <Plus size={12} />
                          Pay
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Pay Modal ─────────────────────────────────────── */}
      {payModal && <PayModal record={payModal} onClose={() => setPayModal(null)} onSave={(r, amt, notes) => { markAsPaid(r, amt, notes); setPayModal(null) }} />}
    </div>
  )
}

// ── Pay Modal ────────────────────────────────────────────────────────────────
function PayModal({ record: r, onClose, onSave }: {
  record: TeacherSalaryRecord
  onClose: () => void
  onSave: (r: TeacherSalaryRecord, amount: number, notes: string) => void
}) {
  const net = r.baseSalary + r.bonus - r.deduction
  const remaining = net - r.paidAmount
  const [amount, setAmount] = useState(remaining)
  const [notes, setNotes] = useState(r.notes ?? '')

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center">
              <DollarSign size={18} className="text-emerald-600" />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Pay Salary</h2>
              <p className="text-xs text-zinc-500">{r.teacherName}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 transition-colors"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-zinc-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-zinc-600">Base Salary</span><span className="font-medium">৳{r.baseSalary.toLocaleString()}</span></div>
            {r.bonus > 0 && <div className="flex justify-between"><span className="text-zinc-600">Bonus</span><span className="font-medium text-green-600">+৳{r.bonus.toLocaleString()}</span></div>}
            {r.deduction > 0 && <div className="flex justify-between"><span className="text-zinc-600">Deduction</span><span className="font-medium text-red-600">-৳{r.deduction.toLocaleString()}</span></div>}
            <div className="flex justify-between border-t border-zinc-200 pt-2 font-bold"><span>Net</span><span>৳{net.toLocaleString()}</span></div>
            {r.paidAmount > 0 && <div className="flex justify-between text-amber-600"><span>Paid Already</span><span>৳{r.paidAmount.toLocaleString()}</span></div>}
            <div className="flex justify-between text-red-600 font-bold"><span>Remaining</span><span>৳{remaining.toLocaleString()}</span></div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Payment Amount (৳)</label>
            <div className="relative">
              <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input type="number" value={amount} onChange={e => setAmount(Number(e.target.value))} min={0} max={remaining}
                className="w-full pl-9 pr-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional..."
              className="w-full px-3 py-2.5 text-sm border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-400" />
          </div>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 text-sm font-medium text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors">Cancel</button>
            <button onClick={() => onSave(r, r.paidAmount + amount, notes)}
              className="flex-1 py-2.5 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/20">
              Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
