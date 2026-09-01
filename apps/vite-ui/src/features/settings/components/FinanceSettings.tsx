import { useState } from 'react'
import {
  Clock,
  CreditCard,
  FileText,
  Save,
  CheckCircle2,
} from 'lucide-react'
import { useSettingsStore, type LateFeePolicyType } from '@/store/settings'

export function FinanceSettings() {
  const settings = useSettingsStore()
  const [feeDueCutoffDay, setFeeDueCutoffDay] = useState(settings.feeDueCutoffDay)
  const [lateFeePolicy, setLateFeePolicy] = useState<LateFeePolicyType>(settings.lateFeePolicy)
  const [lateFeeFixedAmount, setLateFeeFixedAmount] = useState(settings.lateFeeFixedAmount)
  const [lateFeeDailyAmount, setLateFeeDailyAmount] = useState(settings.lateFeeDailyAmount)
  const [invoicePrefix, setInvoicePrefix] = useState(settings.invoicePrefix)
  const [merchantBkash, setMerchantBkash] = useState(settings.merchantBkash)
  const [merchantNagad, setMerchantNagad] = useState(settings.merchantNagad)
  const [bankAccountDetails, setBankAccountDetails] = useState(settings.bankAccountDetails)
  const [receiptTermsFooter, setReceiptTermsFooter] = useState(settings.receiptTermsFooter)
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    settings.updateFinanceSettings({
      feeDueCutoffDay,
      lateFeePolicy,
      lateFeeFixedAmount,
      lateFeeDailyAmount,
      invoicePrefix,
      merchantBkash,
      merchantNagad,
      bankAccountDetails,
      receiptTermsFooter,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 1. Monthly Due Date & Late Fine Engine ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Monthly Fee Billing Cycle & Late Fee Penalties
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Monthly Fee Due Cutoff Day
            </label>
            <div className="relative">
              <input
                type="number"
                min={1}
                max={28}
                value={feeDueCutoffDay}
                onChange={(e) => setFeeDueCutoffDay(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-zinc-400">th of month</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Payments received after this calendar day incur automated late penalties.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Invoice & Money Receipt Prefix
            </label>
            <input
              type="text"
              value={invoicePrefix}
              onChange={(e) => setInvoicePrefix(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="e.g. INV-2026-"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Generated Invoice will look like: <code className="font-mono text-zinc-800">{invoicePrefix}00482</code></p>
          </div>
        </div>

        {/* Late Fee Calculation Engine */}
        <div className="mt-4">
          <label className="block text-xs font-semibold text-zinc-700 mb-2">
            Automated Late Fine Policy
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { id: 'NONE', label: 'No Late Fine', desc: 'No penalty regardless of date' },
              { id: 'FIXED_MONTHLY', label: 'Fixed Monthly Fine', desc: `৳${lateFeeFixedAmount} flat penalty once past due day` },
              { id: 'DAILY_INCREMENT', label: 'Daily Accrual Fine', desc: `৳${lateFeeDailyAmount} added per day overdue` },
            ].map((item) => (
              <div
                key={item.id}
                onClick={() => setLateFeePolicy(item.id as LateFeePolicyType)}
                className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                  lateFeePolicy === item.id
                    ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                    : 'bg-zinc-50/50 border-zinc-200 hover:bg-white hover:border-zinc-300'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-zinc-900">{item.label}</span>
                  <input
                    type="radio"
                    name="lateFeePolicy"
                    checked={lateFeePolicy === item.id}
                    onChange={() => setLateFeePolicy(item.id as LateFeePolicyType)}
                    className="accent-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>

          {lateFeePolicy === 'FIXED_MONTHLY' && (
            <div className="mt-3 w-64">
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Fixed Late Fine Amount (৳)</label>
              <input
                type="number"
                value={lateFeeFixedAmount}
                onChange={(e) => setLateFeeFixedAmount(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}

          {lateFeePolicy === 'DAILY_INCREMENT' && (
            <div className="mt-3 w-64">
              <label className="block text-[11px] font-semibold text-zinc-600 mb-1">Daily Accrual Amount (৳/day)</label>
              <input
                type="number"
                value={lateFeeDailyAmount}
                onChange={(e) => setLateFeeDailyAmount(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs text-zinc-900 font-bold font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── 2. Merchant Numbers & Bank Details ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard size={16} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Official Merchant Accounts (Printed on Invoices for Parents)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              bKash Merchant / Personal Number
            </label>
            <input
              type="text"
              value={merchantBkash}
              onChange={(e) => setMerchantBkash(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              placeholder="e.g. 01711-000000 (Merchant)"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Nagad Merchant / Personal Number
            </label>
            <input
              type="text"
              value={merchantNagad}
              onChange={(e) => setMerchantNagad(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              placeholder="e.g. 01811-000000 (Merchant)"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Official Bank Deposit Account Information
            </label>
            <input
              type="text"
              value={bankAccountDetails}
              onChange={(e) => setBankAccountDetails(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              placeholder="e.g. Dutch-Bangla Bank Ltd | A/C: 115.120.98765 | Uttara Branch"
            />
          </div>
        </div>
      </div>

      {/* ── 3. Receipt Terms & Conditions ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <FileText size={16} className="text-purple-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Money Receipt Terms & Footer Disclaimer
          </h3>
        </div>

        <div>
          <textarea
            value={receiptTermsFooter}
            onChange={(e) => setReceiptTermsFooter(e.target.value)}
            rows={2}
            className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
            placeholder="e.g. Fees once paid are non-refundable. Please preserve this receipt..."
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        {saved ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
            <CheckCircle2 size={16} />
            Finance and billing rules saved!
          </span>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Controls late fine calculations & money receipt footers</span>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save size={15} />
          Save Finance Settings
        </button>
      </div>
    </form>
  )
}
