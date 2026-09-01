import { useMemo } from 'react'
import { Printer, Receipt } from 'lucide-react'
import type { Teacher } from '../../types'
import { salaryStore, teacherSalarySettingStore } from '@/data/stores'
import { formatCurrency, MONTH_NAMES } from '@/features/payments/types'

export function SalaryHistoryTab({ teacher }: { teacher: Teacher }) {
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
          <h1>Estudy International Model Academy</h1>
          <p>Sector 4, Uttara Model Town, Dhaka-1230</p>
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
            <p><strong>Account/Ref:</strong> ${setting?.account_number || 'DBBL-***921'}</p>
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
              <td><strong>Net Net Salary Paid:</strong></td>
              <td style="text-align: right; font-family: monospace; font-size: 14px; color: #047857;"><strong>${formatCurrency(paidAmount || netMonthlySalary)}</strong></td>
            </tr>
          </tbody>
        </table>

        <div class="sigs">
          <div>
            <div class="sig-line"></div>
            Teacher / Signature
          </div>
          <div>
            <div class="sig-line"></div>
            Accounts & Finance Officer
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
    <div className="space-y-4">
      {/* ── Salary Structure KPI Summary ───────────────────────── */}
      <div className="bg-gradient-to-r from-blue-900 to-indigo-900 rounded-2xl p-5 text-white shadow-md">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">
              Salary Profile & Disbursal
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <h3 className="text-2xl font-black font-mono">{formatCurrency(netMonthlySalary)}</h3>
              <span className="text-xs text-blue-200 font-semibold">/ month (Net)</span>
            </div>
            <p className="text-[11px] text-blue-200 mt-1">
              Base: {formatCurrency(baseSalary)} • Allowances: +{formatCurrency(totalAllowances)} • Deductions: -{formatCurrency(deductions)}
            </p>
          </div>

          <button
            onClick={() => handlePrintSlip('August', currentYear, netMonthlySalary)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white text-indigo-900 text-xs font-bold hover:bg-indigo-50 transition-all shadow-sm cursor-pointer"
          >
            <Printer size={13} /> Current Pay Slip
          </button>
        </div>
      </div>

      {/* ── Salary Disbursal History ───────────────────────────── */}
      <div className="bg-white border border-zinc-200/80 rounded-2xl overflow-hidden shadow-xs">
        <div className="px-4 py-3 bg-zinc-50/80 border-b border-zinc-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt size={14} className="text-indigo-600" />
            <h4 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
              Disbursal History ({salaryRecords.length})
            </h4>
          </div>
        </div>

        {salaryRecords.length === 0 ? (
          <div className="py-12 text-center text-zinc-400">
            <Receipt size={32} className="mx-auto mb-2 opacity-30 text-zinc-400" />
            <p className="text-xs font-semibold text-zinc-600">No salary history recorded</p>
            <p className="text-[11px] text-zinc-400 mt-0.5">Disburse salary from Finance & Payroll</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100">
            {salaryRecords.map((rec) => {
              const isPaid = rec.status === 'PAID'
              const monthName = MONTH_NAMES[rec.month - 1]

              return (
                <div
                  key={rec.id}
                  className="p-3.5 hover:bg-zinc-50/70 transition-colors flex items-center justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h5 className="font-bold text-zinc-900 text-xs">
                        {monthName} {rec.year} Salary
                      </h5>
                      <span
                        className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${
                          isPaid
                            ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                            : 'bg-amber-100 text-amber-800 border-amber-200'
                        }`}
                      >
                        {rec.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-500 mt-0.5">
                      Base: {formatCurrency(rec.baseSalary)} • Paid Date: {rec.paidDate || 'Pending'}
                      {rec.notes ? ` • Note: ${rec.notes}` : ''}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="text-right font-mono">
                      <p className="font-extrabold text-xs text-indigo-900">
                        {formatCurrency(rec.paidAmount || rec.baseSalary)}
                      </p>
                    </div>

                    <button
                      onClick={() => handlePrintSlip(monthName, rec.year, rec.paidAmount || rec.baseSalary)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                      title="Print Pay Slip"
                    >
                      <Printer size={14} />
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
