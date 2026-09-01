import { useState } from 'react'
import {
  Award,
  BookOpen,
  CheckCircle2,
  Save,
  Scale,
} from 'lucide-react'
import { useSettingsStore, type GradingScaleType } from '@/store/settings'

export function GradingPolicySettings() {
  const settings = useSettingsStore()
  const [gradingScale, setGradingScale] = useState<GradingScaleType>(settings.gradingScale)
  const [minPassPercentage, setMinPassPercentage] = useState(settings.minPassPercentage)
  const [fourthSubjectBonusThreshold, setFourthSubjectBonusThreshold] = useState(settings.fourthSubjectBonusThreshold)
  const [autoFailOnCompulsoryFail, setAutoFailOnCompulsoryFail] = useState(settings.autoFailOnCompulsoryFail)
  const [marksheetShowPrincipalSign, setMarksheetShowPrincipalSign] = useState(settings.marksheetShowPrincipalSign)
  const [marksheetExaminerTitle, setMarksheetExaminerTitle] = useState(settings.marksheetExaminerTitle)
  const [saved, setSaved] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    settings.updateGradingPolicy({
      gradingScale,
      minPassPercentage,
      fourthSubjectBonusThreshold,
      autoFailOnCompulsoryFail,
      marksheetShowPrincipalSign,
      marksheetExaminerTitle,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* ── 1. Grading Standard Scale ── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Scale size={16} className="text-indigo-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Evaluation Scale & Grading System Standard
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[
            {
              id: 'NCTB_SECONDARY',
              name: 'NCTB Bangladesh Standard (GPA 5.00)',
              desc: '80+ A+ (5.0), 70+ A (4.0), 60+ A- (3.5), 50+ B (3.0), 40+ C (2.0), 33+ D (1.0), <33 F',
            },
            {
              id: 'PRIMARY_STANDARD',
              name: 'Primary Standard (Grades 1-5)',
              desc: '80+ A+, 60+ A, 40+ B, 33+ C, <33 F',
            },
            {
              id: 'CAMBRIDGE',
              name: 'Cambridge International / IGCSE',
              desc: 'A*, A, B, C, D, E, U Percentile Scale',
            },
          ].map((item) => (
            <div
              key={item.id}
              onClick={() => setGradingScale(item.id as GradingScaleType)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                gradingScale === item.id
                  ? 'bg-indigo-50/70 border-indigo-300 ring-2 ring-indigo-500/20'
                  : 'bg-zinc-50/50 border-zinc-200 hover:bg-white hover:border-zinc-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-bold text-zinc-900">{item.name}</span>
                  <input
                    type="radio"
                    name="gradingScale"
                    checked={gradingScale === item.id}
                    onChange={() => setGradingScale(item.id as GradingScaleType)}
                    className="accent-indigo-600"
                  />
                </div>
                <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Pass & Fail Rules ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen size={16} className="text-emerald-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Passing Marks & 4th Subject Bonus Calculation
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Minimum Pass Percentage (%)
            </label>
            <div className="relative">
              <input
                type="number"
                min={20}
                max={50}
                value={minPassPercentage}
                onChange={(e) => setMinPassPercentage(Number(e.target.value))}
                className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
              />
              <span className="absolute right-3.5 top-2.5 text-xs font-bold text-zinc-400">%</span>
            </div>
            <p className="text-[11px] text-zinc-500 mt-1">Scores below this percentage are marked as Grade F (Fail).</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              4th Optional Subject Bonus Threshold (GP)
            </label>
            <input
              type="number"
              step="0.5"
              min={0}
              max={3}
              value={fourthSubjectBonusThreshold}
              onChange={(e) => setFourthSubjectBonusThreshold(Number(e.target.value))}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 font-bold focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-mono"
            />
            <p className="text-[11px] text-zinc-500 mt-1">Only Grade Points above this value (e.g. GP - 2.00) add bonus to total GPA.</p>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200">
          <div>
            <p className="text-xs font-bold text-zinc-900">Enforce Strict Board Rule (Auto-Fail on Mandatory Subject F)</p>
            <p className="text-[11px] text-zinc-500">If a student fails in any compulsory subject (e.g. English/Math), overall GPA is forced to 0.00 (Fail).</p>
          </div>
          <input
            type="checkbox"
            checked={autoFailOnCompulsoryFail}
            onChange={(e) => setAutoFailOnCompulsoryFail(e.target.checked)}
            className="w-4 h-4 accent-indigo-600 cursor-pointer"
          />
        </div>
      </div>

      {/* ── 3. Transcript & Marksheet Printing Signatories ── */}
      <div className="pt-4 border-t border-zinc-100">
        <div className="flex items-center gap-2 mb-3">
          <Award size={16} className="text-purple-600" />
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Marksheet & Certificate Printing Configuration
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1">
              Official Examination Authority Title
            </label>
            <input
              type="text"
              value={marksheetExaminerTitle}
              onChange={(e) => setMarksheetExaminerTitle(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 hover:border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs text-zinc-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 transition-all font-medium"
              placeholder="e.g. Controller of Examinations"
            />
          </div>

          <div className="flex items-center justify-between p-3.5 bg-zinc-50 rounded-2xl border border-zinc-200 self-end">
            <div>
              <p className="text-xs font-bold text-zinc-900">Include Principal Signature Line</p>
              <p className="text-[11px] text-zinc-500">Print authorized Principal signature box on report cards.</p>
            </div>
            <input
              type="checkbox"
              checked={marksheetShowPrincipalSign}
              onChange={(e) => setMarksheetShowPrincipalSign(e.target.checked)}
              className="w-4 h-4 accent-indigo-600 cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Submit Button */}
      <div className="flex items-center justify-between pt-4 border-t border-zinc-100">
        {saved ? (
          <span className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 animate-in fade-in">
            <CheckCircle2 size={16} />
            Grading and examination rules saved!
          </span>
        ) : (
          <span className="text-xs text-zinc-400 font-medium">Applies to all exam tabulation sheets and report cards</span>
        )}

        <button
          type="submit"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
        >
          <Save size={15} />
          Save Grading Policy
        </button>
      </div>
    </form>
  )
}
