import { useState } from 'react'
import {
  Pencil,
  Search,
} from 'lucide-react'
import type { TeacherSalarySetting, UpdateTeacherSalarySettingDto } from '@/features/finance/types'
import { formatCurrency } from '@/features/payments/types'
import { SetTeacherSalaryModal } from './SetTeacherSalaryModal'

interface SalarySetupTabProps {
  settings: TeacherSalarySetting[]
  onSaveSetting: (dto: UpdateTeacherSalarySettingDto) => void
}

export function SalarySetupTab({ settings, onSaveSetting }: SalarySetupTabProps) {
  const [search, setSearch] = useState('')
  const [editingSetting, setEditingSetting] = useState<TeacherSalarySetting | null>(null)

  const filtered = settings.filter((s) => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      s.teacher_name.toLowerCase().includes(q) ||
      s.designation.toLowerCase().includes(q) ||
      (s.department && s.department.toLowerCase().includes(q)) ||
      (s.bank_name && s.bank_name.toLowerCase().includes(q))
    )
  })

  const totalMonthlyPayroll = settings.reduce((sum, s) => {
    const allowances = (s.house_allowance || 0) + (s.medical_allowance || 0) + (s.special_allowance || 0)
    const deductions = (s.provident_fund_deduction || 0) + (s.tax_deduction || 0) + (s.other_deduction || 0)
    return sum + (s.base_salary + allowances - deductions)
  }, 0)

  return (
    <div className="space-y-4">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-900 to-indigo-800 text-white rounded-2xl p-6 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold">Teacher Salary Configurations</h3>
          <p className="text-xs text-indigo-200 mt-1 max-w-xl">
            Configure individual base salary, house rent, medical allowance, and deductions for each teacher. Monthly salary sheets are automatically generated from these settings.
          </p>
        </div>
        <div className="bg-white/10 backdrop-blur-md rounded-2xl px-5 py-3 border border-white/20 text-right">
          <p className="text-[11px] font-semibold text-indigo-200 uppercase tracking-wider">Estimated Monthly Payroll</p>
          <p className="text-2xl font-extrabold font-mono text-white mt-0.5">
            {formatCurrency(totalMonthlyPayroll)}
          </p>
        </div>
      </div>

      {/* Control Bar */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-[240px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search teacher, designation, bank..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
        <span className="text-xs text-zinc-500 font-medium">
          {filtered.length} Teacher{filtered.length !== 1 ? 's' : ''} Configured
        </span>
      </div>

      {/* Settings Table */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-zinc-50 text-zinc-500 border-b border-zinc-100 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-5 py-3">Teacher</th>
                <th className="px-4 py-3 text-right">Base Salary</th>
                <th className="px-4 py-3 text-right">Allowances</th>
                <th className="px-4 py-3 text-right">Deductions</th>
                <th className="px-4 py-3 text-right">Net Salary</th>
                <th className="px-4 py-3">Disbursal Mode</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-50">
              {filtered.map((s) => {
                const totalAllowances = (s.house_allowance || 0) + (s.medical_allowance || 0) + (s.special_allowance || 0)
                const totalDeductions = (s.provident_fund_deduction || 0) + (s.tax_deduction || 0) + (s.other_deduction || 0)
                const net = s.base_salary + totalAllowances - totalDeductions

                return (
                  <tr key={s.id} className="hover:bg-zinc-50/70 transition-colors">
                    {/* Teacher Details */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold shrink-0 shadow-xs">
                          {s.teacher_name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{s.teacher_name}</p>
                          <p className="text-[11px] text-zinc-500">
                            {s.designation} {s.department ? `• ${s.department}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Base Salary */}
                    <td className="px-4 py-3.5 text-right font-mono font-semibold text-zinc-800">
                      {formatCurrency(s.base_salary)}
                    </td>

                    {/* Allowances */}
                    <td className="px-4 py-3.5 text-right font-mono text-emerald-600 font-medium">
                      +{formatCurrency(totalAllowances)}
                    </td>

                    {/* Deductions */}
                    <td className="px-4 py-3.5 text-right font-mono text-rose-600 font-medium">
                      -{formatCurrency(totalDeductions)}
                    </td>

                    {/* Net Salary */}
                    <td className="px-4 py-3.5 text-right font-mono font-bold text-sm text-indigo-950">
                      {formatCurrency(net)}
                    </td>

                    {/* Payment Mode */}
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5 text-zinc-700">
                        <span className="font-semibold text-[11px] px-2 py-0.5 bg-zinc-100 rounded-md">
                          {s.payment_method}
                        </span>
                        {s.bank_name && (
                          <span className="text-[11px] text-zinc-400 truncate max-w-[120px]" title={s.bank_name}>
                            {s.bank_name}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="px-4 py-3.5 text-center">
                      <button
                        onClick={() => setEditingSetting(s)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-lg transition-colors cursor-pointer"
                      >
                        <Pencil size={12} /> Edit Salary
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Modal */}
      <SetTeacherSalaryModal
        open={Boolean(editingSetting)}
        setting={editingSetting}
        onClose={() => setEditingSetting(null)}
        onSave={(dto) => {
          onSaveSetting(dto)
          setEditingSetting(null)
        }}
      />
    </div>
  )
}
