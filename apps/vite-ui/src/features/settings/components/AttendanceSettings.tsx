import { useState } from 'react'
import {
  Clock,
  Save,
  CheckCircle2,
  ShieldCheck,
  Briefcase,
} from 'lucide-react'
import { useSettingsStore } from '@/store/settings'

export function AttendanceSettings() {
  const settings = useSettingsStore()
  const [shiftStartTime, setShiftStartTime] = useState(settings.shiftStartTime)
  const [shiftEndTime, setShiftEndTime] = useState(settings.shiftEndTime)
  const [lateGraceMinutes, setLateGraceMinutes] = useState(settings.lateGraceMinutes)
  const [absentCutoffMinutes, setAbsentCutoffMinutes] = useState(settings.absentCutoffMinutes)
  const [examMinAttendancePct, setExamMinAttendancePct] = useState(settings.examMinAttendancePct)
  const [autoApplyApprovedLeaves, setAutoApplyApprovedLeaves] = useState(settings.autoApplyApprovedLeaves)
  const [teacherCasualLeaveQuota, setTeacherCasualLeaveQuota] = useState(settings.teacherCasualLeaveQuota)
  const [teacherMedicalLeaveQuota, setTeacherMedicalLeaveQuota] = useState(settings.teacherMedicalLeaveQuota)
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    settings.updateAttendanceRules({
      shiftStartTime,
      shiftEndTime,
      lateGraceMinutes,
      absentCutoffMinutes,
      examMinAttendancePct,
      autoApplyApprovedLeaves,
      teacherCasualLeaveQuota,
      teacherMedicalLeaveQuota,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 1. Daily School Timings & Thresholds ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Clock size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Daily Shift Timings & Punctuality Thresholds
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Shift In-Time (Start)
            </label>
            <input
              type="time"
              value={shiftStartTime}
              onChange={(e) => setShiftStartTime(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Shift Out-Time (Dismissal)
            </label>
            <input
              type="time"
              value={shiftEndTime}
              onChange={(e) => setShiftEndTime(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-mono font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all text-center"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Late Grace Period
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={60}
                value={lateGraceMinutes}
                onChange={(e) => setLateGraceMinutes(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-zinc-400">mins</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Arrival after {lateGraceMinutes} mins marked as LATE.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Absent Cutoff Threshold
            </label>
            <div className="relative">
              <input
                type="number"
                min={30}
                max={180}
                value={absentCutoffMinutes}
                onChange={(e) => setAbsentCutoffMinutes(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-zinc-400">mins</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Unmarked students after {absentCutoffMinutes} mins marked ABSENT.</p>
          </div>
        </div>
      </div>

      {/* ── 2. Exam Eligibility & Leave Synchronizer ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <ShieldCheck size={16} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Academic Eligibility & Approved Leave Auto-Sync
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Minimum Attendance Required for Exam Clearance (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min={50}
                max={90}
                value={examMinAttendancePct}
                onChange={(e) => setExamMinAttendancePct(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-zinc-400">%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Students below this percentage are flagged as "Non-Collegiate / At-Risk".</p>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 self-end">
            <div>
              <p className="text-xs font-bold text-zinc-900">Auto-Apply Approved Leaves on Register</p>
              <p className="text-[11px] text-zinc-500">Auto-mark 'LEAVE' on daily register if principal approved the leave request.</p>
            </div>
            <input
              type="checkbox"
              checked={autoApplyApprovedLeaves}
              onChange={(e) => setAutoApplyApprovedLeaves(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* ── 3. Teacher Annual Leave Quotas ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <Briefcase size={16} className="text-purple-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Faculty Annual Leave Policy (Days per Session)
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Casual Leave (CL) Quota
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={30}
                value={teacherCasualLeaveQuota}
                onChange={(e) => setTeacherCasualLeaveQuota(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-zinc-400">days / year</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Medical / Sick Leave (ML) Quota
            </label>
            <div className="relative">
              <input
                type="number"
                min={0}
                max={30}
                value={teacherMedicalLeaveQuota}
                onChange={(e) => setTeacherMedicalLeaveQuota(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-zinc-400">days / year</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        {saved ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
            <CheckCircle2 size={16} />
            Attendance and timing rules saved!
          </span>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Controls live roll-call registers and eligibility filters</span>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save size={15} />
          Save Attendance Rules
        </button>
      </div>
    </form>
  )
}
