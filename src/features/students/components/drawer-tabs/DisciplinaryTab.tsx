import { AlertTriangle, ThumbsUp } from 'lucide-react'
import type { Student } from '../../types'

export function DisciplinaryTab({ student: _student }: { student: Student }) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-slate-200">Behavioral Records</h4>
        <button className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors bg-blue-500/10 px-3 py-1.5 rounded-lg">
          + Add Remark
        </button>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 flex gap-4">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center shrink-0 mt-1">
            <AlertTriangle size={14} className="text-amber-400" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-sm font-semibold text-slate-200">Disrupting Class</h5>
              <span className="text-[10px] text-slate-500">12 Mar 2024</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Student was talking continuously during the Physics lecture despite multiple warnings.
            </p>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Reported by: Hasibul Islam (Physics)</p>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-700/50 rounded-xl p-4 flex gap-4">
          <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 mt-1">
            <ThumbsUp size={14} className="text-emerald-400" />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <h5 className="text-sm font-semibold text-slate-200">Excellent Leadership</h5>
              <span className="text-[10px] text-slate-500">28 Feb 2024</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Led the group project exceptionally well and helped weaker students understand the concepts.
            </p>
            <p className="text-[10px] text-slate-500 mt-2 font-medium">Reported by: Nabila Haque (Chemistry)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
