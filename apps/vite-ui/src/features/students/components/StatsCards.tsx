import { Users, GraduationCap, BookOpen, UserCheck } from 'lucide-react'

interface Props {
  total: number
  regular: number
  examBatch: number
  active: number
}

const cards = [
  {
    key: 'total' as const,
    label: 'Total Students',
    icon: Users,
    gradient: 'from-blue-600/20 to-blue-900/10',
    border: 'border-blue-500/20',
    iconBg: 'bg-blue-600/20',
    iconColor: 'text-blue-400',
    valueColor: 'text-blue-300',
  },
  {
    key: 'regular' as const,
    label: 'Regular Students',
    icon: GraduationCap,
    gradient: 'from-emerald-600/20 to-emerald-900/10',
    border: 'border-emerald-500/20',
    iconBg: 'bg-emerald-600/20',
    iconColor: 'text-emerald-400',
    valueColor: 'text-emerald-300',
  },
  {
    key: 'examBatch' as const,
    label: 'Exam Batch',
    icon: BookOpen,
    gradient: 'from-purple-600/20 to-purple-900/10',
    border: 'border-purple-500/20',
    iconBg: 'bg-purple-600/20',
    iconColor: 'text-purple-400',
    valueColor: 'text-purple-300',
  },
  {
    key: 'active' as const,
    label: 'Active Students',
    icon: UserCheck,
    gradient: 'from-cyan-600/20 to-cyan-900/10',
    border: 'border-cyan-500/20',
    iconBg: 'bg-cyan-600/20',
    iconColor: 'text-cyan-400',
    valueColor: 'text-cyan-300',
  },
]

export function StatsCards({ total, regular, examBatch, active }: Props) {
  const values = { total, regular, examBatch, active }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map(card => {
        const Icon = card.icon
        return (
          <div
            key={card.key}
            className={`relative overflow-hidden rounded-xl border ${card.border} bg-gradient-to-br ${card.gradient} p-5 backdrop-blur-sm transition-transform hover:-translate-y-0.5`}
          >
            {/* Background glow */}
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full blur-2xl opacity-20 bg-white" />

            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-medium text-zinc-600 uppercase tracking-wider mb-2">
                  {card.label}
                </p>
                <p className={`text-3xl font-bold ${card.valueColor}`}>
                  {values[card.key]}
                </p>
              </div>
              <div className={`${card.iconBg} p-2.5 rounded-lg`}>
                <Icon className={card.iconColor} size={20} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}
