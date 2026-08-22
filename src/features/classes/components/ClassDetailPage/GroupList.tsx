import { Users, ChevronRight, FlaskConical, Palette, Calculator, LayoutGrid } from 'lucide-react'
import type { ClassGroup } from '../../types'
import { Link } from 'react-router-dom'

interface GroupListProps {
  groups: ClassGroup[]
  classId: string
}

export function GroupList({ groups, classId }: GroupListProps) {
  const getGroupIcon = (name: string) => {
    switch (name) {
      case 'SCIENCE': return <FlaskConical className="w-7 h-7 text-emerald-400" />
      case 'ARTS': return <Palette className="w-7 h-7 text-purple-400" />
      case 'COMMERCE': return <Calculator className="w-7 h-7 text-amber-400" />
      default: return <Users className="w-7 h-7 text-blue-400" />
    }
  }

  const getGroupTheme = (name: string) => {
    switch (name) {
      case 'SCIENCE': return {
        border: 'border-emerald-500/20 hover:border-emerald-500/50',
        iconBg: 'bg-emerald-500/10',
        badge: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
        btn: 'bg-emerald-600 hover:bg-emerald-500',
      }
      case 'ARTS': return {
        border: 'border-purple-500/20 hover:border-purple-500/50',
        iconBg: 'bg-purple-500/10',
        badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
        btn: 'bg-purple-600 hover:bg-purple-500',
      }
      case 'COMMERCE': return {
        border: 'border-amber-500/20 hover:border-amber-500/50',
        iconBg: 'bg-amber-500/10',
        badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        btn: 'bg-amber-600 hover:bg-amber-500',
      }
      default: return {
        border: 'border-blue-500/20 hover:border-blue-500/50',
        iconBg: 'bg-blue-500/10',
        badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
        btn: 'bg-blue-600 hover:bg-blue-500',
      }
    }
  }

  if (groups.length === 0) {
    return (
      <div className="text-center p-10 text-slate-400 border border-dashed border-slate-700 rounded-xl">
        No groups defined yet.
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {groups.map((group) => {
        const theme = getGroupTheme(group.name)
        return (
          <div
            key={group.id}
            className={`overflow-hidden rounded-xl border-2 bg-slate-900/60 transition-all duration-300 ${theme.border}`}
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className={`p-4 rounded-2xl mb-4 ${theme.iconBg}`}>
                {getGroupIcon(group.name)}
              </div>
              <h3 className="text-2xl font-bold text-white mb-1 capitalize">
                {group.name.charAt(0) + group.name.slice(1).toLowerCase()}
              </h3>

              <div className="grid grid-cols-2 gap-3 w-full mb-6 mt-5">
                <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-slate-700">
                  <div className="text-2xl font-bold text-white mb-0.5">{group.totalSections}</div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <LayoutGrid className="w-3 h-3" /> Sections
                  </div>
                </div>
                <div className="bg-slate-800/60 rounded-lg p-3 text-center border border-slate-700">
                  <div className="text-2xl font-bold text-white mb-0.5">{group.totalStudents}</div>
                  <div className="text-xs text-slate-400 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3" /> Students
                  </div>
                </div>
              </div>

              <Link
                to={`/admin/classes/${classId}/groups/${group.id}`}
                className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all duration-200 ${theme.btn}`}
              >
                View Sections
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
