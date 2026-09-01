import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { X, DollarSign, Save } from 'lucide-react'
import type { TeacherSalarySetting, UpdateTeacherSalarySettingDto, FinancePaymentMethod } from '@/features/finance/types'
import { formatCurrency } from '@/features/payments/types'

interface SetTeacherSalaryModalProps {
  open: boolean
  setting: TeacherSalarySetting | null
  onClose: () => void
  onSave: (dto: UpdateTeacherSalarySettingDto) => void
}

export function SetTeacherSalaryModal({
  open,
  setting,
  onClose,
  onSave,
}: SetTeacherSalaryModalProps) {
  const [baseSalary, setBaseSalary] = useState<number>(20000)
  const [houseAllowance, setHouseAllowance] = useState<number>(3000)
  const [medicalAllowance, setMedicalAllowance] = useState<number>(1000)
  const [specialAllowance, setSpecialAllowance] = useState<number>(0)
  const [pfDeduction, setPfDeduction] = useState<number>(1000)
  const [taxDeduction, setTaxDeduction] = useState<number>(0)
  const [otherDeduction, setOtherDeduction] = useState<number>(0)
  const [paymentMethod, setPaymentMethod] = useState<FinancePaymentMethod>('BANK')
  const [bankName, setBankName] = useState<string>('')
  const [accountNumber, setAccountNumber] = useState<string>('')
  const [notes, setNotes] = useState<string>('')

  useEffect(() => {
    if (setting) {
      setBaseSalary(setting.base_salary ?? 20000)
      setHouseAllowance(setting.house_allowance ?? 0)
      setMedicalAllowance(setting.medical_allowance ?? 0)
      setSpecialAllowance(setting.special_allowance ?? 0)
      setPfDeduction(setting.provident_fund_deduction ?? 0)
      setTaxDeduction(setting.tax_deduction ?? 0)
      setOtherDeduction(setting.other_deduction ?? 0)
      setPaymentMethod(setting.payment_method ?? 'BANK')
      setBankName(setting.bank_name ?? '')
      setAccountNumber(setting.account_number ?? '')
      setNotes(setting.notes ?? '')
    }
  }, [setting, open])

  if (!open || !setting) return null

  const totalAllowances = Number(houseAllowance || 0) + Number(medicalAllowance || 0) + Number(specialAllowance || 0)
  const totalDeductions = Number(pfDeduction || 0) + Number(taxDeduction || 0) + Number(otherDeduction || 0)
  const netMonthlySalary = Number(baseSalary || 0) + totalAllowances - totalDeductions

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      teacher_id: setting.teacher_id,
      base_salary: Number(baseSalary),
      house_allowance: Number(houseAllowance),
      medical_allowance: Number(medicalAllowance),
      special_allowance: Number(specialAllowance),
      provident_fund_deduction: Number(pfDeduction),
      tax_deduction: Number(taxDeduction),
      other_deduction: Number(otherDeduction),
      payment_method: paymentMethod,
      bank_name: bankName,
      account_number: accountNumber,
      notes,
    })
    onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden border border-zinc-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 border border-indigo-100 flex items-center justify-center">
              <DollarSign size={20} />
            </div>
            <div>
              <h2 className="font-bold text-zinc-900">Salary Structure Setup</h2>
              <p className="text-xs text-zinc-500">
                {setting.teacher_name} • <span className="font-medium text-zinc-700">{setting.designation}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-zinc-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Live Calculation Summary Banner */}
        <div className="px-6 py-3 bg-gradient-to-r from-indigo-50 via-purple-50 to-emerald-50 border-b border-indigo-100/60 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-zinc-500 uppercase tracking-wider">Net Monthly Salary</p>
            <p className="text-xl font-extrabold text-indigo-950 font-mono">
              {formatCurrency(netMonthlySalary)}
            </p>
          </div>
          <div className="text-right text-xs space-y-0.5">
            <p className="text-emerald-700 font-semibold font-mono">
              + Allowances: {formatCurrency(totalAllowances)}
            </p>
            <p className="text-rose-600 font-semibold font-mono">
              - Deductions: {formatCurrency(totalDeductions)}
            </p>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs max-h-[70vh] overflow-y-auto">
          {/* Base Salary */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1.5">
              Base Salary (৳) <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 font-bold font-mono">৳</span>
              <input
                type="number"
                required
                min={0}
                value={baseSalary}
                onChange={(e) => setBaseSalary(Number(e.target.value))}
                placeholder="20000"
                className="w-full pl-8 pr-3 py-2.5 border border-zinc-200 rounded-xl bg-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm font-mono font-bold"
              />
            </div>
          </div>

          {/* Allowances Breakdown */}
          <div className="bg-emerald-50/40 rounded-2xl p-4 border border-emerald-100 space-y-3">
            <p className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <span>➕</span> Monthly Allowances
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">House Rent (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={houseAllowance}
                  onChange={(e) => setHouseAllowance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Medical (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={medicalAllowance}
                  onChange={(e) => setMedicalAllowance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Special (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={specialAllowance}
                  onChange={(e) => setSpecialAllowance(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg bg-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Deductions Breakdown */}
          <div className="bg-rose-50/40 rounded-2xl p-4 border border-rose-100 space-y-3">
            <p className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
              <span>➖</span> Monthly Deductions
            </p>
            <div className="grid grid-cols-3 gap-2.5">
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Provident Fund (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={pfDeduction}
                  onChange={(e) => setPfDeduction(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Tax (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={taxDeduction}
                  onChange={(e) => setTaxDeduction(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg bg-white text-xs font-mono"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Other (৳)</label>
                <input
                  type="number"
                  min={0}
                  value={otherDeduction}
                  onChange={(e) => setOtherDeduction(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 border border-zinc-200 rounded-lg bg-white text-xs font-mono"
                />
              </div>
            </div>
          </div>

          {/* Payment Method & Bank Account */}
          <div className="space-y-3">
            <div>
              <label className="block font-bold text-zinc-700 mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as FinancePaymentMethod)}
                className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs font-medium"
              >
                <option value="BANK">Bank Transfer 🏦</option>
                <option value="BKASH">bKash 📱</option>
                <option value="NAGAD">Nagad 📱</option>
                <option value="ROCKET">Rocket 📱</option>
                <option value="CASH">Cash 💵</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {paymentMethod === 'BANK' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Bank Name</label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g. Dutch-Bangla Bank"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Account Number</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="e.g. 128-105-004291"
                    className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {(paymentMethod === 'BKASH' || paymentMethod === 'NAGAD' || paymentMethod === 'ROCKET') && (
              <div>
                <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Mobile Wallet Number</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="e.g. 01711-234567"
                  className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block font-bold text-zinc-700 mb-1">Remarks / Contract Note (Optional)</label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g. Annual increment applied, special lead teacher allowance"
              className="w-full px-3 py-2 border border-zinc-200 rounded-xl bg-zinc-50 text-xs"
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-3 border-t border-zinc-100">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 text-xs font-semibold text-zinc-600 border border-zinc-200 rounded-xl hover:bg-zinc-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors shadow-md shadow-indigo-500/20 flex items-center justify-center gap-1.5"
            >
              <Save size={14} /> Save Salary Config
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  )
}
