import { useState } from 'react'
import { Save, Calendar } from 'lucide-react'
import { useSettingsStore } from '../../../store/settings'

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

export function SessionConfig() {
  const settings = useSettingsStore()
  const [session, setSession] = useState(settings.currentSession)
  const [startMonth, setStartMonth] = useState(settings.sessionStartMonth)
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    settings.updateSession({ currentSession: session, sessionStartMonth: startMonth })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  const changed = session !== settings.currentSession || startMonth !== settings.sessionStartMonth

  // Generate common session strings
  const currentYear = new Date().getFullYear()
  const sessionOptions = [
    `${currentYear - 1}-${String(currentYear).slice(-2)}`,
    `${currentYear}-${String(currentYear + 1).slice(-2)}`,
    `${currentYear + 1}-${String(currentYear + 2).slice(-2)}`,
    `${currentYear}`,
    `${currentYear + 1}`,
  ]

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Current Session */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar size={12} /> Current Academic Session
          </label>
          <input
            value={session}
            onChange={e => setSession(e.target.value)}
            placeholder="e.g. 2024-25"
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 placeholder-slate-600 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          />
          {/* Quick picks */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {sessionOptions.map(opt => (
              <button
                key={opt}
                onClick={() => setSession(opt)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition-all ${
                  session === opt
                    ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300'
                    : 'border-zinc-100 text-zinc-600 hover:border-zinc-100 hover:text-zinc-600'
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Session Start Month */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-600 uppercase tracking-wider">Session Start Month</label>
          <select
            value={startMonth}
            onChange={e => setStartMonth(Number(e.target.value))}
            className="w-full bg-white shadow-[0_2px_10px_-4px_rgba(0,0,0,0.05)] border-zinc-200 border border-zinc-100 rounded-2xl px-4 py-2.5 text-sm text-zinc-800 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/20 transition-all"
          >
            {MONTH_NAMES.map((name, i) => (
              <option key={i + 1} value={i + 1}>{name}</option>
            ))}
          </select>
          <p className="text-[11px] text-zinc-800 mt-1">
            This determines when the academic year resets (fee dues, attendance, etc.)
          </p>
        </div>
      </div>

      {/* Preview */}
      <div className="p-4 rounded-xl bg-white border border-zinc-100">
        <p className="text-xs text-zinc-600 mb-1">Preview</p>
        <p className="text-sm text-zinc-800">
          Academic Session: <strong className="text-indigo-400">{session || '—'}</strong>
          {' '}· Starts: <strong className="text-indigo-400">{MONTH_NAMES[startMonth - 1]}</strong>
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={handleSave}
          disabled={!changed}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Save size={14} />
          Save Session
        </button>
        {saved && <span className="text-xs text-emerald-400 font-medium animate-fadeIn">✓ Saved</span>}
      </div>
    </div>
  )
}
