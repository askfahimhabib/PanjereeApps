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
      case 'SCIENCE': return <FlaskConical className="w-8 h-8 text-emerald-600" />
      case 'ARTS': return <Palette className="w-8 h-8 text-purple-600" />
      case 'COMMERCE': return <Calculator className="w-8 h-8 text-amber-600" />
      default: return <Users className="w-8 h-8 text-indigo-600" />
    }
  }

  const getGroupTheme = (name: string) => {
    switch (name) {
      case 'SCIENCE': return {
        border: 'border-emerald-200 hover:border-emerald-400',
        iconBg: 'bg-emerald-50 border border-emerald-100',
        titleColor: 'text-emerald-950',
        btn: 'bg-emerald-600 hover:bg-emerald-700 text-white',
      }
      case 'ARTS': return {
        border: 'border-purple-200 hover:border-purple-400',
        iconBg: 'bg-purple-50 border border-purple-100',
        titleColor: 'text-purple-950',
        btn: 'bg-purple-600 hover:bg-purple-700 text-white',
      }
      case 'COMMERCE': return {
        border: 'border-amber-200 hover:border-amber-400',
        iconBg: 'bg-amber-50 border border-amber-100',
        titleColor: 'text-amber-950',
        btn: 'bg-amber-600 hover:bg-amber-700 text-white',
      }
      default: return {
        border: 'border-indigo-200 hover:border-indigo-400',
        iconBg: 'bg-indigo-50 border border-indigo-100',
        titleColor: 'text-indigo-950',
        btn: 'bg-indigo-600 hover:bg-indigo-700 text-white',
      }
    }
  }

  if (groups.length === 0) {
    return (
      <div className="text-center p-12 text-zinc-500 border-2 border-dashed border-zinc-200 rounded-3xl bg-white">
        No academic groups defined yet.
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
            className={`overflow-hidden rounded-3xl border bg-white shadow-xs hover:shadow-xl transition-all duration-300 ${theme.border} flex flex-col justify-between`}
          >
            <div className="p-6 flex flex-col items-center text-center">
              <div className={`p-4 rounded-3xl mb-4 ${theme.iconBg}`}>
                {getGroupIcon(group.name)}
              </div>
              <h3 className={`text-xl font-black ${theme.titleColor} mb-1 capitalize tracking-tight`}>
                {group.name.charAt(0) + group.name.slice(1).toLowerCase()} Group
              </h3>
              <p className="text-xs text-zinc-500 font-medium">Secondary Academic Stream</p>

              <div className="grid grid-cols-2 gap-3 w-full mb-5 mt-5">
                <div className="bg-zinc-50 rounded-2xl p-3.5 text-center border border-zinc-100">
                  <div className="text-2xl font-black text-zinc-900 mb-0.5">{group.totalSections}</div>
                  <div className="text-xs text-zinc-500 font-semibold flex items-center justify-center gap-1">
                    <LayoutGrid className="w-3.5 h-3.5 text-indigo-600" /> Sections
                  </div>
                </div>
                <div className="bg-zinc-50 rounded-2xl p-3.5 text-center border border-zinc-100">
                  <div className="text-2xl font-black text-zinc-900 mb-0.5">{group.totalStudents}</div>
                  <div className="text-xs text-zinc-500 font-semibold flex items-center justify-center gap-1">
                    <Users className="w-3.5 h-3.5 text-emerald-600" /> Students
                  </div>
                </div>
              </div>

              <Link
                to={`/admin/classes/${classId}/groups/${group.id}`}
                className={`flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md ${theme.btn}`}
              >
                <span>Manage Group Sections</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )
      })}
    </div>
  )
}
