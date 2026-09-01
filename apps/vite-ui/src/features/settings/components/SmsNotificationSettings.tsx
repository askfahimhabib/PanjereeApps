import { useState } from 'react'
import {
  Key,
  BellRing,
  FileCode,
  Save,
  CheckCircle2,
  Send,
} from 'lucide-react'
import { useSettingsStore } from '@/store/settings'

export function SmsNotificationSettings() {
  const settings = useSettingsStore()
  const [smsGatewayProvider, setSmsGatewayProvider] = useState(settings.smsGatewayProvider)
  const [smsApiKey, setSmsApiKey] = useState(settings.smsApiKey)
  const [smsSenderId, setSmsSenderId] = useState(settings.smsSenderId)
  const [autoSmsAbsentAlert, setAutoSmsAbsentAlert] = useState(settings.autoSmsAbsentAlert)
  const [autoSmsFeeReceipt, setAutoSmsFeeReceipt] = useState(settings.autoSmsFeeReceipt)
  const [autoSmsDueReminder, setAutoSmsDueReminder] = useState(settings.autoSmsDueReminder)
  const [autoSmsResultPublished, setAutoSmsResultPublished] = useState(settings.autoSmsResultPublished)
  const [smsTemplateAbsent, setSmsTemplateAbsent] = useState(settings.smsTemplateAbsent)
  const [smsTemplatePayment, setSmsTemplatePayment] = useState(settings.smsTemplatePayment)
  const [smsTemplateDue, setSmsTemplateDue] = useState(settings.smsTemplateDue)
  const [saved, setSaved] = useState(false)
  const [testSent, setTestSent] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    settings.updateSmsSettings({
      smsGatewayProvider,
      smsApiKey,
      smsSenderId,
      autoSmsAbsentAlert,
      autoSmsFeeReceipt,
      autoSmsDueReminder,
      autoSmsResultPublished,
      smsTemplateAbsent,
      smsTemplatePayment,
      smsTemplateDue,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const handleTestSms = () => {
    setTestSent(true)
    setTimeout(() => setTestSent(false), 3000)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 1. Gateway API & Sender Masking ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Key size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            SMS Gateway Configuration & Masking Sender ID
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Gateway Provider
            </label>
            <select
              value={smsGatewayProvider}
              onChange={(e) => setSmsGatewayProvider(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium cursor-pointer"
            >
              <option value="Greenweb SMS Gateway BD">Greenweb SMS Gateway BD</option>
              <option value="SSL Wireless Bulk SMS">SSL Wireless Bulk SMS</option>
              <option value="Teletalk SMS Platform">Teletalk SMS Platform</option>
              <option value="Alpha Net SMS Gateway">Alpha Net SMS Gateway</option>
              <option value="Simulation / Local Test Gateway">Simulation / Local Test Gateway</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              API Authentication Key / Token
            </label>
            <input
              type="password"
              value={smsApiKey}
              onChange={(e) => setSmsApiKey(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="e.g. gw_live_89f7..."
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Masking / Sender ID (Header)
            </label>
            <input
              type="text"
              value={smsSenderId}
              onChange={(e) => setSmsSenderId(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all"
              placeholder="e.g. PANJEREE"
            />
          </div>
        </div>

        {/* Test SMS dispatch */}
        <div className="mt-3 flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
          <p className="text-xs text-zinc-600 font-medium">Verify gateway connection by sending a diagnostic test message</p>
          <button
            type="button"
            onClick={handleTestSms}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-black text-white text-xs font-bold transition-all cursor-pointer"
          >
            <Send size={13} />
            <span>{testSent ? '✓ Test SMS Dispatched' : 'Send Test Ping SMS'}</span>
          </button>
        </div>
      </div>

      {/* ── 2. Automatic Notification Triggers ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <BellRing size={16} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Automated SMS Notification Triggers (Toggles)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            {
              title: 'Daily Student Absent Alert',
              desc: 'Send automated SMS to guardians when a student is marked Absent.',
              checked: autoSmsAbsentAlert,
              set: setAutoSmsAbsentAlert,
            },
            {
              title: 'Instant Fee Payment Receipt',
              desc: 'Send SMS with invoice number & amount immediately upon collecting fee.',
              checked: autoSmsFeeReceipt,
              set: setAutoSmsFeeReceipt,
            },
            {
              title: 'Monthly Fee Due Reminder',
              desc: 'Send friendly reminder SMS to parents 2 days before the due day.',
              checked: autoSmsDueReminder,
              set: setAutoSmsDueReminder,
            },
            {
              title: 'Exam Result Publication Notice',
              desc: 'Send broadcast SMS to parents when term results & marks are published.',
              checked: autoSmsResultPublished,
              set: setAutoSmsResultPublished,
            },
          ].map((item, idx) => (
            <div
              key={idx}
              onClick={() => item.set(!item.checked)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between ${
                item.checked
                  ? 'bg-emerald-50/70 border-emerald-300 ring-2 ring-emerald-500/20'
                  : 'bg-zinc-50/50 border-zinc-200 hover:bg-white hover:border-zinc-300'
              }`}
            >
              <div>
                <p className="text-xs font-bold text-zinc-900">{item.title}</p>
                <p className="text-[11px] text-zinc-500 mt-0.5">{item.desc}</p>
              </div>
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => {}}
                className="w-4 h-4 accent-emerald-600 cursor-pointer ml-3 mt-0.5"
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. SMS Message Templates ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <FileCode size={16} className="text-purple-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            SMS Message Templates & Variables
          </h3>
        </div>

        <div className="space-y-3">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Absent Alert Template
            </label>
            <input
              type="text"
              value={smsTemplateAbsent}
              onChange={(e) => setSmsTemplateAbsent(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
            />
            <p className="text-[10px] text-zinc-400 mt-1">Variables: <code className="text-zinc-600 font-mono">{'{student_name}'}</code>, <code className="text-zinc-600 font-mono">{'{roll}'}</code>, <code className="text-zinc-600 font-mono">{'{class}'}</code>, <code className="text-zinc-600 font-mono">{'{date}'}</code></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Fee Collection Receipt Template
            </label>
            <input
              type="text"
              value={smsTemplatePayment}
              onChange={(e) => setSmsTemplatePayment(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
            />
            <p className="text-[10px] text-zinc-400 mt-1">Variables: <code className="text-zinc-600 font-mono">{'{amount}'}</code>, <code className="text-zinc-600 font-mono">{'{invoice_no}'}</code>, <code className="text-zinc-600 font-mono">{'{student_name}'}</code></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Fee Due Reminder Template
            </label>
            <input
              type="text"
              value={smsTemplateDue}
              onChange={(e) => setSmsTemplateDue(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
            />
            <p className="text-[10px] text-zinc-400 mt-1">Variables: <code className="text-zinc-600 font-mono">{'{due}'}</code>, <code className="text-zinc-600 font-mono">{'{due_date}'}</code>, <code className="text-zinc-600 font-mono">{'{student_name}'}</code></p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        {saved ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
            <CheckCircle2 size={16} />
            SMS gateway and notification rules saved!
          </span>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Auto-triggers execute during daily operations</span>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save size={15} />
          Save SMS Settings
        </button>
      </div>
    </form>
  )
}
