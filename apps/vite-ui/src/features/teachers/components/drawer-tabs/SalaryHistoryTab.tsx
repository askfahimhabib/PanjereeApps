import { useMemo } from 'react'
import { Printer, Receipt } from 'lucide-react'
import type { Teacher } from '../../types'
import { salaryStore, teacherSalarySettingStore } from '@/data/stores'
import { formatCurrency, MONTH_NAMES } from '@/features/payments/types'
import { getInstitutionInfo } from '@/lib/institutionInfo'

export function SalaryHistoryTab({ teacher }: { teacher: Teacher }) {
  const inst = getInstitutionInfo()
  const currentYear = new Date().getFullYear()

  // Teacher Salary Setting
  const setting = useMemo(() => {
    return teacherSalarySettingStore.getAll().find(s => s.teacher_id === teacher.id)
  }, [teacher.id])

  // Teacher Salary Records
  const salaryRecords = useMemo(() => {
    return salaryStore
      .getAll()
      .filter(s => s.teacherId === teacher.id || s.teacherId === `t-${teacher.id}`)
      .sort((a, b) => b.year - a.year || b.month - a.month)
  }, [teacher.id])

  const baseSalary = setting?.base_salary || 25000
  const houseAllowance = setting?.house_allowance || 3000
  const medicalAllowance = setting?.medical_allowance || 1200
  const totalAllowances = houseAllowance + medicalAllowance + (setting?.special_allowance || 0)
  const deductions = (setting?.provident_fund_deduction || 1000) + (setting?.tax_deduction || 0)
  const netMonthlySalary = baseSalary + totalAllowances - deductions

  const handlePrintSlip = (monthName: string, year: number, paidAmount: number) => {
    const printWindow = window.open('', '_blank', 'width=800,height=700')
    if (!printWindow) {
      window.print()
      return
    }

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Salary Pay Slip - ${teacher.fullName} (${monthName} ${year})</title>
        <meta charset="utf-8" />
        <style>
          @page { size: A5 landscape; margin: 12mm; }
          * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
          body { padding: 15px; color: #1e293b; font-size: 12px; }
          .header { text-align: center; border-bottom: 2px solid #1e3a8a; padding-bottom: 10px; margin-bottom: 14px; }
          .header h1 { font-size: 18px; font-weight: 800; text-transform: uppercase; color: #1e3a8a; }
          .header p { font-size: 11px; color: #64748b; margin-top: 2px; }
          .badge { display: inline-block; margin-top: 6px; padding: 3px 12px; border-radius: 9999px; background: #eff6ff; border: 1px solid #bfdbfe; font-size: 10px; font-weight: 700; color: #1e3a8a; }
          .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 10px 14px; margin-bottom: 16px; font-size: 11.5px; }
          table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #e2e8f0; }
          th { background: #f1f5f9; padding: 8px 12px; text-align: left; font-size: 10px; text-transform: uppercase; color: #475569; border-bottom: 1px solid #cbd5e1; }
          td { padding: 8px 12px; border-bottom: 1px solid #f1f5f9; font-size: 11.5px; }
          .total-row { background: #f8fafc; font-weight: 800; border-top: 2px solid #cbd5e1; }
          .sigs { display: grid; grid-template-columns: 1fr 1fr; gap: 40px; margin-top: 35px; text-align: center; font-size: 10px; color: #64748b; }
          .sig-line { border-top: 1px dashed #94a3b8; width: 150px; margin: 0 auto 5px auto; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>${inst.name}</h1>
          ${inst.nameBn ? `<p style="font-size:12px; font-weight:600; color:#475569;">${inst.nameBn}</p>` : ''}
          <p>${inst.address} • Phone: ${inst.phone} • EIIN: ${inst.eiin}</p>
          <div class="badge">Official Staff Salary Slip • ${monthName} ${year}</div>
        </div>

        <div class="grid">
          <div>
            <p><strong>Employee Name:</strong> ${teacher.fullName}</p>
            <p><strong>Teacher ID:</strong> ${teacher.teacherId}</p>
            <p><strong>Designation:</strong> ${teacher.designation}</p>
          </div>
          <div style="text-align: right;">
            <p><strong>Disbursal Method:</strong> ${setting?.payment_method || 'BANK'}</p>
            <p><strong>Account/Ref:</strong> ${setting?.account_number || inst.bankDetails.split('|')[1] || 'DBBL-***921'}</p>
            <p><strong>Pay Period:</strong> ${monthName} ${year}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr><th>Earnings & Additions</th><th style="text-align: right;">Amount</th></tr>
          </thead>
          <tbody>
            <tr><td>Basic Salary</td><td style="text-align: right; font-family: monospace;">${formatCurrency(baseSalary)}</td></tr>
            <tr><td>House & Medical Allowance</td><td style="text-align: right; font-family: monospace;">+ ${formatCurrency(totalAllowances)}</td></tr>
            <tr><td>Provident Fund & Tax Deduction</td><td style="text-align: right; font-family: monospace; color: #dc2626;">- ${formatCurrency(deductions)}</td></tr>
            <tr class="total-row">
              <td><strong>Net Salary Paid:</strong></td>
              <td style="text-align: right; font-family: monospace; font-size: 14px; color: #047857;"><strong>${formatCurrency(paidAmount || netMonthlySalary)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="sigs">
          <div>
            <div class="sig-line"></div>
            Teacher Signature
          </div>
          <div>
            <div class="sig-line"></div>
            ${inst.principalDesignation}
          </div>
        </div>

        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
      </html>
    `

    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()
  }

  return (
    <div className="space-y-6">
      {/* Salary Overview Card */}
      <div className="bg-gradient-to-br from-indigo-900 to-slate-900 text-white rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl" />
        <div className="relative z-10">
          <span className="text-[10px] font-bold tracking-wider text-indigo-300 uppercase block">
            Configured Compensation Package
          </span>
          <div className="flex flex-wrap items-baseline gap-4 mt-2">
            <h3 className="text-3xl font-black font-mono tracking-tight">
              {formatCurrency(netMonthlySalary)}
            </h3>
            <span className="text-xs text-zinc-400 font-medium">/ month (Net Payable)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/10 text-xs">
            <div>
              <span className="text-zinc-400 text-[11px] block">Basic Salary</span>
              <span className="font-bold font-mono text-zinc-100">{formatCurrency(baseSalary)}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[11px] block">Allowances</span>
              <span className="font-bold font-mono text-emerald-400">+{formatCurrency(totalAllowances)}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[11px] block">Deductions (PF/Tax)</span>
              <span className="font-bold font-mono text-rose-400">-{formatCurrency(deductions)}</span>
            </div>
            <div>
              <span className="text-zinc-400 text-[11px] block">Disbursal</span>
              <span className="font-bold text-zinc-200">{setting?.payment_method || 'BANK'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Salary Disbursement History */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider flex items-center gap-1.5">
            <Receipt size={15} className="text-indigo-600" />
            Salary Payment History ({currentYear})
          </h4>
          <span className="text-xs text-zinc-400">{salaryRecords.length} recorded payments</span>
        </div>

        {salaryRecords.length === 0 ? (
          <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-400 text-xs">
            No past salary disbursement history found for this teacher.
          </div>
        ) : (
          <>
            {/* Mobile Card List */}
            <div className="block sm:hidden space-y-3">
              {salaryRecords.map((rec) => {
                const mName = MONTH_NAMES[rec.month - 1] || `Month ${rec.month}`
                return (
                  <div key={rec.id} className="p-3.5 rounded-2xl bg-white border border-zinc-200/80 shadow-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-zinc-900 text-xs">{mName} {rec.year}</span>
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 font-mono">
                        {rec.paymentMethod || 'BANK'}
                      </span>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-zinc-100">
                      <div>
                        <span className="text-[10px] text-zinc-400 block font-mono">
                          {rec.paidDate || `${rec.year}-0${rec.month}-05`}
                        </span>
                        <span className="font-mono font-bold text-emerald-700 text-xs">
                          {formatCurrency(rec.paidAmount || netMonthlySalary)}
                        </span>
                      </div>
                      <button
                        onClick={() => handlePrintSlip(mName, rec.year, rec.paidAmount || netMonthlySalary)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold transition-all cursor-pointer"
                      >
                        <Printer size={12} />
                        Slip
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Desktop Table View */}
            <div className="hidden sm:block border border-zinc-200 rounded-2xl overflow-hidden shadow-xs">
              <table className="w-full text-xs">
                <thead className="bg-zinc-50 border-b border-zinc-200 text-zinc-600 uppercase text-[10px] font-bold">
                  <tr>
                    <th className="px-4 py-2.5 text-left">Pay Period</th>
                    <th className="px-4 py-2.5 text-left">Disbursal Date</th>
                    <th className="px-4 py-2.5 text-left">Method</th>
                    <th className="px-4 py-2.5 text-right">Amount Paid</th>
                    <th className="px-4 py-2.5 text-center">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100">
                  {salaryRecords.map((rec) => {
                    const mName = MONTH_NAMES[rec.month - 1] || `Month ${rec.month}`
                    return (
                      <tr key={rec.id} className="hover:bg-zinc-50/50">
                        <td className="px-4 py-3 font-bold text-zinc-900">
                          {mName} {rec.year}
                        </td>
                        <td className="px-4 py-3 text-zinc-500 font-mono">
                          {rec.paidDate || `${rec.year}-0${rec.month}-05`}
                        </td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 font-mono">
                            {rec.paymentMethod || 'BANK'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-bold text-emerald-700">
                          {formatCurrency(rec.paidAmount || netMonthlySalary)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handlePrintSlip(mName, rec.year, rec.paidAmount || netMonthlySalary)}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-[11px] font-bold transition-all cursor-pointer"
                          >
                            <Printer size={12} />
                            Slip
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
