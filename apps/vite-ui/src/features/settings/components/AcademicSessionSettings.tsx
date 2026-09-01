import { useState } from 'react'
import {
  Calendar,
  Layers,
  Sparkles,
  Save,
  CheckCircle2,
  Plus,
} from 'lucide-react'
import { useSettingsStore, type WeeklyHolidayConfig } from '@/store/settings'

export function AcademicSessionSettings() {
  const settings = useSettingsStore()
  const [currentSession, setCurrentSession] = useState(settings.currentSession)
  const [sessionList, setSessionList] = useState(settings.sessionList)
  const [newSessionInput, setNewSessionInput] = useState('')
  const [sessionStartMonth, setSessionStartMonth] = useState(settings.sessionStartMonth)
  const [weeklyHolidays, setWeeklyHolidays] = useState<WeeklyHolidayConfig>(settings.weeklyHolidays)
  const [studentIdPrefix, setStudentIdPrefix] = useState(settings.studentIdPrefix)
  const [teacherIdPrefix, setTeacherIdPrefix] = useState(settings.teacherIdPrefix)
  const [autoRollGeneration, setAutoRollGeneration] = useState(settings.autoRollGeneration)
  const [saved, setSaved] = useState(false)

  const handleAddSession = () => {
    if (!newSessionInput.trim() || sessionList.includes(newSessionInput.trim())) return
    const updated = [...sessionList, newSessionInput.trim()]
    setSessionList(updated)
    setNewSessionInput('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    settings.updateAcademicSession({
      currentSession,
      sessionList,
      sessionStartMonth,
      weeklyHolidays,
      studentIdPrefix,
      teacherIdPrefix,
      autoRollGeneration,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 1. Active Academic Session & History ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Calendar size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Active Academic Year & Session Calendar
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Active Current Session
            </label>
            <select
              value={currentSession}
              onChange={(e) => setCurrentSession(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-bold cursor-pointer"
            >
              {sessionList.map((s) => (
                <option key={s} value={s}>
                  Academic Year {s} {s === currentSession ? ' (Active Current)' : ''}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Session Cycle Start Month
            </label>
            <select
              value={sessionStartMonth}
              onChange={(e) => setSessionStartMonth(Number(e.target.value))}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium cursor-pointer"
            >
              <option value={1}>January – December (Standard Bangladeshi Schooling)</option>
              <option value={7}>July – June (College / Higher Secondary Cycle)</option>
              <option value={9}>September – August (British / International Curriculum)</option>
            </select>
          </div>
        </div>

        {/* Add new session year */}
        <div className="mt-3 flex items-center gap-2">
          <input
            type="text"
            value={newSessionInput}
            onChange={(e) => setNewSessionInput(e.target.value)}
            placeholder="Add new session (e.g. 2027)"
            className="w-48 bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-1.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
          <button
            type="button"
            onClick={handleAddSession}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-zinc-800 text-xs font-bold transition-all cursor-pointer"
          >
            <Plus size={13} />
            <span>Add Session</span>
          </button>
        </div>
      </div>

      {/* ── 2. Weekly Working Days & Holidays ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <Layers size={16} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Weekly Institution Holidays
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {[
            { id: 'FRIDAY_SATURDAY', label: 'Friday & Saturday', desc: 'Standard 5-day week' },
            { id: 'FRIDAY_ONLY', label: 'Friday Only', desc: '6-day academic week' },
            { id: 'SUNDAY_ONLY', label: 'Sunday Only', desc: 'International standard' },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setWeeklyHolidays(item.id as WeeklyHolidayConfig)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                weeklyHolidays === item.id
                  ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-zinc-50/50 border-zinc-200 hover:bg-white hover:border-zinc-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-zinc-900">{item.label}</span>
                <input
                  type="radio"
                  name="weeklyHolidays"
                  checked={weeklyHolidays === item.id}
                  onChange={() => setWeeklyHolidays(item.id as WeeklyHolidayConfig)}
                  className="accent-indigo-600"
                />
              </div>
              <p className="text-[11px] text-zinc-500 font-medium">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 3. ID Prefix & Numbering Scheme ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={16} className="text-purple-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            ID Numbering Pattern & Auto-Roll Generation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Student ID Prefix Pattern
            </label>
            <input
              type="text"
              value={studentIdPrefix}
              onChange={(e) => setStudentIdPrefix(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-bold"
              placeholder="e.g. PM-26-"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Generated Student ID will look like: <code className="font-mono text-zinc-800">{studentIdPrefix}1045</code></p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Teacher / Staff ID Prefix
            </label>
            <input
              type="text"
              value={teacherIdPrefix}
              onChange={(e) => setTeacherIdPrefix(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-bold"
              placeholder="e.g. TCH-"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Generated Staff ID will look like: <code className="font-mono text-zinc-800">{teacherIdPrefix}082</code></p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200">
          <div>
            <p className="text-xs font-bold text-zinc-900">Auto Roll Number Sequencing</p>
            <p className="text-[11px] text-zinc-500">Automatically assign incremental roll numbers (01, 02, 03...) during new student admission.</p>
          </div>
          <input
            type="checkbox"
            checked={autoRollGeneration}
            onChange={(e) => setAutoRollGeneration(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        {saved ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
            <CheckCircle2 size={16} />
            Academic session settings updated!
          </span>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Session applies to all class registers and fee billings</span>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save size={15} />
          Save Academic Settings
        </button>
      </div>
    </form>
  )
}
