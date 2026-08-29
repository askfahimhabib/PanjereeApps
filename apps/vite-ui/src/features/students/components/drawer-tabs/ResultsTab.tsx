import { Trophy, Award, TrendingUp, BarChart2 } from 'lucide-react'
import type { Student } from '../../types'

export function ResultsTab({ student: _student }: { student: Student }) {
  return (
    <div className="space-y-6">
      {/* Overview */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-zinc-100 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
            <Trophy size={18} className="text-blue-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-600">Average Grade</p>
            <p className="text-lg font-bold text-zinc-800">A- (4.25)</p>
          </div>
        </div>
        <div className="bg-white border border-zinc-100 p-4 rounded-xl flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center shrink-0">
            <TrendingUp size={18} className="text-purple-400" />
          </div>
          <div>
            <p className="text-xs text-zinc-600">Class Rank</p>
            <p className="text-lg font-bold text-zinc-800">12th <span className="text-xs text-zinc-600 font-normal">/ 45</span></p>
          </div>
        </div>
      </div>

      {/* Exam List */}
      <div className="border border-zinc-100 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <Award size={14} className="text-zinc-600" />
            <h4 className="text-xs font-semibold text-zinc-800 uppercase tracking-wider">Exam History</h4>
          </div>
        </div>
        <div className="divide-y divide-zinc-100">
          {[
            { name: 'Half-Yearly Exam 2024', grade: 'A', gpa: '4.50', status: 'pass' },
            { name: 'Monthly Test - March', grade: 'B+', gpa: '3.75', status: 'pass' },
            { name: 'Monthly Test - Feb', grade: 'F', gpa: '0.00', status: 'fail' }
          ].map((exam, i) => (
            <div key={i} className="flex items-center justify-between p-4 bg-zinc-50">
              <div>
                <p className="text-sm font-medium text-zinc-800">{exam.name}</p>
                <button className="text-xs text-blue-400 hover:underline mt-0.5 flex items-center gap-1">
                  <BarChart2 size={12} /> View Details
                </button>
              </div>
              <div className="text-right flex flex-col items-end gap-1">
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  exam.status === 'pass' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                }`}>
                  {exam.grade} ({exam.gpa})
                </span>
                <span className={`text-[10px] uppercase font-semibold ${
                  exam.status === 'pass' ? 'text-emerald-500/70' : 'text-red-500/70'
                }`}>
                  {exam.status === 'pass' ? 'Passed' : 'Failed'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
