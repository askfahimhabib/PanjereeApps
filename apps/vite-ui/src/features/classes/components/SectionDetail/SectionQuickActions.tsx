import { CalendarDays, ClipboardCheck, FileText, Calculator, Zap } from 'lucide-react'
import { Link } from 'react-router-dom'

export function SectionQuickActions() {
  const actions = [
    {
      label: 'Class Routine',
      icon: <CalendarDays className="w-4 h-4" />,
      to: '/admin/routines',
      color: 'bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20',
    },
    {
      label: 'Daily Attendance',
      icon: <ClipboardCheck className="w-4 h-4" />,
      to: '/admin/attendance',
      color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 hover:bg-emerald-500/20',
    },
    {
      label: 'Exam Results',
      icon: <FileText className="w-4 h-4" />,
      to: '/admin/exams',
      color: 'bg-purple-500/10 text-purple-400 border-purple-500/20 hover:bg-purple-500/20',
    },
    {
      label: 'Fee Status',
      icon: <Calculator className="w-4 h-4" />,
      to: '/admin/fees',
      color: 'bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20',
    },
  ]

  return (
    <div className="rounded-xl border border-zinc-100 bg-white p-5">
      <h3 className="text-base font-semibold text-white flex items-center gap-2 mb-4">
        <Zap className="w-4 h-4 text-amber-400" />
        Quick Actions
      </h3>
      <div className="grid grid-cols-1 gap-2">
        {actions.map((action, i) => (
          <Link
            key={i}
            to={action.to}
            className={`flex items-center gap-2 w-full px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${action.color}`}
          >
            {action.icon}
            {action.label}
          </Link>
        ))}
      </div>
    </div>
  )
}
