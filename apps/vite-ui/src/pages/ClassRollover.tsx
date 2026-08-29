import { ArrowRight, AlertTriangle, CheckCircle2, History, RotateCcw, GraduationCap } from 'lucide-react'
import { useClassRollover } from '@/features/rollover/useClassRollover'

// ── Component ────────────────────────────────────────────────────────────────

export function ClassRollover() {
  const {
    currentYear, nextYear,
    classes,
    logs,
    step, setStep,
    isProcessing,
    processRollover,
  } = useClassRollover()

  return (
    <div className="space-y-5 max-w-4xl mx-auto">
      {/* ── Header ───────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">Class Rollover</h1>
          <p className="text-sm text-zinc-500 mt-1">Promote students to the next class at the end of the academic year</p>
        </div>
      </div>

      {/* ── Main Action Card ─────────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden">
        {/* Progress header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50/50">
          {[
            { s: 1, label: 'Setup' },
            { s: 2, label: 'Review' },
            { s: 3, label: 'Complete' },
          ].map((item, i, arr) => (
            <div key={item.s} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step >= item.s ? 'bg-indigo-600 text-white' : 'bg-zinc-200 text-zinc-500'}`}>
                  {item.s}
                </div>
                <span className={`text-sm font-semibold ${step >= item.s ? 'text-zinc-900' : 'text-zinc-400'}`}>{item.label}</span>
              </div>
              {i < arr.length - 1 && <div className={`h-px flex-1 mx-4 ${step > item.s ? 'bg-indigo-600' : 'bg-zinc-200'}`} />}
            </div>
          ))}
        </div>

        {/* Step 1: Setup */}
        {step === 1 && (
          <div className="p-6 md:p-8 space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex gap-3">
              <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-bold text-amber-800 text-sm">Warning!</h3>
                <p className="text-sm text-amber-700 mt-1 leading-relaxed">
                  Class Rollover is an irreversible process. It will promote all students of the current academic year to the next class and archive all current year classes. Please ensure all exam results for the current year have been entered.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="border border-zinc-200 rounded-xl p-5 bg-zinc-50">
                <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Current Academic Year</p>
                <p className="text-3xl font-black text-zinc-800">{currentYear}</p>
                <p className="text-sm text-zinc-500 mt-2">{classes.length} Active Classes</p>
              </div>
              <div className="border border-indigo-200 rounded-xl p-5 bg-indigo-50/50">
                <p className="text-xs font-bold text-indigo-500 uppercase tracking-wider mb-2">Next Academic Year</p>
                <p className="text-3xl font-black text-indigo-800">{nextYear}</p>
                <p className="text-sm text-indigo-600 mt-2">New classes will be created</p>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-zinc-100">
              <button onClick={() => setStep(2)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                Preview <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Preview */}
        {step === 2 && (
          <div className="p-0">
            <div className="px-6 py-4 bg-zinc-50 border-b border-zinc-100">
              <p className="font-semibold text-zinc-800 text-sm">Promotion Preview ({currentYear} → {nextYear})</p>
            </div>
            <div className="divide-y divide-zinc-100">
              {classes.map(c => {
                const nextClass = classes.find(nc => nc.numericName === c.numericName + 1)
                const isGraduating = c.numericName === 12
                return (
                  <div key={c.id} className="flex items-center justify-between p-4 px-6 hover:bg-zinc-50 transition-colors">
                    <div className="flex-1">
                      <p className="font-bold text-zinc-800">{c.name}</p>
                      <p className="text-xs text-zinc-500 mt-0.5">{c.totalStudents} Students</p>
                    </div>
                    <div className="px-4 text-zinc-300">
                      <ArrowRight size={20} />
                    </div>
                    <div className="flex-1 text-right">
                      {isGraduating ? (
                        <div>
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold">
                            <GraduationCap size={14} /> Alumni (Graduated)
                          </span>
                        </div>
                      ) : (
                        <div>
                          <p className="font-bold text-indigo-700">{nextClass?.name ?? `Class ${c.numericName + 1}`}</p>
                          <p className="text-xs text-indigo-500/70 mt-0.5">{c.totalStudents} to be promoted</p>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
            <div className="px-6 py-5 border-t border-zinc-100 flex items-center justify-between bg-zinc-50">
              <button onClick={() => setStep(1)} className="text-zinc-500 font-medium text-sm hover:text-zinc-800">
                Go Back
              </button>
              <button onClick={processRollover} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-500/20">
                Confirm Rollover
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Processing / Done */}
        {step === 3 && (
          <div className="p-12 text-center">
            {isProcessing ? (
              <div className="space-y-4">
                <RotateCcw size={40} className="mx-auto text-indigo-600 animate-spin" />
                <div>
                  <h3 className="font-bold text-xl text-zinc-900">Processing Rollover...</h3>
                  <p className="text-sm text-zinc-500 mt-1">Please wait, this may take a few minutes.</p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 size={32} />
                </div>
                <div>
                  <h3 className="font-bold text-2xl text-zinc-900">Rollover Completed!</h3>
                  <p className="text-sm text-zinc-500 mt-1">Academic year {nextYear} has been created successfully.</p>
                </div>
                <button onClick={() => setStep(1)} className="mt-4 bg-zinc-100 text-zinc-700 font-medium px-6 py-2.5 rounded-xl hover:bg-zinc-200 transition-colors">
                  Start New Rollover
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── History Logs ─────────────────────────────────────── */}
      <div className="bg-white border border-zinc-100 rounded-2xl shadow-sm overflow-hidden mt-8">
        <div className="px-6 py-4 border-b border-zinc-100 flex items-center gap-2 bg-zinc-50/50">
          <History size={18} className="text-zinc-500" />
          <h2 className="font-bold text-zinc-800">Rollover History</h2>
        </div>
        <div className="divide-y divide-zinc-100">
          {logs.map(log => (
            <div key={log.id} className="p-5 flex items-start sm:items-center justify-between flex-col sm:flex-row gap-4">
              <div>
                <div className="flex items-center gap-3">
                  <p className="font-bold text-zinc-900 text-lg">{log.fromYear} <span className="text-zinc-300 font-normal mx-1">→</span> {log.toYear}</p>
                  <span className="px-2 py-0.5 rounded-md bg-green-100 text-green-700 text-[10px] font-bold">SUCCESS</span>
                </div>
                <p className="text-xs text-zinc-500 mt-1 flex items-center gap-1.5">
                  <CalendarIcon size={12} /> {log.date}
                </p>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-xl font-bold text-zinc-800">{log.totalPromoted}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-wider font-semibold">Promoted</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-red-600">{log.totalFailed}</p>
                  <p className="text-[10px] text-red-400 uppercase tracking-wider font-semibold">Failed</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-bold text-emerald-600">{log.totalGraduated}</p>
                  <p className="text-[10px] text-emerald-500 uppercase tracking-wider font-semibold">Graduated</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function CalendarIcon({ size }: { size: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
}
