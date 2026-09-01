import { CalendarDays, ClipboardCheck, FileText, CreditCard, Zap, ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SectionQuickActions() {
  const actions = [
    {
      label: 'Class Routine',
      description: 'View & assign weekly schedule',
      icon: <CalendarDays className="w-4 h-4 text-indigo-600" />,
      to: '/routines',
      borderHover: 'hover:border-indigo-300 hover:bg-indigo-50/50',
    },
    {
      label: 'Daily Attendance',
      description: 'Take today’s section presence',
      icon: <ClipboardCheck className="w-4 h-4 text-emerald-600" />,
      to: '/attendance',
      borderHover: 'hover:border-emerald-300 hover:bg-emerald-50/50',
    },
    {
      label: 'Exam Results & Marks',
      description: 'Tabulation sheets & GPA entry',
      icon: <FileText className="w-4 h-4 text-purple-600" />,
      to: '/exam-results',
      borderHover: 'hover:border-purple-300 hover:bg-purple-50/50',
    },
    {
      label: 'Fee Collection & Dues',
      description: 'Tuition fees & waivers',
      icon: <CreditCard className="w-4 h-4 text-amber-600" />,
      to: '/payments',
      borderHover: 'hover:border-amber-300 hover:bg-amber-50/50',
    },
  ]

  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-xs">
      <div className="flex items-center gap-2 mb-3.5">
        <div className="w-7 h-7 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600">
          <Zap className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-bold text-zinc-900">Quick Section Actions</h3>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {actions.map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`flex items-center justify-between p-3 rounded-xl border border-zinc-200/80 bg-zinc-50/60 text-zinc-900 transition-all ${action.borderHover} group`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-white border border-zinc-200 shadow-2xs group-hover:scale-105 transition-transform">
                {action.icon}
              </div>
              <div>
                <p className="text-xs font-bold text-zinc-900">{action.label}</p>
                <p className="text-[10px] text-zinc-500">{action.description}</p>
              </div>
            </div>
            <ArrowUpRight size={14} className="text-zinc-400 group-hover:text-zinc-700 transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
